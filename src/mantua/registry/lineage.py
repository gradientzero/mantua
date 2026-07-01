"""SQLite-backed lineage graph + input-identity cache index.

The blob store owns artefact *identity* (content hashes); this owns the *graph*: which run
produced/consumed which artefact, plus the stage cache mapping ``input-identity key -> artefact``.
"Which models were trained on dataset X" is a query here, not a Slack search.
"""

from __future__ import annotations

import sqlite3
import threading
from datetime import UTC, datetime
from pathlib import Path

_SCHEMA = """
CREATE TABLE IF NOT EXISTS runs (
    id TEXT PRIMARY KEY, flow_name TEXT, params TEXT, git_commit TEXT, created_at TEXT
);
CREATE TABLE IF NOT EXISTS artefacts (
    id TEXT PRIMARY KEY, name TEXT, kind TEXT, size INTEGER
);
CREATE TABLE IF NOT EXISTS edges (
    run_id TEXT, artefact_id TEXT, direction TEXT  -- 'produced' | 'consumed'
);
CREATE TABLE IF NOT EXISTS stage_cache (
    cache_key TEXT PRIMARY KEY, artefact_id TEXT
);
"""


class Lineage:
    def __init__(self, db_path: Path) -> None:
        db_path.parent.mkdir(parents=True, exist_ok=True)
        # Prefect's task runner uses threads; allow cross-thread use + serialise writes.
        self._conn = sqlite3.connect(str(db_path), check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        self._lock = threading.Lock()
        with self._lock:
            self._conn.executescript(_SCHEMA)
            self._conn.commit()

    def add_run(self, run_id: str, flow_name: str, params: str, git_commit: str) -> None:
        now = datetime.now(UTC).isoformat()
        with self._lock:
            self._conn.execute(
                "INSERT OR IGNORE INTO runs VALUES (?, ?, ?, ?, ?)",
                (run_id, flow_name, params, git_commit, now),
            )
            self._conn.commit()

    def add_artefact(self, artefact_id: str, name: str, kind: str, size: int) -> None:
        with self._lock:
            self._conn.execute(
                "INSERT OR IGNORE INTO artefacts VALUES (?, ?, ?, ?)",
                (artefact_id, name, kind, size),
            )
            self._conn.commit()

    def add_edge(self, run_id: str, artefact_id: str, direction: str) -> None:
        with self._lock:
            self._conn.execute(
                "INSERT INTO edges VALUES (?, ?, ?)", (run_id, artefact_id, direction)
            )
            self._conn.commit()

    def get_artefact(self, artefact_id: str) -> dict | None:
        row = self._conn.execute(
            "SELECT id, name, kind, size FROM artefacts WHERE id = ?", (artefact_id,)
        ).fetchone()
        return dict(row) if row else None

    def cache_get(self, cache_key: str) -> str | None:
        row = self._conn.execute(
            "SELECT artefact_id FROM stage_cache WHERE cache_key = ?", (cache_key,)
        ).fetchone()
        return row["artefact_id"] if row else None

    def cache_put(self, cache_key: str, artefact_id: str) -> None:
        with self._lock:
            self._conn.execute(
                "INSERT OR REPLACE INTO stage_cache VALUES (?, ?)", (cache_key, artefact_id)
            )
            self._conn.commit()

    def descendants_of(self, artefact_id: str) -> list[str]:
        """Artefacts produced by runs that consumed ``artefact_id`` (one hop).

        e.g. ``descendants_of(dataset_id)`` -> checkpoints/tokenisers trained on that dataset.
        """
        rows = self._conn.execute(
            """
            SELECT DISTINCT p.artefact_id
            FROM edges c
            JOIN edges p ON c.run_id = p.run_id
            WHERE c.artefact_id = ? AND c.direction = 'consumed' AND p.direction = 'produced'
            """,
            (artefact_id,),
        ).fetchall()
        return [r["artefact_id"] for r in rows]
