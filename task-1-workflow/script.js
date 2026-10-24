const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const categoryInfo = {
  Waste: { icon: "♻", color: "#e6f3e7", text: "#347747" },
  Water: { icon: "◉", color: "#e7f1ff", text: "#3976b4" },
  Energy: { icon: "ϟ", color: "#fff1d8", text: "#ac781e" },
  Transport: { icon: "↗", color: "#f0eafd", text: "#7757a4" },
  Resources: { icon: "♧", color: "#e8f3e9", text: "#467c4e" }
};
const roleInfo = {
  student: { name: "Student", short: "Student", subtitle: "Campus community", initials: "ST" },
  faculty: { name: "Faculty", short: "Faculty", subtitle: "Teaching & academics", initials: "FC" },
  maintenance: { name: "Maintenance Team", short: "Maintenance Team", subtitle: "Facilities & operations", initials: "MT" },
  admin: { name: "Administrator", short: "Administrator", subtitle: "Campus overview", initials: "AD" }
};
const initialReports = [
  {id:"GC-1048",title:"Water leakage near Block B",category:"Water",location:"Block B · Ground floor",description:"A tap near the washroom is continuously leaking and needs inspection.",priority:"High",status:"Reported",reporterRole:"student",createdAt:"2026-10-21T08:20:00",updatedAt:"2026-10-21T08:20:00",resolutionNotes:"",reporter:"A. Student"},
  {id:"GC-1047",title:"Overflowing waste bin",category:"Waste",location:"Main cafeteria",description:"The general waste bin is overflowing during lunch hours.",priority:"Medium",status:"In Progress",reporterRole:"student",createdAt:"2026-10-20T12:30:00",updatedAt:"2026-10-21T07:50:00",resolutionNotes:"Cleaning team has been assigned.",reporter:"Campus user"},
  {id:"GC-1046",title:"Lights left on in empty room",category:"Energy",location:"Academic Block A · Room 204",description:"Lights were left on after the room was no longer in use.",priority:"Low",status:"Resolved",reporterRole:"student",createdAt:"2026-10-19T16:10:00",updatedAt:"2026-10-20T09:00:00",resolutionNotes:"Lights switched off and reminder shared.",reporter:"Campus user"},
  {id:"GC-1045",title:"Recycling bins need labels",category:"Waste",location:"Library entrance",description:"Students are unsure which bin should be used for recyclable items.",priority:"Medium",status:"Assigned",reporterRole:"student",createdAt:"2026-10-19T10:45:00",updatedAt:"2026-10-20T11:30:00",resolutionNotes:"",reporter:"Campus user"},
  {id:"GC-1044",title:"Air conditioning running unnecessarily",category:"Energy",location:"Admin Block · Meeting room",description:"The AC appears to be running in an unoccupied meeting room.",priority:"Medium",status:"Resolved",reporterRole:"student",createdAt:"2026-10-18T14:00:00",updatedAt:"2026-10-19T08:30:00",resolutionNotes:"Timer setting adjusted.",reporter:"Campus user"},
  {id:"GC-1043",title:"Damaged water refill station",category:"Water",location:"Sports complex",description:"The water refill station is not dispensing water consistently.",priority:"High",status:"In Progress",reporterRole:"student",createdAt:"2026-10-18T11:20:00",updatedAt:"2026-10-20T13:10:00",resolutionNotes:"Spare part requested.",reporter:"Campus user"},
  {id:"GC-1042",title:"Bicycle parking area cluttered",category:"Transport",location:"East campus gate",description:"The bicycle stand is partially blocked by unused items.",priority:"Low",status:"Reported",reporterRole:"student",createdAt:"2026-10-17T09:15:00",updatedAt:"2026-10-17T09:15:00",resolutionNotes:"",reporter:"Campus user"},
  {id:"GC-1041",title:"Paper waste in computer lab",category:"Resources",location:"Computer lab 2",description:"Reusable single-sided sheets are being discarded with general waste.",priority:"Low",status:"Resolved",reporterRole:"student",createdAt:"2026-10-16T13:40:00",updatedAt:"2026-10-17T10:00:00",resolutionNotes:"A reuse tray has been added.",reporter:"Campus user"}
];
const initialNotifications = [
  {title:"A new report needs attention",text:"Water leakage near Block B was reported.",time:"Just now",read:false,icon:"◉",reportId:"GC-1048"},
  {title:"Issue status updated",text:"Overflowing waste bin is now In Progress.",time:"Today",read:false,icon:"↻",reportId:"GC-1047"},
  {title:"Resolved successfully",text:"Lights left on in empty room was resolved.",time:"Yesterday",read:true,icon:"✓",reportId:"GC-1046"}
];

let state = {
  role: "student",
  profile: null,
  page: "dashboard",
  reports: loadStored("gc-reports", initialReports),
  notifications: loadStored("gc-notifications", initialNotifications),
  dark: loadStored("gc-dark", false),
  selectedCategory: "Waste",
  uploadedFile: null,
  settingsSection: "preferences",
  search: "",
  statusFilter: "All statuses",
  categoryFilter: "All categories",
  priorityFilter: "All priorities",
  analyticsRange: "Last 30 days"
};

function loadStored(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}
function saveState() {
  try {
    localStorage.setItem("gc-reports", JSON.stringify(state.reports));
    localStorage.setItem("gc-notifications", JSON.stringify(state.notifications));
    localStorage.setItem("gc-dark", JSON.stringify(state.dark));
  } catch {}
}
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {day:"2-digit", month:"short", year:"numeric"});
}
function relativeTime(value) {
  const diff = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(diff)) return "Recently";
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}
function statusClass(status) { return `status-${status.toLowerCase().replace(/\s+/g,"-")}`; }
function statusBadge(status) { return `<span class="status-badge ${statusClass(status)}">${escapeHTML(status)}</span>`; }
function priorityClass(priority) { return `priority-${priority.toLowerCase()}`; }
function categoryIcon(category) {
  const c = categoryInfo[category] || categoryInfo.Resources;
  return `<span class="issue-symbol" style="background:${c.color};color:${c.text}">${c.icon}</span>`;
}
function toast(title, message, type = "success") {
  const node = document.createElement("div");
  node.className = `toast ${type === "error" ? "error" : ""}`;
  node.innerHTML = `<span class="toast-icon">${type === "error" ? "!" : "✓"}</span><div><strong>${escapeHTML(title)}</strong><p>${escapeHTML(message)}</p></div>`;
  $("#toastRegion").appendChild(node);
  setTimeout(() => node.remove(), 3800);
}
function roleName() { return roleInfo[state.role].name; }
function switchPage(page) {
  state.page = page;
  $("#notificationPanel").classList.add("hidden");
  $("#sidebar").classList.remove("mobile-open");
  renderApp();
  window.scrollTo({top:0, behavior:"smooth"});
}
const API_BASE_URL = "http://127.0.0.1:8000";



async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data.detail;
    const message = Array.isArray(detail)
      ? detail.map(item => item.msg || "Invalid input").join("; ")
      : (detail || "The request could not be completed.");
    throw new Error(message);
  }
  return data;
}

function mapApiReport(r) {
  return {
    ...r,

    // Display the report code, but keep the numeric database ID for API calls.
    id: r.report_code || `GC-${r.id}`,
    apiId: Number(r.id),
    reportCode: r.report_code || "",

    title: r.title || "",
    category: r.category || "",
    location: r.location || "",
    description: r.description || "",
    priority: r.priority || "Medium",
    status: r.status || "Reported",

    reporterId: r.reporter_id,
    reporterName: r.reporter_name || "Campus user",
    reporter: r.reporter_name || "Campus user",
    reporterEmail: r.reporter_email || "",
    reporterPhone: r.reporter_phone || "",
    reporterRole: r.reporter_role || "",
    reporterCampusId: r.reporter_campus_id || "",

    assignedToId: r.assigned_to_id ?? r.assigned_to ?? null,
    assignedToName: r.assigned_to_name || "",
    assignedToEmail: r.assigned_to_email || "",

    createdAt: r.created_at,
    updatedAt: r.updated_at,
    resolutionNotes: r.resolution_notes || ""
  };
}

async function loadReportsFromApi() {
  try {
    const data = await apiRequest("/api/reports");
    state.reports = (data.reports || []).map(mapApiReport);
    return true;
  } catch (error) {
    console.error("Could not load database reports:", error.message);
    toast("Reports could not be refreshed", error.message, "error");
    return false;
  }
}

function setAuthenticatedUser(user) {
  if (!user || !user.email) {
    throw new Error("The server did not return valid user details.");
  }

  const validRoles = ["student", "faculty", "maintenance", "admin"];

  state.role = validRoles.includes(user.role)
    ? user.role
    : "student";

  state.profile = {
    name: user.full_name || user.name || user.email,
    email: user.email,
    phone: user.phone || "",
    id: user.campus_id || "",
    department: user.department || "",
    program: user.program || "",
    year: user.year_of_study || "",
    designation: user.designation || "",
    campusArea: user.campus_area || "",
    shift: user.shift || ""
  };

  hideAllScreens();
  $("#appShell").classList.remove("hidden");

  document.body.classList.toggle("theme-dark", state.dark);
  updateRoleChrome();
  renderApp();
}

async function handleLogin(event) {
  event.preventDefault();

  const email = $("#loginEmail").value.trim().toLowerCase();
  const password = $("#loginPassword").value;
  const error = $("#loginError");
  const button = $("#loginForm button[type='submit']");

  error.textContent = "";
  button.disabled = true;
  button.textContent = "Logging in…";

  try {
    const result = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    setAuthenticatedUser(result.user || result);
    await loadReportsFromApi();
    toast("Login successful", `Welcome back, ${state.profile.name}.`);
  } catch (err) {
    error.textContent = err.message.includes("Failed to fetch")
      ? "Cannot connect to GreenCampus. Please start the API server."
      : err.message;
  } finally {
    button.disabled = false;
    button.textContent = "Log in →";
  }
}

