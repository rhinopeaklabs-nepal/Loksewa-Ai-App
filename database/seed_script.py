import argparse
import csv
import gzip
import json
import shutil
import sqlite3
import unicodedata
import hashlib
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCHEMA_PATH = ROOT / "database" / "schema.sql"


def normalize_text(value: str) -> str:
    normalized = unicodedata.normalize("NFKC", value or "")
    normalized = " ".join(normalized.strip().lower().split())
    return normalized


def read_json(path: Path) -> list[dict]:
    with path.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)

    if isinstance(payload, dict):
        return payload.get("questions", [])
    if isinstance(payload, list):
        return payload
    raise ValueError("JSON input must be a list or an object with a questions array")


def read_csv(path: Path) -> list[dict]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def read_questions(path: Path) -> list[dict]:
    suffix = path.suffix.lower()
    if suffix == ".json":
        return read_json(path)
    if suffix == ".csv":
        return read_csv(path)
    raise ValueError("Input must be .json or .csv")


def require_text(row: dict, key: str) -> str:
    value = str(row.get(key, "")).strip()
    if not value:
        raise ValueError(f"Missing required field: {key}")
    return value


def optional_int(row: dict, key: str) -> int | None:
    value = row.get(key)
    if value in (None, ""):
        return None
    return int(value)


def public_id_for(row: dict) -> str:
    parts = [
        normalize_text(str(row.get("question_text", ""))),
        normalize_text(str(row.get("option_a", ""))),
        normalize_text(str(row.get("option_b", ""))),
        normalize_text(str(row.get("option_c", ""))),
        normalize_text(str(row.get("option_d", ""))),
    ]
    digest = hashlib.sha256("|".join(parts).encode("utf-8")).hexdigest()[:24]
    return f"q_{digest}"


def insert_questions(connection: sqlite3.Connection, rows: list[dict]) -> None:
    sql = """
        INSERT INTO loksewa_questions (
            public_id,
            question_text,
            normalized_question_text,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_option,
            explanation,
            syllabus_category,
            source_name,
            source_url,
            source_license,
            source_year,
            source_page,
            exam_level,
            exam_type,
            language,
            verification_status,
            verifier,
            data_version,
            verified_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """

    for index, row in enumerate(rows, start=1):
        question_text = require_text(row, "question_text")
        correct_option = require_text(row, "correct_option").upper()
        if correct_option not in {"A", "B", "C", "D"}:
            raise ValueError(f"Row {index}: correct_option must be A, B, C, or D")

        values = (
            str(row.get("public_id", "")).strip() or public_id_for(row),
            question_text,
            normalize_text(question_text),
            require_text(row, "option_a"),
            require_text(row, "option_b"),
            require_text(row, "option_c"),
            require_text(row, "option_d"),
            correct_option,
            str(row.get("explanation", "")).strip(),
            str(row.get("syllabus_category", "")).strip(),
            str(row.get("source_name", "")).strip(),
            str(row.get("source_url", "")).strip(),
            str(row.get("source_license", "")).strip(),
            optional_int(row, "source_year"),
            optional_int(row, "source_page"),
            str(row.get("exam_level", "")).strip(),
            str(row.get("exam_type", "")).strip(),
            str(row.get("language", "ne")).strip() or "ne",
            str(row.get("verification_status", "verified")).strip() or "verified",
            str(row.get("verifier", "")).strip(),
            int(row.get("data_version", 1) or 1),
            str(row.get("verified_at", "")).strip() or None,
        )
        connection.execute(sql, values)


def build_database(input_path: Path, output_path: Path, app_version: str) -> None:
    rows = read_questions(input_path)
    if not rows:
        raise ValueError("No question rows found")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    for sqlite_path in (
        output_path,
        Path(f"{output_path}-journal"),
        Path(f"{output_path}-wal"),
        Path(f"{output_path}-shm"),
    ):
        if sqlite_path.exists():
            try:
                sqlite_path.unlink()
            except PermissionError as exc:
                raise PermissionError(
                    f"Could not replace {sqlite_path}. Close any app or SQLite "
                    "viewer that has the database open, then rerun the seed script."
                ) from exc

    with sqlite3.connect(output_path) as connection:
        connection.execute("PRAGMA foreign_keys = ON")
        connection.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
        insert_questions(connection, rows)
        connection.execute(
            "INSERT OR REPLACE INTO database_metadata (key, value) VALUES (?, ?)",
            ("app_data_version", app_version),
        )
        connection.commit()
        connection.execute("PRAGMA optimize")
        connection.execute("VACUUM")


def compress_gzip(source: Path) -> Path:
    target = source.with_suffix(source.suffix + ".gz")
    with source.open("rb") as raw, gzip.open(target, "wb", compresslevel=9) as zipped:
        shutil.copyfileobj(raw, zipped)
    return target


def compress_brotli(source: Path) -> Path:
    try:
        import brotli
    except ImportError as exc:
        raise RuntimeError(
            "Brotli compression requires the optional 'brotli' Python package"
        ) from exc

    target = source.with_suffix(source.suffix + ".br")
    target.write_bytes(brotli.compress(source.read_bytes(), quality=11))
    return target


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build and compress the offline Loksewa SQLite seed database."
    )
    parser.add_argument("--input", required=True, type=Path, help="JSON or CSV source file")
    parser.add_argument("--output", required=True, type=Path, help="Output .db path")
    parser.add_argument(
        "--compress",
        choices=("none", "gzip", "brotli"),
        default="gzip",
        help="Compression format for the app asset",
    )
    parser.add_argument("--version", default="1", help="App data version to store")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    input_path = args.input.resolve()
    output_path = args.output.resolve()

    build_database(input_path, output_path, args.version)

    compressed_path = None
    if args.compress == "gzip":
        compressed_path = compress_gzip(output_path)
    elif args.compress == "brotli":
        compressed_path = compress_brotli(output_path)

    print(f"Built database: {output_path}")
    if compressed_path:
        print(f"Compressed asset: {compressed_path}")


if __name__ == "__main__":
    main()
