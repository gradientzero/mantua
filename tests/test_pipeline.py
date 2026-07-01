"""End-to-end and caching tests for the tiny pipeline.

These run the real (downscaled) pipeline, so they exercise training, the registry, lineage and
caching for real — just fast enough for CI.
"""

import math

from mantua import stages
from mantua.configs import tiny
from mantua.registry import get_registry


def test_stage_pipeline_end_to_end():
    """Run every stage as plain functions and check artefacts + a sane eval."""
    cfg = tiny()
    data = stages.prepare_data(cfg.pretrain.data)
    tokenizer = stages.train_tokenizer(cfg.pretrain.tokenizer, data)
    pretrain_ckpt = stages.pre_train(cfg.pretrain, data, tokenizer)

    sft_data = stages.prepare_data(cfg.post_train.sft.data)
    sft_ckpt = stages.sft(cfg.post_train.sft, pretrain_ckpt, sft_data)

    rl_data = stages.prepare_data(cfg.post_train.rl.data)
    rl_ckpt = stages.rl(cfg.post_train.rl, sft_ckpt, rl_data)

    eval_data = stages.prepare_data(cfg.post_train.eval.data)
    eval_art = stages.evaluate(cfg.post_train.eval, rl_ckpt, eval_data)
    evaluation = stages.read_evaluation(rl_ckpt, eval_art)

    # Distinct content-addressed artefacts were produced.
    assert len({data.id, tokenizer.id, pretrain_ckpt.id, sft_ckpt.id, rl_ckpt.id}) == 5
    assert data.kind == "dataset"
    assert pretrain_ckpt.kind == sft_ckpt.kind == "checkpoint"

    # A real, finite perplexity was computed.
    assert math.isfinite(evaluation.perplexity)
    assert evaluation.perplexity > 0
    assert 0.0 <= evaluation.format_adherence <= 1.0

    # Lineage: the RL checkpoint descends from the SFT checkpoint's dataset lineage.
    lineage = get_registry().lineage
    assert sft_ckpt.id in lineage.descendants_of(sft_data.id)


def test_caching_short_circuits_recompute():
    """Identical inputs must not recompute: the second call is a cache hit."""
    cfg = tiny()
    data = stages.prepare_data(cfg.pretrain.data)
    tokenizer = stages.train_tokenizer(cfg.pretrain.tokenizer, data)
    # Unique seed => guaranteed cache miss on the first call, regardless of other tests
    # sharing this registry.
    pretrain_cfg = cfg.pretrain.model_copy(update={"seed": 987654})

    before = stages.COMPUTE_COUNTS["pre_train"]
    first = stages.pre_train(pretrain_cfg, data, tokenizer)
    after_first = stages.COMPUTE_COUNTS["pre_train"]
    second = stages.pre_train(pretrain_cfg, data, tokenizer)
    after_second = stages.COMPUTE_COUNTS["pre_train"]

    assert first.id == second.id  # same artefact version
    assert after_first == before + 1  # first call computed
    assert after_second == after_first  # second call was a cache hit


def test_prefect_flow_runs():
    """The Prefect-composed flow produces both post-training evaluations."""
    from mantua.pipeline import train

    result = train(tiny())
    assert math.isfinite(result.post_train.sft_eval.perplexity)
    assert math.isfinite(result.post_train.rl_eval.perplexity)
    assert result.pretrain_checkpoint