function openApp() {
  hideAllScreens();
  renderRegistrationForm();
  $("#registrationScreen").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showLogin() {
  hideAllScreens();
  $("#loginScreen").classList.remove("hidden");
  $("#loginError").textContent = "";
  $("#loginForm").reset();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function hideAllScreens() {
  $("#accessScreen").classList.add("hidden");
  $("#loginScreen").classList.add("hidden");
  $("#registrationScreen").classList.add("hidden");
  $("#appShell").classList.add("hidden");
}

function showRoleSelection() {
  hideAllScreens();
  $("#accessScreen").classList.remove("hidden");
  $("#registrationError").textContent = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function registrationField(id, label, type="text", placeholder="", required=true, extra="") {
  const autocomplete = id === "regName" ? "name" : id === "regEmail" ? "email" : id === "regPhone" ? "tel" : id.toLowerCase().includes("password") ? "new-password" : "off";
  return `<div class="registration-field"><label for="${id}">${label}${required ? ' <span>*</span>' : ''}</label><input id="${id}" name="${id}" type="${type}" placeholder="${placeholder}" ${required ? 'required' : ''} ${extra} autocomplete="${autocomplete}"><small class="field-error" id="${id}Error"></small></div>`;
}
function registrationSelect(id, label, options, selected, required=true) {
  return `<div class="registration-field"><label for="${id}">${label}${required ? ' <span>*</span>' : ''}</label><select id="${id}" name="${id}" ${required ? 'required' : ''}>${options.map(o=>`<option value="${escapeHTML(o)}" ${o===selected?'selected':''}>${escapeHTML(o)}</option>`).join("")}</select><small class="field-error" id="${id}Error"></small></div>`;
}
function renderRegistrationForm() {
  const role = roleInfo[state.role] ? state.role : "student";
  state.role = role;
  const roleLabel = roleInfo[role].name;
  $("#registrationRoleName").textContent = roleLabel;
  $("#registrationTitle").textContent = role === "maintenance" ? "Join the maintenance team." : role === "faculty" ? "Welcome, faculty member." : role === "admin" ? "Administrator account request." : "Create your student account.";
  let fields = "";
  if (role === "student") {
    fields += `<div class="registration-field full"><label for="registrationUserType">Account type <span>*</span></label><select id="registrationUserType"><option value="student" selected>Student</option><option value="faculty">Faculty</option></select><small class="field-error" id="registrationUserTypeError"></small></div>`;
  }
  fields += registrationField("regName","Full name","text","Enter your full name",true,'minlength="2" maxlength="120"');
  fields += registrationField("regEmail","Campus email","email","you@college.edu",true,'maxlength="254"');
  fields += registrationField("regPhone","Phone number","tel","Include country code if needed",true,'minlength="8" maxlength="18"');
  if (role === "student") {
    fields += registrationField("regId","Campus ID / enrollment number","text","Enter your student ID",true,'minlength="2" maxlength="80"');
    fields += registrationSelect("regDepartment","Department",["Computer Science","Electrical","Mechanical","Civil","Electronics","Business Administration","Other"],"Computer Science");
    fields += registrationSelect("regProgram","Program / degree",["B.Tech","B.Sc","B.Com","BBA","M.Tech","M.Sc","Other"],"B.Tech");
    fields += registrationSelect("regYear","Current year of study",["1st Year","2nd Year","3rd Year","4th Year","5th Year or above","Other"],"1st Year");
  } else if (role === "faculty") {
    fields += registrationField("regId","Employee ID","text","Enter your employee ID",true,'minlength="2" maxlength="80"');
    fields += registrationSelect("regDepartment","Department",["Computer Science","Electrical","Mechanical","Civil","Electronics","Business Administration","Other"],"Computer Science");
    fields += registrationField("regDesignation","Designation","text","e.g. Assistant Professor",true,'minlength="2" maxlength="120"');
  } else if (role === "maintenance") {
    fields += registrationField("regId","Employee / staff ID","text","Enter your staff ID",true,'minlength="2" maxlength="80"');
    fields += registrationSelect("regDepartment","Department / work team",["Facilities & Operations","Electrical","Plumbing","Housekeeping / Sweeping","Waste Management","Grounds & Gardening","Carpentry","General Maintenance","Other"],"Facilities & Operations");
    fields += registrationSelect("regArea","Assigned campus area",["Entire campus","Academic Block A","Academic Block B","Library","Cafeteria","Sports complex","Hostels","Other"],"Entire campus",false);
    fields += registrationSelect("regShift","Shift timing",["Day shift","Evening shift","Night shift","Rotational","Not specified"],"Day shift",false);
  } else {
    fields += registrationField("regId","Employee ID","text","Enter your employee ID",true,'minlength="2" maxlength="80"');
    fields += registrationSelect("regDepartment","Department / office",["Administration","Computer Science","Facilities & Operations","Sustainability Office","Other"],"Administration",false);
  }
  fields += registrationField("regPassword","Create password","password","At least 8 characters",true,'minlength="8" maxlength="128"');
  fields += registrationField("regConfirmPassword","Confirm password","password","Re-enter your password",true,'minlength="8" maxlength="128"');
  $("#registrationFields").innerHTML = fields;
  $("#registrationError").textContent = "";
  $("#registrationConsent").checked = false;
  const typeSelect = $("#registrationUserType");
  if (typeSelect) typeSelect.addEventListener("change", () => {
    state.role = typeSelect.value;
    renderRegistrationForm();
  });
}
function validateRegistration() {
  const form = $("#registrationForm");
  const error = $("#registrationError");
  error.textContent = "";
  $$(".registration-field input, .registration-field select", form).forEach(el => {
    el.classList.remove("invalid");
    const message = $("#" + el.id + "Error");
    if (message) message.textContent = "";
  });
  const firstInvalid = $(".registration-field :invalid", form);
  if (firstInvalid) {
    firstInvalid.classList.add("invalid");
    firstInvalid.focus();
    const fieldError = $("#" + firstInvalid.id + "Error");
    if (fieldError) fieldError.textContent = firstInvalid.validationMessage || "Please complete this field correctly.";
    else error.textContent = firstInvalid.validationMessage || "Please complete this field correctly.";
    return false;
  }
  const phone = $("#regPhone").value.replace(/[^0-9]/g, "");
  if (phone.length < 8 || phone.length > 15) {
    $("#regPhone").classList.add("invalid");
    $("#regPhoneError").textContent = "Enter a phone number containing 8 to 15 digits.";
    $("#regPhone").focus();
    return false;
  }
  if ($("#regPassword").value !== $("#regConfirmPassword").value) {
    $("#regConfirmPassword").classList.add("invalid");
    $("#regConfirmPasswordError").textContent = "Passwords do not match.";
    $("#regConfirmPassword").focus();
    return false;
  }
  if (!$("#registrationConsent").checked) {
    error.textContent = "Please agree to the privacy notice before creating your account.";
    $("#registrationConsent").focus();
    return false;
  }
  return true;
}
async function completeRegistration() {
  if (!validateRegistration()) return;
  const submitButton = $("#registrationForm button[type='submit']");
  const error = $("#registrationError");
  const role = state.role;
  const fullName = $("#regName").value.trim();
  const payload = {
    full_name: fullName,
    email: $("#regEmail").value.trim().toLowerCase(),
    phone: $("#regPhone").value.trim(),
    campus_id: $("#regId").value.trim(),
    role,
    department: $("#regDepartment")?.value || null,
    program: $("#regProgram")?.value || null,
    year_of_study: $("#regYear")?.value || null,
    designation: $("#regDesignation")?.value.trim() || null,
    campus_area: $("#regArea")?.value || null,
    shift: $("#regShift")?.value || null,
    password: $("#regPassword").value,
    consent: $("#registrationConsent").checked
  };
  submitButton.disabled = true;
  submitButton.textContent = "Creating account…";
  try {
    const result = await apiRequest("/api/auth/register", { method: "POST", body: JSON.stringify(payload) });
    const user = result.user || result;
    state.role = user.role || role;
    state.profile = {
      name: user.full_name || fullName,
      email: user.email || payload.email,
      phone: user.phone || payload.phone,
      id: user.campus_id || payload.campus_id,
      department: user.department || payload.department || "",
      program: user.program || payload.program || "",
      year: user.year_of_study || payload.year_of_study || "",
      designation: user.designation || payload.designation || "",
      campusArea: user.campus_area || payload.campus_area || "",
      shift: user.shift || payload.shift || ""
    };
    $("#regPassword").value = "";
    $("#regConfirmPassword").value = "";
    $("#registrationScreen").classList.add("hidden");
    $("#appShell").classList.remove("hidden");
    document.body.classList.toggle("theme-dark", state.dark);
    updateRoleChrome();
    renderApp();
    toast("Account created", `Welcome to GreenCampus, ${state.profile.name}.`);
  } catch (err) {
    error.textContent = err.message.includes("Failed to fetch")
      ? "Could not reach the GreenCampus API. Start the FastAPI server and try again."
      : err.message;
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Create account <span>→</span>';
  }
}
function updateRoleChrome() {
  const role = roleInfo[state.role];
  const displayName = state.profile?.name || role.name;
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0].toUpperCase()).join("") || role.initials;
  $("#profileName").textContent = displayName;
  $("#profileRole").textContent = state.profile?.department || role.subtitle;
  $("#profileAvatar").textContent = initials;
  $("#topUserName").textContent = displayName;
  $("#topUserRole").textContent = role.name;
  $("#topAvatar").textContent = initials;
  $("#sidebarIssueCount").textContent = state.reports.length;
  $("#notificationDot").style.display = state.notifications.some(n => !n.read) ? "block" : "none";

  const reportNavItem = $("#reportNavItem");

if (reportNavItem) {
  reportNavItem.classList.toggle(
    "hidden",
    !["student", "faculty"].includes(state.role)
  );
}
}
function renderApp() {
  updateRoleChrome();
  const pageNames = {dashboard:"Dashboard",report:"Report an issue",issues:"Issue tracker",analytics:"Analytics",initiatives:"Green initiatives",settings:"Settings & help"};
  $("#pageCrumb").textContent = pageNames[state.page] || "Dashboard";
  $$(".nav-item[data-page]").forEach(button => button.classList.toggle("active", button.dataset.page === state.page));
  const pages = {dashboard:renderDashboard,report:renderReportPage,issues:renderIssuesPage,analytics:renderAnalyticsPage,initiatives:renderInitiativesPage,settings:renderSettingsPage};
  $("#pageContent").innerHTML = (pages[state.page] || renderDashboard)();
  bindPageEvents();
  if (state.page === "dashboard") drawDashboardChart();
  if (state.page === "analytics") drawAnalyticsChart();
}
function reportStats(reports = state.reports) {
  return {
    total: reports.length,
    pending: reports.filter(r => ["Reported","Assigned"].includes(r.status)).length,
    progress: reports.filter(r => r.status === "In Progress").length,
    resolved: reports.filter(r => r.status === "Resolved").length
  };
}
function heading(title, subtitle, actions = "") {
  return `<div class="page-heading"><div><div class="eyebrow-small">CAMPUS SUSTAINABILITY</div><h1>${title}</h1><p>${subtitle}</p></div><div class="heading-actions">${actions}</div></div>`;
}
function statCard(label, value, icon, tone, foot, trend = "") {
  return `<article class="stat-card"><div class="stat-top"><span class="stat-label">${label}</span><span class="stat-icon ${tone}">${icon}</span></div><div class="stat-number">${value}</div><div class="stat-foot"><span class="${trend ? "trend-up":"trend-neutral"}">${trend}</span><span>${foot}</span></div></article>`;
}


function recentReportRows(reports) {
  return reports.slice(0, 5).map(r => {
    const reporterName =
      r.reporter_name || r.reporterName || r.reporter || "Campus user";

    const reporterRole =
      r.reporter_role || r.reporterRole || "";

    const reporterInfo = state.role === "admin"
      ? `<small>Reported by: ${escapeHTML(reporterName)}${reporterRole ? ` · ${escapeHTML(reporterRole.charAt(0).toUpperCase() + reporterRole.slice(1))}` : ""}</small>`
      : "";

    return `<tr>
      <td>
        <div class="issue-title-cell">
          ${categoryIcon(r.category)}
          <div>
            <strong>${escapeHTML(r.title)}</strong>
            <small>${escapeHTML(r.report_code || r.reportCode || r.id)} · ${formatDate(r.createdAt || r.created_at)}</small>
            ${reporterInfo}
          </div>
        </div>
      </td>
      <td>${escapeHTML(r.location)}</td>
      <td><span class="${priorityClass(r.priority)}">${escapeHTML(r.priority)}</span></td>
      <td>${statusBadge(r.status)}</td>
      <td>
        <button class="text-button"
          data-action="view-issue"
          data-id="${escapeHTML(r.id)}"
          aria-label="View ${escapeHTML(r.title)}">View ↗</button>
      </td>
    </tr>`;
  }).join("");
}


function categoryBreakdown(reports = state.reports) {
  const categories = ["Waste","Water","Energy","Transport","Resources"];
  const counts = categories.map(category => ({category,count:reports.filter(r=>r.category===category).length}));
  const max = Math.max(1,...counts.map(c=>c.count));
  return counts.map(item => {
    const c = categoryInfo[item.category];
    const pct = Math.round(item.count / max * 100);
    return `<div class="category-row"><span class="category-icon" style="background:${c.color};color:${c.text}">${c.icon}</span><div><div class="category-meta"><span class="category-name">${item.category === "Resources" ? "Resource usage" : item.category}</span><span class="category-percent">${item.count} reports</span></div><div class="progress-track"><div class="progress-fill" style="width:${pct}%;background:${c.text}"></div></div></div><span class="category-count">${reports.length ? Math.round(item.count/reports.length*100) : 0}%</span></div>`;
  }).join("");
}


function renderDashboard() {
  const role = state.role;
  const allReports = state.reports || [];
  const profile = state.profile || {};

  const sameId = (a, b) =>
    a != null && b != null &&
    String(a).trim() !== "" &&
    String(a) === String(b);

  // Check which reports belong to the signed-in user.
  const isOwnReport = r =>
    sameId(r.reporterId ?? r.reporter_id, profile.id) ||
    (
      Boolean(profile.email) &&
      String(r.reporterEmail ?? r.reporter_email ?? "").toLowerCase() ===
        String(profile.email).toLowerCase()
    );

  // Only reports explicitly assigned to this maintenance user.
  const isAssignedTask = r =>
    sameId(r.assignedTo ?? r.assigned_to, profile.id) ||
    (
      Boolean(profile.email) &&
      String(r.assignedToEmail ?? r.assigned_to_email ?? "").toLowerCase() ===
        String(profile.email).toLowerCase()
    );

  let visibleReports = [];

  if (role === "admin") {
    visibleReports = allReports;
  } else if (role === "maintenance") {
    visibleReports = allReports.filter(isAssignedTask);
  } else {
    // Students and faculty see their own reports only.
    visibleReports = allReports.filter(isOwnReport);
  }

  // Used by the chart if it reads this property.
  state.dashboardReports = visibleReports;

  const stats = reportStats(visibleReports);
  const resolvedRate = stats.total
    ? Math.round(stats.resolved / stats.total * 100)
    : 0;

  const dashboardConfig = {
    student: {
      greeting: "Good morning!",
      subtitle: "Track the sustainability issues you have reported.",
      title: "Your report overview",
      chartTitle: "Your reports over time",
      tableTitle: "Your recent reports",
      tableSubtitle: "The latest updates on your reports",
      totalLabel: "My reports",
      totalDescription: "Reports submitted by you",
      action: `<button class="btn btn-primary btn-sm" data-page="report"><span class="button-icon">＋</span> Report an issue</button>`
    },
    faculty: {
      greeting: "Welcome back, Faculty!",
      subtitle: "Review your reports and sustainability contributions.",
      title: "Your report overview",
      chartTitle: "Your reports over time",
      tableTitle: "Your recent reports",
      tableSubtitle: "The latest updates on your reports",
      totalLabel: "My reports",
      totalDescription: "Reports submitted by you",
      action: `<button class="btn btn-primary btn-sm" data-page="report"><span class="button-icon">＋</span> Report an issue</button>`
    },
    maintenance: {
      greeting: "Good morning, team!",
      subtitle: "Monitor your assigned tasks and maintenance progress.",
      title: "Maintenance task overview",
      chartTitle: "Your assigned tasks over time",
      tableTitle: "Your assigned tasks",
      tableSubtitle: "Tasks assigned to your account",
      totalLabel: "Assigned tasks",
      totalDescription: "Tasks assigned to you",
      action: `<button class="btn btn-primary btn-sm" data-page="issues">Manage tasks <span>→</span></button>`
    },
    admin: {
      greeting: "Welcome back, Admin!",
      subtitle: "Monitor campus reports and sustainability performance.",
      title: "Campus sustainability overview",
      chartTitle: "Campus reports over time",
      tableTitle: "Recent campus reports",
      tableSubtitle: "The latest activity across campus",
      totalLabel: "Total reports",
      totalDescription: "All campus reports",
      action: `<button class="btn btn-primary btn-sm" data-page="analytics">View analytics <span>→</span></button>`
    }
  };

  const config = dashboardConfig[role] || dashboardConfig.student;

  const recentReports = visibleReports
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const activity = visibleReports
    .slice()
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 3);

  // Build category counts from the reports this role may see.
  const categoryCounts = {};
  visibleReports.forEach(r => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
  });

  const categoriesHTML = Object.entries(categoryInfo).map(([category, info]) => {
    const count = categoryCounts[category] || 0;
    const percentage = stats.total
      ? Math.round(count / stats.total * 100)
      : 0;

    return `
      <div class="category-row">
        <span class="category-icon"
          style="background:${info.color};color:${info.text}">
          ${info.icon}
        </span>
        <div class="category-details">
          <div class="category-label">
            <span>${escapeHTML(category)}</span>
            <strong>${count}</strong>
          </div>
          <div class="category-track">
            <div class="category-fill"
              style="width:${percentage}%;background:${info.text}">
            </div>
          </div>
        </div>
      </div>`;
  }).join("");

  const emptyMessage = role === "maintenance"
    ? "No tasks have been assigned to your account yet."
    : role === "admin"
    ? "No campus reports have been submitted yet."
    : "No reports are linked to your account yet.";

  const tableRows = recentReports.length
    ? recentReportRows(recentReports)
    : `<tr><td colspan="5">${emptyMessage}</td></tr>`;

  const categoryHeading = role === "admin"
    ? "Campus reports by category"
    : role === "maintenance"
    ? "Assigned tasks by category"
    : "Your reports by category";

  return `${heading(config.greeting, config.subtitle, config.action)}

    <div class="stat-grid">
      ${statCard(
        config.totalLabel,
        stats.total,
        "▤",
        "green",
        config.totalDescription
      )}
      ${statCard("Pending", stats.pending, "◷", "amber", "Awaiting action")}
      ${statCard("In progress", stats.progress, "↻", "blue", "Being addressed")}
      ${statCard(
        role === "maintenance" ? "Completed" : "Resolved",
        stats.resolved,
        "✓",
        "purple",
        `${resolvedRate}% of visible reports`
      )}
    </div>

    <div class="dashboard-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">${config.title}</h2>
            <p class="panel-subtitle">${config.chartTitle}</p>
          </div>
          <select id="dashboardRange" class="select-small"
            aria-label="Chart time range">
            <option>Last 6 months</option>
            <option>Last 30 days</option>
            <option>This year</option>
          </select>
        </div>
        <div class="panel-body">
          <div class="chart-area">
            <canvas id="dashboardChart" role="img"
              aria-label="Chart of reports visible to your role"></canvas>
          </div>
          <div class="chart-legend">
            <span class="legend-item">
              <i class="legend-dot" style="background:#347b49"></i>
              Reports received
            </span>
            <span class="legend-item">
              <i class="legend-dot" style="background:#b8d9b8"></i>
              Issues resolved
            </span>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">${categoryHeading}</h2>
            <p class="panel-subtitle">Category breakdown</p>
          </div>
          ${role === "admin"
            ? `<button class="text-button" data-page="analytics">View all ↗</button>`
            : ""}
        </div>
        <div class="panel-body">
          <div class="category-list">
            ${categoriesHTML}
          </div>
        </div>
      </section>
    </div>

    <section class="panel table-panel">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">${config.tableTitle}</h2>
          <p class="panel-subtitle">${config.tableSubtitle}</p>
        </div>
        <button class="text-button" data-page="issues">
          ${role === "admin" ? "View all reports ↗" : "View details ↗"}
        </button>
      </div>
      <div class="table-wrap">
        <table class="report-table">
          <thead>
            <tr>
              <th>Issue</th>
              <th>Location</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>${tableRows || ""}</tbody>
        </table>
      </div>
      <div class="table-footer">
        <span>Showing ${Math.min(5, visibleReports.length)} of ${visibleReports.length} reports</span>
        <button class="text-button" data-page="issues">
          ${role === "admin" ? "Open issue tracker →" : "View my issues →"}
        </button>
      </div>
    </section>

    <div class="bottom-grid">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Recent activity</h2>
            <p class="panel-subtitle">Latest updates for your role</p>
          </div>
        </div>
        <div class="panel-body">
          <div class="activity-list">
            ${activity.map(r => {
              const info = categoryInfo[r.category] || categoryInfo.Resources;
              return `
                <div class="activity-item">
                  <span class="activity-dot"
                    style="background:${info.color};color:${info.text}">
                    ${info.icon}
                  </span>
                  <div class="activity-copy">
                    <p><strong>${escapeHTML(r.title)}</strong>
                      · status is ${escapeHTML(String(r.status || "").toLowerCase())}.</p>
                    <time>${relativeTime(r.updatedAt)}</time>
                  </div>
                </div>`;
            }).join("") || `<p class="panel-subtitle">${emptyMessage}</p>`}
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">This week's green tip</h2>
            <p class="panel-subtitle">A small action can make a big difference</p>
          </div>
        </div>
        <div class="panel-body">
          <div class="initiative-card">
            <div class="initiative-illustration">🌿</div>
            <div>
              <h3>Make every drop count</h3>
              <p>Report leaking taps and turn off water while it isn't needed. Small habits help reduce waste.</p>
              <button class="text-button" data-page="initiatives">
                Explore green initiatives →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>`;
}



