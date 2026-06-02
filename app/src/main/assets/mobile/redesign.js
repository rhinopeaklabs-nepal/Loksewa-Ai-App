(function () {
  const SVG = {
    arrowLeft: '<path d="M15 18 9 12l6-6"/>',
    arrowRight: '<path d="m9 18 6-6-6-6"/>',
    bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/>',
    bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    bot: '<rect x="5" y="7" width="14" height="11" rx="4"/><path d="M12 3v4"/><path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M9 16h6"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 14 3-3 3 2 5-7"/>',
    check: '<path d="m20 6-11 11-5-5"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3"/><path d="m8 12 2 2 4-4"/><path d="M8 18h8"/>',
    download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
    home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v11h14V10"/><path d="M9 21v-6h6v6"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    notes: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/>',
    profile: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
    settings: '<path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.05A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.05A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.05A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.05A1.7 1.7 0 0 0 19.4 15z"/>',
    star: '<path d="m12 2 3.1 6.28 6.9 1-5 4.88 1.18 6.88L12 17.77l-6.18 3.27L7 14.16 2 9.28l6.9-1L12 2z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    test: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8"/><path d="M8 13h6"/><path d="M8 17h5"/>',
    trophy: '<path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M5 5H3v2a4 4 0 0 0 4 4"/><path d="M19 5h2v2a4 4 0 0 1-4 4"/>',
    userEdit: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m19 8 2 2-5 5h-2v-2z"/>'
  };

  const icon = (name) => `<svg class="lr-icon" viewBox="0 0 24 24">${SVG[name] || SVG.star}</svg>`;
  const status = () => `<div class="lr-status"><span>9:41</span><span class="lr-signal">||| <span></span></span></div>`;

  function logo(size = "") {
    return `
      <div class="lr-brand-logo ${size}">
        <div class="lr-mark-wing"></div>
        <div class="lr-mark-swoosh"></div>
        <div class="lr-mark-book"></div>
        <div class="lr-mark-building"></div>
        <div class="lr-mark-network">
          <i class="lr-line" style="left:6px;top:16px;width:46px;transform:rotate(20deg)"></i>
          <i class="lr-line" style="left:27px;top:18px;width:41px;transform:rotate(-24deg)"></i>
          <i class="lr-line" style="left:14px;top:45px;width:50px;transform:rotate(-24deg)"></i>
          <i class="lr-line" style="left:43px;top:47px;width:40px;transform:rotate(18deg)"></i>
          <i class="lr-node" style="left:4px;top:11px"></i>
          <i class="lr-node" style="left:25px;top:18px"></i>
          <i class="lr-node orange" style="left:63px;top:3px"></i>
          <i class="lr-node" style="left:13px;top:48px"></i>
          <i class="lr-node orange" style="left:50px;top:44px"></i>
          <i class="lr-node orange" style="left:80px;top:58px"></i>
        </div>
      </div>`;
  }

  const dots = (index, total = 4) => `<div class="lr-dots">${Array.from({ length: total }, (_, i) => `<span class="lr-dot ${i === index ? "is-active" : ""}"></span>`).join("")}</div>`;

  function topbar(title, subtitle = "", back = false, action = "") {
    return `
      ${status()}
      <div class="lr-topbar">
        <div class="lr-row" style="justify-content:flex-start">
          ${back ? `<button class="lr-icon-btn" data-go="${back}">${icon("arrowLeft")}</button>` : ""}
          <div>
            <h1 class="lr-title">${title}</h1>
            ${subtitle ? `<p class="lr-subtitle">${subtitle}</p>` : ""}
          </div>
        </div>
        ${action}
      </div>`;
  }

  function bottomNav(active) {
    const items = [
      ["home", "Home", "home"],
      ["test", "Tests", "tests"],
      ["book", "Study", "study"],
      ["chart", "Analytics", "analytics"],
      ["profile", "Profile", "profile"]
    ];
    return `<nav class="lr-bottom-nav">${items.map(([ico, label, screen]) => `
      <button class="lr-nav-item ${active === screen ? "is-active" : ""}" data-go="${screen}">
        ${icon(ico)}<span>${label}</span>
      </button>`).join("")}</nav>`;
  }

  function mainScreen(id, active, title, content, subtitle = "", action = "") {
    return `<section id="${id}" class="lr-screen lr-main-screen">${topbar(title, subtitle, false, action)}${content}${bottomNav(active)}</section>`;
  }

  function authButton(label, go, extra = "") {
    return `<button class="lr-btn ${extra}" data-go="${go}" type="button">${label}</button>`;
  }

  function input(type, placeholder, ico, note = "") {
    return `<label class="lr-input">${icon(ico)}<input type="${type}" placeholder="${placeholder}" />${note ? `<span class="lr-field-note">${note}</span>` : ""}</label>`;
  }

  function splash() {
    return `
      <section id="splash" class="lr-screen lr-splash is-active" data-go="onboard-learning">
        <div>
          ${logo()}
          <div class="lr-logo-title">LOKSEWA <span class="lr-ai">A<b>I</b></span></div>
          <p class="lr-copy">Your <strong>AI-Powered</strong> <span class="warm">Companion</span><br/>for Loksewa Success</p>
        </div>
        <div>
          <div class="lr-feature-fan">
            <div class="lr-feature-card">${icon("book")}Study<br/>Materials</div>
            <div class="lr-feature-card">${icon("clipboard")}Mock<br/>Tests</div>
            <div class="lr-feature-card">${icon("bot")}AI<br/>Practice</div>
            <div class="lr-feature-card">${icon("chart")}Analytics</div>
          </div>
          <div class="lr-proof-row">
            <div class="lr-proof">${icon("check")}Trusted<br/>Content</div>
            <div class="lr-proof">${icon("target")}Exam<br/>Focused</div>
            <div class="lr-proof">${icon("trophy")}Achieve<br/>Goal</div>
            <div class="lr-proof">${icon("profile")}For<br/>Aspirants</div>
          </div>
          ${dots(0)}
        </div>
      </section>`;
  }

  function onboarding(id, index, art, title, copy, next) {
    return `
      <section id="${id}" class="lr-screen lr-onboarding">
        ${status()}
        <div class="lr-topbar"><span></span><button class="lr-skip" data-go="get-started">Skip</button></div>
        <div class="lr-center">
          <div class="lr-art-stage">${art}</div>
          <h1>${title}</h1>
          <p class="lr-copy">${copy}</p>
        </div>
        <div class="lr-next-row">
          ${dots(index, 3)}
          <button class="lr-round-next" data-go="${next}">${icon("arrowRight")}</button>
        </div>
      </section>`;
  }

  function authScreens() {
    return `
      <section id="get-started" class="lr-screen lr-auth">
        ${status()}
        <button class="lr-icon-btn" data-go="onboard-prep">${icon("arrowLeft")}</button>
        <div class="lr-center" style="width:100%;margin-top:18px">
          ${logo("small")}
          <h1 style="margin-top:18px">Welcome to Loksewa AI</h1>
          <p class="lr-copy">Your all-in-one platform for Loksewa exam preparation.</p>
          <div class="lr-auth-panel">
            ${authButton("Continue with Email", "login", "primary")}
            <button class="lr-btn outline" type="button" data-go="home">Continue with Google</button>
            <button class="lr-btn outline" type="button" data-go="home">Continue with Apple</button>
            <p class="lr-tos">By continuing, you agree to our<br/><a>Terms of Service</a> and <a>Privacy Policy</a></p>
          </div>
        </div>
      </section>
      <section id="login" class="lr-screen lr-auth">
        ${status()}
        <button class="lr-icon-btn" data-go="get-started">${icon("arrowLeft")}</button>
        <div class="lr-center" style="width:100%;margin-top:34px">
          <h1>Welcome Back!</h1>
          <p class="lr-copy">Login to continue your learning journey.</p>
          <form class="lr-auth-panel" data-auth="login">
            ${input("email", "Email or Phone", "mail")}
            ${input("password", "Password", "lock", "Forgot?")}
            <button class="lr-btn primary" type="submit">Login</button>
            <p class="lr-link-line">Don't have an account? <button type="button" data-go="signup">Sign Up</button></p>
          </form>
        </div>
      </section>
      <section id="signup" class="lr-screen lr-auth">
        ${status()}
        <button class="lr-icon-btn" data-go="login">${icon("arrowLeft")}</button>
        <div class="lr-center" style="width:100%;margin-top:12px">
          <h1>Create Account</h1>
          <p class="lr-copy">Join Loksewa AI and start preparing smarter.</p>
          <form class="lr-auth-panel" data-auth="signup">
            ${input("text", "Full Name", "profile")}
            ${input("email", "Email or Phone", "mail")}
            ${input("password", "Password", "lock")}
            ${input("password", "Confirm Password", "lock")}
            <label class="lr-check-row"><input type="checkbox" checked /> <span>I agree to the <a class="lr-link">Terms of Service</a> and <a class="lr-link">Privacy Policy</a></span></label>
            <button class="lr-btn primary" type="submit">Sign Up</button>
            <p class="lr-link-line">Already have an account? <button type="button" data-go="login">Login</button></p>
          </form>
        </div>
      </section>`;
  }

  function home() {
    const quick = [
      ["test", "Mock Tests", "tests"], ["target", "Practice", "practice"], ["clipboard", "Past Questions", "study"], ["bot", "Study", "study"],
      ["notes", "Notes", "study"], ["bookmark", "Bookmarks", "bookmarks"], ["chart", "Current Affairs", "analytics"], ["bot", "AI Tutor", "tutor"]
    ];
    return mainScreen("home", "home", "Namaste!", "Keep learning, keep growing.", `
      <article class="lr-card lr-pad lr-progress-card lr-row">
        <div class="lr-ring" style="--pct:65"><strong>65%</strong></div>
        <div style="flex:1">
          <h3 style="margin:0;font-size:15px">Great job!</h3>
          <p class="lr-subtitle">You're on the right track</p>
          <button class="lr-mini-btn" data-go="analytics" style="margin-top:10px">View Analytics</button>
        </div>
      </article>
      <p class="lr-section-label">Quick Access</p>
      <div class="lr-quick-grid">${quick.map(([ico, label, go]) => `
        <button class="lr-card lr-quick" data-go="${go}">
          <span class="lr-quick-icon">${icon(ico)}</span><span>${label}</span>
        </button>`).join("")}</div>
      <p class="lr-section-label">Recommended for You</p>
      <article class="lr-card lr-course" data-go="practice">
        <div class="lr-course-icon">${icon("book")}</div>
        <div>
          <h3 class="lr-test-title">Geography</h3>
          <p class="lr-test-meta">Continue Practice</p>
          <div class="lr-bar"><span style="width:72%"></span></div>
        </div>
        <span class="lr-test-meta">12/25</span>
      </article>
    `, `<button class="lr-icon-btn framed">${icon("bell")}</button>`);
  }

  function tests() {
    const rows = [
      ["Full Length Mock Test 1", "100 Questions - 2 Hours", "78%", "ring"],
      ["Full Length Mock Test 2", "100 Questions - 2 Hours", "Attempt", "button"],
      ["Sectional Mock Test", "Nepal Government - 50 Questions - 1 Hour", "Attempt", "button"],
      ["Full Length Mock Test 3", "100 Questions - 2 Hours", "Locked", "chip"],
      ["Full Length Mock Test 4", "100 Questions - 2 Hours", "Locked", "chip"]
    ];
    return mainScreen("tests", "tests", "Mock Tests", "", `
      <div class="lr-tabs"><span class="lr-chip active">All</span><span class="lr-chip">By Subject</span><span class="lr-chip">By Level</span></div>
      <div class="lr-list">${rows.map(([title, meta, label, kind], i) => `
        <article class="lr-card lr-test-card" ${kind !== "chip" ? 'data-go="practice"' : ""}>
          <div><h3 class="lr-test-title">${title}</h3><p class="lr-test-meta">${meta}</p></div>
          ${kind === "ring" ? `<div class="lr-small-ring">${label}</div>` : kind === "button" ? `<button class="lr-mini-btn">${label}</button>` : `<span class="lr-chip">${label}</span>`}
        </article>`).join("")}</div>
    `);
  }

  function practice() {
    return `
      <section id="practice" class="lr-screen">
        ${topbar("Practice", "1/20", "home", `<button class="lr-icon-btn">${icon("bookmark")}</button>`)}
        <div class="lr-tabs"><span class="lr-chip active">Geography</span><span class="lr-chip active" style="background:rgba(24,199,102,.24);color:#7cffb1">Easy</span></div>
        <h2 style="font-size:18px;margin:16px 0 20px">Which is the longest river in Nepal?</h2>
        <div class="lr-list">
          <button class="lr-option"><span class="lr-option-letter">A</span><span>Koshi</span></button>
          <button class="lr-option correct"><span class="lr-option-letter">B</span><span>Gandaki</span>${icon("check")}</button>
          <button class="lr-option"><span class="lr-option-letter">C</span><span>Karnali</span></button>
          <button class="lr-option"><span class="lr-option-letter">D</span><span>Mahakali</span></button>
        </div>
        <div class="lr-bottom-actions">
          <button class="lr-btn outline" type="button">Previous</button>
          <button class="lr-btn primary" type="button" data-go="question-result">Next</button>
        </div>
      </section>`;
  }

  function questionResult() {
    return `
      <section id="question-result" class="lr-screen lr-center">
        ${topbar("Result", "", "practice")}
        <div class="lr-trophy">${icon("trophy")}</div>
        <h1 style="font-size:22px;margin-top:12px">Excellent!</h1>
        <p class="lr-copy" style="margin-top:4px">You answered correctly</p>
        <article class="lr-card lr-pad" style="width:100%;text-align:left;margin-top:24px">
          <p class="lr-test-meta">Correct Answer</p>
          <p style="color:var(--lr-green);font-weight:800;margin:6px 0 0">B. Gandaki</p>
        </article>
        <article class="lr-card lr-pad" style="width:100%;text-align:left;margin-top:12px">
          <p class="lr-test-meta">Explanation</p>
          <p style="font-size:13px;line-height:1.6;color:var(--lr-muted)">The Gandaki River is the longest river in Nepal. It originates from the Himalayas and flows through central Nepal.</p>
        </article>
        <button class="lr-btn primary" type="button" data-go="practice" style="margin-top:auto">Next Question</button>
      </section>`;
  }

  function testResult() {
    return `
      <section id="test-result" class="lr-screen lr-center">
        ${topbar("Test Result", "Full Length Mock Test 1", "tests")}
        <p class="lr-subtitle">Completed on May 12, 2024</p>
        <div class="lr-score-ring" style="--pct:78"><div><strong>78%</strong><span>Score</span></div></div>
        <strong>78/100</strong><p class="lr-subtitle">Great Performance!</p>
        <div class="lr-stats-3" style="width:100%;margin-top:16px">
          <div class="lr-card lr-stat-tile"><small>Correct</small><strong style="color:var(--lr-green)">78</strong></div>
          <div class="lr-card lr-stat-tile"><small>Incorrect</small><strong style="color:var(--lr-red)">16</strong></div>
          <div class="lr-card lr-stat-tile"><small>Skipped</small><strong>6</strong></div>
        </div>
        <button class="lr-btn primary" data-go="analytics" style="margin-top:18px">View Detailed Analysis</button>
        <button class="lr-btn outline" data-go="practice" style="margin-top:10px">Review Questions</button>
      </section>`;
  }

  function analytics() {
    return mainScreen("analytics", "analytics", "Analytics", "", `
      <div class="lr-tabs"><span class="lr-chip active">Overview</span><span class="lr-chip">Performance</span><span class="lr-chip">Subjects</span></div>
      <div class="lr-row"><p class="lr-section-label" style="margin:0">Performance Overview</p><span class="lr-chip">This Week</span></div>
      <div class="lr-stats-3" style="margin-top:12px">
        <div class="lr-card lr-stat-tile"><small>Tests Taken</small><strong>12</strong></div>
        <div class="lr-card lr-stat-tile"><small>Average Score</small><strong>72%</strong></div>
        <div class="lr-card lr-stat-tile"><small>Accuracy</small><strong>68%</strong></div>
      </div>
      <article class="lr-card lr-pad" style="margin-top:14px">
        <p class="lr-test-title">Score Trend</p>
        <svg class="lr-chart" viewBox="0 0 320 130" aria-hidden="true">
          <path d="M0 110H320M0 78H320M0 46H320M0 14H320" stroke="rgba(130,160,210,.13)"/>
          <path d="M10 94 45 62 80 74 115 42 150 31 185 54 220 76 255 40 290 28 315 32" fill="none" stroke="#0a84ff" stroke-width="4"/>
          <g fill="#12d8ff"><circle cx="45" cy="62" r="4"/><circle cx="80" cy="74" r="4"/><circle cx="115" cy="42" r="4"/><circle cx="150" cy="31" r="4"/><circle cx="185" cy="54" r="4"/><circle cx="220" cy="76" r="4"/><circle cx="255" cy="40" r="4"/><circle cx="290" cy="28" r="4"/></g>
        </svg>
      </article>
      <div class="lr-row" style="margin-top:14px"><p class="lr-section-label" style="margin:0">Top Subjects</p><button class="lr-link" data-go="study">View All</button></div>
      <article class="lr-card lr-course" style="margin-top:10px"><div class="lr-course-icon">${icon("book")}</div><div><h3 class="lr-test-title">Geography</h3><div class="lr-bar"><span style="width:78%"></span></div></div><span>78%</span></article>
    `);
  }

  function tutor() {
    return `
      <section id="tutor" class="lr-screen lr-main-screen">
        ${status()}
        <div class="lr-bot-orb">${icon("bot")}</div>
        <h1 style="text-align:center;font-size:21px">Hello! I'm your AI Tutor.</h1>
        <p class="lr-copy">Ask me anything about Loksewa preparation.</p>
        <div class="lr-suggestions">
          <button class="lr-chip" data-fill="Explain Federalism in Nepal">Explain Federalism in Nepal</button>
          <button class="lr-chip" data-fill="Important Rivers of Nepal">Important Rivers of Nepal</button>
          <button class="lr-chip" data-fill="MCQ on Constitution">MCQ on Constitution</button>
        </div>
        <div class="lr-card lr-chat-input"><input id="lrTutorInput" placeholder="Ask anything..." /><button>${icon("send")}</button></div>
        ${bottomNav("study")}
      </section>`;
  }

  function study() {
    const materials = [
      ["Nepal Constitution", "25 Chapters", "#ff6a00"], ["Nepal Geography", "18 Chapters", "#12d8ff"], ["Nepal History", "22 Chapters", "#0a84ff"],
      ["Economics", "20 Chapters", "#7c4dff"], ["General Knowledge", "30 Chapters", "#ffc400"]
    ];
    return mainScreen("study", "study", "Study Materials", "", `
      <div class="lr-tabs"><span class="lr-chip active">All</span><span class="lr-chip">Subjects</span><button class="lr-chip" data-go="bookmarks">Bookmarks</button></div>
      <div class="lr-list">${materials.map(([name, meta, color]) => `
        <article class="lr-card lr-material-row">
          <div class="lr-course-icon" style="background:${color}">${icon("book")}</div>
          <div><h3 class="lr-test-title">${name}</h3><p class="lr-test-meta">${meta}</p></div>
          <button class="lr-icon-btn framed">${icon("download")}</button>
        </article>`).join("")}</div>
    `);
  }

  function bookmarks() {
    const rows = [
      ["Which is the longest river in Nepal?", "Geography - Easy"], ["Who is known as the Father of the Nation in Nepal?", "History - Medium"],
      ["Federalism is adopted in Nepal from which year?", "Polity - Easy"], ["Characteristics of Good Governance", "Notes - Polity"]
    ];
    return `
      <section id="bookmarks" class="lr-screen lr-main-screen">
        ${topbar("Bookmarks", "", "study")}
        <div class="lr-tabs"><span class="lr-chip active">All</span><span class="lr-chip">Questions</span><span class="lr-chip">Notes</span><span class="lr-chip">Materials</span></div>
        <div class="lr-list">${rows.map(([title, meta]) => `
          <article class="lr-card lr-bookmark-card">
            <div><h3 class="lr-test-title">${title}</h3><p class="lr-test-meta">${meta}<br/>Bookmarked on May 12, 2024</p></div>
            <span style="color:var(--lr-blue)">${icon("bookmark")}</span>
          </article>`).join("")}</div>
        ${bottomNav("study")}
      </section>`;
  }

  function profile() {
    const rows = [
      ["userEdit", "Edit Profile"], ["target", "Study Plan"], ["test", "Subscription"], ["clipboard", "Payment History"],
      ["settings", "Settings"], ["notes", "Help & Support"]
    ];
    return mainScreen("profile", "profile", "", "", `
      <div class="lr-profile-head">
        <div class="lr-avatar">SK</div>
        <div><h2 style="margin:0;font-size:17px">Sujan Karki</h2><p class="lr-test-meta">sujan.karki@email.com</p><span class="lr-badge">Premium Member</span></div>
        <button class="lr-icon-btn">${icon("settings")}</button>
      </div>
      <div class="lr-list">${rows.map(([ico, label]) => `
        <article class="lr-card lr-profile-row"><span>${icon(ico)}</span><strong style="font-size:13px">${label}</strong>${icon("chevron")}</article>`).join("")}
        <article class="lr-card lr-profile-row lr-danger"><span>${icon("arrowLeft")}</span><strong style="font-size:13px">Logout</strong>${icon("chevron")}</article>
      </div>
    `);
  }

  function screens() {
    const bookArt = `<div class="lr-open-book"><div class="lr-brain"></div></div>`;
    const prepArt = `<div class="lr-checklist-art"><div class="lr-target-arrow"></div><div class="lr-bars"><span style="height:34px"></span><span style="height:52px"></span><span style="height:74px"></span></div></div>`;
    return [
      splash(),
      onboarding("onboard-learning", 1, bookArt, "AI-Powered Learning", "Smart practice, personalized for Loksewa success.", "onboard-prep"),
      onboarding("onboard-prep", 2, prepArt, "Exam Focused Preparation", "Mock tests, past questions and detailed analytics to boost your performance.", "get-started"),
      authScreens(),
      home(),
      tests(),
      practice(),
      questionResult(),
      testResult(),
      analytics(),
      tutor(),
      study(),
      bookmarks(),
      profile()
    ].join("");
  }

  function go(id) {
    document.querySelectorAll(".lr-screen").forEach((screen) => screen.classList.toggle("is-active", screen.id === id));
    const phone = document.querySelector(".lr-phone");
    if (phone) phone.scrollTop = 0;
  }

  function handleClick(event) {
    const target = event.target.closest("[data-go], [data-fill]");
    if (!target) return;
    if (target.dataset.fill) {
      const input = document.getElementById("lrTutorInput");
      if (input) input.value = target.dataset.fill;
      return;
    }
    if (target.dataset.go) go(target.dataset.go);
  }

  function handleSubmit(event) {
    const form = event.target.closest("[data-auth]");
    if (!form) return;
    event.preventDefault();
    go("home");
  }

  function mount() {
    document.body.className = "loksewa-redesign";
    document.body.innerHTML = `<main class="lr-root"><div class="lr-phone">${screens()}</div></main>`;
    document.body.addEventListener("click", handleClick);
    document.body.addEventListener("submit", handleSubmit);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
