// ============================================
// LJ SERVICES GROUP - CRM DASHBOARD
// Firebase + Multi-dashboard UI
// ============================================

console.log("🚀 Loading LJ Services CRM app.js...");

const LJ_STATE = {
  db: null,
  tickets: {},      // Tickets Dashboard
  workOrders: {},   // Work Orders Dashboard
  violations: {},   // Violations Dashboard
};

// ---------- Initialization ----------

document.addEventListener("DOMContentLoaded", () => {
  try {
    initFirebaseBinding();
    initUserProfile();
    initDashboardNavigation();
    initTicketDrawer();
    initRealtimeListeners();
    initLogoutButton();
    console.log("✅ Application initialized successfully!");
  } catch (err) {
    console.error("❌ Error initializing app:", err);
  }
});

function initFirebaseBinding() {
  if (!window.firebase || !firebase.apps.length) {
    console.error("Firebase is not initialized. Check firebase-config.js.");
    return;
  }
  LJ_STATE.db = firebase.database();
  console.log("🔥 Firebase database ready:", LJ_STATE.db.ref().toString());

  const dbUrlLabel = document.getElementById("dbUrlLabel");
  if (dbUrlLabel && firebase.apps[0].options.databaseURL) {
    dbUrlLabel.textContent = firebase.apps[0].options.databaseURL;
  }
}

// ---------- User / Profile ----------

function initUserProfile() {
  const nameEl = document.getElementById("userName");
  const emailEl = document.getElementById("userEmail");

  const user = window.currentUser || {
    name: "Kevin R",
    email: "kevinr@ljservicesgroup.com",
  };

  if (nameEl) nameEl.textContent = user.name || "User";
  if (emailEl) emailEl.textContent = user.email || "";

  console.log("✅ User logged in:", user.email);
}

// Optional logout wiring (you can replace with your MSAL logic)
function initLogoutButton() {
  const btn = document.getElementById("logoutBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    alert("Here you can plug your MSAL logout logic.");
  });
}

// ---------- Dashboard Switching (tabs + mobile select) ----------

function initDashboardNavigation() {
  const tabButtons = document.querySelectorAll(".dashboard-tab");
  const views = document.querySelectorAll("[data-dashboard-view]");
  const mobileSelect = document.getElementById("mobileDashboardSelect");
  const titleEl = document.getElementById("dashboardTitle");
  const subtitleEl = document.getElementById("dashboardSubtitle");

  const LABELS = {
    main: {
      title: "Overview",
      subtitle:
        "High-level activity across all tickets, work orders, and violations.",
    },
    tickets: {
      title: "Tickets Dashboard",
      subtitle: "General tickets and internal tasks.",
    },
    workOrders: {
      title: "Work Orders Dashboard",
      subtitle: "Vendor-related work orders and maintenance tasks.",
    },
    violations: {
      title: "Violations Dashboard",
      subtitle: "CC&R infractions and enforcement letters.",
    },
  };

  function setDashboard(id) {
    // Tabs
    tabButtons.forEach((btn) => {
      const isActive = btn.dataset.dashboard === id;
      if (isActive) {
        btn.classList.remove("text-slate-600", "hover:bg-slate-50");
        btn.classList.add("bg-indigo-50", "text-indigo-700");
      } else {
        btn.classList.add("text-slate-600", "hover:bg-slate-50");
        btn.classList.remove("bg-indigo-50", "text-indigo-700");
      }
    });

    // Views
    views.forEach((view) => {
      const matches = view.dataset.dashboardView === id || (id === "main" && view.dataset.dashboardView === "main");
      view.classList.toggle("hidden", !matches);
    });

    // Mobile select
    if (mobileSelect && mobileSelect.value !== id) {
      mobileSelect.value = id;
    }

    // Title + subtitle
    if (LABELS[id]) {
      if (titleEl) titleEl.textContent = LABELS[id].title;
      if (subtitleEl) subtitleEl.textContent = LABELS[id].subtitle;
    }
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.dashboard || "main";
      setDashboard(id);
    });
  });

  if (mobileSelect) {
    mobileSelect.addEventListener("change", (e) => {
      setDashboard(e.target.value || "main");
    });
  }

  setDashboard("main");
}

