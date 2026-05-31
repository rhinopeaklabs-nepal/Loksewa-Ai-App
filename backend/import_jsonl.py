import argparse
import json
import re
import sqlite3
from pathlib import Path
from typing import Iterable

from pydantic import ValidationError

from backend.db import connect, initialize_database, next_data_version
from backend.models import QuestionIn
from backend.repository import insert_question
from backend.text import normalize_text


OPTION_RE = re.compile(r"^\s*([A-D])\s*[\)\.:-]\s*(.+?)\s*$", re.IGNORECASE)
ANSWER_RE = re.compile(r"(?:सही\s*उत्तर|correct\s*answer|answer)\s*[:：]\s*([A-D])", re.IGNORECASE)


def iter_jsonl(path: Path) -> Iterable[dict]:
    with path.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            line = line.strip()
            if not line:
                continue
            try:
                yield json.loads(line)
            except json.JSONDecodeError as exc:
                raise ValueError(f"Line {line_number}: invalid JSON") from exc


def parse_instruction_record(
    record: dict,
    *,
    source_name: str,
    source_url: str,
    source_license: str,
    verifier: str,
    verification_status: str,
) -> QuestionIn:
    raw_input = str(record.get("input", "")).strip()
    raw_output = str(record.get("output", "")).strip()
    if not raw_input or not raw_output:
        raise ValueError("instruction JSONL record must contain input and output")

    lines = [line.strip() for line in raw_input.splitlines() if line.strip()]
    question_lines: list[str] = []
    options: dict[str, str] = {}
    for line in lines:
        option_match = OPTION_RE.match(line)
        if option_match:
            options[option_match.group(1).upper()] = option_match.group(2).strip()
        else:
            question_lines.append(line)

    answer_match = ANSWER_RE.search(raw_output)
    if not answer_match:
        raise ValueError("could not parse correct option from output")

    missing = sorted(set("ABCD") - set(options))
    if missing:
        raise ValueError(f"missing options: {', '.join(missing)}")

    explanation = raw_output
    question_text = normalize_text(" ".join(question_lines))
    if not question_text:
        raise ValueError("could not parse question text")

    return QuestionIn(
        question_text=question_text,
        option_a=options["A"],
        option_b=options["B"],
        option_c=options["C"],
        option_d=options["D"],
        correct_option=answer_match.group(1).upper(),
        explanation=explanation,
        syllabus_category=str(record.get("syllabus_category", "")).strip(),
        source_name=source_name,
        source_url=source_url,
        source_license=source_license,
        exam_level=str(record.get("exam_level", "")).strip(),
        exam_type=str(record.get("exam_type", "")).strip(),
        language=str(record.get("language", "ne")).strip() or "ne",
        verification_status=verification_status,  # type: ignore[arg-type]
        verifier=verifier,
        verified_at=str(record.get("verified_at", "")).strip() or None,
    )


def parse_structured_record(
    record: dict,
    *,
    source_name: str,
    source_url: str,
    source_license: str,
    verifier: str,
    verification_status: str,
) -> QuestionIn:
    payload = {
        **record,
        "source_name": record.get("source_name") or source_name,
        "source_url": record.get("source_url") or source_url,
        "source_license": record.get("source_license") or source_license,
        "verifier": record.get("verifier") or verifier,
        "verification_status": record.get("verification_status") or verification_status,
    }
    return QuestionIn.model_validate(payload)


def import_file(
    path: Path,
    *,
    db_path: Path | None,
    batch_name: str,
    source_name: str,
    source_url: str,
    source_license: str,
    verifier: str,
    verification_status: str,
) -> tuple[int, int, int]:
    initialize_database(db_path)
    imported = 0
    rejected = 0

    connection = connect(db_path)
    try:
        version = next_data_version(connection)
        batch_cursor = connection.execute(
            """
            INSERT INTO import_batches (
                batch_name,
                source_name,
                source_url,
                source_license,
                verifier
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (batch_name, source_name, source_url, source_license, verifier),
        )
        batch_id = int(batch_cursor.lastrowid)

        for record in iter_jsonl(path):
            try:
                if "question_text" in record:
                    question = parse_structured_record(
                        record,
                        source_name=source_name,
                        source_url=source_url,
                        source_license=source_license,
                        verifier=verifier,
                        verification_status=verification_status,
                    )
                else:
                    question = parse_instruction_record(
                        record,
                        source_name=source_name,
                        source_url=source_url,
                        source_license=source_license,
                        verifier=verifier,
                        verification_status=verification_status,
                    )
                insert_question(
                    connection,
                    question,
                    data_version=version,
                    import_batch_id=batch_id,
                )
                imported += 1
            except (ValueError, ValidationError, sqlite3.IntegrityError):
                rejected += 1

        connection.execute(
            "UPDATE import_batches SET imported_count = ?, rejected_count = ? WHERE id = ?",
            (imported, rejected, batch_id),
        )
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()

    return imported, rejected, version


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Import Loksewa JSONL data into the backend database.")
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--db", type=Path, default=None)
    parser.add_argument("--batch-name", required=True)
    parser.add_argument("--source-name", required=True)
    parser.add_argument("--source-url", default="")
    parser.add_argument("--source-license", required=True)
    parser.add_argument("--verifier", required=True)
    parser.add_argument(
        "--verification-status",
        choices=("draft", "needs_review", "verified"),
        default="needs_review",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    imported, rejected, version = import_file(
        args.input,
        db_path=args.db,
        batch_name=args.batch_name,
        source_name=args.source_name,
        source_url=args.source_url,
        source_license=args.source_license,
        verifier=args.verifier,
        verification_status=args.verification_status,
    )
    print(f"Imported {imported} questions, rejected {rejected}, data_version={version}")


if __name__ == "__main__":
    main()
