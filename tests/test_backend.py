import os
import shutil
import unittest
from pathlib import Path


class BackendApiTest(unittest.TestCase):
    def setUp(self):
        self.temp_dir = Path("C:/tmp/loksewa_ai_backend_test")
        if self.temp_dir.exists():
            shutil.rmtree(self.temp_dir)
        self.temp_dir.mkdir(parents=True, exist_ok=True)
        self.db_path = self.temp_dir / "test.db"
        os.environ["LOKSEWA_DB_PATH"] = str(self.db_path)
        os.environ["LOKSEWA_ADMIN_TOKEN"] = "test-token"
        os.environ["LOKSEWA_DELTA_SIGNING_SECRET"] = "test-secret"
        os.environ["LOKSEWA_BOOTSTRAP_ADMIN_PASSWORD"] = "LoksewaAdmin@123"

        import importlib
        import backend.settings
        import backend.app

        importlib.reload(backend.settings)
        importlib.reload(backend.app)
        backend.app.startup()

        from fastapi.testclient import TestClient

        self.client = TestClient(backend.app.app)

    def tearDown(self):
        if self.temp_dir.exists():
            shutil.rmtree(self.temp_dir)

    def test_verified_question_search_delta_and_report(self):
        question = {
            "question_text": "Which article establishes the Public Service Commission in Nepal?",
            "option_a": "Article 240",
            "option_b": "Article 242",
            "option_c": "Article 244",
            "option_d": "Article 246",
            "correct_option": "B",
            "explanation": "Development fixture explanation.",
            "syllabus_category": "Constitution",
            "source_name": "Development Fixture",
            "source_license": "Internal test data",
            "verifier": "test-suite",
            "verification_status": "verified",
        }

        created = self.client.post(
            "/v1/admin/questions",
            json=question,
            headers={"X-Admin-Token": "test-token"},
        )
        self.assertEqual(created.status_code, 201, created.text)
        question_id = created.json()["id"]

        search = self.client.post(
            "/v1/search",
            json={"query": "public service commission article nepal", "limit": 3},
        )
        self.assertEqual(search.status_code, 200, search.text)
        payload = search.json()
        self.assertIn(payload["answer_source"], {"verified_db", "ai_assisted"})
        self.assertGreaterEqual(len(payload["matches"]), 1)

        architecture = self.client.get("/architecture")
        self.assertEqual(architecture.status_code, 200, architecture.text)
        self.assertIn("Loksewa AI Architecture", architecture.text)

        api_subjects = self.client.get("/api/subjects")
        self.assertEqual(api_subjects.status_code, 200, api_subjects.text)
        self.assertGreaterEqual(len(api_subjects.json()), 1)

        api_search = self.client.get("/api/questions/search?q=public%20service%20commission&limit=1")
        self.assertEqual(api_search.status_code, 200, api_search.text)
        self.assertIn("answer_source", api_search.json())

        delta = self.client.get("/v1/sync/delta?since_version=0")
        self.assertEqual(delta.status_code, 200, delta.text)
        self.assertTrue(delta.json()["signature"])

        report = self.client.post(
            "/v1/reports",
            json={
                "question_id": question_id,
                "report_type": "wrong_answer",
                "message": "Test report",
                "device_id": "device-123",
            },
        )
        self.assertEqual(report.status_code, 201, report.text)
        self.assertEqual(report.json()["status"], "open")

        admin_login = self.client.post(
            "/v1/auth/login",
            json={
                "email": "admin@loksewa.local",
                "password": "LoksewaAdmin@123",
                "client_type": "admin",
            },
        )
        self.assertEqual(admin_login.status_code, 200, admin_login.text)
        admin_token = admin_login.json()["token"]

        student_register = self.client.post(
            "/v1/auth/register",
            json={
                "email": "student@example.com",
                "password": "StudentPass123",
                "full_name": "Test Student",
            },
        )
        self.assertEqual(student_register.status_code, 201, student_register.text)
        student_token = student_register.json()["token"]

        mock = self.client.post(
            "/v1/admin/mock-tests",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "title": "Fixture Mock Test",
                "description": "Timed fixture",
                "duration_minutes": 10,
                "marks_per_correct": 1,
                "negative_marking_enabled": True,
                "negative_marks_per_wrong": 0.2,
                "status": "published",
                "question_ids": [question_id],
            },
        )
        self.assertEqual(mock.status_code, 201, mock.text)
        mock_id = mock.json()["id"]

        start = self.client.post(
            f"/v1/mock-tests/{mock_id}/start",
            headers={"Authorization": f"Bearer {student_token}"},
        )
        self.assertEqual(start.status_code, 201, start.text)
        attempt_id = start.json()["id"]

        answer = self.client.post(
            f"/v1/mock-attempts/{attempt_id}/answers",
            headers={"Authorization": f"Bearer {student_token}"},
            json={"question_id": question_id, "selected_option": "B"},
        )
        self.assertEqual(answer.status_code, 200, answer.text)

        submit = self.client.post(
            f"/v1/mock-attempts/{attempt_id}/submit",
            headers={"Authorization": f"Bearer {student_token}"},
        )
        self.assertEqual(submit.status_code, 200, submit.text)
        result = submit.json()["attempt"]
        self.assertEqual(result["correct_count"], 1)
        self.assertEqual(result["wrong_count"], 0)
        self.assertEqual(result["unanswered_count"], 0)
        self.assertEqual(result["score"], 1)


if __name__ == "__main__":
    unittest.main()
