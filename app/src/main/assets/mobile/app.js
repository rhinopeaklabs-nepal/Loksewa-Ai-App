/* ═══════════════════════════════════════════════════════════════
   LOKSEWA AI — MOBILE APP (REDESIGN 2026)
   Enhanced JavaScript with Modern Interactions
   ═══════════════════════════════════════════════════════════════ */

let rawApiBase = (window.AndroidSecureStorage && window.AndroidSecureStorage.getApiBaseUrl()) 
  || (location.protocol === "file:" ? "http://10.0.2.2:8000" : location.origin);
if (rawApiBase.endsWith("/")) {
  rawApiBase = rawApiBase.slice(0, -1);
}
const API_BASE = rawApiBase;

const secureStorage = {
  getItem(key) {
    if (window.AndroidSecureStorage) {
      try {
        return window.AndroidSecureStorage.getItem(key);
      } catch (e) {
        console.error("Error calling AndroidSecureStorage.getItem:", e);
      }
    }
    return localStorage.getItem(key);
  },
  setItem(key, value) {
    if (window.AndroidSecureStorage) {
      try {
        window.AndroidSecureStorage.setItem(key, value);
        return;
      } catch (e) {
        console.error("Error calling AndroidSecureStorage.setItem:", e);
      }
    }
    localStorage.setItem(key, value);
  },
  removeItem(key) {
    if (window.AndroidSecureStorage) {
      try {
        window.AndroidSecureStorage.removeItem(key);
        return;
      } catch (e) {
        console.error("Error calling AndroidSecureStorage.removeItem:", e);
      }
    }
    localStorage.removeItem(key);
  }
};

// ═══════════════════════════════════════════════════════════════
// STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════

const state = {
  token: secureStorage.getItem("loksewa_mobile_token") || "",
  user: null,
  authMode: "login",
  mocks: [],
  attempt: null,
  timerHandle: null,
  answers: new Map(),
  categories: [],
  browseCategory: null,
  browseQuestions: [],
  questionDetail: null,
  searchHistory: JSON.parse(localStorage.getItem("loksewa_scan_history") || "[]"),
  userStats: null,
  theme: localStorage.getItem("loksewa_theme") || "dark",
  questionsViewed: parseInt(localStorage.getItem("loksewa_questions_viewed") || "0"),
  screenStack: ["homeScreen"],
  isLoading: false,
  isOnline: navigator.onLine,
};

// ═══════════════════════════════════════════════════════════════
// OFFLINE DETECTION & UI INITIALIZATION
// ═══════════════════════════════════════════════════════════════

function initOnlineStatus() {
  updateOnlineIndicator();
  window.addEventListener("online", () => {
    state.isOnline = true;
    updateOnlineIndicator();
    toast("Back online — syncing data...");
  });
  window.addEventListener("offline", () => {
    state.isOnline = false;
    updateOnlineIndicator();
    toast("You're offline — using cached data");
  });
}

function updateOnlineIndicator() {
  const indicator = document.getElementById("offlineIndicator");
  if (!indicator) return;
  
  if (!state.isOnline) {
    indicator.classList.add("visible");
  } else {
    indicator.classList.remove("visible");
  }
}

function initCameraPermissionModal() {
  const modal = document.getElementById("cameraPermissionModal");
  const allowBtn = document.getElementById("cameraPermissionAllow");
  const dismissBtn = document.getElementById("cameraPermissionDismiss");
  
  if (!modal || !allowBtn || !dismissBtn) return;
  
  allowBtn.addEventListener("click", async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      modal.classList.remove("visible");
      toast("Camera access enabled");
    } catch (error) {
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        toast("Camera permission denied");
      } else {
        toast("Camera not available");
      }
      modal.classList.remove("visible");
    }
  });
  
  dismissBtn.addEventListener("click", () => {
    modal.classList.remove("visible");
    toast("You can enable camera later in Settings");
  });
}

function showCameraPermissionModal() {
  const modal = document.getElementById("cameraPermissionModal");
  if (modal) {
    modal.classList.add("visible");
  }
}

function showCameraPermissionPrompt() {
  const modal = document.getElementById("cameraPermissionModal");
  if (!modal) return;
  
  const hasPermission = localStorage.getItem("loksewa_camera_permission_shown");
  if (!hasPermission) {
    setTimeout(() => {
      modal.classList.add("visible");
      localStorage.setItem("loksewa_camera_permission_shown", "true");
    }, 1000);
  }
}

// ═══════════════════════════════════════════════════════════════
// USER-FRIENDLY ERROR HANDLING
// ═══════════════════════════════════════════════════════════════

function showErrorState(container, title, message, retryCallback) {
  if (!container) return "";
  return `
    <div class="error-state">
      <div class="error-icon">
        <span class="ui-icon">
          <svg class="ui-icon-svg" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </span>
      </div>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(message)}</p>
      ${retryCallback ? `<button class="btn btn-secondary" type="button" onclick="${retryCallback}">Try Again</button>` : ""}
    </div>
  `;
}

