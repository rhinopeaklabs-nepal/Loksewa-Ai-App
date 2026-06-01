import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { join, resolve } from "node:path";

async function main() {
  const tempBase = resolve(process.cwd(), "..", "runtime", "tests");
  await mkdir(tempBase, { recursive: true });
  const tempDir = await mkdtemp(join(tempBase, "loksewa-node-backend-"));

  process.env.NODE_ENV = "test";
  process.env.LOKSEWA_ENV = "test";
  process.env.NODE_BACKEND_DB_PATH = join(tempDir, "backend-test-db.json");
  process.env.LOKSEWA_ADMIN_TOKEN = "test-admin-token";
  process.env.LOKSEWA_SESSION_SECRET = "test-session-secret";
  process.env.LOKSEWA_DELTA_SIGNING_SECRET = "test-delta-signing-secret";
  process.env.LOKSEWA_BOOTSTRAP_ADMIN_EMAIL = "admin@loksewa.local";
  process.env.LOKSEWA_BOOTSTRAP_ADMIN_PASSWORD = "LoksewaAdmin@Test123";
  process.env.LOKSEWA_SCRAPER_ENABLED = "false";
  process.env.LOG_LEVEL = "silent";

  const appModule = await import("../dist/app.js");
  const { buildApp } = appModule.default ?? appModule;
  const app = await buildApp();

  try {
    const health = await app.inject({ method: "GET", url: "/healthz" });
    assert.equal(health.statusCode, 200);
    assert.equal(health.json().runtime, "node");
    assert.equal(health.headers["x-content-type-options"], "nosniff");
    assert.equal(health.headers["x-frame-options"], "DENY");

    const question = {
      question_text: "Which article establishes the Public Service Commission in Nepal?",
      option_a: "Article 240",
      option_b: "Article 242",
      option_c: "Article 244",
      option_d: "Article 246",
      correct_option: "B",
      explanation: "Article 242 establishes the Public Service Commission.",
      syllabus_category: "Constitution",
      source_name: "Development Fixture",
      source_url: "",
      source_license: "Internal test data",
      source_year: 2080,
      source_page: null,
      exam_level: "Officer",
      exam_type: "Loksewa",
      language: "en",
      verification_status: "verified",
      verifier: "node-test",
      verified_at: new Date().toISOString(),
      deleted_at: null
    };

    const created = await app.inject({
      method: "POST",
      url: "/v1/admin/questions",
      headers: { "x-admin-token": "test-admin-token" },
      payload: question
    });
    assert.equal(created.statusCode, 201, created.body);
    const questionId = created.json().id;

    const search = await app.inject({
      method: "POST",
      url: "/v1/search",
      payload: { query: "public service commission article nepal", limit: 3 }
    });
    assert.equal(search.statusCode, 200, search.body);
    assert.equal(search.json().answer_source, "verified_db");

    const delta = await app.inject({ method: "GET", url: "/v1/sync/delta?since_version=0" });
    assert.equal(delta.statusCode, 200, delta.body);
    assert.ok(delta.json().signature);

    const report = await app.inject({
      method: "POST",
      url: "/v1/reports",
      payload: {
        question_id: questionId,
        report_type: "wrong_answer",
        message: "<script>Test report</script>",
        contact: "qa@example.com",
        device_id: "device-123"
      }
    });
    assert.equal(report.statusCode, 201, report.body);
    assert.equal(report.json().status, "open");

    const reports = await app.inject({
      method: "GET",
      url: "/v1/admin/reports",
      headers: { "x-admin-token": "test-admin-token" }
    });
    assert.equal(reports.statusCode, 200, reports.body);
    assert.equal(reports.json()[0].message.includes("<"), false);
    assert.equal(reports.json()[0].message.includes(">"), false);
    assert.ok(reports.json()[0].device_hash);
    assert.equal("device_id" in reports.json()[0], false);

    const adminLogin = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      payload: {
        email: "admin@loksewa.local",
        password: "LoksewaAdmin@Test123",
        client_type: "admin"
      }
    });
    assert.equal(adminLogin.statusCode, 200, adminLogin.body);
    const adminToken = adminLogin.json().token;

    const studentRegister = await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      payload: {
        email: "student@example.com",
        password: "StudentPass123",
        full_name: "Test Student"
      }
    });
    assert.equal(studentRegister.statusCode, 201, studentRegister.body);
    const studentToken = studentRegister.json().token;

    const mock = await app.inject({
      method: "POST",
      url: "/v1/admin/mock-tests",
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        title: "Fixture Mock Test",
        description: "Timed fixture",
        exam_level: "Officer",
        exam_type: "Loksewa",
        syllabus_category: "Constitution",
        duration_minutes: 10,
        marks_per_correct: 1,
        negative_marking_enabled: true,
        negative_marks_per_wrong: 0.2,
        status: "published",
        question_ids: [questionId]
      }
    });
    assert.equal(mock.statusCode, 201, mock.body);
    const mockId = mock.json().id;

    const attempt = await app.inject({
      method: "POST",
      url: `/v1/mock-tests/${mockId}/start`,
      headers: { authorization: `Bearer ${studentToken}` }
    });
    assert.equal(attempt.statusCode, 201, attempt.body);
    const attemptId = attempt.json().id;

    const answer = await app.inject({
      method: "POST",
      url: `/v1/mock-attempts/${attemptId}/answers`,
      headers: { authorization: `Bearer ${studentToken}` },
      payload: { question_id: questionId, selected_option: "B" }
    });
    assert.equal(answer.statusCode, 200, answer.body);

    const submit = await app.inject({
      method: "POST",
      url: `/v1/mock-attempts/${attemptId}/submit`,
      headers: { authorization: `Bearer ${studentToken}` }
    });
    assert.equal(submit.statusCode, 200, submit.body);
    assert.equal(submit.json().attempt.correct_count, 1);
    assert.equal(submit.json().attempt.score, 1);

    console.log("Node backend API smoke test passed");
  } finally {
    await app.close();
    await rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
