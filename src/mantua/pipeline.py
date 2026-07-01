"""The pipeline, composed with Prefect.

This is the MTaC canonical shape: stages are functions with typed inputs/outputs, and the
end-to-end pipeline is just their composition. Prefect provides orchestration — concurrency
(``.submit`` = the blog's ``spawn``), retries, durable execution, and a UI. Caching and lineage
live in the registry (see ``stages.run_stage``).
"""

from __future__ import annotations

from prefect import flow, task
from prefect.cache_policies import NO_CACHE

from . import stages
from .config import (
    PostTrainConfig,
    PostTrainEvaluation,
    PreTrainConfig,
    TrainConfig,
    TrainResult,
)
from .registry import Artefact

# cache_policy=NO_CACHE: the registry is the single source of truth for input-identity caching,
# so we don't want Prefect's own result cache second-guessing it. Prefect still gives us
# orchestration, concurrency, retries and the run UI.
_task = task(cache_policy=NO_CACHE)


@_task
def prepare_data(cfg) -> Artefact:
    return stages.prepare_data(cfg)


@_task
def train_tokenizer(cfg, data: Artefact) -> Artefact:
    return stages.train_tokenizer(cfg, data)


@_task
def pre_train_step(cfg: PreTrainConfig, data: Artefact, tokenizer: Artefact) -> Artefact:
    return stages.pre_train(cfg, data, tokenizer)


@_task
def sft(cfg, base: Artefact, data: Artefact) -> Artefact:
    return stages.sft(cfg, base, data)


@_task
def rl(cfg, base: Artefact, data: Artefact) -> Artefact:
    return stages.rl(cfg, base, data)


@_task
def evaluate(cfg, checkpoint: Artefact, data: Artefact) -> Artefact:
    return stages.evaluate(cfg, checkpoint, data)


@flow(name="pre_train")
def pre_train(cfg: PreTrainConfig) -> Artefact:
    data = prepare_data(cfg.data)
    tokenizer = train_tokenizer(cfg.tokenizer, data)
    return pre_train_step(cfg, data, tokenizer)


@flow(name="post_train")
def post_train(cfg: PostTrainConfig, base: Artefact) -> PostTrainEvaluation:
    sft_data = prepare_data(cfg.sft.data)
    eval_data = prepare_data(cfg.eval.data)

    sft_ckpt = sft(cfg.sft, base, sft_data)
    sft_eval = evaluate.submit(cfg.eval, sft_ckpt, eval_data)  # spawn

    rl_data = prepare_data(cfg.rl.data)
    rl_ckpt = rl(cfg.rl, sft_ckpt, rl_data)
    rl_eval = evaluate.submit(cfg.eval, rl_ckpt, eval_data)  # spawn

    return PostTrainEvaluation(
        sft_eval=stages.read_evaluation(sft_ckpt, sft_eval.result()),
        rl_eval=stages.read_evaluation(rl_ckpt, rl_eval.result()),
    )


@flow(name="train")
def train(cfg: TrainConfig) -> TrainResult:
    pretrain_ckpt = pre_train(cfg.pretrain)
    post = post_train(cfg.post_train, pretrain_ckpt)
    return TrainResult(pretrain_checkpoint=pretrain_ckpt.id, post_train=post)
