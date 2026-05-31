import 'dart:io';

import 'package:archive/archive_io.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:path/path.dart' as p;
import 'package:sqflite/sqflite.dart';

class VerifiedQuestionMatch {
  const VerifiedQuestionMatch({
    required this.id,
    required this.questionText,
    required this.optionA,
    required this.optionB,
    required this.optionC,
    required this.optionD,
    required this.correctOption,
    required this.explanation,
    required this.syllabusCategory,
    required this.sourceName,
    required this.bm25Score,
    this.sourceYear,
    this.sourcePage,
  });

  final int id;
  final String questionText;
  final String optionA;
  final String optionB;
  final String optionC;
  final String optionD;
  final String correctOption;
  final String explanation;
  final String syllabusCategory;
  final String sourceName;
  final int? sourceYear;
  final int? sourcePage;
  final double bm25Score;

  factory VerifiedQuestionMatch.fromRow(Map<String, Object?> row) {
    return VerifiedQuestionMatch(
      id: row['id'] as int,
      questionText: row['question_text'] as String,
      optionA: row['option_a'] as String,
      optionB: row['option_b'] as String,
      optionC: row['option_c'] as String,
      optionD: row['option_d'] as String,
      correctOption: row['correct_option'] as String,
      explanation: row['explanation'] as String,
      syllabusCategory: row['syllabus_category'] as String,
      sourceName: row['source_name'] as String,
      sourceYear: row['source_year'] as int?,
      sourcePage: row['source_page'] as int?,
      bm25Score: (row['bm25_score'] as num).toDouble(),
    );
  }
}

class OfflineDatabaseService {
  OfflineDatabaseService({
    this.assetPath = 'assets/loksewa_v1.db.gz',
    this.databaseFileName = 'loksewa_active.db',
  });

  final String assetPath;
  final String databaseFileName;

  Database? _database;

  Future<Database> get database async {
    final existing = _database;
    if (existing != null) return existing;

    final installedPath = await _ensureInstalled();
    _database = await openDatabase(installedPath, readOnly: true);
    return _database!;
  }

  Future<List<VerifiedQuestionMatch>> searchVerifiedQuestions(
    String input, {
    int limit = 3,
  }) async {
    final normalized = normalizeText(input);
    if (normalized.length < 3) return const [];

    final ftsQuery = buildFtsQuery(normalized);
    final rows = await (await database).rawQuery(
      '''
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
      WHERE fts_questions MATCH ?
      ORDER BY bm25_score ASC
      LIMIT ?
      ''',
      [ftsQuery, limit],
    );

    return rows.map(VerifiedQuestionMatch.fromRow).toList(growable: false);
  }

  Future<void> close() async {
    final existing = _database;
    _database = null;
    await existing?.close();
  }

  Future<String> _ensureInstalled() async {
    final databasesPath = await getDatabasesPath();
    final installedPath = p.join(databasesPath, databaseFileName);

    if (await databaseExists(installedPath)) {
      return installedPath;
    }

    await Directory(databasesPath).create(recursive: true);
    final tempPath = '$installedPath.tmp';
    final tempFile = File(tempPath);

    if (await tempFile.exists()) {
      await tempFile.delete();
    }

    final data = await rootBundle.load(assetPath);
    final compressedBytes = data.buffer.asUint8List(
      data.offsetInBytes,
      data.lengthInBytes,
    );

    final databaseBytes = await compute(_decodeGzipBytes, compressedBytes);
    await tempFile.writeAsBytes(databaseBytes, flush: true);
    await tempFile.rename(installedPath);

    return installedPath;
  }
}

List<int> _decodeGzipBytes(Uint8List bytes) {
  return GZipDecoder().decodeBytes(bytes);
}

String normalizeText(String value) {
  return value
      .replaceAll(RegExp(r'\s+'), ' ')
      .trim()
      .toLowerCase();
}

String buildFtsQuery(String normalizedInput) {
  final terms = normalizedInput
      .split(' ')
      .map((term) => term.trim())
      .where((term) => term.length >= 3)
      .take(24)
      .map(_quoteFtsTerm)
      .toList(growable: false);

  if (terms.isEmpty) {
    return _quoteFtsTerm(normalizedInput);
  }

  return terms.join(' OR ');
}

String _quoteFtsTerm(String value) {
  final escaped = value.replaceAll('"', '""');
  return '"$escaped"';
}
