"""Content-addressed blob store.

Artefacts are directories (a checkpoint, a tokeniser, a dataset file). Each is stored under a
key derived purely from its content, so identical bytes are stored once and every reference to a
version yields the same bytes — the "immutable, versioned artefacts" invariant.

This is the single swap point for a remote backend: the interface is dir-in / key-out / path-back,
so a future ``fsspec``/S3-backed implementation slots in behind ``Registry`` without touching any
stage code.
"""

from __future__ import annotations

import hashlib
import shutil
from pathlib import Path


class BlobStore:
    def __init__(self, root: Path) -> None:
        self.root = Path(root)
        self.root.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def hash_dir(directory: Path) -> str:
        """Deterministic hash of a directory's contents (paths + bytes)."""
        h = hashlib.sha256()
        for path in sorted(directory.rglob("*")):
            if path.is_file():
                h.update(path.relative_to(directory).as_posix().encode())
                h.update(b"\0")
                h.update(hashlib.sha256(path.read_bytes()).digest())
                h.update(b"\0")
        return h.hexdigest()[:32]

    def put_dir(self, src: Path) -> tuple[str, int]:
        """Store ``src`` under its content hash. No-op if already present. Returns (key, size)."""
        key = self.hash_dir(src)
        dest = self.root / key
        if not dest.exists():
            tmp = self.root / f".tmp-{key}"
            if tmp.exists():
                shutil.rmtree(tmp)
            shutil.copytree(src, tmp)
            tmp.rename(dest)  # atomic publish
        size = sum(p.stat().st_size for p in dest.rglob("*") if p.is_file())
        return key, size

    def path(self, key: str) -> Path:
        return self.root / key

    def exists(self, key: str) -> bool:
        return (self.root / key).exists()
