// ============================================
// LJ SERVICES GROUP - CRM DASHBOARD
// Firebase + Multi-dashboard UI with Separate Drawers
// ============================================

console.log("🚀 Loading LJ Services CRM (Improved)...");

const LJ_STATE = {
  db: null,
  tickets: {},
  workOrders: {},
  violations: {},
};

// ---------- Initialization ----------

document.addEventListener("DOMContentLoaded", () => {
  try {
    initFirebaseBinding();
    initUserProfile();
    initDashboardNavigation();
    initDrawers();
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

function initLogoutButton() {
  const btn = document.getElementById("logoutBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    alert("Here you can plug your MSAL logout logic.");
  });
}

// ---------- Dashboard Switching ----------

function initDashboardNavigation() {
  const tabButtons = document.querySelectorAll(".dashboard-tab");
  const views = document.querySelectorAll("[data-dashboard-view]");
  const mobileSelect = document.getElementById("mobileDashboardSelect");
  const titleEl = document.getElementById("dashboardTitle");
  const subtitleEl = document.getElementById("dashboardSubtitle");

  const LABELS = {
    main: {
      title: "Overview",
      subtitle: "High-level activity across all tickets, work orders, and violations.",
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
    // Update tabs
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

    // Update views
    views.forEach((view) => {
      const matches = view.dataset.dashboardView === id;
      view.classList.toggle("hidden", !matches);
    });

    // Update mobile select
    if (mobileSelect && mobileSelect.value !== id) {
      mobileSelect.value = id;
    }

    // Update title + subtitle
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

// ---------- Drawer Management (3 separate drawers) ----------

function initDrawers() {
  const backdrop = document.getElementById("drawerBackdrop");
  
  // Initialize each drawer type
  initSingleDrawer("ticket", "ticketDrawer", "ticketForm", createTicket);
  initSingleDrawer("workOrder", "workOrderDrawer", "workOrderForm", createWorkOrder);
  initSingleDrawer("violation", "violationDrawer", "violationForm", createViolation);

  // Backdrop closes all drawers
  if (backdrop) {
    backdrop.addEventListener("click", () => {
      closeAllDrawers();
    });
  }
}

function initSingleDrawer(type, drawerId, formId, submitHandler) {
  const drawer = document.getElementById(drawerId);
  const form = document.getElementById(formId);
  const openButtons = document.querySelectorAll(`[data-open-drawer="${type}"]`);
  const closeButtons = drawer?.querySelectorAll("[data-close-drawer]");

  if (!drawer || !form) {
    console.warn(`${type} drawer not found`);
    return;
  }

  // Open drawer buttons
  openButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      closeAllDrawers();
      form.reset();
      openDrawer(drawer);
    });
  });

  // Close drawer buttons
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      closeDrawer(drawer);
    });
  });

  // Form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submitHandler(form)
      .then(() => {
        closeDrawer(drawer);
        form.reset();
      })
      .catch((err) => {
        console.error(`Error saving ${type}:`, err);
        alert(`Problem saving ${type}. Check console.`);
      });
  });
}

function openDrawer(drawer) {
  const backdrop = document.getElementById("drawerBackdrop");
  
  drawer.classList.remove("drawer-enter");
  drawer.classList.add("drawer-open");
  
  if (backdrop) {
    backdrop.classList.remove("pointer-events-none", "opacity-0");
    backdrop.classList.add("opacity-100");
  }
  
  drawer.focus();
}

function closeDrawer(drawer) {
  const backdrop = document.getElementById("drawerBackdrop");
  
  drawer.classList.remove("drawer-open");
  drawer.classList.add("drawer-enter");
  
  // Only close backdrop if no drawers are open
  setTimeout(() => {
    const anyOpen = document.querySelector(".drawer-open");
    if (!anyOpen && backdrop) {
      backdrop.classList.add("pointer-events-none", "opacity-0");
      backdrop.classList.remove("opacity-100");
    }
  }, 100);
}

function closeAllDrawers() {
  const drawers = ["ticketDrawer", "workOrderDrawer", "violationDrawer"];
  drawers.forEach((id) => {
    const drawer = document.getElementById(id);
    if (drawer) {
      drawer.classList.remove("drawer-open");
      drawer.classList.add("drawer-enter");
    }
  });

  const backdrop = document.getElementById("drawerBackdrop");
  if (backdrop) {
    backdrop.classList.add("pointer-events-none", "opacity-0");
    backdrop.classList.remove("opacity-100");
  }
}

// ---------- Create Functions ----------