function renderReportPage() {
  const cats = Object.keys(categoryInfo);
  return `${heading("Report an issue","Help us keep our campus clean, safe, and sustainable.")}
    <div class="form-layout">
      <section class="panel form-panel">
        <h2 class="form-section-title">Tell us what's happening</h2><p class="form-section-desc">Share a few details so the right team can take action.</p>
        <form id="issueForm" novalidate>
          <div class="field full" id="categoryField"><span class="field-label">Issue category <span class="required">*</span></span><div class="category-picker">${cats.map(c=>`<button class="category-choice ${state.selectedCategory===c?"selected":""}" type="button" data-category="${c}" aria-pressed="${state.selectedCategory===c}"><span class="cat-emoji">${categoryInfo[c].icon}</span><span>${c==="Resources"?"Resource use":c}</span></button>`).join("")}</div><span class="field-error">Please select a category.</span></div>
          <div class="form-grid" style="margin-top:18px">
            <div class="field full" id="titleField"><label for="issueTitle">Issue title <span class="required">*</span></label><input id="issueTitle" name="title" maxlength="90" placeholder="e.g. Water leaking near the library" required><span class="field-error">Enter a short title for this issue.</span></div>
            <div class="field" id="locationField"><label for="issueLocation">Campus location <span class="required">*</span></label><input id="issueLocation" name="location" maxlength="100" placeholder="e.g. Block B, first floor" required><span class="field-error">Please enter the location.</span></div>
            <div class="field" id="priorityField"><label for="issuePriority">Priority</label><select id="issuePriority" name="priority"><option>Low</option><option selected>Medium</option><option>High</option></select><span class="field-help">Choose High only when prompt attention is needed.</span></div>
            <div class="field full" id="descriptionField"><label for="issueDescription">Description <span class="required">*</span></label><textarea id="issueDescription" name="description" maxlength="1000" placeholder="Describe what you noticed and why it needs attention..." required></textarea><span class="field-help"><span id="descriptionCount">0</span>/1000 characters</span><span class="field-error">Please add a short description (at least 10 characters).</span></div>
            <div class="field full"><span class="field-label">Add a photo <span style="font-weight:400;color:#98a198">(optional)</span></span><label class="upload-zone" id="uploadZone" for="issuePhoto"><span class="upload-icon">⇧</span><strong>Choose a photo or drag it here</strong><small>PNG, JPG or WEBP · Up to 5 MB</small><input id="issuePhoto" type="file" accept="image/png,image/jpeg,image/webp"></label><div id="photoPreview"></div></div>
          </div>
          <div class="form-actions"><button type="button" class="btn btn-outline btn-sm" id="cancelReport">Cancel</button><button type="submit" class="btn btn-primary btn-sm">Submit report <span>→</span></button></div>
        </form>
      </section>
      <aside class="panel form-side-card">
        <h2 class="panel-title">What happens next?</h2><p class="panel-subtitle">Your report helps the right people take action.</p>
        <div class="steps-list">
          <div class="step-item"><span class="step-number">1</span><div><strong>We receive your report</strong><p>Your issue is added to the campus tracker with a unique reference ID.</p></div></div>
          <div class="step-item"><span class="step-number">2</span><div><strong>The team reviews it</strong><p>The maintenance team checks the details and sets the next action.</p></div></div>
          <div class="step-item"><span class="step-number">3</span><div><strong>You can track progress</strong><p>Check the issue tracker for status changes and resolution notes.</p></div></div>
        </div>
        <div class="privacy-note"><strong>♧ Helpful tip</strong><br>Choose a clear location and describe what you observed. Please don't include private or sensitive information in your report.</div>
      </aside>
    </div>`;
}
function filteredReports() {
  const query = state.search.trim().toLowerCase();
  return state.reports.filter(r => {
    const matchesQuery = !query || [r.id,r.title,r.location,r.description,r.category].some(v=>String(v).toLowerCase().includes(query));
    return matchesQuery && (state.statusFilter==="All statuses"||r.status===state.statusFilter) && (state.categoryFilter==="All categories"||r.category===state.categoryFilter) && (state.priorityFilter==="All priorities"||r.priority===state.priorityFilter);
  }).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
}
function renderIssuesPage() {
  const canManage = ["maintenance", "admin"].includes(state.role);
  const reports = filteredReports();
  const s = reportStats();
  return `${heading("Issue tracker","Search, filter, and follow the progress of campus reports.",state.role==="student"?`<button class="btn btn-primary btn-sm" data-page="report">＋ Report an issue</button>`:`<span class="status-badge status-assigned">${s.pending} awaiting action</span>`)}
    <div class="stat-grid" style="margin-bottom:18px">
      ${statCard("All reports",s.total,"▤","green","Across all categories")}
      ${statCard("Awaiting action",s.pending,"◷","amber","Reported or assigned")}
      ${statCard("In progress",s.progress,"↻","blue","Currently being handled")}
      ${statCard("Resolved",s.resolved,"✓","purple","Completed reports")}
    </div>
    <section class="panel">
      <div class="panel-header"><div><h2 class="panel-title">All campus issues</h2><p class="panel-subtitle">${canManage?"Review reports and update their progress.":"Track your campus reports and their status."}</p></div><button id="clearFilters" class="text-button">Clear filters</button></div>
      <div class="filters-row"><label class="search-field"><span>⌕</span><input id="issueSearch" type="search" value="${escapeHTML(state.search)}" placeholder="Search reports, locations or IDs..." aria-label="Search reports"></label>
        <select id="statusFilter" class="filter-select" aria-label="Filter by status">${["All statuses","Reported","Assigned","In Progress","Resolved"].map(x=>`<option ${state.statusFilter===x?"selected":""}>${x}</option>`).join("")}</select>
        <select id="categoryFilter" class="filter-select" aria-label="Filter by category">${["All categories",...Object.keys(categoryInfo)].map(x=>`<option ${state.categoryFilter===x?"selected":""}>${x}</option>`).join("")}</select>
        <select id="priorityFilter" class="filter-select" aria-label="Filter by priority">${["All priorities","High","Medium","Low"].map(x=>`<option ${state.priorityFilter===x?"selected":""}>${x}</option>`).join("")}</select>
      </div>
      <div id="issueResults" class="panel-body"><div class="issue-cards">${reports.map(r=>renderIssueCard(r,canManage)).join("")}</div>${reports.length?`<div class="table-footer"><span>Showing ${reports.length} report${reports.length===1?"":"s"}</span><span>Updated from demo data</span></div>`:`<div class="empty-state"><div class="empty-icon">⌕</div><h3>No reports found</h3><p>Try changing your search or filters.</p><button class="btn btn-outline btn-sm" data-action="clear-filters">Clear filters</button></div>`}</div>
    </section>`;
}
function renderIssueCard(r, canManage) {
  return `<article class="issue-card"><div class="issue-card-top">${categoryIcon(r.category)}<div class="issue-card-heading"><h3>${escapeHTML(r.title)}</h3><p>${escapeHTML(r.id)} · ${formatDate(r.createdAt)}</p></div>${statusBadge(r.status)}</div><p class="issue-card-desc">${escapeHTML(r.description)}</p><div class="issue-card-meta"><span>⌖ ${escapeHTML(r.location)}</span><span class="${priorityClass(r.priority)}">● ${escapeHTML(r.priority)} priority</span><span class="issue-card-actions"><button class="text-button" data-action="view-issue" data-id="${escapeHTML(r.id)}">Details ↗</button></span></div>${canManage?`<div style="margin-top:12px;display:flex;gap:8px;align-items:center"><select class="filter-select status-edit" data-id="${escapeHTML(r.id)}" aria-label="Change status for ${escapeHTML(r.title)}" style="flex:1">${["Reported","Assigned","In Progress","Resolved"].map(s=>`<option ${r.status===s?"selected":""}>${s}</option>`).join("")}</select><button class="btn btn-outline btn-sm" data-action="save-status" data-id="${escapeHTML(r.id)}">Update</button></div>`:""}</article>`;
}
function renderAnalyticsPage() {
  const s = reportStats();
  const resolvedRate = s.total ? Math.round(s.resolved/s.total*100):0;
  const cats = Object.keys(categoryInfo).map(c=>({c,n:state.reports.filter(r=>r.category===c).length})).sort((a,b)=>b.n-a.n);
  return `${heading("Sustainability analytics","Understand reported issues and monitor progress across campus.",`<select id="analyticsRange" class="filter-select" aria-label="Analytics period"><option ${state.analyticsRange==="Last 30 days"?"selected":""}>Last 30 days</option><option ${state.analyticsRange==="Last 6 months"?"selected":""}>Last 6 months</option><option ${state.analyticsRange==="This year"?"selected":""}>This year</option></select><button class="btn btn-outline btn-sm" data-action="export-report">↓ Export summary</button>`)}
    <div class="metric-cards">
      <div class="metric-card"><span>Resolution rate</span><strong>${resolvedRate}%</strong><small>Based on current demo reports</small></div>
      <div class="metric-card"><span>Open issues</span><strong>${s.pending+s.progress}</strong><small>Reported, assigned, or in progress</small></div>
      <div class="metric-card"><span>Most reported category</span><strong style="font-size:20px">${cats[0]?.c||"—"}</strong><small>${cats[0]?.n||0} reports in this category</small></div>
    </div>
    <div class="analytics-grid">
      <section class="panel"><div class="panel-header"><div><h2 class="panel-title">Report and resolution trends</h2><p class="panel-subtitle">Illustrative monthly trend based on demo data</p></div></div><div class="panel-body"><div class="chart-area chart-large"><canvas id="analyticsChart" role="img" aria-label="Line chart showing sample report and resolution trends"></canvas></div><div class="chart-legend"><span class="legend-item"><i class="legend-dot" style="background:#347b49"></i>Reports received</span><span class="legend-item"><i class="legend-dot" style="background:#b8d9b8"></i>Resolved</span></div></div></section>
      <section class="panel"><div class="panel-header"><div><h2 class="panel-title">Issues by category</h2><p class="panel-subtitle">Number of current reports</p></div></div><div class="panel-body"><div class="bar-chart">${cats.map(({c,n})=>`<div class="bar-row"><label>${c==="Resources"?"Resource use":c}</label><div class="progress-track"><div class="progress-fill" style="width:${state.reports.length?Math.max(n/state.reports.length*100,n?5:0):0}%;background:${categoryInfo[c].text}"></div></div><strong>${n}</strong></div>`).join("")}</div></div></section>
    </div>
    <section class="panel"><div class="panel-header"><div><h2 class="panel-title">Sustainability indicators</h2><p class="panel-subtitle">Demonstration metrics — replace with measured campus data for real reporting.</p></div></div><div class="panel-body"><div class="metric-cards" style="margin:0"><div class="metric-card"><span>Waste segregation reports</span><strong>${state.reports.filter(r=>r.category==="Waste").length}</strong><small>Issue reports, not kilograms of waste</small></div><div class="metric-card"><span>Water-related reports</span><strong>${state.reports.filter(r=>r.category==="Water").length}</strong><small>Issue reports, not litres saved</small></div><div class="metric-card"><span>Energy-related reports</span><strong>${state.reports.filter(r=>r.category==="Energy").length}</strong><small>Issue reports, not kWh saved</small></div></div></div></section>`;
}
const campaigns = [
  {id:"plastic",emoji:"♻",tag:"WASTE REDUCTION",title:"Choose reusables",desc:"Bring a reusable bottle and bag to reduce single-use plastic around campus.",goal:80,joined:false},
  {id:"water",emoji:"💧",tag:"WATER CONSERVATION",title:"Make every drop count",desc:"Notice a leaking tap? Report it, and turn off water whenever it isn't needed.",goal:65,joined:false},
  {id:"energy",emoji:"☀",tag:"ENERGY SAVING",title:"Switch off to save",desc:"Switch off lights, fans, and screens when rooms are empty.",goal:72,joined:false},
  {id:"travel",emoji:"🚲",tag:"GREENER TRAVEL",title:"Try a greener commute",desc:"Walk, cycle, carpool, or use shared transport whenever practical.",goal:54,joined:false},
  {id:"paper",emoji:"🌱",tag:"RESOURCE USE",title:"Give paper another life",desc:"Use digital notes when possible and reuse one-sided sheets for drafts.",goal:61,joined:false},
  {id:"campus",emoji:"🌿",tag:"CAMPUS CARE",title:"Keep our campus clean",desc:"Use the right waste bin and help keep shared spaces clean for everyone.",goal:88,joined:false}
];
let joinedCampaigns = loadStored("gc-campaigns", []);
function renderInitiativesPage() {
  return `${heading("Green initiatives","Discover small actions that add up to a healthier campus.",`<span class="status-badge status-resolved">${joinedCampaigns.length} joined</span>`)}
    <div class="initiative-grid">${campaigns.map(c=>{const joined=joinedCampaigns.includes(c.id);return `<article class="campaign-card"><div class="campaign-art">${c.emoji}</div><div class="campaign-body"><span class="campaign-tag">${c.tag}</span><h3>${c.title}</h3><p>${c.desc}</p><div class="campaign-progress"><div class="progress-track"><div class="progress-fill" style="width:${c.goal}%"></div></div></div><div class="campaign-foot"><span>Community participation</span><strong>${c.goal}%</strong></div><button class="btn ${joined?"btn-secondary":"btn-primary"} btn-sm" data-action="join-campaign" data-id="${c.id}">${joined?"✓ Joined":"Join initiative"}</button></div></article>`;}).join("")}</div>
    <section class="panel" style="margin-top:18px"><div class="panel-header"><div><h2 class="panel-title">Quick sustainability tips</h2><p class="panel-subtitle">Simple habits for everyday campus life</p></div></div><div class="panel-body"><div class="category-list"><div class="category-row"><span class="category-icon" style="background:#e7f1ff;color:#3976b4">💧</span><div><div class="category-name">Save water</div><div class="panel-subtitle">Report leaks promptly and avoid unnecessary water use.</div></div></div><div class="category-row"><span class="category-icon" style="background:#fff1d8;color:#ac781e">ϟ</span><div><div class="category-name">Save energy</div><div class="panel-subtitle">Switch off lights and equipment in unused rooms.</div></div></div><div class="category-row"><span class="category-icon" style="background:#e6f3e7;color:#347747">♻</span><div><div class="category-name">Sort your waste</div><div class="panel-subtitle">Use clearly labelled bins and reuse materials where possible.</div></div></div></div></div></section>`;
}
function renderSettingsPage() {
  return `${heading("Settings & help","Manage your demo experience and learn how to use GreenCampus.")}
    <div class="settings-layout">
      <section class="panel settings-nav" aria-label="Settings sections"><button class="${state.settingsSection==="preferences"?"active":""}" data-settings-section="preferences">⚙ Preferences</button><button class="${state.settingsSection==="account"?"active":""}" data-settings-section="account">◉ Demo role</button><button class="${state.settingsSection==="help"?"active":""}" data-settings-section="help">? Help & guidance</button><button class="${state.settingsSection==="data"?"active":""}" data-settings-section="data">↻ Demo data</button></section>
      <section class="panel settings-content">${renderSettingsSection()}</section>
    </div>`;
}
function renderSettingsSection() {
  if(state.settingsSection==="account") return `<h2 class="panel-title">Demo role</h2><p class="panel-subtitle">Switch between user roles to explore different workflows.</p><div class="settings-row"><div><strong>Current role</strong><p>${roleName()}</p></div><button class="btn btn-outline btn-sm" data-action="switch-role">Switch role</button></div><div class="help-card"><h3>About role-based views</h3><p>Each role sees a tailored set of dashboard information and actions. This is a frontend demonstration, not real authentication or access control.</p></div>`;
  if(state.settingsSection==="help") return `<h2 class="panel-title">Help & guidance</h2><p class="panel-subtitle">A quick guide to the main GreenCampus workflows.</p><div class="steps-list"><div class="step-item"><span class="step-number">1</span><div><strong>Report an issue</strong><p>Choose a category, enter a title, campus location, and description, then submit.</p></div></div><div class="step-item"><span class="step-number">2</span><div><strong>Track progress</strong><p>Open Issue Tracker and use the search and filters to find a report.</p></div></div><div class="step-item"><span class="step-number">3</span><div><strong>Manage a report</strong><p>Switch to the Maintenance Team role to update statuses and add resolution notes.</p></div></div><div class="step-item"><span class="step-number">4</span><div><strong>Explore analytics</strong><p>Charts use the current demo report records. Environmental measurements are illustrative unless entered from real data.</p></div></div></div>`;
  if(state.settingsSection==="data") return `<h2 class="panel-title">Demo data</h2><p class="panel-subtitle">Your sample reports are saved in this browser.</p><div class="settings-row"><div><strong>Current reports</strong><p>${state.reports.length} report records saved locally.</p></div><button class="btn btn-outline btn-sm" data-action="export-report">Export summary</button></div><div class="settings-row"><div><strong>Reset demo data</strong><p>Restore the original sample reports and notifications. This removes reports you've added in this browser.</p></div><button class="btn btn-danger btn-sm" data-action="reset-data">Reset data</button></div>`;
  return `<h2 class="panel-title">Preferences</h2><p class="panel-subtitle">Adjust the appearance of your GreenCampus demo.</p><div class="settings-row"><div><strong>Dark appearance</strong><p>Use a darker color scheme for the interface.</p></div><button class="toggle" id="darkToggle" role="switch" aria-checked="${state.dark}" aria-label="Toggle dark appearance"><span></span></button></div><div class="settings-row"><div><strong>Current demo role</strong><p>${roleName()}</p></div><button class="btn btn-outline btn-sm" data-action="switch-role">Change role</button></div><div class="settings-row"><div><strong>Responsive layout</strong><p>The interface adapts to desktop, tablet, and mobile screen sizes.</p></div><span class="status-badge status-resolved">Enabled</span></div><div class="help-card"><h3>Designed around people</h3><p>GreenCampus uses clear navigation, visible system status, helpful feedback, and error prevention to make common tasks easier to complete.</p></div>`;
}
function bindPageEvents() {
  $$("#pageContent [data-page]").forEach(btn=>btn.addEventListener("click",()=>switchPage(btn.dataset.page)));
  $$("#pageContent [data-action]").forEach(btn=>btn.addEventListener("click",()=>handleAction(btn.dataset.action,btn.dataset.id)));
  $$("#pageContent [data-settings-section]").forEach(btn=>btn.addEventListener("click",()=>{state.settingsSection=btn.dataset.settingsSection;renderApp();}));
  if($("#issueForm")) bindReportForm();
  if($("#issueSearch")) {
    $("#issueSearch").addEventListener("input",e=>{state.search=e.target.value;updateIssueResults();});
    $("#statusFilter").addEventListener("change",e=>{state.statusFilter=e.target.value;updateIssueResults();});
    $("#categoryFilter").addEventListener("change",e=>{state.categoryFilter=e.target.value;updateIssueResults();});
    $("#priorityFilter").addEventListener("change",e=>{state.priorityFilter=e.target.value;updateIssueResults();});
    $("#clearFilters").addEventListener("click",clearFilters);
  }
  if($("#analyticsRange")) $("#analyticsRange").addEventListener("change",e=>{state.analyticsRange=e.target.value;drawAnalyticsChart();toast("Chart updated",`Showing ${state.analyticsRange.toLowerCase()} sample trend.`);});
  if($("#dashboardRange")) $("#dashboardRange").addEventListener("change",()=>drawDashboardChart());
  if($("#darkToggle")) $("#darkToggle").addEventListener("click",toggleDark);
  $$(".status-edit").forEach(select=>select.addEventListener("change",()=>{select.dataset.pending=select.value;}));
}
function updateIssueResults() {
  const root=$("#issueResults");if(!root)return;
  const reports = filteredReports();
const canManage = ["maintenance", "admin"].includes(state.role);
  root.innerHTML=`${reports.length?`<div class="issue-cards">${reports.map(r=>renderIssueCard(r,canManage)).join("")}</div><div class="table-footer"><span>Showing ${reports.length} report${reports.length===1?"":"s"}</span><span>Updated from demo data</span></div>`:`<div class="empty-state"><div class="empty-icon">⌕</div><h3>No reports found</h3><p>Try changing your search or filters.</p><button class="btn btn-outline btn-sm" data-action="clear-filters">Clear filters</button></div>`}`;
  $$("#issueResults [data-action]").forEach(btn=>btn.addEventListener("click",()=>handleAction(btn.dataset.action,btn.dataset.id)));
  $$("#issueResults .status-edit").forEach(select=>select.addEventListener("change",()=>{select.dataset.pending=select.value;}));
}
function clearFilters() {
  state.search="";state.statusFilter="All statuses";state.categoryFilter="All categories";state.priorityFilter="All priorities";
  renderApp();
}
function bindReportForm() {
  $$("#pageContent [data-category]").forEach(btn=>btn.addEventListener("click",()=>{
    state.selectedCategory=btn.dataset.category;
    $$("#pageContent [data-category]").forEach(b=>{b.classList.toggle("selected",b===btn);b.setAttribute("aria-pressed",String(b===btn));});
    $("#categoryField").classList.remove("invalid");
  }));
  $("#issueDescription").addEventListener("input",e=>$("#descriptionCount").textContent=e.target.value.length);
  $("#issuePhoto").addEventListener("change",e=>handlePhoto(e.target.files[0]));
  $("#uploadZone").addEventListener("dragover",e=>{e.preventDefault();$("#uploadZone").classList.add("dragover");});
  $("#uploadZone").addEventListener("dragleave",()=>$("#uploadZone").classList.remove("dragover"));
  $("#uploadZone").addEventListener("drop",e=>{e.preventDefault();$("#uploadZone").classList.remove("dragover");handlePhoto(e.dataTransfer.files[0]);});
  $("#cancelReport").addEventListener("click",()=>switchPage("dashboard"));
  $("#issueForm").addEventListener("submit",submitReport);
}
function handlePhoto(file) {
  state.uploadedFile=null;
  $("#photoPreview").innerHTML="";
  if(!file){return;}
  if(!["image/png","image/jpeg","image/webp"].includes(file.type)){toast("Unsupported file","Choose a PNG, JPG, or WEBP image.","error");$("#issuePhoto").value="";return;}
  if(file.size>5*1024*1024){toast("Image is too large","Choose an image smaller than 5 MB.","error");$("#issuePhoto").value="";return;}
  state.uploadedFile=file;
  $("#photoPreview").innerHTML=`<div class="photo-preview"><span>▧ ${escapeHTML(file.name)} · ${(file.size/1024).toFixed(0)} KB</span><button type="button" class="text-button" id="removePhoto">Remove</button></div>`;
  $("#removePhoto").addEventListener("click",()=>{state.uploadedFile=null;$("#issuePhoto").value="";$("#photoPreview").innerHTML="";});
}


