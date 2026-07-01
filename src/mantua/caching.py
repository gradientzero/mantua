"""Caching by input identity.

The cache key of a stage is a pure function of its inputs: the stage name, its (frozen) config,
and the *versions* (content hashes) of the artefacts it consumes. Identical inputs => identical
key => the registry returns the prior artefact instead of recomputing. This is what makes
multi-axis sweeps tractable without combinatorial blow-up.
"""

from __future__ import annotations

import hashlib
import json
from typing import TYPE_CHECKING

from pydantic import BaseModel

if TYPE_CHECKING:
    from .registry import Artefact


def stage_cache_key(stage: str, config: BaseModel, inputs: list[Artefact]) -> str:
    payload = {
        "stage": stage,
        "config": json.loads(config.model_dump_json()),
        "inputs": sorted(a.id for a in inputs),
    }
    blob = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(blob.encode()).hexdigest()
