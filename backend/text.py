import re
import unicodedata


FTS_SPECIAL = re.compile(r'["]')


def normalize_text(value: str | None) -> str:
    normalized = unicodedata.normalize("NFKC", value or "")
    return " ".join(normalized.strip().lower().split())


def build_fts_query(value: str, max_terms: int = 24) -> str:
    terms = [
        term
        for term in normalize_text(value).split(" ")
        if len(term) >= 3
    ][:max_terms]

    if not terms:
        return quote_fts_term(value)
    return " OR ".join(quote_fts_term(term) for term in terms)


def quote_fts_term(value: str) -> str:
    escaped = FTS_SPECIAL.sub('""', value.strip())
    return f'"{escaped}"'


def trigrams(value: str) -> set[str]:
    normalized = f"  {normalize_text(value)}  "
    if len(normalized) < 3:
        return set()
    return {normalized[index:index + 3] for index in range(len(normalized) - 2)}


def trigram_similarity(left: str, right: str) -> float:
    a = trigrams(left)
    b = trigrams(right)
    if not a or not b:
        return 0.0
    intersection = len(a.intersection(b))
    union = len(a) + len(b) - intersection
    return 0.0 if union == 0 else intersection / union