async function submitReport(event) {
  event.preventDefault();

  const title = $("#issueTitle").value.trim();
  const location = $("#issueLocation").value.trim();
  const description = $("#issueDescription").value.trim();

  let valid = true;

  const checks = [
    ["titleField", title.length > 0],
    ["locationField", location.length > 0],
    ["descriptionField", description.length >= 10]
  ];

  checks.forEach(([id, ok]) => {
    const el = $("#" + id);
    el.classList.toggle("invalid", !ok);
    if (!ok) valid = false;
  });

  if (!state.selectedCategory) {
    $("#categoryField").classList.add("invalid");
    valid = false;
  } else {
    $("#categoryField").classList.remove("invalid");
  }

  if (!valid) {
    const first = $(".field.invalid");
    first?.scrollIntoView({ behavior: "smooth", block: "center" });
    toast(
      "Please check the form",
      "Complete the highlighted fields before submitting.",
      "error"
    );
    return;
  }

  const submitButton = $('#issueForm button[type="submit"]');

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Submitting…";
  }

  try {
    const result = await apiRequest("/api/reports", {
      method: "POST",
      body: JSON.stringify({
        title,
        category: state.selectedCategory,
        location,
        description,
        priority: $("#issuePriority").value
      })
    });

    // Fetch the report saved by the backend.
    const loaded = await loadReportsFromApi();

    const report =
      state.reports.find(
        r => String(r.apiId) === String(result.id)
      ) ||
      state.reports.find(
        r => String(r.reportCode) === String(result.report_code)
      ) ||
      {
        id: result.report_code || `GC-${result.id}`,
        apiId: Number(result.id),
        title,
        category: state.selectedCategory,
        location,
        description,
        priority: $("#issuePriority").value,
        status: "Reported",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

    state.uploadedFile = null;

    showSubmissionSuccess(report);

    toast(
      "Issue submitted",
      loaded
        ? "Your report is saved and available for Admin review."
        : "Your report was saved, but the report list could not refresh."
    );
  } catch (error) {
    toast("Submission failed", error.message, "error");
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Submit report";
    }
  }
}