// ---------- Ticket Drawer (right side panel) ----------

function initTicketDrawer() {
  const drawer = document.getElementById("ticketDrawer");
  const backdrop = document.getElementById("ticketDrawerBackdrop");
  const form = document.getElementById("ticketForm");
  const openButtons = document.querySelectorAll('[data-open-drawer="ticket"]');
  const closeButtons = document.querySelectorAll("[data-close-drawer]");

  if (!drawer || !backdrop || !form) {
    console.warn("Drawer elements not found; skipping drawer init.");
    return;
  }

  function openDrawer(options) {
    const typeField = form.elements["ticketType"];
    const dashboardField = form.elements["dashboard"];
    const drawerTitle = document.getElementById("drawerTitle");

    if (typeField && options.type) {
      typeField.value = options.type;
    }
    if (dashboardField && options.dashboard) {
      dashboardField.value = options.dashboard;
    }

    if (drawerTitle) {
      if (options.type === "Work Order") {
        drawerTitle.textContent = "Create Work Order";
      } else if (options.type === "Violation") {
        drawerTitle.textContent = "Create Violation";
      } else {
        drawerTitle.textContent = "Create Ticket";
      }
    }

    drawer.classList.remove("drawer-enter");
    drawer.classList.add("drawer-open");
    backdrop.classList.remove("pointer-events-none");
    backdrop.classList.remove("opacity-0");
    backdrop.classList.add("opacity-100");

    drawer.focus();
  }

  function closeDrawer() {
    drawer.classList.remove("drawer-open");
    drawer.classList.add("drawer-enter");
    backdrop.classList.add("pointer-events-none");
    backdrop.classList.remove("opacity-100");
    backdrop.classList.add("opacity-0");
  }

  openButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      form.reset();
      const opts = {
        type: btn.dataset.type || "General",
        dashboard: btn.dataset.dashboard || "Tickets Dashboard",
      };
      openDrawer(opts);
    });
  });

  closeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      closeDrawer();
    });
  });

  backdrop.addEventListener("click", () => {
    closeDrawer();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    createTicketFromForm(form)
      .then(() => {
        closeDrawer();
        form.reset();
      })
      .catch((err) => {
        console.error("Error saving ticket:", err);
        alert("There was a problem saving the ticket. Check console for details.");
      });
  });
}

// ---------- Create Ticket (save to Firebase) ----------

function createTicketFromForm(form) {
  if (!LJ_STATE.db) {
    return Promise.reject(new Error("Database not ready"));
  }

  const get = (name) =>
    form.elements[name] ? form.elements[name].value.trim() : "";

  const now = new Date();
  const iso = now.toISOString();

  let dashboard = get("dashboard") || "Tickets Dashboard";
  const type = get("ticketType") || "General";

  let path = "tickets";
  if (dashboard === "Work Orders Dashboard" || type === "Work Order") {
    path = "workOrders";
    dashboard = "Work Orders Dashboard";
  } else if (dashboard === "Violations Dashboard" || type === "Violation") {
    path = "violations";
    dashboard = "Violations Dashboard";
  }

  const title = get("title");
  const association = get("association");

  if (!title) {
    alert("Please add a title for the ticket.");
    return Promise.resolve();
  }
  if (!association) {
    alert("Please specify the association.");
    return Promise.resolve();
  }

  const ticketRef = LJ_STATE.db.ref(path).push();
  const referenceNumber = `LJ-${Date.now().toString(36).toUpperCase()}`;

  const ticket = {
    id: ticketRef.key,
    referenceNumber,
    type,
    dashboard,
    title,
    association,
    priority: get("priority") || "Medium",
    status: get("status") || "Open",
    assignedTo: get("assignedTo") || "",
    vendor: get("vendor") || "",
    description: get("description") || "",
    ruleBroken: get("ruleBroken") || "",
    attachments: get("attachments") || "",
    createdAt: iso,
    createdAtMillis: now.getTime(),
    createdBy:
      (window.currentUser && window.currentUser.email) ||
      "kevinr@ljservicesgroup.com",
  };

  console.log("💾 Saving ticket:", path, ticket);

  return ticketRef.set(ticket);
}

