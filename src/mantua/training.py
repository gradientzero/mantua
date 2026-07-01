"""The actual (deliberately tiny) training and evaluation.

Pure functions over local directories — no registry, no Prefect, no caching here. Pre-training and
SFT are real causal-LM training loops; RL is a real DPO loss against a frozen reference. Everything
is downscaled so the whole pipeline runs on CPU in seconds.

At full scale the trainers here would be swapped for the ``recipes`` stack: transformers ``Trainer``
/ TRL ``SFTTrainer`` for SFT and TRL ``GRPOTrainer``/``PPOTrainer`` for online RL. The DPO loop
below marks that RL drop-in point.
"""

from __future__ import annotations

import math
from pathlib import Path

import torch
from tokenizers import ByteLevelBPETokenizer
from torch.nn import functional as F
from transformers import GPT2Config, GPT2LMHeadModel, PreTrainedTokenizerFast
from transformers.utils import logging as hf_logging

from .config import EvalConfig, PreTrainConfig, RLConfig, SFTConfig, TokenizerConfig

# Keep the pipeline's stdout to Mantua's own run report, not transformers' save/load chatter.
hf_logging.set_verbosity_error()
hf_logging.disable_progress_bar()

SPECIAL = "<|endoftext|>"


def _set_seed(seed: int) -> None:
    torch.manual_seed(seed)


def _prompt(instruction: str) -> str:
    return f"### Instruction:\n{instruction}\n\n### Response:\n"


# ------------------------------------------------------------------ tokenizer / model


def train_tokenizer(
    corpus_path: Path, cfg: TokenizerConfig, out_dir: Path
) -> PreTrainedTokenizerFast:
    bpe = ByteLevelBPETokenizer()
    bpe.train(
        files=[str(corpus_path)],
        vocab_size=cfg.vocab_size,
        min_frequency=cfg.min_frequency,
        special_tokens=[SPECIAL],
    )
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    bpe.save(str(out_dir / "tokenizer.json"))
    tok = PreTrainedTokenizerFast(
        tokenizer_file=str(out_dir / "tokenizer.json"),
        eos_token=SPECIAL,
        bos_token=SPECIAL,
        unk_token=SPECIAL,
        pad_token=SPECIAL,
    )
    tok.save_pretrained(str(out_dir))
    return tok


def load_tokenizer(directory: Path) -> PreTrainedTokenizerFast:
    return PreTrainedTokenizerFast.from_pretrained(str(directory))


def _build_model(cfg, vocab_size: int, tok: PreTrainedTokenizerFast) -> GPT2LMHeadModel:
    gpt2 = GPT2Config(
        vocab_size=vocab_size,
        n_positions=cfg.block_size,
        n_embd=cfg.n_embd,
        n_layer=cfg.n_layer,
        n_head=cfg.n_head,
        resid_pdrop=cfg.dropout,
        embd_pdrop=cfg.dropout,
        attn_pdrop=cfg.dropout,
    )
    model = GPT2LMHeadModel(gpt2)
    model.config.pad_token_id = tok.pad_token_id
    model.config.eos_token_id = tok.eos_token_id
    return model


def _save(model: GPT2LMHeadModel, tok: PreTrainedTokenizerFast, out_dir: Path) -> None:
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    model.save_pretrained(str(out_dir))
    tok.save_pretrained(str(out_dir))  # ship the tokenizer with every checkpoint


def load_checkpoint(directory: Path) -> tuple[GPT2LMHeadModel, PreTrainedTokenizerFast]:
    model = GPT2LMHeadModel.from_pretrained(str(directory))
    tok = load_tokenizer(directory)
    return model, tok


# ------------------------------------------------------------------ pre-training