function getUserFriendlyError(error) {
  const message = error?.message || String(error) || "Unknown error occurred";
  
  // Network errors
  if (!navigator.onLine || message.includes("fetch") || message.includes("network") || message.includes("Failed to fetch") || message.includes("NetworkError") || message.includes("net::ERR")) {
    return {
      title: "Connection Issue",
      message: "Please check your internet connection and try again.",
      recoverable: true,
    };
  }
  
  // 401 Unauthorized
  if (message.includes("401") || message.toLowerCase().includes("unauthorized") || message.toLowerCase().includes("not authenticated")) {
    return {
      title: "Session Expired",
      message: "Please sign in again to continue.",
      recoverable: false,
    };
  }
  
  // 403 Forbidden
  if (message.includes("403") || message.toLowerCase().includes("forbidden") || message.toLowerCase().includes("access denied")) {
    return {
      title: "Access Restricted",
      message: "You don't have permission for this action.",
      recoverable: false,
    };
  }
  
  // 404 Not Found
  if (message.includes("404") || message.includes("not found") || message.includes("NotFound")) {
    return {
      title: "Not Found",
      message: "The content you're looking for doesn't exist or has been removed.",
      recoverable: true,
    };
  }
  
  // 500 Server Error
  if (message.includes("500") || message.includes("Internal Server Error") || message.includes("server error")) {
    return {
      title: "Server Issue",
      message: "Our servers are having trouble. Please try again in a few moments.",
      recoverable: true,
    };
  }
  
  // 429 Rate Limited
  if (message.includes("429") || message.includes("Too Many Requests") || message.includes("rate limit")) {
    return {
      title: "Slow Down",
      message: "You're making requests too quickly. Please wait a moment and try again.",
      recoverable: true,
    };
  }
  
  // Timeout
  if (message.includes("timeout") || message.includes("Timeout") || message.includes("timed out")) {
    return {
      title: "Request Timed Out",
      message: "The server is taking too long to respond. Please try again.",
      recoverable: true,
    };
  }
  
  // JSON parse error
  if (message.includes("JSON") || message.includes("Unexpected token") || message.includes("SyntaxError")) {
    return {
      title: "Data Error",
      message: "We received unexpected data from the server. Please try again.",
      recoverable: true,
    };
  }
  
  // Default - generic but friendly
  return {
    title: "Something Went Wrong",
    message: "An unexpected error occurred. Please try again.",
    recoverable: true,
  };
}

// ═══════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════

const $ = (id) => document.getElementById(id);

function toast(message, duration = 2500) {
  const el = $("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), duration);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ═══════════════════════════════════════════════════════════════
// API HANDLER
// ═══════════════════════════════════════════════════════════════

async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  
  try {
    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (response.status === 204) return null;
    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;
    if (!response.ok) {
      const detail = payload?.detail;
      throw new Error(
        Array.isArray(detail) ? detail.map((item) => item.msg).join(", ") : detail || response.statusText
      );
    }
    return payload;
  } catch (error) {
    // Provide user-friendly error messages
    const friendlyError = getUserFriendlyError(error);
    const enhancedError = new Error(friendlyError.message);
    enhancedError.userTitle = friendlyError.title;
    enhancedError.recoverable = friendlyError.recoverable;
    enhancedError.originalError = error;
    
    if (error.message === "Unauthorized" || error.message.includes("401")) {
      logout();
    }
    throw enhancedError;
  }
}

// ═══════════════════════════════════════════════════════════════
// THEME MANAGEMENT
// ═══════════════════════════════════════════════════════════════

function initTheme() {
  const saved = state.theme;
  document.documentElement.dataset.theme = saved;
  const toggle = $("themeToggle");
  if (toggle) toggle.checked = saved === "dark";
}

function toggleTheme() {
  const toggle = $("themeToggle");
  const newTheme = toggle?.checked ? "dark" : "light";
  state.theme = newTheme;
  localStorage.setItem("loksewa_theme", newTheme);
  document.documentElement.dataset.theme = newTheme;
  toast(`Switched to ${newTheme} mode`);
}

// ═══════════════════════════════════════════════════════════════
// AUTHENTICATION
// ═══════════════════════════════════════════════════════════════

function showAuth() {
  $("authView")?.classList.remove("hidden");
  $("appView")?.classList.add("hidden");
}

function showApp(user) {
  state.user = user;
  $("authView")?.classList.add("hidden");
  $("appView")?.classList.remove("hidden");
  renderWelcome();
  switchScreen("homeScreen");
  loadMocks();
  loadCategories();
  loadUserStats();
}

function setAuthMode(mode) {
  state.authMode = mode;
  const register = mode === "register";
  document.querySelectorAll(".register-only").forEach((el) => el.classList.toggle("hidden", !register));
  if ($("authSubmit")) $("authSubmit").textContent = register ? "Create Account" : "Sign In";
  if ($("authMode")) $("authMode").textContent = register ? "Use Existing Account" : "Create Student Account";
}

async function handleAuth(event) {
  event.preventDefault();
  if ($("authError")) $("authError").textContent = "";
  
  const path = state.authMode === "register" ? "/v1/auth/register" : "/v1/auth/login";
  const payload = {
    email: $("authEmail")?.value,
    password: $("authPassword")?.value,
  };
  if (state.authMode === "register") {
    payload.full_name = $("authName")?.value;
  } else {
    payload.client_type = "mobile";
  }

  try {
    state.isLoading = true;
    const response = await api(path, { method: "POST", body: JSON.stringify(payload) });
    state.token = response.token;
    secureStorage.setItem("loksewa_mobile_token", response.token);
    showApp(response.user);
  } catch (error) {
    if ($("authError")) $("authError").textContent = error.message;
  } finally {
    state.isLoading = false;
  }
}

async function logout() {
  try {
    await api("/v1/auth/logout", { method: "POST" });
  } catch (_) { /* local logout */ }
  state.token = "";
  secureStorage.removeItem("loksewa_mobile_token");
  state.user = null;
  showAuth();
}

// ═══════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════

const titles = {
  homeScreen: "Home",
  scanScreen: "Quick Scan",
  preparationScreen: "Subjects",
  categoriesScreen: "Question Bank",
  subjectTopicsScreen: "Topics",
  topicStudyScreen: "Topic Study",
  aiLessonScreen: "AI Lesson",
  aiTutorScreen: "AI Tutor",
  mockScreen: "Mock Tests",
  historyScreen: "Scan History",
  profileScreen: "Profile",
  settingsScreen: "Settings",
  browseScreen: "Browse",
  questionDetailScreen: "Question",
  attemptScreen: "Exam Mode",
  resultScreen: "Result",
};

const childScreens = new Set([
  "categoriesScreen", "subjectTopicsScreen", "topicStudyScreen",
  "aiLessonScreen", "aiTutorScreen", "browseScreen",
  "questionDetailScreen", "attemptScreen", "resultScreen",
  "historyScreen", "settingsScreen",
]);

async function switchScreen(id, options = {}) {
  if (!$(id)) return;

  // Track navigation stack
  if (!options.back && childScreens.has(id)) {
    if (state.screenStack[state.screenStack.length - 1] !== id) {
      state.screenStack.push(id);
    }
  } else if (!options.back) {
    state.screenStack = [id];
  }

  // Hide all screens, show active
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $(id)?.classList.add("active");

  // Update bottom nav
  const mainTabs = ["homeScreen", "scanScreen", "preparationScreen", "mockScreen", "profileScreen"];
  document.querySelectorAll(".bottom-nav button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === id);
  });

  // Show/hide back button
  $("headerBack")?.classList.toggle("hidden", !childScreens.has(id));

  // Update title
  $("screenTitle").textContent = titles[id] || "Loksewa AI";

  // Lazy load data
  try {
    switch (id) {
      case "homeScreen":
        renderRecentActivity();
        loadUserStats();
        loadOverallProgress();
        break;
      case "preparationScreen":
        await loadPrepSubjects();
        break;
      case "categoriesScreen":
        await loadCategories();
        break;
      case "mockScreen":
        await loadMocks();
        break;
      case "historyScreen":
        renderHistory();
        break;
      case "profileScreen":
        await loadUserStats();
        renderProfile();
        break;
    }
  } catch (err) {
    console.error("Screen load error:", err);
  }
}