// ---------- Firebase listeners (load data for dashboards) ----------

function initRealtimeListeners() {
  if (!LJ_STATE.db) {
    console.warn("Realtime listeners skipped (db not ready).");
    return;
  }

  LJ_STATE.db.ref("tickets").on("value", (snap) => {
    LJ_STATE.tickets = snap.val() || {};
    console.log("📡 Tickets updated from Firebase:", Object.keys(LJ_STATE.tickets).length);
    renderAll();
  });

  LJ_STATE.db.ref("workOrders").on("value", (snap) => {
    LJ_STATE.workOrders = snap.val() || {};
    console.log("📡 Work orders updated from Firebase:", Object.keys(LJ_STATE.workOrders).length);
    renderAll();
  });

  LJ_STATE.db.ref("violations").on("value", (snap) => {
    LJ_STATE.violations = snap.val() || {};
    console.log("📡 Violations updated from Firebase:", Object.keys(LJ_STATE.violations).length);
    renderAll();
  });
}

// ---------- Rendering helpers ----------

function renderAll() {
  renderStatCards();
  renderRecentActivity();
  renderTables();
}

function renderStatCards() {
  const totalTicketsEl = document.getElementById("totalTicketsCard");
  const openTicketsEl = document.getElementById("openTicketsCard");
  const totalWorkOrdersEl = document.getElementById("totalWorkOrdersCard");
  const totalViolationsEl = document.getElementById("totalViolationsCard");

  const ticketsArray = objToArray(LJ_STATE.tickets);
  const workOrdersArray = objToArray(LJ_STATE.workOrders);
  const violationsArray = objToArray(LJ_STATE.violations);

  const allItems = [...ticketsArray, ...workOrdersArray, ...violationsArray];

  const total = allItems.length;
  const openCount = allItems.filter(
    (t) => (t.status || "").toLowerCase() !== "closed"
  ).length;

  if (totalTicketsEl) totalTicketsEl.textContent = String(total);
  if (openTicketsEl) openTicketsEl.textContent = String(openCount);
  if (totalWorkOrdersEl)
    totalWorkOrdersEl.textContent = String(workOrdersArray.length);
  if (totalViolationsEl)
    totalViolationsEl.textContent = String(violationsArray.length);
}

