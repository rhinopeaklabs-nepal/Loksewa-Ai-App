const state = {
  token: localStorage.getItem("loksewa_admin_token") || "",
  user: null,
  questions: [],
  syllabus: [],
  mocks: [],
  users: [],
  reports: [],
};

const $ = (id) => document.getElementById(id);

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toast(message) {
  const element = $("toast");
  element.textContent = message;
  element.classList.add("show");
  window.setTimeout(() => element.classList.remove("show"), 2200);
}

async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }
  const response = await fetch(path, {
    ...options,
    headers,
  });
  if (response.status === 204) return null;
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const detail = payload?.detail;
    throw new Error(Array.isArray(detail) ? detail.map((item) => item.msg).join(", ") : detail || response.statusText);
  }
  return payload;
}

function showApp(user) {
  state.user = user;
  $("loginView").classList.add("hidden");
  $("appView").classList.remove("hidden");
  $("adminName").textContent = user.full_name || user.email;
}

function showLogin() {
  state.token = "";
  state.user = null;
  localStorage.removeItem("loksewa_admin_token");
  $("loginView").classList.remove("hidden");
  $("appView").classList.add("hidden");
}

async function boot() {
  bindEvents();
  if (!state.token) return showLogin();
  try {
    const user = await api("/v1/auth/me");
    if (user.role !== "admin") throw new Error("Admin account required");
    showApp(user);
    await loadAll();
  } catch (error) {
    showLogin();
  }
}

function bindEvents() {
  $("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    $("loginError").textContent = "";
    try {
      const payload = await api("/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: $("loginEmail").value,
          password: $("loginPassword").value,
          client_type: "admin",
        }),
      });
      state.token = payload.token;
      localStorage.setItem("loksewa_admin_token", payload.token);
      showApp(payload.user);
      await loadAll();
    } catch (error) {
      $("loginError").textContent = error.message;
    }
  });

  $("logoutButton").addEventListener("click", async () => {
    try {
      await api("/v1/auth/logout", { method: "POST" });
    } catch (_) {
      // Local sign-out still matters if the server session is already gone.
    }
    showLogin();
  });

  document.querySelectorAll("#tabs button").forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });

  $("refreshQuestions").addEventListener("click", loadQuestions);
  $("questionStatusFilter").addEventListener("change", loadQuestions);
  $("questionFilter").addEventListener("input", debounce(loadQuestions, 250));
  $("questionForm").addEventListener("submit", saveQuestion);
  $("resetQuestion").addEventListener("click", resetQuestionForm);

  $("syllabusForm").addEventListener("submit", saveSyllabus);
  $("resetSyllabus").addEventListener("click", resetSyllabusForm);

  $("mockForm").addEventListener("submit", saveMock);
  $("resetMock").addEventListener("click", resetMockForm);

  $("userForm").addEventListener("submit", saveUser);
  $("resetUser").addEventListener("click", resetUserForm);

  $("refreshReports").addEventListener("click", loadReports);
  $("reportStatusFilter").addEventListener("change", loadReports);
}

function debounce(fn, wait) {
  let handle;
  return () => {
    window.clearTimeout(handle);
    handle = window.setTimeout(fn, wait);
  };
}

function switchTab(tab) {
  const titles = {
    overview: ["Overview", "Verified data cockpit"],
    questions: ["Questions", "Question bank CRUD"],
    syllabus: ["Syllabus", "Reference material"],
    mocks: ["Mock Tests", "Exam simulation"],
    users: ["Users", "Access control"],
    reports: ["Reports", "Content review queue"],
  };
  document.querySelectorAll("#tabs button").forEach((button) => button.classList.toggle("active", button.dataset.tab === tab));
  document.querySelectorAll(".panel").forEach((panel) => panel.classList.remove("active"));
  $(`${tab}Panel`).classList.add("active");
  $("activeSectionLabel").textContent = titles[tab][0];
  $("activeSectionTitle").textContent = titles[tab][1];
}

async function loadAll() {
  await Promise.all([loadQuestions(), loadSyllabus(), loadMocks(), loadUsers(), loadReports()]);
  renderMetrics();
}

function renderMetrics() {
  $("metricQuestions").textContent = state.questions.length;
  $("metricMocks").textContent = state.mocks.length;
  $("metricUsers").textContent = state.users.length;
  $("metricReports").textContent = state.reports.filter((report) => report.status === "open").length;
}