def pretrain(cfg: PreTrainConfig, text: str, tok: PreTrainedTokenizerFast, out_dir: Path) -> None:
    _set_seed(cfg.seed)
    model = _build_model(cfg.model, len(tok), tok)
    block = cfg.model.block_size
    data = torch.tensor(tok(text)["input_ids"], dtype=torch.long)
    data = _ensure_length(data, block + 2)

    opt = torch.optim.AdamW(model.parameters(), lr=cfg.lr)
    model.train()
    for _ in range(cfg.steps):
        x = _sample_blocks(data, block, cfg.batch_size)
        loss = model(input_ids=x, labels=x).loss
        opt.zero_grad()
        loss.backward()
        opt.step()
    _save(model, tok, out_dir)


def _ensure_length(data: torch.Tensor, minimum: int) -> torch.Tensor:
    if len(data) >= minimum:
        return data
    reps = minimum // len(data) + 1
    return data.repeat(reps)


def _sample_blocks(data: torch.Tensor, block: int, batch_size: int) -> torch.Tensor:
    ix = torch.randint(0, len(data) - block - 1, (batch_size,))
    return torch.stack([data[i : i + block] for i in ix])


# ------------------------------------------------------------------ SFT


def _encode_supervised(tok, prompt: str, response: str, block: int) -> tuple[list[int], list[int]]:
    prompt_ids = tok(prompt)["input_ids"]
    full_ids = tok(prompt + response + tok.eos_token)["input_ids"][:block]
    labels = list(full_ids)
    for i in range(min(len(prompt_ids), len(labels))):
        labels[i] = -100  # mask the prompt: supervise only the response
    return full_ids, labels


def _collate_supervised(batch, pad_id: int):
    maxlen = max(len(ids) for ids, _ in batch)
    input_ids, labels, mask = [], [], []
    for ids, lab in batch:
        pad = maxlen - len(ids)
        input_ids.append(ids + [pad_id] * pad)
        labels.append(lab + [-100] * pad)
        mask.append([1] * len(ids) + [0] * pad)
    return (torch.tensor(input_ids), torch.tensor(labels), torch.tensor(mask))


def sft(cfg: SFTConfig, base_dir: Path, examples: list[dict], out_dir: Path) -> None:
    _set_seed(cfg.seed)
    model, tok = load_checkpoint(base_dir)
    block = model.config.n_positions
    data = [
        _encode_supervised(tok, _prompt(ex["instruction"]), ex["response"], block)
        for ex in examples
    ]
    opt = torch.optim.AdamW(model.parameters(), lr=cfg.lr)
    model.train()
    for step in range(cfg.steps):
        batch = [data[(step * cfg.batch_size + j) % len(data)] for j in range(cfg.batch_size)]
        x, y, m = _collate_supervised(batch, tok.pad_token_id)
        loss = model(input_ids=x, attention_mask=m, labels=y).loss
        opt.zero_grad()
        loss.backward()
        opt.step()
    _save(model, tok, out_dir)


# ------------------------------------------------------------------ RL (DPO)


def _encode_pref(tok, prompt: str, response: str, block: int) -> tuple[list[int], list[int]]:
    prompt_ids = tok(prompt)["input_ids"]
    full_ids = tok(prompt + response + tok.eos_token)["input_ids"][:block]
    cut = min(len(prompt_ids), len(full_ids))
    resp_mask = [0] * cut + [1] * (len(full_ids) - cut)  # 1 over response tokens
    return full_ids, resp_mask


def _pad(seqs: list[list[int]], pad_id: int) -> tuple[torch.Tensor, torch.Tensor]:
    maxlen = max(len(s) for s in seqs)
    ids = torch.tensor([s + [pad_id] * (maxlen - len(s)) for s in seqs])
    attn = torch.tensor([[1] * len(s) + [0] * (maxlen - len(s)) for s in seqs])
    return ids, attn


def _pad_mask(masks: list[list[int]], width: int) -> torch.Tensor:
    return torch.tensor([m + [0] * (width - len(m)) for m in masks])


