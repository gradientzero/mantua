"""Configure a hermetic, server-less local Prefect environment.

Must run *before* Prefect is imported, so both the CLI and the test conftest call this first.
Keeps all state (registry + Prefect) under ``$MANTUA_HOME`` and uses Prefect's ephemeral server so
no ``prefect server start`` is needed for a run — the "one-click, no setup to reconstruct" property.
"""

from __future__ import annotations

import os
from pathlib import Path


def configure_local(home: str | None = None) -> Path:
    root = Path(home or os.environ.get("MANTUA_HOME", ".mantua")).resolve()
    prefect_home = root / "prefect"
    # Prefect opens its SQLite DB directly under PREFECT_HOME and won't create the nested
    # path itself, so ensure both exist before it starts.
    root.mkdir(parents=True, exist_ok=True)
    prefect_home.mkdir(parents=True, exist_ok=True)

    os.environ["MANTUA_HOME"] = str(root)
    os.environ.setdefault("PREFECT_HOME", str(prefect_home))
    os.environ.setdefault("PREFECT_SERVER_ALLOW_EPHEMERAL_MODE", "true")
    # First run migrates a fresh SQLite DB; give the ephemeral server room to start.
    os.environ.setdefault("PREFECT_SERVER_EPHEMERAL_STARTUP_TIMEOUT_SECONDS", "120")
    os.environ.setdefault("PREFECT_LOGGING_LEVEL", "WARNING")
    return root