function showSubmissionSuccess(report) {
  $("#modalRoot").innerHTML=`<div class="modal-backdrop" role="presentation"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="successTitle"><div class="modal-body"><div class="confirmation-icon">✓</div><h2 id="successTitle" style="font-size:20px;margin:0 0 8px">Report submitted!</h2><p class="confirm-copy">Thank you for helping improve our campus. Your report has been added to the demo issue tracker.</p><div class="success-panel"><strong>${escapeHTML(report.id)} · ${escapeHTML(report.title)}</strong><p>${escapeHTML(report.category)} · ${escapeHTML(report.location)}<br>Status: Reported</p></div></div><div class="modal-footer"><button class="btn btn-outline btn-sm" id="successClose">Close</button><button class="btn btn-primary btn-sm" id="trackNewReport">Track this report →</button></div></section></div>`;
  $("#successClose").addEventListener("click",()=>{$("#modalRoot").innerHTML="";switchPage("dashboard");});
  $("#trackNewReport").addEventListener("click",()=>{$("#modalRoot").innerHTML="";state.search=report.id;state.statusFilter="All statuses";state.categoryFilter="All categories";state.priorityFilter="All priorities";switchPage("issues");});
  $("#trackNewReport").focus();
}
function handleAction(action,id) {
  if(action==="view-issue"){showIssueDetails(id);return;}
  if(action==="clear-filters"){clearFilters();return;}
  if(action==="save-status"){saveIssueStatus(id);return;}
  if(action==="switch-role"){showRoleSwitcher();return;}
  if(action==="join-campaign"){toggleCampaign(id);return;}
  if(action==="export-report"){exportSummary();return;}
  if(action==="reset-data"){confirmReset();return;}
}