async function loadQuestions() {
  const params = new URLSearchParams();
  const status = $("questionStatusFilter").value;
  const query = $("questionFilter").value.trim();
  if (status) params.set("verification_status", status);
  if (query) params.set("query", query);
  state.questions = await api(`/v1/admin/questions?${params.toString()}`);
  renderQuestions();
  renderMetrics();
}

function questionPayload() {
  return {
    question_text: $("questionText").value,
    option_a: $("optionA").value,
    option_b: $("optionB").value,
    option_c: $("optionC").value,
    option_d: $("optionD").value,
    correct_option: $("correctOption").value,
    explanation: $("questionExplanation").value,
    syllabus_category: $("questionCategory").value,
    source_name: $("questionSource").value,
    source_license: $("questionLicense").value,
    verifier: $("questionVerifier").value,
    exam_level: $("questionLevel").value,
    exam_type: $("questionType").value,
    language: "ne",
    verification_status: $("questionVerification").value,
  };
}

async function saveQuestion(event) {
  event.preventDefault();
  const id = $("questionId").value;
  try {
    await api(id ? `/v1/admin/questions/${id}` : "/v1/admin/questions", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(questionPayload()),
    });
    resetQuestionForm();
    await loadQuestions();
    toast("Question saved");
  } catch (error) {
    toast(error.message);
  }
}

function resetQuestionForm() {
  $("questionForm").reset();
  $("questionId").value = "";
  $("questionVerification").value = "needs_review";
}

function editQuestion(id) {
  const item = state.questions.find((question) => question.id === id);
  if (!item) return;
  $("questionId").value = item.id;
  $("questionText").value = item.question_text;
  $("optionA").value = item.option_a;
  $("optionB").value = item.option_b;
  $("optionC").value = item.option_c;
  $("optionD").value = item.option_d;
  $("correctOption").value = item.correct_option;
  $("questionExplanation").value = item.explanation || "";
  $("questionCategory").value = item.syllabus_category || "";
  $("questionSource").value = item.source_name || "";
  $("questionLicense").value = item.source_license || "";
  $("questionVerifier").value = item.verifier || "";
  $("questionLevel").value = item.exam_level || "";
  $("questionType").value = item.exam_type || "";
  $("questionVerification").value = item.verification_status;
  $("questionText").focus();
}

async function deleteQuestion(id) {
  if (!confirm("Reject this question?")) return;
  await api(`/v1/admin/questions/${id}`, { method: "DELETE" });
  await loadQuestions();
  toast("Question rejected");
}

function statusBadge(status) {
  const tone = status === "verified" || status === "published" || status === "active" || status === "resolved"
    ? ""
    : status === "rejected" || status === "disabled" || status === "archived"
      ? "danger"
      : "warn";
  return `<span class="badge ${tone}">${escapeHtml(status)}</span>`;
}

function renderQuestions() {
  $("questionsTable").innerHTML = table(
    ["ID", "Question", "Category", "Status", "Source", "Actions"],
    state.questions.map((item) => [
      item.id,
      `<strong>${escapeHtml(item.question_text).slice(0, 150)}</strong>`,
      escapeHtml(item.syllabus_category),
      statusBadge(item.verification_status),
      escapeHtml(item.source_name),
      actions([
        ["Edit", `editQuestion(${item.id})`],
        ["Reject", `deleteQuestion(${item.id})`, "danger"],
      ]),
    ]),
  );
}

async function loadSyllabus() {
  state.syllabus = await api("/v1/admin/syllabus");
  renderSyllabus();
}

function syllabusPayload() {
  const year = $("syllabusYear").value;
  return {
    title: $("syllabusTitle").value,
    content: $("syllabusContent").value,
    category: $("syllabusCategory").value,
    source_name: $("syllabusSource").value,
    source_year: year ? Number(year) : null,
  };
}

async function saveSyllabus(event) {
  event.preventDefault();
  const id = $("syllabusId").value;
  try {
    await api(id ? `/v1/admin/syllabus/${id}` : "/v1/admin/syllabus", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(syllabusPayload()),
    });
    resetSyllabusForm();
    await loadSyllabus();
    toast("Syllabus saved");
  } catch (error) {
    toast(error.message);
  }
}

