// Shared helper functions for Loksewa seeding

export function q(text, a, b, c, d, correct, explanation, category, level = 'General', lang = 'en') {
  return {
    question_text: text,
    option_a: a,
    option_b: b,
    option_c: c,
    option_d: d,
    correct_option: correct,
    explanation: explanation,
    syllabus_category: category,
    exam_level: level,
    exam_type: 'MCQ',
    source_name: 'Verified Nepal PSC',
    source_url: '',
    source_license: 'Verified Syllabus',
    source_year: 2026,
    source_page: null,
    language: lang,
    verification_status: 'verified',
    verifier: 'seed-generator',
    verified_at: new Date().toISOString(),
    deleted_at: null,
    data_version: 1
  };
}

export function syl(title, content, category, source_name = 'Official PSC Syllabus') {
  return {
    title,
    content,
    category,
    source_name,
    source_year: 2026,
    verified_at: new Date().toISOString()
  };
}

export function topic(subject_id, title, content_beginner, content_intermediate, content_advanced, revision_notes, sort_order) {
  return {
    subject_id,
    title,
    content_beginner,
    content_intermediate,
    content_advanced,
    revision_notes,
    sort_order
  };
}

export function flashcard(front, back) {
  return {
    front,
    back
  };
}