function renderRecentActivity() {
  const container = document.getElementById("recentActivityList");
  if (!container) return;

  const items = [
    ...objToArray(LJ_STATE.tickets).map((t) => ({ ...t, source: "Ticket" })),
    ...objToArray(LJ_STATE.workOrders).map((t) => ({
      ...t,
      source: "Work Order",
    })),
    ...objToArray(LJ_STATE.violations).map((t) => ({
      ...t,
      source: "Violation",
    })),
  ];

  if (!items.length) {
    container.innerHTML =
      '<p class="text-xs text-slate-400 py-4 text-center">No activity yet. Create your first ticket to get started.</p>';
    return;
  }

  items.sort((a, b) => (b.createdAtMillis || 0) - (a.createdAtMillis || 0));
  const latest = items.slice(0, 10);

  container.innerHTML = latest
    .map((item) => {
      const dateLabel = item.createdAt
        ? new Date(item.createdAt).toLocaleString()
        : "";
      const badgeClass =
        item.source === "Work Order"
          ? "bg-amber-50 text-amber-700"
          : item.source === "Violation"
          ? "bg-rose-50 text-rose-700"
          : "bg-indigo-50 text-indigo-700";

      return `
        <div class="py-2.5 flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${badgeClass}">
                ${escapeHtml(item.source)}
              </span>
              <span class="text-xs text-slate-400 truncate">
                ${escapeHtml(item.referenceNumber || "")}
              </span>
            </div>
            <p class="text-sm font-medium text-slate-900 mt-0.5 truncate">
              ${escapeHtml(item.title || "")}
            </p>
            <p class="text-xs text-slate-500 mt-0.5 truncate">
              ${escapeHtml(item.association || "")}
            </p>
          </div>
          <div class="text-right">
            <p class="text-[11px] text-slate-400 mb-1">${escapeHtml(
              item.status || "Open"
            )}</p>
            <p class="text-[10px] text-slate-400">${escapeHtml(
              dateLabel || ""
            )}</p>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderTables() {
  renderSimpleTable(
    "ticketsTableBody",
    objToArray(LJ_STATE.tickets),
    "ticket"
  );
  renderSimpleTable(
    "workOrdersTableBody",
    objToArray(LJ_STATE.workOrders),
    "workOrder"
  );
  renderSimpleTable(
    "violationsTableBody",
    objToArray(LJ_STATE.violations),
    "violation"
  );
}

function renderSimpleTable(tbodyId, items, type) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  if (!items.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="px-3 py-4 text-center text-xs text-slate-400">
          No ${escapeHtml(type)}s yet. Use the button above to create one.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = items
    .map((item) => {
      const statusClass =
        (item.status || "").toLowerCase() === "closed"
          ? "bg-emerald-50 text-emerald-700"
          : (item.status || "").toLowerCase() === "in progress"
          ? "bg-amber-50 text-amber-700"
          : "bg-sky-50 text-sky-700";

      const priorityClass =
        (item.priority || "").toLowerCase() === "urgent"
          ? "bg-rose-50 text-rose-700"
          : (item.priority || "").toLowerCase() === "high"
          ? "bg-amber-50 text-amber-700"
          : "bg-slate-50 text-slate-600";

      const ruleOrVendor =
        type === "workOrder"
          ? item.vendor || "–"
          : type === "violation"
          ? item.ruleBroken || "–"
          : item.priority || "–";

      return `
        <tr class="hover:bg-slate-50">
          <td class="px-3 py-2 align-top">
            <p class="text-xs sm:text-sm font-medium text-slate-900 truncate">${escapeHtml(
              item.title || ""
            )}</p>
            <p class="text-[11px] text-slate-400 truncate">${escapeHtml(
              item.referenceNumber || ""
            )}</p>
          </td>
          <td class="px-3 py-2 align-top text-xs text-slate-600">
            ${escapeHtml(item.association || "")}
          </td>
          <td class="px-3 py-2 align-top text-xs text-slate-600">
            ${
              type === "workOrder" || type === "violation"
                ? escapeHtml(ruleOrVendor)
                : `<span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${priorityClass}">
                     ${escapeHtml(item.priority || "")}
                   </span>`
            }
          </td>
          <td class="px-3 py-2 align-top">
            <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${statusClass}">
              ${escapeHtml(item.status || "")}
            </span>
          </td>
          <td class="px-3 py-2 align-top text-right">
            <button
              type="button"
              class="inline-flex items-center rounded-lg border border-slate-200 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-100"
              onclick="handleTicketActions('${escapeAttr(item.id)}','${type}')"
            >
              Actions
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}

// ---------- Actions & helpers ----------

function handleTicketActions(id, type) {
  // From here you can integrate PDF / letter generation.
  // For now we just show a simple menu placeholder.
  const message =
    type === "violation"
      ? "Here you can trigger violation letter PDF generation, including the rule/covenant that was broken, and CC team members."
      : type === "workOrder"
      ? "Here you can trigger vendor letter PDF generation and CC a team member."
      : "Here you can edit the ticket or change its status.";
  alert(message + "\n\nTicket ID: " + id);
}

function objToArray(obj) {
  if (!obj) return [];
  return Object.keys(obj).map((key) => obj[key]);
}

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(str) {
  if (str == null) return "";
  return String(str).replace(/'/g, "\\'");
}