async function showIssueDetails(id) {
  const r = state.reports.find(x => String(x.id) === String(id));
  if (!r) return;

  const isAdmin = state.role === "admin";
  const canManage = ["admin", "maintenance"].includes(state.role);

  let maintenanceTeam = [];

if (isAdmin) {
  try {
    const data = await apiRequest("/api/maintenance-team");
    maintenanceTeam = data.team || [];
  } catch (error) {
    toast("Maintenance team unavailable", error.message, "error");
  }
}

  const reporterName =
    r.reporter_name || r.reporterName || r.reporter || "Campus user";

  const reporterEmail =
    r.reporter_email || r.reporterEmail || "";

  const reporterPhone =
    r.reporter_phone || r.reporterPhone || "";

  const reporterRole =
    r.reporter_role || r.reporterRole || "";

  const reporterCampusId =
    r.reporter_campus_id || r.reporterCampusId || "";

  const reportedBySection = isAdmin
    ? `
      <div class="detail-field">
        <small>REPORTED BY</small>
        <strong>${escapeHTML(reporterName)}</strong>
      </div>
      <div class="detail-field">
        <small>REPORTER ROLE</small>
        <strong>${escapeHTML(reporterRole || "Not available")}</strong>
      </div>
      <div class="detail-field">
        <small>CAMPUS ID</small>
        <strong>${escapeHTML(reporterCampusId || "Not available")}</strong>
      </div>
      <div class="detail-field">
        <small>EMAIL</small>
        <strong>${escapeHTML(reporterEmail || "Not available")}</strong>
      </div>
      <div class="detail-field">
        <small>PHONE</small>
        <strong>${escapeHTML(reporterPhone || "Not available")}</strong>
      </div>
    `
    : `
      <div class="detail-field">
        <small>REPORTED BY</small>
        <strong>Campus user</strong>
      </div>
    `;

  $("#modalRoot").innerHTML = `
    <div class="modal-backdrop" role="presentation">
      <section class="modal" role="dialog" aria-modal="true"
        aria-labelledby="issueModalTitle">

        <div class="modal-header">
          <div>
            <h2 id="issueModalTitle">${escapeHTML(r.title)}</h2>
            <p>${escapeHTML(r.report_code || r.reportCode || r.id)}
              · Reported ${formatDate(r.createdAt || r.created_at)}</p>
          </div>
          <button class="icon-button" data-close-modal
            aria-label="Close details">×</button>
        </div>

        <div class="modal-body">
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px">
            ${statusBadge(r.status)}
            <span class="priority-badge ${priorityClass(r.priority)}">
              ${escapeHTML(r.priority)} priority
            </span>
          </div>

          <div class="detail-grid">
            <div class="detail-field">
              <small>CATEGORY</small>
              <strong>${escapeHTML(r.category)}</strong>
            </div>

            <div class="detail-field">
              <small>LOCATION</small>
              <strong>${escapeHTML(r.location)}</strong>
            </div>

            ${reportedBySection}

            <div class="detail-field">
              <small>LAST UPDATED</small>
              <strong>${formatDate(r.updatedAt || r.updated_at)}</strong>
            </div>
          </div>

          <p class="detail-description">${escapeHTML(r.description)}</p>

          ${r.photoName
            ? `<div class="privacy-note">Attached image: ${escapeHTML(r.photoName)} (filename only in this demo).</div>`
            : ""}

          <h3 class="panel-title">Activity history</h3>

          <div class="history-list">
            <div class="history-item">
              <strong>${escapeHTML(r.status)}</strong>
              <p>Latest recorded status · ${formatDate(r.updatedAt || r.updated_at)}</p>
            </div>
            <div class="history-item">
              <strong>Report received</strong>
              <p>Created on ${formatDate(r.createdAt || r.created_at)}</p>
            </div>
          </div>

          ${r.resolutionNotes || r.resolution_notes
            ? `<div class="success-panel">
                <strong>Resolution / team notes</strong>
                <p>${escapeHTML(r.resolutionNotes || r.resolution_notes)}</p>
              </div>`
            : ""}
            ${isAdmin ? `
  <div class="field" style="margin-top:18px">
    <label for="assignMaintenance">Assign to maintenance team</label>

    <select id="assignMaintenance">
      <option value="">Select a maintenance team member</option>

      ${maintenanceTeam.map(person => `
        <option
          value="${person.id}"
          ${Number(r.assignedToId) === Number(person.id) ? "selected" : ""}
        >
          ${escapeHTML(person.full_name)}
          (${escapeHTML(person.campus_id || person.email)})
        </option>
      `).join("")}
    </select>

    <p class="panel-subtitle">
      Current assignee:
      ${escapeHTML(r.assignedToName || "Not assigned")}
    </p>

    <button
      type="button"
      class="btn btn-primary btn-sm"
      id="assignReportButton"
      style="margin-top:10px"
      ${maintenanceTeam.length ? "" : "disabled"}
    >
      Assign report
    </button>
  </div>
` : ""}

          ${canManage ? `
            <div class="field" style="margin-top:18px">
              <label for="modalStatus">Update status</label>
              <select id="modalStatus">
                ${["Reported", "Assigned", "In Progress", "Resolved"]
                  .map(s => `<option ${r.status === s ? "selected" : ""}>${s}</option>`)
                  .join("")}
              </select>
            </div>

            <div class="field" style="margin-top:13px">
              <label for="resolutionNotes">Team notes</label>
              <textarea id="resolutionNotes"
                placeholder="Add assignment or resolution notes...">${escapeHTML(r.resolutionNotes || r.resolution_notes || "")}</textarea>
            </div>
          ` : ""}
        </div>

        <div class="modal-footer">
          <button class="btn btn-outline btn-sm" data-close-modal>Close</button>
          ${canManage
            ? `<button class="btn btn-primary btn-sm" id="saveModalIssue"
                data-id="${escapeHTML(r.id)}">Save changes</button>`
            : ""}
        </div>
      </section>
    </div>`;

  $$("[data-close-modal]").forEach(b =>
    b.addEventListener("click", () => {
      $("#modalRoot").innerHTML = "";
    })
  );

  if ($("#saveModalIssue")) {
    $("#saveModalIssue").addEventListener("click", () => {
      const report = state.reports.find(
        x => String(x.id) === String(id)
      );

      if ($("#assignReportButton")) {
  $("#assignReportButton").addEventListener("click", async () => {
    const selectedStaffId = Number($("#assignMaintenance").value);

    if (!selectedStaffId) {
      toast(
        "Select a team member",
        "Choose a maintenance team member before assigning.",
        "error"
      );
      return;
    }

    if (!r.apiId) {
      toast(
        "Report not saved in database",
        "This sample report cannot be assigned. Refresh the database reports first.",
        "error"
      );
      return;
    }

    const button = $("#assignReportButton");
    button.disabled = true;
    button.textContent = "Assigning…";

    try {
      const result = await apiRequest(
        `/api/reports/${r.apiId}/assign`,
        {
          method: "POST",
          body: JSON.stringify({
            assigned_to: selectedStaffId
          })
        }
      );

      await loadReportsFromApi();

      $("#modalRoot").innerHTML = "";
      renderApp();

      toast(
        "Report assigned successfully",
        `${result.assigned_to_name} has been assigned this issue.`
      );
    } catch (error) {
      button.disabled = false;
      button.textContent = "Assign report";

      toast("Assignment failed", error.message, "error");
    }
  });
}

      if (!report) return;

      const newStatus = $("#modalStatus").value;
      const notes = $("#resolutionNotes").value.trim();

      updateReport(report, newStatus, notes);
      $("#modalRoot").innerHTML = "";
      renderApp();
      toast("Issue updated", `${report.id} is now ${report.status}.`);
    });
  }

  $(".modal-backdrop").addEventListener("click", e => {
    if (e.target.classList.contains("modal-backdrop")) {
      $("#modalRoot").innerHTML = "";
    }
  });
}

