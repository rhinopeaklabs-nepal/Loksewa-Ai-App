import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/Dashboard";
import { QuestionsPage } from "./pages/Questions";
import { UsersPage } from "./pages/Users";
import { MockExamsPage } from "./pages/MockExams";
import { KnowledgePage } from "./pages/Knowledge";
import { AnalyticsPage } from "./pages/Analytics";
import { LoginPage } from "./pages/Login";

export default function App() {
  const isAuthed = localStorage.getItem("admin_token");

  if (!isAuthed) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/exams" element={<MockExamsPage />} />
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}