function resetSyllabusForm() {
  $("syllabusForm").reset();
  $("syllabusId").value = "";
}

function editSyllabus(id) {
  const item = state.syllabus.find((entry) => entry.id === id);
  if (!item) return;
  $("syllabusId").value = item.id;
  $("syllabusTitle").value = item.title;
  $("syllabusContent").value = item.content;
  $("syllabusCategory").value = item.category || "";
  $("syllabusSource").value = item.source_name || "";
  $("syllabusYear").value = item.source_year || "";
}

async function deleteSyllabus(id) {
  if (!confirm("Delete this syllabus entry?")) return;
  await api(`/v1/admin/syllabus/${id}`, { method: "DELETE" });
  await loadSyllabus();
  toast("Syllabus deleted");
}

function renderSyllabus() {
  $("syllabusTable").innerHTML = table(
    ["ID", "Title", "Category", "Source", "Actions"],
    state.syllabus.map((item) => [
      item.id,
      `<strong>${escapeHtml(item.title)}</strong><br><span>${escapeHtml(item.content).slice(0, 140)}</span>`,
      escapeHtml(item.category),
      escapeHtml(item.source_name),
      actions([
        ["Edit", `editSyllabus(${item.id})`],
        ["Delete", `deleteSyllabus(${item.id})`, "danger"],
      ]),
    ]),
  );
}

async function loadMocks() {
  state.mocks = await api("/v1/admin/mock-tests");
  renderMocks();
  renderMetrics();
}

function parseIds(value) {
  return value.split(",").map((id) => Number(id.trim())).filter((id) => Number.isInteger(id) && id > 0);
}

function mockPayload() {
  return {
    title: $("mockTitle").value,
    description: $("mockDescription").value,
    exam_level: $("mockLevel").value,
    exam_type: $("mockType").value,
    syllabus_category: "",
    duration_minutes: Number($("mockDuration").value || 45),
    marks_per_correct: Number($("mockCorrect").value || 1),
    negative_marking_enabled: $("mockNegative").value === "true",
    negative_marks_per_wrong: Number($("mockWrong").value || 0),
    status: $("mockStatus").value,
    question_ids: parseIds($("mockQuestionIds").value),
  };
}

async function saveMock(event) {
  event.preventDefault();
  const id = $("mockId").value;
  try {
    await api(id ? `/v1/admin/mock-tests/${id}` : "/v1/admin/mock-tests", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(mockPayload()),
    });
    resetMockForm();
    await loadMocks();
    toast("Mock test saved");
  } catch (error) {
    toast(error.message);
  }
}

function resetMockForm() {
  $("mockForm").reset();
  $("mockId").value = "";
  $("mockDuration").value = 45;
  $("mockCorrect").value = 1;
  $("mockWrong").value = 0.2;
}

function editMock(id) {
  const item = state.mocks.find((mock) => mock.id === id);
  if (!item) return;
  $("mockId").value = item.id;
  $("mockTitle").value = item.title;
  $("mockDescription").value = item.description || "";
  $("mockStatus").value = item.status;
  $("mockDuration").value = item.duration_minutes;
  $("mockCorrect").value = item.marks_per_correct;
  $("mockWrong").value = item.negative_marks_per_wrong;
  $("mockNegative").value = String(item.negative_marking_enabled);
  $("mockLevel").value = item.exam_level || "";
  $("mockType").value = item.exam_type || "";
  $("mockQuestionIds").value = item.question_ids.join(", ");
}

async function deleteMock(id) {
  if (!confirm("Archive this mock test?")) return;
  await api(`/v1/admin/mock-tests/${id}`, { method: "DELETE" });
  await loadMocks();
  toast("Mock test archived");
}

function renderMocks() {
  $("mocksTable").innerHTML = table(
    ["ID", "Mock test", "Timer", "Marking", "Questions", "Status", "Actions"],
    state.mocks.map((item) => [
      item.id,
      `<strong>${escapeHtml(item.title)}</strong><br><span>${escapeHtml(item.description || "")}</span>`,
      `${item.duration_minutes} min`,
      `+${item.marks_per_correct} / ${item.negative_marking_enabled ? `-${item.negative_marks_per_wrong}` : "0"}`,
      item.total_questions,
      statusBadge(item.status),
      actions([
        ["Edit", `editMock(${item.id})`],
        ["Archive", `deleteMock(${item.id})`, "danger"],
      ]),
    ]),
  );
}

