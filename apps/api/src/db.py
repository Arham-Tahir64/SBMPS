from __future__ import annotations

import sqlite3
from contextlib import closing
from pathlib import Path

from src.core.config import get_settings


SCHEMA = """
CREATE TABLE IF NOT EXISTS space_objects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  norad_id INTEGER NOT NULL UNIQUE,
  object_class TEXT NOT NULL,
  source TEXT NOT NULL,
  operator_name TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tle_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  object_id TEXT NOT NULL,
  source TEXT NOT NULL,
  line0 TEXT NOT NULL,
  line1 TEXT NOT NULL,
  line2 TEXT NOT NULL,
  epoch TEXT NOT NULL,
  ingested_at TEXT NOT NULL,
  UNIQUE(object_id, source, epoch)
);

CREATE TABLE IF NOT EXISTS feed_statuses (
  source TEXT PRIMARY KEY,
  last_ingested_at TEXT,
  last_attempted_at TEXT NOT NULL,
  stale_threshold_minutes INTEGER NOT NULL,
  is_stale INTEGER NOT NULL,
  object_count INTEGER NOT NULL,
  message TEXT
);
"""


def get_database_path() -> Path:
    return Path(get_settings().local_database_path)


def connect() -> sqlite3.Connection:
    path = get_database_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path, check_same_thread=False)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    with closing(connect()) as connection:
        connection.executescript(SCHEMA)
        connection.commit()
