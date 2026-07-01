"""Recipes as code. ``tiny()`` is the downscaled end-to-end recipe that PR-CI runs."""

from __future__ import annotations

from pathlib import Path

from .config import (
    DataConfig,
    EvalConfig,
    ModelConfig,
    PostTrainConfig,
    PreTrainConfig,
    RLConfig,
    SFTConfig,
    TokenizerConfig,
    TrainConfig,
)

_DATA = Path(__file__).resolve().parents[2] / "data"


def tiny() -> TrainConfig:
    """A ~2-layer GPT-2 on a few KB of text: the whole pipeline runs on CPU in seconds."""
    return TrainConfig(
        pretrain=PreTrainConfig(
            data=DataConfig(name="corpus", path=str(_DATA / "corpus.txt")),
            tokenizer=TokenizerConfig(vocab_size=512, min_frequency=2),
            model=ModelConfig(n_layer=2, n_head=2, n_embd=32, block_size=64),
            steps=30,
            batch_size=8,
            lr=3e-3,
        ),
        post_train=PostTrainConfig(
            sft=SFTConfig(
                data=DataConfig(name="sft", path=str(_DATA / "sft.jsonl")),
                steps=20,
                batch_size=4,
                lr=1e-3,
            ),
            rl=RLConfig(
                data=DataConfig(name="preferences", path=str(_DATA / "preferences.jsonl")),
                steps=10,
                batch_size=2,
                lr=5e-4,
            ),
            eval=EvalConfig(
                data=DataConfig(name="eval", path=str(_DATA / "eval.jsonl")),
                max_samples=16,
            ),
        ),
    )