function goBack() {
  if (state.screenStack.length > 1) {
    state.screenStack.pop();
    const prev = state.screenStack[state.screenStack.length - 1];
    switchScreen(prev, { back: true });
  } else {
    switchScreen("homeScreen");
  }
}

// ═══════════════════════════════════════════════════════════════
// HOME RENDERING
// ═══════════════════════════════════════════════════════════════

function renderWelcome() {
  const name = state.user?.full_name || state.user?.email || "Student";
  const firstName = escapeHtml(name.split(" ")[0]);
  const greetEl = $("welcomeGreeting");
  if (greetEl) greetEl.textContent = `Namaste, ${firstName}`;
}

function renderQuickStats() {
  const viewed = state.questionsViewed;
  const mocks = state.userStats?.total_mocks_taken ?? 0;
  const accuracy = state.userStats?.correct_rate ? Math.round(state.userStats.correct_rate) : 0;

  animateCounter($("statViewed"), viewed);
  animateCounter($("statMocks"), mocks);
  animateCounter($("statAccuracy"), accuracy, "%");
}

function animateCounter(element, target, suffix = "") {
  if (!element) return;
  const duration = 800;
  const start = performance.now();
  const from = parseInt(element.textContent) || 0;

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(from + (target - from) * eased);
    element.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function sourceBadgeClass(source) {
  if (source === "verified_db") return "badge-verified";
  if (source === "ai" || source === "ai_assisted" || source === "ai_only") return "badge-ai";
  return "badge-error";
}

function renderRecentActivity() {
  const container = $("recentActivity");
  if (!container) return;
  const recent = state.searchHistory.slice(0, 3);
  
  if (recent.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <h3 style="font-size: 18px; font-weight: 700; margin-bottom: var(--space-3);">Recent Scans</h3>
    ${recent.map((item) => `
      <div class="history-item">
        <div class="history-icon">
          <span class="ui-icon"><svg class="ui-icon-svg" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></span>
        </div>
        <div class="history-content">
          <div class="history-query">${escapeHtml(item.query)}</div>
          <div class="history-time">${escapeHtml(timeAgo(item.timestamp))}</div>
        </div>
        <span class="badge ${sourceBadgeClass(item.source)}">${sourceBadgeText(item.source)}</span>
      </div>
    `).join("")}`;
}

function sourceBadgeText(source) {
  if (source === "verified_db") return "Verified";
  if (source === "ai_assisted") return "AI-Assisted";
  if (source === "ai_only" || source === "ai") return "AI";
  return "No Match";
}

// ═══════════════════════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════════════════════

async function searchQuestion(event) {
  event.preventDefault();
  const query = $("searchQuery")?.value.trim();
  if (!query || query.length < 3) {
    toast("Enter a question first (at least 3 characters)");
    return;
  }

  try {
    const result = await api("/v1/search", {
      method: "POST",
      body: JSON.stringify({ query, limit: 3, allow_ai_fallback: true }),
    });
    renderSearchResult(result);
    saveToHistory(query, result);
} catch (error) {
    const friendly = getUserFriendlyError(error);
    toast(friendly.title + ": " + friendly.message);
  }
}

async function submitAttempt() {
  if (!state.attempt) return;
  try {
    clearInterval(state.timerHandle);
    const result = await api(`/v1/mock-attempts/${state.attempt.id}/submit`, { method: "POST" });
    renderResult(result);
    switchScreen("resultScreen");
  } catch (error) {
    const friendly = getUserFriendlyError(error);
    toast(friendly.title + ": " + friendly.message);
  }
}

function renderResult(result) {
  const attempt = result.attempt;
  $("attemptResult").innerHTML = `
    <div class="result-box">
      <span class="badge ${attempt.status === "completed" ? "badge-verified" : "badge-ai"}">${escapeHtml(attempt.status)}</span>
      <h2 class="result-question">${escapeHtml(attempt.mock_test.title)}</h2>
      
      <div class="stats-grid" style="margin: var(--space-5) 0;">
        <div class="stat-card">
          <span class="stat-value">${attempt.score.toFixed(1)}</span>
          <span class="stat-label">Score</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${attempt.correct_count}</span>
          <span class="stat-label">Correct</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${attempt.wrong_count}</span>
          <span class="stat-label">Wrong</span>
        </div>
      </div>
      
      <p style="font-size: 14px; color: var(--text-tertiary); margin-bottom: var(--space-4);">
        Total: ${attempt.total_marks.toFixed(1)} marks | Unanswered: ${attempt.unanswered_count}
      </p>
      
      <div class="list-container">
        ${result.answers.map((answer, index) => `
          <div class="card" style="padding: var(--space-4);">
            <div style="display: flex; align-items: center; gap: var(--space-3);">
              <span class="badge ${answer.selected_option === answer.correct_option ? "badge-verified" : answer.selected_option ? "badge-error" : "badge-ai"}">
                ${answer.selected_option || "–"}
              </span>
              <span style="font-size: 14px;">Correct: <strong>${escapeHtml(answer.correct_option)}</strong></span>
              <span style="font-size: 14px; color: var(--text-tertiary);">| Marks: ${answer.marks_awarded}</span>
            </div>
            ${answer.explanation ? `<p style="font-size: 13px; color: var(--text-secondary); margin-top: var(--space-2);">${escapeHtml(answer.explanation)}</p>` : ""}
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════
// PROFILE & STATS
// ═══════════════════════════════════════════════════════════════

async function loadUserStats() {
  try {
    state.userStats = await api("/v1/stats/me");
  } catch (_) {
    state.userStats = { total_mocks_taken: 0, average_score: 0, correct_rate: 0 };
  }
  renderQuickStats();
}

function renderProfile() {
  const container = $("profileContent");
  if (!container) return;
  const user = state.user;
  if (!user) {
    container.innerHTML = '<div class="loading-spinner"></div>';
    return;
  }

  const initials = (user.full_name || user.email || "U").split(" ").map((w) => w[0]).join("").toUpperCase().substring(0, 2);
  const stats = state.userStats || {};

  container.innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar">${escapeHtml(initials)}</div>
      <p class="profile-name">${escapeHtml(user.full_name || "Student")}</p>
      <p class="profile-email">${escapeHtml(user.email || "")}</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon"><span class="ui-icon"><svg class="ui-icon-svg" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg></span></div>
        <span class="stat-value">${state.questionsViewed}</span>
        <span class="stat-label">Questions Viewed</span>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><span class="ui-icon"><svg class="ui-icon-svg" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10"/><path d="M7 12h6"/><path d="M7 16h8"/></svg></span></div>
        <span class="stat-value">${stats.total_mocks_taken ?? 0}</span>
        <span class="stat-label">Mocks Taken</span>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><span class="ui-icon"><svg class="ui-icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg></span></div>
        <span class="stat-value">${Math.round(stats.correct_rate ?? 0)}%</span>
        <span class="stat-label">Accuracy Rate</span>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><span class="ui-icon"><svg class="ui-icon-svg" viewBox="0 0 24 24"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M5 5H3v2a4 4 0 0 0 4 4"/><path d="M19 5h2v2a4 4 0 0 1-4 4"/></svg></span></div>
        <span class="stat-value">${stats.total_mocks_completed ?? 0}</span>
        <span class="stat-label">Completed Mocks</span>
      </div>
    </div>

    <div class="list-container" style="margin-top: var(--space-5);">
      <div class="list-item" onclick="switchScreen('settingsScreen')">
        <div class="list-icon"><span class="ui-icon"><svg class="ui-icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg></span></div>
        <div class="list-content"><div class="list-title">Settings</div></div>
        <span class="ui-icon" style="color: var(--text-tertiary);"><svg class="ui-icon-svg" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></span>
      </div>
      <div class="list-item" onclick="switchScreen('historyScreen')">
        <div class="list-icon"><span class="ui-icon"><svg class="ui-icon-svg" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 7v5l3 2"/></svg></span></div>
        <div class="list-content"><div class="list-title">Scan History</div></div>
        <span class="ui-icon" style="color: var(--text-tertiary);"><svg class="ui-icon-svg" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></span>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════
// STUDY PREPARATION
// ═══════════════════════════════════════════════════════════════

async function loadPrepSubjects() {
  const grid = $("prepSubjectGrid");
  if (!grid) return;
  grid.innerHTML = '<div class="loading-spinner"></div>';

  try {
    const subjects = await api("/v1/preparation/subjects");
    if (!subjects?.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon"><span class="ui-icon"><svg class="ui-icon-svg" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg></span></div>
          <h3>No subjects available</h3>
          <p>Seeded topics will appear once the backend database finishes setup.</p>
        </div>`;
      return;
    }
    grid.innerHTML = subjects.map((sub) => `
      <div class="category-card" onclick="showSubjectTopics('${escapeHtml(sub)}')">
        <div class="category-icon">
          <span class="ui-icon ui-icon-lg"><svg class="ui-icon-svg" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg></span>
        </div>
        <div class="category-name">${escapeHtml(sub)}</div>
        <div class="category-count">View study topics</div>
      </div>
    `).join("");
  } catch (error) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon"><span class="ui-icon"><svg class="ui-icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v5"/><path d="M12 16h.01"/></svg></span></div>
        <h3>Failed to load subjects</h3>
        <p>${escapeHtml(error.message)}</p>
      </div>`;
  }
}

async function showSubjectTopics(subjectId) {
  const titleEl = $("subjectTopicsTitle");
  const listEl = $("subjectTopicsList");
  if (titleEl) titleEl.textContent = `${subjectId} Topics`;
  if (listEl) listEl.innerHTML = '<div class="loading-spinner"></div>';
  
  switchScreen("subjectTopicsScreen");

  try {
    const topics = await api(`/v1/preparation/subjects/${encodeURIComponent(subjectId)}/topics`);
    if (!topics?.length) {
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon"><span class="ui-icon"><svg class="ui-icon-svg" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></span></div>
          <h3>No topics found</h3>
          <p>There are no study topics under ${escapeHtml(subjectId)} yet.</p>
        </div>`;
      return;
    }
    listEl.innerHTML = topics.map((t) => `
      <div class="list-item" onclick="showTopicStudy(${t.id})">
        <div class="list-icon">
          <span class="ui-icon"><svg class="ui-icon-svg" viewBox="0 0 24 24"><path d="M9 11H7a4 4 0 0 0-4 4v0a4 4 0 0 0 4 4h2"/><path d="M15 11h2a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4h-2"/></svg></span>
        </div>
        <div class="list-content">
          <div class="list-title">${escapeHtml(t.title)}</div>
          <div class="progress-bar-container" style="height: 6px; margin-top: var(--space-2); max-width: 200px;">
            <div class="progress-bar" style="width: ${t.completion_percentage}%"></div>
          </div>
        </div>
        <span style="font-size: 13px; color: var(--text-tertiary);">${Math.round(t.completion_percentage)}%</span>
      </div>
    `).join("");
  } catch (error) {
    listEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><span class="ui-icon"><svg class="ui-icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v5"/><path d="M12 16h.01"/></svg></span></div>
        <h3>Failed to load topics</h3>
        <p>${escapeHtml(error.message)}</p>
      </div>`;
  }
}

async function showTopicStudy(topicId) {
  state.currentTopic = null;
  switchScreen("topicStudyScreen");

  const titleEl = $("topicStudyTitle");
  const beginnerEl = $("topicNotesBeginner");
  const intermediateEl = $("topicNotesIntermediate");
  const advancedEl = $("topicNotesAdvanced");
  const mcqsEl = $("topicMCQs");
  const flashcardsEl = $("topicFlashcardsList");
  const progressIndicator = $("topicProgressIndicator");
  const completeBtn = $("markCompletedBtn");

  if (titleEl) titleEl.textContent = "Loading...";
  [beginnerEl, intermediateEl, advancedEl, mcqsEl, flashcardsEl].forEach(el => {
    if (el) el.innerHTML = '<div class="loading-spinner"></div>';
  });

  try {
    const data = await api(`/v1/preparation/topics/${topicId}`);
    state.currentTopic = data;
    const topic = data.topic;

    if (titleEl) titleEl.textContent = topic.title;
    if (beginnerEl) beginnerEl.innerHTML = formatStudyNotes(topic.content_beginner);
    if (intermediateEl) intermediateEl.innerHTML = formatStudyNotes(topic.content_intermediate);
    if (advancedEl) advancedEl.innerHTML = formatStudyNotes(topic.content_advanced);

    if (mcqsEl) {
      mcqsEl.innerHTML = !data.questions?.length
        ? '<p style="color: var(--text-tertiary);">No questions loaded for this topic yet.</p>'
        : `<div class="list-container">${data.questions.map((q, idx) => `
          <div class="question-card">
            <p class="question-number">${idx + 1}.</p>
            <p class="question-text">${escapeHtml(q.question_text)}</p>
            <div class="options-list">
              ${["A", "B", "C", "D"].map(opt => `
                <button class="option-btn" id="topicQ${q.id}Opt${opt}" onclick="revealTopicQuestionAnswer(${q.id}, '${opt}', '${q.correct_option}')">
                  <span class="option-letter">${opt}</span>
                  <span>${escapeHtml(q[`option_${opt.toLowerCase()}`])}</span>
                </button>
              `).join("")}
            </div>
            <div id="topicQ${q.id}Expl" class="result-answer" style="display: none; margin-top: var(--space-3);">
              <span>${escapeHtml(q.explanation || "Correct: " + q.correct_option)}</span>
            </div>
          </div>
        `).join("")}</div>`;
    }

    if (flashcardsEl) {
      flashcardsEl.innerHTML = !data.flashcards?.length
        ? '<p style="color: var(--text-tertiary);">No active recall flashcards for this topic.</p>'
        : `<div class="flashcard-list">${data.flashcards.map(f => `
          <div class="flashcard" onclick="toggleFlashcard(this)">
            <div class="flashcard-inner">
              <div class="flashcard-front"><p>${escapeHtml(f.front)}</p></div>
              <div class="flashcard-back"><p>${escapeHtml(f.back)}</p></div>
            </div>
          </div>
        `).join("")}</div>`;
    }

    const pct = data.completion_percentage;
    if (progressIndicator) progressIndicator.style.width = `${pct}%`;
    if (completeBtn) {
      if (pct >= 100) {
        completeBtn.textContent = "Mark as Incomplete";
        completeBtn.classList.remove("btn-primary");
        completeBtn.classList.add("btn-secondary");
      } else {
        completeBtn.textContent = "Mark as Completed";
        completeBtn.classList.remove("btn-secondary");
        completeBtn.classList.add("btn-primary");
      }
    }
    resetTopicTabs();
  } catch (error) {
    toast(error.message);
  }
}

function resetTopicTabs() {
  const screen = $("topicStudyScreen");
  if (!screen) return;
  const tabs = screen.querySelectorAll(".tab-btn");
  const panes = screen.querySelectorAll(".tab-content");
  tabs.forEach((tab, idx) => tab.classList.toggle("active", idx === 0));
  panes.forEach((pane, idx) => pane.classList.toggle("active", idx === 0));
}

function switchTopicTab(event, tabId) {
  const screen = $("topicStudyScreen");
  screen.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
  screen.querySelectorAll(".tab-content").forEach(pane => pane.classList.remove("active"));
  event.currentTarget.classList.add("active");
  $(tabId)?.classList.add("active");
}

function revealTopicQuestionAnswer(questionId, selectedOpt, correctOpt) {
  ["A", "B", "C", "D"].forEach(opt => {
    const btn = $(`topicQ${questionId}Opt${opt}`);
    if (!btn) return;
    btn.classList.remove("selected", "correct", "wrong");
    if (opt === correctOpt) btn.classList.add("correct");
    else if (opt === selectedOpt) btn.classList.add("wrong");
    btn.onclick = null;
  });
  const expl = $(`topicQ${questionId}Expl`);
  if (expl) expl.style.display = "flex";
}

async function toggleTopicCompletion() {
  if (!state.currentTopic) return;
  const topic = state.currentTopic.topic;
  const wasCompleted = state.currentTopic.completion_percentage >= 100;
  const newPct = wasCompleted ? 0 : 100;

  try {
    await api(`/v1/preparation/topics/${topic.id}/progress`, {
      method: "POST",
      body: JSON.stringify({ completion_percentage: newPct }),
    });
    state.currentTopic.completion_percentage = newPct;
    const progressIndicator = $("topicProgressIndicator");
    const completeBtn = $("markCompletedBtn");

    if (progressIndicator) progressIndicator.style.width = `${newPct}%`;
    if (completeBtn) {
      if (newPct >= 100) {
        completeBtn.textContent = "Mark as Incomplete";
        completeBtn.classList.remove("btn-primary");
        completeBtn.classList.add("btn-secondary");
        toast("Topic marked as completed!");
      } else {
        completeBtn.textContent = "Mark as Completed";
        completeBtn.classList.remove("btn-secondary");
        completeBtn.classList.add("btn-primary");
        toast("Topic progress reset.");
      }
    }
    loadOverallProgress();
  } catch (error) {
    toast(error.message);
  }
}

// ═══════════════════════════════════════════════════════════════
// AI LESSON
// ═══════════════════════════════════════════════════════════════

async function showAiLesson(questionId) {
  switchScreen("aiLessonScreen");

  const qTextEl = $("lessonQuestionText");
  const qAnsEl = $("lessonAnswerText");
  const simpleEl = $("lessonSimple");
  const detailedEl = $("lessonDetailed");
  const examEl = $("lessonExam");
  const mnemonicEl = $("lessonMnemonic");
  const recallEl = $("lessonFlashcardsList");
  const questionsEl = $("lessonQuestions");

  if (qTextEl) qTextEl.textContent = "Loading AI Lesson...";
  if (qAnsEl) qAnsEl.innerHTML = "";
  [simpleEl, detailedEl, examEl, mnemonicEl, recallEl, questionsEl].forEach(el => {
    if (el) el.innerHTML = '<div class="loading-spinner"></div>';
  });

  try {
    const data = await api(`/v1/questions/${questionId}/ai-lesson`);
    state.currentAiLesson = data;

    const qDetail = await api(`/v1/questions/${questionId}`);
    const correctOpt = qDetail.correct_option;
    const correctText = qDetail[`option_${correctOpt.toLowerCase()}`];

    if (qTextEl) qTextEl.textContent = qDetail.question_text;
    if (qAnsEl) qAnsEl.innerHTML = `<span class="ui-icon ui-icon-sm"><svg class="ui-icon-svg" viewBox="0 0 24 24"><path d="m9 12 2 2 4-4"/></svg></span><span><strong>Verified Answer:</strong> Option ${correctOpt} – ${escapeHtml(correctText)}</span>`;

    if (simpleEl) simpleEl.innerHTML = formatStudyNotes(data.lesson_simple);
    if (detailedEl) detailedEl.innerHTML = formatStudyNotes(data.lesson_detailed);
    if (examEl) examEl.innerHTML = formatStudyNotes(data.exam_notes);
    if (mnemonicEl) mnemonicEl.innerHTML = formatStudyNotes(data.mnemonic);

    if (recallEl) {
      recallEl.innerHTML = !data.flashcards?.length
        ? '<p style="color: var(--text-tertiary);">No active recall flashcards generated.</p>'
        : `<div class="flashcard-list">${data.flashcards.map(f => `
          <div class="flashcard" onclick="toggleFlashcard(this)">
            <div class="flashcard-inner">
              <div class="flashcard-front"><p>${escapeHtml(f.front)}</p></div>
              <div class="flashcard-back"><p>${escapeHtml(f.back)}</p></div>
            </div>
          </div>
        `).join("")}</div>`;
    }

    if (questionsEl) {
      questionsEl.innerHTML = !data.related_mcqs?.length
        ? '<p style="color: var(--text-tertiary);">No practice test questions generated.</p>'
        : `<div class="list-container">${data.related_mcqs.map((q, idx) => `
          <div class="question-card">
            <p class="question-number">${idx + 1}.</p>
            <p class="question-text">${escapeHtml(q.question_text)}</p>
            <div class="options-list">
              ${["A", "B", "C", "D"].map(opt => `
                <button class="option-btn" id="lessonQ${idx}Opt${opt}" onclick="revealLessonQuestionAnswer(${idx}, '${opt}', '${q.correct_option}')">
                  <span class="option-letter">${opt}</span>
                  <span>${escapeHtml(q[`option_${opt.toLowerCase()}`])}</span>
                </button>
              `).join("")}
            </div>
            <div id="lessonQ${idx}Expl" class="result-answer" style="display: none; margin-top: var(--space-3);">
              <span>${escapeHtml(q.explanation || "Correct: " + q.correct_option)}</span>
            </div>
          </div>
        `).join("")}</div>`;
    }
    resetLessonTabs();
  } catch (error) {
    toast(error.message);
  }
}

function resetLessonTabs() {
  const screen = $("aiLessonScreen");
  if (!screen) return;
  const tabs = screen.querySelectorAll(".tab-btn");
  const panes = screen.querySelectorAll(".tab-content");
  tabs.forEach((tab, idx) => tab.classList.toggle("active", idx === 0));
  panes.forEach((pane, idx) => pane.classList.toggle("active", idx === 0));
}

function switchLessonTab(event, tabId) {
  const screen = $("aiLessonScreen");
  screen.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
  screen.querySelectorAll(".tab-content").forEach(pane => pane.classList.remove("active"));
  event.currentTarget.classList.add("active");
  $(tabId)?.classList.add("active");
}

function revealLessonQuestionAnswer(idx, selectedOpt, correctOpt) {
  ["A", "B", "C", "D"].forEach(opt => {
    const btn = $(`lessonQ${idx}Opt${opt}`);
    if (!btn) return;
    btn.classList.remove("selected", "correct", "wrong");
    if (opt === correctOpt) btn.classList.add("correct");
    else if (opt === selectedOpt) btn.classList.add("wrong");
    btn.onclick = null;
  });
  const expl = $(`lessonQ${idx}Expl`);
  if (expl) expl.style.display = "flex";
}

// ═══════════════════════════════════════════════════════════════
// FLASHCARD TOGGLE
// ═══════════════════════════════════════════════════════════════

function toggleFlashcard(cardElement) {
  cardElement.classList.toggle("flipped");
}

// ═══════════════════════════════════════════════════════════════
// AI TUTOR
// ═══════════════════════════════════════════════════════════════

function askTutorSuggestion(query) {
  const inputEl = $("tutorInput");
  if (inputEl) inputEl.value = query;
  sendTutorQuery(query);
}

async function sendTutorMessage(event) {
  event.preventDefault();
  const inputEl = $("tutorInput");
  const query = inputEl?.value.trim();
  if (!query) return;
  inputEl.value = "";
  await sendTutorQuery(query);
}

async function sendTutorQuery(query) {
  const chatHistory = $("chatHistory");
  if (!chatHistory) return;

  chatHistory.innerHTML += `
    <div class="chat-message user">
      <div class="chat-bubble">${escapeHtml(query)}</div>
    </div>`;
  chatHistory.scrollTop = chatHistory.scrollHeight;

  const typingEl = document.createElement("div");
  typingEl.className = "chat-message assistant";
  typingEl.innerHTML = `<div class="chat-bubble"><span style="color: var(--text-tertiary);">Tutor is researching database...</span></div>`;
  chatHistory.appendChild(typingEl);
  chatHistory.scrollTop = chatHistory.scrollHeight;

  try {
    const data = await api("/v1/ai-tutor/ask", {
      method: "POST",
      body: JSON.stringify({ query }),
    });

    typingEl.remove();
    const formattedAnswer = formatStudyNotes(data.answer);

    let citationsHtml = "";
    if (data.citations?.length) {
      citationsHtml = `
        <div style="margin-top: var(--space-3); padding-top: var(--space-3); border-top: 1px dashed var(--border-default);">
          <p style="font-size: 11px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em;">Sources Cited</p>
          <div style="display: flex; flex-wrap: wrap; gap: var(--space-2); margin-top: var(--space-2);">
            ${data.citations.map(c => `
              <span class="chip" onclick="handleCitationClick('${escapeHtml(c.source_type)}', '${escapeHtml(c.title)}')">${escapeHtml(c.source_name)}</span>
            `).join("")}
          </div>
        </div>`;
    }

    chatHistory.innerHTML += `
      <div class="chat-message assistant">
        <div class="chat-bubble">
          ${formattedAnswer}
          ${citationsHtml}
        </div>
      </div>`;
    chatHistory.scrollTop = chatHistory.scrollHeight;
  } catch (error) {
    typingEl.remove();
    chatHistory.innerHTML += `
      <div class="chat-message assistant">
        <div class="chat-bubble" style="color: var(--status-error);">Error: ${escapeHtml(error.message)}</div>
      </div>`;
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }
}

function handleCitationClick(sourceType, title) {
  if (sourceType === "question") {
    const inputEl = $("searchQuery");
    if (inputEl) inputEl.value = title;
    switchScreen("scanScreen");
    $("searchForm")?.dispatchEvent(new Event("submit"));
  } else if (sourceType === "topic") {
    findAndOpenTopic(title);
  }
}

async function findAndOpenTopic(title) {
  try {
    const subjects = await api("/v1/preparation/subjects");
    for (const sub of subjects) {
      const topics = await api(`/v1/preparation/subjects/${encodeURIComponent(sub)}/topics`);
      const matched = topics.find(t => t.title.toLowerCase() === title.toLowerCase());
      if (matched) {
        showTopicStudy(matched.id);
        return;
      }
    }
    toast(`Topic "${title}" not found.`);
  } catch (err) {
    toast(`Could not open topic: ${err.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════
// OVERALL PROGRESS
// ═══════════════════════════════════════════════════════════════

async function loadOverallProgress() {
  try {
    const subjects = await api("/v1/preparation/subjects");
    let totalCompleted = 0;
    let totalTopics = 0;

    for (const sub of subjects) {
      const topics = await api(`/v1/preparation/subjects/${encodeURIComponent(sub)}/topics`);
      totalTopics += topics.length;
      topics.forEach(t => {
        if (t.completion_percentage >= 100) totalCompleted++;
        else if (t.completion_percentage > 0) totalCompleted += t.completion_percentage / 100;
      });
    }

    const overallPct = totalTopics > 0 ? Math.round((totalCompleted / totalTopics) * 100) : 0;
    const progressBar = $("overallProgressBar");
    const progressText = $("overallProgressText");
    
    if (progressBar) progressBar.style.width = `${overallPct}%`;
    if (progressText) progressText.textContent = `${overallPct}%`;
  } catch (_) { /* silent fail */ }
}

// ═══════════════════════════════════════════════════════════════
// STUDY NOTES FORMATTER
// ═══════════════════════════════════════════════════════════════

function formatStudyNotes(text) {
  if (!text) return "<p>No study notes available.</p>";
  const lines = text.split("\n");
  let inList = false;
  let html = "";

  for (const line of lines) {
    let cleaned = line.trim();
    if (!cleaned) continue;

    if (cleaned.startsWith("- ") || cleaned.startsWith("* ")) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${escapeHtml(cleaned.substring(2))}</li>`;
      continue;
    }

    if (inList) {
      html += "</ul>";
      inList = false;
    }

    if (cleaned.startsWith("### ")) {
      html += `<h3 style="font-size: 16px; font-weight: 700; margin: var(--space-4) 0 var(--space-2); color: var(--text-primary);">${escapeHtml(cleaned.substring(4))}</h3>`;
    } else if (cleaned.startsWith("#### ")) {
      html += `<h4 style="font-size: 14px; font-weight: 600; margin: var(--space-3) 0 var(--space-2); color: var(--text-secondary);">${escapeHtml(cleaned.substring(5))}</h4>`;
    } else if (cleaned.startsWith("## ")) {
      html += `<h3 style="font-size: 18px; font-weight: 700; margin: var(--space-4) 0 var(--space-2); color: var(--text-primary);">${escapeHtml(cleaned.substring(3))}</h3>`;
    } else {
      let paragraph = escapeHtml(cleaned);
      paragraph = paragraph.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      paragraph = paragraph.replace(/\*(.*?)\*/g, "<em>$1</em>");
      html += `<p style="margin-bottom: var(--space-3); line-height: 1.6;">${paragraph}</p>`;
    }
  }

  if (inList) html += "</ul>";
  return html;
}

// ═══════════════════════════════════════════════════════════════
// SEARCH RESULTS RENDERING (with AI disclaimer)
// ═══════════════════════════════════════════════════════════════

function renderSearchResult(result) {
  const container = $("searchResult");
  if (!container) return;
  
  container.classList.remove("hidden");
  const best = result.matches?.[0]?.question;
  const verified = result.answer_source === "verified_db";

  if (!best) {
    container.innerHTML = `
      <span class="badge-ai-experimental">
        <svg class="ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2a5 5 0 0 1 5 5c0 .74-.16 1.43-.44 2.05l.72 1.95H19a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3H5a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h1.72l.72-1.95A5 5 0 0 1 7 7a5 5 0 0 1 5-5z"/>
        </svg>
        Not in Database — AI Analysis
      </span>
      <h2 class="result-question">No verified match found</h2>
      <p class="result-explanation">${escapeHtml(result.disclaimer || "No reliable verified answer is available for this question.")}</p>
      <div class="ai-disclaimer-banner" style="margin-top: var(--space-3);">
        <div class="disclaimer-icon" style="background: var(--status-ai);">
          <span class="ui-icon">
            <svg class="ui-icon-svg" viewBox="0 0 24 24">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </span>
        </div>
        <div class="disclaimer-content">
          <div class="disclaimer-title">AI Analysis May Contain Errors</div>
          <div class="disclaimer-text">This explanation was generated by AI. Please verify with official Loksewa materials.</div>
        </div>
      </div>
      <p style="font-size: 13px; color: var(--text-tertiary); margin-top: var(--space-4);">Try rephrasing or scanning again.</p>
    `;
    return;
  }

  const correct = best[`option_${best.correct_option?.toLowerCase()}`];
  const aiBadge = !verified ? `
    <span class="badge-ai-experimental">
      <svg class="ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2a5 5 0 0 1 5 5c0 .74-.16 1.43-.44 2.05l.72 1.95H19a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3H5a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h1.72l.72-1.95A5 5 0 0 1 7 7a5 5 0 0 1 5-5z"/>
      </svg>
      AI-Assisted
    </span>` : `<span class="badge badge-verified">Verified Source</span>`;
  
  container.innerHTML = `
    ${aiBadge}
    <h2 class="result-question">${escapeHtml(best.question_text)}</h2>
    <div class="result-answer">
      <span class="ui-icon ui-icon-sm"><svg class="ui-icon-svg" viewBox="0 0 24 24"><path d="m9 12 2 2 4-4"/></svg></span>
      <span><strong>Answer:</strong> Option ${escapeHtml(best.correct_option)}. ${escapeHtml(correct)}</span>
    </div>
    <p class="result-explanation">${escapeHtml(best.explanation || "")}</p>
    <div class="result-meta">
      <span>${escapeHtml(best.source_name || "Source not provided")}</span>
      ${best.source_year ? `<span>${escapeHtml(best.source_year)}</span>` : ""}
    </div>
    ${result.disclaimer || !verified ? `
    <div class="ai-disclaimer-banner" style="margin-top: var(--space-3);">
      <div class="disclaimer-icon" style="background: var(--status-ai);">
        <span class="ui-icon">
          <svg class="ui-icon-svg" viewBox="0 0 24 24">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </span>
      </div>
      <div class="disclaimer-content">
        <div class="disclaimer-title">AI Analysis May Contain Errors</div>
        <div class="disclaimer-text">This explanation was generated by AI. Please verify with official Loksewa materials.</div>
      </div>
    </div>` : ""}
    <button class="btn btn-primary btn-full" style="margin-top: var(--space-4);" onclick="showAiLesson(${best.id})">
      <span class="ui-icon ui-icon-sm"><svg class="ui-icon-svg" viewBox="0 0 24 24"><path d="M12 2a5 5 0 0 1 5 5c0 .74-.16 1.43-.44 2.05l.72 1.95H19a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3H5a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h1.72l.72-1.95A5 5 0 0 1 7 7a5 5 0 0 1 5-5z"/></svg></span>
      Teach Me (AI Lesson)
    </button>
  `;
}

// ═══════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════

function init() {
  // Initialize theme
  initTheme();

  // Initialize online/offline detection
  initOnlineStatus();

  // Initialize camera permission modal
  initCameraPermissionModal();

  // Setup auth form
  const authForm = $("authForm");
  if (authForm) {
    authForm.addEventListener("submit", handleAuth);
  }

  const authModeBtn = $("authMode");
  if (authModeBtn) {
    authModeBtn.addEventListener("click", () => {
      setAuthMode(state.authMode === "login" ? "register" : "login");
    });
  }

  // Setup search form
  const searchForm = $("searchForm");
  if (searchForm) {
    searchForm.addEventListener("submit", searchQuestion);
  }

  // Setup tutor form
  const tutorForm = $("tutorForm");
  if (tutorForm) {
    tutorForm.addEventListener("submit", sendTutorMessage);
  }

  // Bottom nav click handling
  document.querySelectorAll(".bottom-nav button").forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      if (tab) switchScreen(tab);
    });
  });

  // Check existing token
  if (state.token) {
    api("/v1/auth/me").then(user => {
      showApp(user);
    }).catch(() => {
      showAuth();
    });
  } else {
    showAuth();
  }

  // Platform detection
  const ua = navigator.userAgent || "";
  const platform = /iPad|iPhone|iPod/.test(ua) ? "ios" : "android";
  document.documentElement.dataset.platform = platform;
}

// Start app
document.addEventListener("DOMContentLoaded", init);