function saveIssueStatus(id) {
  const select=$$(`.status-edit[data-id="${CSS.escape(id)}"]`).find(el=>el.dataset.pending);
  if(!select){toast("No changes made","Choose a different status before updating.","error");return;}
  const report=state.reports.find(r=>r.id===id);if(!report)return;
  if(report.status===select.dataset.pending){toast("No changes made","This report already has that status.","error");return;}
  updateReport(report,select.dataset.pending,report.resolutionNotes);
  renderApp();toast("Issue updated",`${report.id} is now ${report.status}.`);
}
function updateReport(report,status,notes) {
  const changed=report.status!==status;
  report.status=status;report.resolutionNotes=notes;report.updatedAt=new Date().toISOString();
  if(changed)state.notifications.unshift({title:"Issue status updated",text:`${report.title} is now ${status}.`,time:"Just now",read:false,icon:"↻",reportId:report.id});
  saveState();
}

async function logoutUser() {
  const button = $("#logoutButton");

  if (button) {
    button.disabled = true;
    button.textContent = "Logging out…";
  }

  try {
    // The backend should invalidate the session and clear its cookie.
    await apiRequest("/api/auth/logout", {
      method: "POST"
    });
  } catch (err) {
    console.error("Server logout failed:", err.message);
  } finally {
    $("#modalRoot").innerHTML = "";

    state.profile = null;
    state.role = "student";
    state.page = "dashboard";

    showLogin();
  }
}

function showProfileMenu() {
  const profile = state.profile;

  if (!profile) {
    toast("Profile unavailable", "Please log in again.", "error");
    return;
  }

  $("#modalRoot").innerHTML = `
    <div class="modal-backdrop" role="presentation">
      <section class="modal" role="dialog"
               aria-modal="true" aria-labelledby="profileModalTitle">
        <div class="modal-header">
          <div>
            <h2 id="profileModalTitle">Your profile</h2>
            <p>Your GreenCampus account information</p>
          </div>
          <button class="icon-button" data-close-modal
                  aria-label="Close">×</button>
        </div>

        <div class="modal-body">
          <p><strong>Name:</strong> ${escapeHTML(profile.name || "")}</p>
          <p><strong>Email:</strong> ${escapeHTML(profile.email || "")}</p>
          <p><strong>Role:</strong> ${escapeHTML(roleInfo[state.role].name)}</p>
          <p><strong>Department:</strong>
            ${escapeHTML(profile.department || "Not specified")}
          </p>
        </div>

        <div class="modal-footer">
          <button class="btn btn-outline" data-close-modal>
            Close
          </button>
          <button class="btn btn-primary" id="logoutButton">
            Logout
          </button>
        </div>
      </section>
    </div>
  `;

  $$("[data-close-modal]").forEach(button => {
    button.addEventListener("click", () => {
      $("#modalRoot").innerHTML = "";
    });
  });

  $("#logoutButton").addEventListener("click", logoutUser);
}

function toggleCampaign(id) {
  if(joinedCampaigns.includes(id))joinedCampaigns=joinedCampaigns.filter(x=>x!==id);else joinedCampaigns.push(id);
  try{localStorage.setItem("gc-campaigns",JSON.stringify(joinedCampaigns));}catch{}
  renderApp();toast(joinedCampaigns.includes(id)?"You're in!":"Participation updated",joinedCampaigns.includes(id)?"You've joined this green initiative.":"You've left this initiative.");
}
function confirmReset() {
  $("#modalRoot").innerHTML=`<div class="modal-backdrop" role="presentation"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="resetTitle"><div class="modal-header"><div><h2 id="resetTitle">Reset demo data?</h2><p>This action cannot be undone.</p></div><button class="icon-button" data-close-modal aria-label="Close">×</button></div><div class="modal-body"><p class="confirm-copy">This will remove reports created during this demo and restore the original sample reports and notifications in this browser.</p></div><div class="modal-footer"><button class="btn btn-outline btn-sm" data-close-modal>Keep my data</button><button class="btn btn-danger btn-sm" id="confirmReset">Reset demo data</button></div></section></div>`;
  $$("[data-close-modal]").forEach(b=>b.addEventListener("click",()=>$("#modalRoot").innerHTML=""));
  $("#confirmReset").addEventListener("click",()=>{state.reports=structuredClone(initialReports);state.notifications=structuredClone(initialNotifications);joinedCampaigns=[];try{localStorage.removeItem("gc-campaigns");}catch{}saveState();$("#modalRoot").innerHTML="";renderApp();toast("Demo data reset","The original sample reports have been restored.");});
}
function exportSummary() {
  const rows=[["ID","Title","Category","Location","Priority","Status","Created","Updated"],...state.reports.map(r=>[r.id,r.title,r.category,r.location,r.priority,r.status,formatDate(r.createdAt),formatDate(r.updatedAt)])];
  const csv=rows.map(row=>row.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\r\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"}),url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download="greencampus-report-summary.csv";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);toast("Export ready","Your report summary has been downloaded as a CSV file.");
}
function toggleDark() {
  state.dark=!state.dark;document.body.classList.toggle("theme-dark",state.dark);saveState();
  if($("#darkToggle")){$("#darkToggle").setAttribute("aria-checked",String(state.dark));}
  toast("Appearance updated",state.dark?"Dark appearance enabled.":"Light appearance enabled.");
}

function getChartDate(value) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getDashboardChartData(range) {
  const now = new Date();
  const reports = state.reports || [];
  let labels = [];
  let reported = [];
  let resolved = [];

  if (range === "Last 30 days") {
    labels = ["W1", "W2", "W3", "W4", "W5"];
    reported = Array(5).fill(0);
    resolved = Array(5).fill(0);

    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);

    reports.forEach(report => {
      const created = getChartDate(report.createdAt);
      const updated = getChartDate(report.updatedAt);

      if (created && created >= start && created <= now) {
        const week = Math.min(
          4,
          Math.floor((created - start) / (6 * 24 * 60 * 60 * 1000))
        );
        reported[week]++;
      }

      if (
        report.status === "Resolved" &&
        updated &&
        updated >= start &&
        updated <= now
      ) {
        const week = Math.min(
          4,
          Math.floor((updated - start) / (6 * 24 * 60 * 60 * 1000))
        );
        resolved[week]++;
      }
    });

    return { labels, reported, resolved };
  }

  let months = [];

  if (range === "This year") {
    for (let month = 0; month < 12; month++) {
      months.push(new Date(now.getFullYear(), month, 1));
    }
  } else {
    for (let offset = 5; offset >= 0; offset--) {
      months.push(
        new Date(now.getFullYear(), now.getMonth() - offset, 1)
      );
    }
  }

  labels = months.map(date =>
    date.toLocaleString("en-US", { month: "short" })
  );
  reported = Array(months.length).fill(0);
  resolved = Array(months.length).fill(0);

  reports.forEach(report => {
    const created = getChartDate(report.createdAt);
    const updated = getChartDate(report.updatedAt);

    if (created) {
      const index = months.findIndex(month =>
        month.getFullYear() === created.getFullYear() &&
        month.getMonth() === created.getMonth()
      );

      if (index !== -1 && created <= now) {
        reported[index]++;
      }
    }

    if (report.status === "Resolved" && updated && updated <= now) {
      const index = months.findIndex(month =>
        month.getFullYear() === updated.getFullYear() &&
        month.getMonth() === updated.getMonth()
      );

      if (index !== -1) {
        resolved[index]++;
      }
    }
  });

  return { labels, reported, resolved };
}


