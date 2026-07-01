"""Sweeps are code.

Because the pipeline is a function, a hyperparameter sweep is a nested loop that calls it with
different parameterisations. This mirrors the blog's SFT-LR × RL-LR experiment. Input-identity
caching collapses redundant work: across the 2×2 grid below, pre-training runs **once** (identical
pretrain config for all four points) and SFT runs **twice** (two distinct SFT learning rates), not
four times — even though ``train`` is invoked four times.
"""

from __future__ import annotations

from .config import TrainConfig
from .pipeline import train


def learning_rate_sweep(base: TrainConfig) -> dict[tuple[float, float], object]:
    results: dict[tuple[float, float], object] = {}
    for sft_lr in (1e-3, 5e-4):
        for rl_lr in (5e-4, 1e-4):
            cfg = base.model_copy(
                update={
                    "post_train": base.post_train.model_copy(
                        update={
                            "sft": base.post_train.sft.model_copy(update={"lr": sft_lr}),
                            "rl": base.post_train.rl.model_copy(update={"lr": rl_lr}),
                        }
                    )
                }
            )
            results[(sft_lr, rl_lr)] = train(cfg)
    return results