def _seq_logprob(model, ids: torch.Tensor, attn: torch.Tensor, resp_mask: torch.Tensor):
    """Sum of per-token log-probs over the response region of each sequence."""
    logits = model(input_ids=ids, attention_mask=attn).logits[:, :-1, :]
    targets = ids[:, 1:]
    logp = F.log_softmax(logits, dim=-1).gather(-1, targets.unsqueeze(-1)).squeeze(-1)
    return (logp * resp_mask[:, 1:].float()).sum(dim=-1)


def dpo(cfg: RLConfig, base_dir: Path, prefs: list[dict], out_dir: Path) -> None:
    # NOTE: DPO stands in for online RL here. At full scale, swap this loop for TRL's
    # GRPOTrainer / PPOTrainer (a policy + reward model + rollouts); the stage contract
    # (base checkpoint + data in, checkpoint out) is unchanged.
    _set_seed(cfg.seed)
    policy, tok = load_checkpoint(base_dir)
    ref, _ = load_checkpoint(base_dir)
    ref.eval()
    for p in ref.parameters():
        p.requires_grad_(False)
    block = policy.config.n_positions

    data = []
    for ex in prefs:
        prompt = _prompt(ex["prompt"])
        data.append(
            (
                *_encode_pref(tok, prompt, ex["chosen"], block),
                *_encode_pref(tok, prompt, ex["rejected"], block),
            )
        )

    opt = torch.optim.AdamW(policy.parameters(), lr=cfg.lr)
    policy.train()
    for step in range(cfg.steps):
        batch = [data[(step * cfg.batch_size + j) % len(data)] for j in range(cfg.batch_size)]
        c_ids, c_attn = _pad([b[0] for b in batch], tok.pad_token_id)
        c_mask = _pad_mask([b[1] for b in batch], c_ids.size(1))
        r_ids, r_attn = _pad([b[2] for b in batch], tok.pad_token_id)
        r_mask = _pad_mask([b[3] for b in batch], r_ids.size(1))

        pol_c = _seq_logprob(policy, c_ids, c_attn, c_mask)
        pol_r = _seq_logprob(policy, r_ids, r_attn, r_mask)
        with torch.no_grad():
            ref_c = _seq_logprob(ref, c_ids, c_attn, c_mask)
            ref_r = _seq_logprob(ref, r_ids, r_attn, r_mask)

        margin = cfg.beta * ((pol_c - ref_c) - (pol_r - ref_r))
        loss = -F.logsigmoid(margin).mean()
        opt.zero_grad()
        loss.backward()
        opt.step()
    _save(policy, tok, out_dir)


# ------------------------------------------------------------------ evaluation


def evaluate(cfg: EvalConfig, ckpt_dir: Path, eval_text: str, prompts: list[str]) -> dict:
    model, tok = load_checkpoint(ckpt_dir)
    model.eval()
    block = model.config.n_positions

    data = _ensure_length(torch.tensor(tok(eval_text)["input_ids"], dtype=torch.long), block + 2)
    losses: list[float] = []
    limit = min(len(data) - block - 1, cfg.max_samples * block)
    with torch.no_grad():
        for i in range(0, limit, block):
            x = data[i : i + block].unsqueeze(0)
            losses.append(model(input_ids=x, labels=x).loss.item())
    perplexity = math.exp(sum(losses) / len(losses)) if losses else float("inf")

    adhered = 0
    checked = 0
    with torch.no_grad():
        for instruction in prompts[:8]:
            enc = tok(_prompt(instruction), return_tensors="pt")
            # Keep prompt + generated tokens within the model's context window.
            input_ids = enc["input_ids"][:, -(block - 1) :]
            new_tokens = max(1, min(16, block - input_ids.size(1)))
            gen = model.generate(
                input_ids=input_ids,
                max_new_tokens=new_tokens,
                do_sample=False,
                pad_token_id=tok.pad_token_id,
            )
            completion = tok.decode(gen[0][input_ids.size(1) :], skip_special_tokens=True)
            checked += 1
            adhered += 1 if completion.strip() else 0
    adherence = adhered / checked if checked else 0.0

    return {
        "perplexity": perplexity,
        "format_adherence": adherence,
        "n_samples": len(losses),
    }
