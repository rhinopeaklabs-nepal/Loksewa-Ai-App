SELECT
    q.id,
    q.question_text,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_option,
    q.explanation,
    q.syllabus_category,
    q.source_name,
    q.source_year,
    q.source_page,
    bm25(fts_questions) AS bm25_score
FROM fts_questions
JOIN loksewa_questions q ON q.id = fts_questions.rowid
WHERE fts_questions MATCH :fts_query
ORDER BY bm25_score ASC
LIMIT :limit;
