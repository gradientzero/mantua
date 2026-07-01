"""Artefact registry: content-addressed storage + lineage + input-identity cache.

Division of responsibility (see CLAUDE.md): Prefect owns *execution*; the registry owns
artefact *identity and lineage*, and is the source of truth for input-identity caching.
"""

from __future__ import annotations

import os
import subprocess
import uuid
from pathlib import Path

from pydantic import BaseModel, ConfigDict

from .blobstore import BlobStore
from .lineage import Lineage


class Artefact(BaseModel):
    """An immutable, versioned artefact. ``id`` is the content hash (its version)."""

    model_config = ConfigDict(frozen=True)

    id: str
    name: str
    kind: str  # 'dataset' | 'tokenizer' | 'checkpoint' | 'eval'
    size: int


def _git_commit() -> str:
    try:
        out = subprocess.run(
            ["git", "rev-parse", "HEAD"], capture_output=True, text=True, timeout=5
        )
        return out.stdout.strip() or "unknown"
    except Exception:
        return "unknown"


class Registry:
    def __init__(self, home: Path) -> None:
        self.home = Path(home)
        self.blobs = BlobStore(self.home / "blobs")
        self.lineage = Lineage(self.home / "lineage.db")

    def new_run(self, flow_name: str, params: str) -> str:
        run_id = uuid.uuid4().hex
        self.lineage.add_run(run_id, flow_name, params, _git_commit())
        return run_id

    def register(
        self, name: str, kind: str, local_dir: Path, run_id: str, inputs: list[Artefact]
    ) -> Artefact:
        key, size = self.blobs.put_dir(Path(local_dir))
        self.lineage.add_artefact(key, name, kind, size)
        self.lineage.add_edge(run_id, key, "produced")
        for a in inputs:
            self.lineage.add_edge(run_id, a.id, "consumed")
        return Artefact(id=key, name=name, kind=kind, size=size)

    def materialize(self, artefact: Artefact) -> Path:
        """Return a local path to the artefact's contents (a download for a remote backend)."""
        return self.blobs.path(artefact.id)

    def cache_get(self, cache_key: str) -> Artefact | None:
        artefact_id = self.lineage.cache_get(cache_key)
        if artefact_id is None:
            return None
        row = self.lineage.get_artefact(artefact_id)
        return Artefact(**row) if row else None

    def cache_put(self, cache_key: str, artefact: Artefact) -> None:
        self.lineage.cache_put(cache_key, artefact.id)


_REGISTRY: Registry | None = None


def get_registry() -> Registry:
    """Process-wide registry, rooted at ``$MANTUA_HOME`` (default ``./.mantua``)."""
    global _REGISTRY
    if _REGISTRY is None:
        home = Path(os.environ.get("MANTUA_HOME", ".mantua")).resolve()
        _REGISTRY = Registry(home)
    return _REGISTRY


__all__ = ["Artefact", "Registry", "get_registry"]