function getDashboardChartData(range, reports = state.dashboardReports || state.reports) {
  const now = new Date();
  const labels = [];
  const buckets = [];

  if (range === "Last 30 days") {
    // Six 5-day periods, covering the last 30 days.
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - (i * 5 + 4));

      const end = new Date(start);
      end.setDate(end.getDate() + 5);

      labels.push(
        `${start.getDate()}-${new Date(end.getTime() - 86400000).getDate()}`
      );

      buckets.push({ start, end });
    }
  } else if (range === "This year") {
    // January through December of the current year.
    for (let month = 0; month < 12; month++) {
      const start = new Date(now.getFullYear(), month, 1);
      const end = new Date(now.getFullYear(), month + 1, 1);

      labels.push(start.toLocaleString("en", { month: "short" }));
      buckets.push({ start, end });
    }
  } else {
    // Current month and the previous five months.
    for (let i = 5; i >= 0; i--) {
      const start = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      const end = new Date(
        now.getFullYear(),
        now.getMonth() - i + 1,
        1
      );

      labels.push(start.toLocaleString("en", { month: "short" }));
      buckets.push({ start, end });
    }
  }

  const reported = buckets.map(() => 0);
  const resolved = buckets.map(() => 0);

  reports.forEach(report => {
    const createdDate = report.createdAt || report.created_at;
    const updatedDate = report.updatedAt || report.updated_at;

    const created = createdDate ? new Date(createdDate) : null;
    const updated = updatedDate ? new Date(updatedDate) : null;

    buckets.forEach((bucket, index) => {
      if (
        created &&
        !Number.isNaN(created.getTime()) &&
        created >= bucket.start &&
        created < bucket.end
      ) {
        reported[index]++;
      }

      if (
        report.status === "Resolved" &&
        updated &&
        !Number.isNaN(updated.getTime()) &&
        updated >= bucket.start &&
        updated < bucket.end
      ) {
        resolved[index]++;
      }
    });
  });

  return { labels, reported, resolved };
}



function drawDashboardChart() {
  const canvas = $("#dashboardChart");
  if (!canvas) return;

  const range = $("#dashboardRange")?.value || "Last 6 months";
  const reports = state.dashboardReports || state.reports;
  const data = getDashboardChartData(range, reports);

  drawBarChart(
    canvas,
    data.labels,
    data.reported,
    data.resolved
  );
}



function drawAnalyticsChart() {
  const canvas = $("#analyticsChart");
  if (!canvas) return;

  const reports = state.dashboardReports || state.reports;
  const data = getDashboardChartData("Last 6 months", reports);

  drawLineChart(
    canvas,
    data.labels,
    data.reported,
    data.resolved
  );
}




function prepareCanvas(canvas) {
  const rect=canvas.getBoundingClientRect(),dpr=window.devicePixelRatio||1;
  canvas.width=Math.max(1,Math.floor(rect.width*dpr));canvas.height=Math.max(1,Math.floor(rect.height*dpr));
  const ctx=canvas.getContext("2d");ctx.scale(dpr,dpr);return {ctx,w:rect.width,h:rect.height};
}
function drawBarChart(canvas,labels,a,b) {
  const {ctx,w,h}=prepareCanvas(canvas);if(!w||!h)return;
  const dark=document.body.classList.contains("theme-dark"),grid=dark?"#2b4030":"#edf1eb",text=dark?"#aab7ac":"#929d93";
  const left=28,right=8,top=12,bottom=27,chartW=w-left-right,chartH=h-top-bottom,max=Math.max(12,...a,...b),step=chartH/4;
  ctx.clearRect(0,0,w,h);ctx.font="10px Inter, sans-serif";ctx.textBaseline="middle";
  for(let i=0;i<=4;i++){const y=top+i*step;ctx.strokeStyle=grid;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(w-right,y);ctx.stroke();ctx.fillStyle=text;ctx.textAlign="right";ctx.fillText(String(Math.round(max-i*max/4)),left-8,y);}
  const group=chartW/labels.length,barW=Math.min(15,group*.23);
  labels.forEach((label,i)=>{const x=left+i*group+group/2;const h1=a[i]/max*chartH,h2=b[i]/max*chartH;ctx.fillStyle="#347b49";roundRect(ctx,x-barW-2,top+chartH-h1,barW,h1,4);ctx.fillStyle="#b8d9b8";roundRect(ctx,x+2,top+chartH-h2,barW,h2,4);ctx.fillStyle=text;ctx.textAlign="center";ctx.fillText(label,x,h-10);});
}
function drawLineChart(canvas,labels,a,b) {
  const {ctx,w,h}=prepareCanvas(canvas);if(!w||!h)return;
  const dark=document.body.classList.contains("theme-dark"),grid=dark?"#2b4030":"#edf1eb",text=dark?"#aab7ac":"#929d93";
  const left=30,right=10,top=15,bottom=27,cw=w-left-right,ch=h-top-bottom,max=Math.max(12,...a,...b);
  ctx.clearRect(0,0,w,h);ctx.font="10px Inter, sans-serif";ctx.textBaseline="middle";
  for(let i=0;i<=4;i++){const y=top+i*ch/4;ctx.strokeStyle=grid;ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(w-right,y);ctx.stroke();ctx.fillStyle=text;ctx.textAlign="right";ctx.fillText(String(Math.round(max-i*max/4)),left-8,y);}
  const xAt=i=>left+i*cw/(labels.length-1),yAt=v=>top+ch-v/max*ch;
  [[a,"#347b49"],[b,"#9ccba1"]].forEach(([values,color])=>{ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.beginPath();values.forEach((v,i)=>i?ctx.lineTo(xAt(i),yAt(v)):ctx.moveTo(xAt(i),yAt(v)));ctx.stroke();values.forEach((v,i)=>{ctx.beginPath();ctx.fillStyle=color;ctx.arc(xAt(i),yAt(v),3.5,0,Math.PI*2);ctx.fill();});});
  labels.forEach((label,i)=>{ctx.fillStyle=text;ctx.textAlign="center";ctx.fillText(label,xAt(i),h-10);});
}
function roundRect(ctx,x,y,w,h,r) {
  if(h<=0)return;const radius=Math.min(r,w/2,h/2);
  ctx.beginPath();ctx.moveTo(x+radius,y);ctx.arcTo(x+w,y,x+w,y+h,radius);ctx.arcTo(x+w,y+h,x,y+h,radius);ctx.arcTo(x,y+h,x,y,radius);ctx.arcTo(x,y,x+w,y,radius);ctx.closePath();ctx.fill();
}
function renderNotifications() {
  const unread=state.notifications.filter(n=>!n.read).length;
  $("#notificationDot").style.display=unread?"block":"none";
  $("#notificationList").innerHTML=state.notifications.length?state.notifications.slice(0,8).map(n=>`<div class="notification-item"><span class="notif-symbol">${escapeHTML(n.icon||"♧")}</span><div><strong>${escapeHTML(n.title)}</strong><p>${escapeHTML(n.text)}</p><time>${escapeHTML(n.time||"Recently")}</time>${n.reportId?`<button class="text-button" data-notif-report="${escapeHTML(n.reportId)}">View report →</button>`:""}</div></div>`).join(""):`<div class="empty-state"><h3>You're all caught up</h3><p>No notifications yet.</p></div>`;
  $$("[data-notif-report]").forEach(b=>b.addEventListener("click",()=>{$("#notificationPanel").classList.add("hidden");state.search=b.dataset.notifReport;switchPage("issues");}));
}
function init() {
    // Login and account navigation
  $("#loginForm").addEventListener("submit", handleLogin);

  $("#goToRegister").addEventListener("click", showRoleSelection);

  $("#toggleLoginPassword").addEventListener("click", () => {
    const input = $("#loginPassword");
    const button = $("#toggleLoginPassword");

    const showing = input.type === "password";
    input.type = showing ? "text" : "password";
    button.textContent = showing ? "Hide password" : "Show password";
  });

  $("#forgotPassword").addEventListener("click", () => {
    toast(
      "Password recovery",
      "Please contact your campus administrator to reset your password.",
      "error"
    );
  });
  $$(".role-card[data-role]").forEach(card=>card.addEventListener("click",()=>{$$(".role-card[data-role]").forEach(c=>c.classList.toggle("selected",c===card));state.role=card.dataset.role;}));
  $("#enterApp").addEventListener("click",openApp);
  $("#backToRoles").addEventListener("click",showRoleSelection);
  $("#cancelRegistration").addEventListener("click",showRoleSelection);
  $("#registrationForm").addEventListener("submit",e=>{e.preventDefault();void completeRegistration();});
  $$("[data-page]").filter(el=>!el.closest("#pageContent")).forEach(button=>button.addEventListener("click",e=>{e.preventDefault();switchPage(button.dataset.page);}));
  $("#topUserMenu").addEventListener("click", showProfileMenu);
  $("#mobileMenu").addEventListener("click",()=>$("#sidebar").classList.toggle("mobile-open"));
  $("#notificationButton").addEventListener("click",()=>{renderNotifications();$("#notificationPanel").classList.toggle("hidden");});
  $("#markRead").addEventListener("click",()=>{state.notifications.forEach(n=>n.read=true);saveState();renderNotifications();toast("Notifications updated","All notifications marked as read.");});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){$("#modalRoot").innerHTML="";$("#notificationPanel").classList.add("hidden");$("#sidebar").classList.remove("mobile-open");}});
  window.addEventListener("resize",()=>{if(state.page==="dashboard")drawDashboardChart();if(state.page==="analytics")drawAnalyticsChart();});
  document.body.classList.toggle("theme-dark",state.dark);
  showLogin();
}
init();