function createTicket(form) {
  if (!LJ_STATE.db) {
    return Promise.reject(new Error("Database not ready"));
  }

  const get = (name) => (form.elements[name] ? form.elements[name].value.trim() : "");

  const now = new Date();
  const id = `TKT-${Date.now()}`;
  const refNum = `TKT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;

  const ticket = {
    id,
    referenceNumber: refNum,
    title: get("title"),
    association: get("association"),
    priority: get("priority") || "Medium",
    status: get("status") || "Open",
    assignedTo: get("assignedTo"),
    description: get("description"),
    attachments: get("attachments"),
    createdAt: now.toISOString(),
    createdAtMillis: now.getTime(),
    dashboard: "Tickets Dashboard",
  };

  console.log("Creating ticket:", ticket);
  return LJ_STATE.db.ref(`tickets/${id}`).set(ticket);
}

function createWorkOrder(form) {
  if (!LJ_STATE.db) {
    return Promise.reject(new Error("Database not ready"));
  }

  const get = (name) => (form.elements[name] ? form.elements[name].value.trim() : "");

  const now = new Date();
  const id = `WO-${Date.now()}`;
  const refNum = `WO-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;

  const workOrder = {
    id,
    referenceNumber: refNum,
    title: get("title"),
    association: get("association"),
    vendor: get("vendor"),
    vendorContact: get("vendorContact"),
    estimatedCost: get("estimatedCost"),
    priority: get("priority") || "Medium",
    status: get("status") || "Open",
    description: get("description"),
    attachments: get("attachments"),
    createdAt: now.toISOString(),
    createdAtMillis: now.getTime(),
    dashboard: "Work Orders Dashboard",
  };

  console.log("Creating work order:", workOrder);
  return LJ_STATE.db.ref(`workOrders/${id}`).set(workOrder);
}

function createViolation(form) {
  if (!LJ_STATE.db) {
    return Promise.reject(new Error("Database not ready"));
  }

  const get = (name) => (form.elements[name] ? form.elements[name].value.trim() : "");

  const now = new Date();
  const id = `VIO-${Date.now()}`;
  const refNum = `VIO-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;

  const violation = {
    id,
    referenceNumber: refNum,
    title: get("title"),
    association: get("association"),
    unit: get("unit"),
    ruleBroken: get("ruleBroken"),
    severity: get("severity") || "Moderate",
    noticeStep: get("noticeStep") || "1st Notice",
    status: get("status") || "Open",
    residentName: get("residentName"),
    description: get("description"),
    attachments: get("attachments"),
    deadline: get("deadline"),
    createdAt: now.toISOString(),
    createdAtMillis: now.getTime(),
    dashboard: "Violations Dashboard",
  };

  console.log("Creating violation:", violation);
  return LJ_STATE.db.ref(`violations/${id}`).set(violation);
}

// ---------- Firebase Listeners ----------

function initRealtimeListeners() {
  if (!LJ_STATE.db) {
    console.warn("Realtime listeners skipped (db not ready).");
    return;
  }

  LJ_STATE.db.ref("tickets").on("value", (snap) => {
    LJ_STATE.tickets = snap.val() || {};
    console.log("📡 Tickets updated:", Object.keys(LJ_STATE.tickets).length);
    renderAll();
  });

  LJ_STATE.db.ref("workOrders").on("value", (snap) => {
    LJ_STATE.workOrders = snap.val() || {};
    console.log("📡 Work orders updated:", Object.keys(LJ_STATE.workOrders).length);
    renderAll();
  });

  LJ_STATE.db.ref("violations").on("value", (snap) => {
    LJ_STATE.violations = snap.val() || {};
    console.log("📡 Violations updated:", Object.keys(LJ_STATE.violations).length);
    renderAll();
  });
}

// ---------- Rendering ----------

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
  if (totalWorkOrdersEl) totalWorkOrdersEl.textContent = String(workOrdersArray.length);
  if (totalViolationsEl) totalViolationsEl.textContent = String(violationsArray.length);
}

function renderRecentActivity() {
  const container = document.getElementById("recentActivityList");
  if (!container) return;

  const items = [
    ...objToArray(LJ_STATE.tickets).map((t) => ({ ...t, source: "Ticket" })),
    ...objToArray(LJ_STATE.workOrders).map((t) => ({ ...t, source: "Work Order" })),
    ...objToArray(LJ_STATE.violations).map((t) => ({ ...t, source: "Violation" })),
  ];

  if (!items.length) {
    container.innerHTML =
      '<p class="text-xs text-slate-400 py-4 text-center">No activity yet. Create your first item to get started.</p>';
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
            <p class="text-[11px] text-slate-400 mb-1">${escapeHtml(item.status || "Open")}</p>
            <p class="text-[10px] text-slate-400">${escapeHtml(dateLabel || "")}</p>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderTables() {
  renderSimpleTable("ticketsTableBody", objToArray(LJ_STATE.tickets), "ticket");
  renderSimpleTable("workOrdersTableBody", objToArray(LJ_STATE.workOrders), "workOrder");
  renderSimpleTable("violationsTableBody", objToArray(LJ_STATE.violations), "violation");
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

      const thirdColumn =
        type === "workOrder"
          ? escapeHtml(item.vendor || "–")
          : type === "violation"
          ? escapeHtml(item.ruleBroken || "–")
          : `<span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${priorityClass}">
               ${escapeHtml(item.priority || "–")}
             </span>`;

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
            ${thirdColumn}
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
              onclick="handleActions('${escapeAttr(item.id)}','${type}')"
            >
              Actions
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}

// ---------- Actions & Helpers ----------

function handleActions(id, type) {
  const message =
    type === "violation"
      ? "Violation actions: Generate notice letter, send to resident, escalate to board"
      : type === "workOrder"
      ? "Work order actions: Generate vendor letter, track progress, mark complete"
      : "Ticket actions: Edit ticket, reassign, update status, close";
  
  alert(message + "\n\nID: " + id);
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