async function loadUsers() {
  state.users = await api("/v1/admin/users");
  renderUsers();
  renderMetrics();
}

function userPayload() {
  const payload = {
    email: $("userEmail").value,
    full_name: $("userName").value,
    role: $("userRole").value,
    status: $("userStatus").value,
  };
  if ($("userPassword").value) payload.password = $("userPassword").value;
  return payload;
}

async function saveUser(event) {
  event.preventDefault();
  const id = $("userId").value;
  const payload = userPayload();
  if (!id && !payload.password) {
    toast("Password is required for new users");
    return;
  }
  try {
    await api(id ? `/v1/admin/users/${id}` : "/v1/admin/users", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload),
    });
    resetUserForm();
    await loadUsers();
    toast("User saved");
  } catch (error) {
    toast(error.message);
  }
}

function resetUserForm() {
  $("userForm").reset();
  $("userId").value = "";
}

function editUser(id) {
  const item = state.users.find((user) => user.id === id);
  if (!item) return;
  $("userId").value = item.id;
  $("userEmail").value = item.email;
  $("userName").value = item.full_name || "";
  $("userRole").value = item.role;
  $("userStatus").value = item.status;
  $("userPassword").value = "";
}

async function deleteUser(id) {
  if (!confirm("Delete this user and sessions?")) return;
  await api(`/v1/admin/users/${id}`, { method: "DELETE" });
  await loadUsers();
  toast("User deleted");
}

function renderUsers() {
  $("usersTable").innerHTML = table(
    ["ID", "Email", "Name", "Role", "Status", "Last login", "Actions"],
    state.users.map((item) => [
      item.id,
      escapeHtml(item.email),
      escapeHtml(item.full_name),
      escapeHtml(item.role),
      statusBadge(item.status),
      escapeHtml(item.last_login_at || ""),
      actions([
        ["Edit", `editUser(${item.id})`],
        ["Delete", `deleteUser(${item.id})`, "danger"],
      ]),
    ]),
  );
}

async function loadReports() {
  const params = new URLSearchParams();
  const status = $("reportStatusFilter").value;
  if (status) params.set("report_status", status);
  state.reports = await api(`/v1/admin/reports?${params.toString()}`);
  renderReports();
  renderMetrics();
}

async function updateReport(id, status) {
  await api(`/v1/admin/reports/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
  await loadReports();
  toast("Report updated");
}

async function deleteReport(id) {
  if (!confirm("Delete this report?")) return;
  await api(`/v1/admin/reports/${id}`, { method: "DELETE" });
  await loadReports();
  toast("Report deleted");
}

function renderReports() {
  $("reportsTable").innerHTML = table(
    ["ID", "Type", "Message", "Status", "Created", "Actions"],
    state.reports.map((item) => [
      item.id,
      escapeHtml(item.report_type),
      `<strong>${escapeHtml(item.message || item.scanned_text || "No message")}</strong><br><span>${escapeHtml(item.contact || "")}</span>`,
      statusBadge(item.status),
      escapeHtml(item.created_at),
      actions([
        ["Triaged", `updateReport(${item.id}, "triaged")`],
        ["Resolved", `updateReport(${item.id}, "resolved")`],
        ["Reject", `updateReport(${item.id}, "rejected")`, "danger"],
        ["Delete", `deleteReport(${item.id})`, "danger"],
      ]),
    ]),
  );
}

function actions(items) {
  return `<div class="row-actions">${items.map(([label, handler, tone]) => `<button class="tiny ${tone || ""}" onclick='${handler}'>${escapeHtml(label)}</button>`).join("")}</div>`;
}

function table(headers, rows) {
  if (!rows.length) {
    return "<table><tbody><tr><td>No records found.</td></tr></tbody></table>";
  }
  return `
    <table>
      <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
  `;
}

window.editQuestion = editQuestion;
window.deleteQuestion = deleteQuestion;
window.editSyllabus = editSyllabus;
window.deleteSyllabus = deleteSyllabus;
window.editMock = editMock;
window.deleteMock = deleteMock;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.updateReport = updateReport;
window.deleteReport = deleteReport;

boot();
