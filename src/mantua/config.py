"""Typed pipeline configuration and evaluation outputs.

Every stage is a function with a typed, *immutable* config as input and a typed output.
Configs are frozen Pydantic models so they hash deterministically — that hash is the basis
of the input-identity cache key (see ``mantua.caching``).
"""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class _Frozen(BaseModel):
    model_config = ConfigDict(frozen=True)


# --------------------------------------------------------------------------- inputs


class ModelConfig(_Frozen):
    """Architecture of the (tiny) GPT-2 style model."""

    n_layer: int = 2
    n_head: int = 2
    n_embd: int = 32
    block_size: int = 64
    dropout: float = 0.0


class TokenizerConfig(_Frozen):
    vocab_size: int = 512
    min_frequency: int = 2


class DataConfig(_Frozen):
    """Reference to a raw data file. ``prepare_data`` registers its *content* as an artefact,
    so identical bytes always yield the same artefact version regardless of this path."""

    name: str
    path: str


class PreTrainConfig(_Frozen):
    data: DataConfig
    tokenizer: TokenizerConfig = TokenizerConfig()
    model: ModelConfig = ModelConfig()
    steps: int = 30
    batch_size: int = 8
    lr: float = 3e-3
    seed: int = 0


class SFTConfig(_Frozen):
    data: DataConfig
    steps: int = 20
    batch_size: int = 4
    lr: float = 1e-3
    seed: int = 0


class RLConfig(_Frozen):
    """Reinforcement learning stage. Implemented as DPO in the downscaled recipe."""

    data: DataConfig
    steps: int = 10
    batch_size: int = 2
    lr: float = 5e-4
    beta: float = 0.1
    seed: int = 0


class EvalConfig(_Frozen):
    data: DataConfig
    max_samples: int = 32


class PostTrainConfig(_Frozen):
    sft: SFTConfig
    rl: RLConfig
    eval: EvalConfig


class TrainConfig(_Frozen):
    pretrain: PreTrainConfig
    post_train: PostTrainConfig


# --------------------------------------------------------------------------- outputs


class Evaluation(BaseModel):
    checkpoint: str  # artefact id of the evaluated checkpoint
    perplexity: float
    format_adherence: float
    n_samples: int


class PostTrainEvaluation(BaseModel):
    sft_eval: Evaluation
    rl_eval: Evaluation


class TrainResult(BaseModel):
    pretrain_checkpoint: str
    post_train: PostTrainEvaluation
