import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from backend.settings import ROOT, settings


SCHEMA_PATH = ROOT / "database" / "schema.sql"


def connect(db_path: Path | None = None) -> sqlite3.Connection:
    path = db_path or settings.database_path
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    connection.execute("PRAGMA journal_mode = WAL")
    connection.execute("PRAGMA busy_timeout = 5000")
    return connection


@contextmanager
def get_connection() -> Iterator[sqlite3.Connection]:
    connection = connect()
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def initialize_database(db_path: Path | None = None) -> None:
    connection = connect(db_path)
    try:
        connection.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
        connection.commit()
    finally:
        connection.close()


def get_metadata(connection: sqlite3.Connection, key: str, default: str = "") -> str:
    row = connection.execute(
        "SELECT value FROM database_metadata WHERE key = ?",
        (key,),
    ).fetchone()
    return default if row is None else str(row["value"])


def set_metadata(connection: sqlite3.Connection, key: str, value: str) -> None:
    connection.execute(
        """
        INSERT INTO database_metadata (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET
            value = excluded.value,
            updated_at = CURRENT_TIMESTAMP
        """,
        (key, value),
    )


def next_data_version(connection: sqlite3.Connection) -> int:
    current = int(get_metadata(connection, "data_version", "1"))
    version = current + 1
    set_metadata(connection, "data_version", str(version))
    return version
