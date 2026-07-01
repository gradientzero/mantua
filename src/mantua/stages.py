"""Pipeline stages: typed function in, artefact out.

Each stage follows the same shape: compute an input-identity cache key; if the registry already
holds an artefact for it, short-circuit; otherwise run the (tiny) compute, register the resulting
directory as an immutable artefact, and record lineage edges. These are plain functions (no Prefect
dependency) so they're trivially testable; ``pipeline.py`` wraps them as Prefect tasks/flows.
"""

from __future__ import annotations

import json
import shutil
import tempfile
from collections import defaultdict
from collections.abc import Callable
from pathlib import Path

from . import training
from .caching import stage_cache_key
from .config import (
    DataConfig,
    EvalConfig,
    Evaluation,
    PreTrainConfig,
    RLConfig,
    SFTConfig,
    TokenizerConfig,
)
from .registry import Artefact, get_registry

# Counts stages that actually *computed* (cache misses). Used by tests to prove caching.
COMPUTE_COUNTS: dict[str, int] = defaultdict(int)


def run_stage(
    stage: str,
    config,
    inputs: list[Artefact],
    kind: str,
    compute: Callable[[Path], None],
) -> Artefact:
    """Cache-check → compute → register artefact + lineage."""
    reg = get_registry()
    key = stage_cache_key(stage, config, inputs)

    cached = reg.cache_get(key)
    if cached is not None:
        return cached

    COMPUTE_COUNTS[stage] += 1
    run_id = reg.new_run(stage, config.model_dump_json())
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "out"
        out.mkdir()
        compute(out)
        artefact = reg.register(stage, kind, out, run_id, inputs)
    reg.cache_put(key, artefact)
    return artefact


def _only_file(artefact: Artefact) -> Path:
    directory = get_registry().materialize(artefact)
    return next(p for p in Path(directory).iterdir() if p.is_file())


def _jsonl(artefact: Artefact) -> list[dict]:
    text = _only_file(artefact).read_text()
    return [json.loads(line) for line in text.splitlines() if line.strip()]


# --------------------------------------------------------------------------- stages


def prepare_data(cfg: DataConfig) -> Artefact:
    def compute(out: Path) -> None:
        src = Path(cfg.path)
        shutil.copy(src, out / src.name)

    return run_stage("prepare_data", cfg, [], "dataset", compute)


def train_tokenizer(cfg: TokenizerConfig, data: Artefact) -> Artefact:
    def compute(out: Path) -> None:
        training.train_tokenizer(_only_file(data), cfg, out)

    return run_stage("train_tokenizer", cfg, [data], "tokenizer", compute)


def pre_train(cfg: PreTrainConfig, data: Artefact, tokenizer: Artefact) -> Artefact:
    def compute(out: Path) -> None:
        reg = get_registry()
        text = _only_file(data).read_text()
        tok = training.load_tokenizer(reg.materialize(tokenizer))
        training.pretrain(cfg, text, tok, out)

    return run_stage("pre_train", cfg, [data, tokenizer], "checkpoint", compute)


def sft(cfg: SFTConfig, base: Artefact, data: Artefact) -> Artefact:
    def compute(out: Path) -> None:
        training.sft(cfg, get_registry().materialize(base), _jsonl(data), out)

    return run_stage("sft", cfg, [base, data], "checkpoint", compute)


def rl(cfg: RLConfig, base: Artefact, data: Artefact) -> Artefact:
    def compute(out: Path) -> None:
        training.dpo(cfg, get_registry().materialize(base), _jsonl(data), out)

    return run_stage("rl", cfg, [base, data], "checkpoint", compute)


def evaluate(cfg: EvalConfig, checkpoint: Artefact, data: Artefact) -> Artefact:
    def compute(out: Path) -> None:
        rows = _jsonl(data)
        eval_text = " ".join(r["text"] for r in rows if "text" in r)
        prompts = [r["prompt"] for r in rows if "prompt" in r]
        metrics = training.evaluate(cfg, get_registry().materialize(checkpoint), eval_text, prompts)
        (out / "metrics.json").write_text(json.dumps(metrics))

    return run_stage("evaluate", cfg, [checkpoint, data], "eval", compute)


def read_evaluation(checkpoint: Artefact, eval_artefact: Artefact) -> Evaluation:
    metrics_path = get_registry().materialize(eval_artefact) / "metrics.json"
    metrics = json.loads(metrics_path.read_text())
    return Evaluation(checkpoint=checkpoint.id, **metrics)
