// ============================================
// LJ SERVICES CRM v8.0 - COMPLETE & WIRED
// For index-FINAL-v8.html structure
// ============================================

console.log("🚀 LJ Services CRM v8.0 COMPLETE - Initializing...");

// ------------------------
// Helper
// ------------------------
function getEl(id) {
  const el = document.getElementById(id);
  if (!el) console.warn("⚠️ Element not found:", id);
  return el;
}

// Global state (simple)
const CRM = {
  currentView: "list",
  darkMode: localStorage.getItem("theme") === "dark",
  selectedItems: new Set(),
};

// ============================================
// LOADING ANIMATION
// ============================================
function initLoadingAnimation() {
  const loadingScreen = getEl("loadingScreen");
  const mainApp = getEl("mainApp");

  if (!loadingScreen || !mainApp) {
    console.warn("⚠️ Loading elements not found - showing app directly");
    if (mainApp) {
      mainApp.style.display = "flex";
      mainApp.style.opacity = "1";
    }
    setTimeout(initializeApp, 100);
    return;
  }

  // Fade out loading, fade in app
  setTimeout(() => {
    loadingScreen.style.opacity = "0";
    setTimeout(() => {
      loadingScreen.style.display = "none";
      mainApp.style.display = "flex";
      mainApp.style.opacity = "0";
      mainApp.style.transition = "opacity 0.5s ease";
      requestAnimationFrame(() => {
        mainApp.style.opacity = "1";
      });
      initializeApp();
    }, 500);
  }, 1500); // 1.5s – you can adjust
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, duration = 3000) {
  const container = getEl("toastContainer") || document.body;

  const toast = document.createElement("div");
  toast.className =
    "fixed bottom-6 right-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-lg shadow-2xl z-50 text-xs";
  toast.style.animation = "slideInRight 0.3s ease";
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => {
      if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, duration);
}

// ============================================
// DARK MODE
// ============================================
function initDarkMode() {
  const btn = getEl("darkModeToggle");

  // Apply saved theme
  if (CRM.darkMode) {
    document.documentElement.classList.add("dark");
    document.body.classList.add("dark");
  }

  if (!btn) return;

  btn.addEventListener("click", () => {
    CRM.darkMode = !CRM.darkMode;
    document.documentElement.classList.toggle("dark");
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", CRM.darkMode ? "dark" : "light");
    showToast(
      CRM.darkMode ? "🌙 Dark mode enabled" : "☀️ Light mode enabled"
    );
  });
}

// ============================================
// NOTIFICATIONS
// ============================================
function initNotifications() {
  const btn = getEl("notificationsBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    showToast("📬 Notifications panel");
  });
}

// ============================================
// AI ASSISTANT
// ============================================
function initAI() {
  const btn = getEl("aiAssistantBtn");
  const modal = getEl("aiAssistantModal");
  if (!btn || !modal) return;

  btn.addEventListener("click", () => {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  });
}

// ============================================
// VIEW TOGGLE (List / Kanban / Calendar)
// ============================================
function initViewToggle() {
  const listBtn = getEl("listViewBtn");
  const kanbanBtn = getEl("kanbanViewBtn");
  const calendarBtn = getEl("calendarViewBtn");

  function switchView(view) {
    const kanban = getEl("kanbanView");
    const calendar = getEl("calendarView");
    const mainListContainer = getEl("listViewContainer"); // OPTIONAL ID; safe if missing

    // Default behavior: list view = main table visible, kanban/calendar hidden
    if (kanban) {
      kanban.classList.toggle("hidden", view !== "kanban");
    }
    if (calendar) {
      calendar.classList.toggle("hidden", view !== "calendar");
    }
    if (mainListContainer) {
      mainListContainer.classList.toggle("hidden", view !== "list");
    }

    CRM.currentView = view;
    console.log(`📄 Switched to ${view} view`);
  }

  function updateActiveButton(activeBtn, otherBtns) {
    const cls = ["bg-white", "dark:bg-slate-700", "shadow-sm"];
    [activeBtn, ...otherBtns].forEach((btn) => {
      if (!btn) return;
      cls.forEach((c) => btn.classList.remove(c));
    });
    if (activeBtn) cls.forEach((c) => activeBtn.classList.add(c));
  }

  if (listBtn) {
    listBtn.addEventListener("click", () => {
      switchView("list");
      updateActiveButton(listBtn, [kanbanBtn, calendarBtn]);
    });
  }
  if (kanbanBtn) {
    kanbanBtn.addEventListener("click", () => {
      switchView("kanban");
      updateActiveButton(kanbanBtn, [listBtn, calendarBtn]);
    });
  }
  if (calendarBtn) {
    calendarBtn.addEventListener("click", () => {
      switchView("calendar");
      updateActiveButton(calendarBtn, [listBtn, kanbanBtn]);
    });
  }

  // Default
  switchView("list");
  updateActiveButton(listBtn || kanbanBtn || calendarBtn, []);
}

// ============================================
// BULK ACTIONS BAR
// ============================================
function initBulkActions() {
  const selectAllBtn = getEl("selectAllBtn");
  const clearBtn = getEl("clearSelectionBtn");
  const closeBtn = getEl("closeBulkActionsBtn");
  const bulkBar = getEl("bulkActionsBar");

  if (!bulkBar) return;

  function openBar() {
    bulkBar.classList.add("active");
  }
  function closeBar() {
    bulkBar.classList.remove("active");
  }

  if (selectAllBtn) {
    selectAllBtn.addEventListener("click", () => {
      openBar();
      showToast("✅ All items selected (demo)");
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      CRM.selectedItems.clear();
      closeBar();
      showToast("✨ Selection cleared");
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      closeBar();
    });
  }
}

// ============================================
// SEARCH
// ============================================
function initSearch() {
  const searchInput = document.querySelector('input[type="search"]');
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    const q = (e.target.value || "").toLowerCase();
    console.log("🔍 Searching for:", q);
    // later: filter ticket list
  });
}

// ============================================
// EXPORT / PRINT
// ============================================
function initExport() {
  const csvBtn = getEl("exportCsvBtn");
  const printBtn = getEl("printViewBtn");

  if (csvBtn) {
    csvBtn.addEventListener("click", () => {
      showToast("📊 Exporting to CSV (demo)");
    });
  }

  if (printBtn) {
    printBtn.addEventListener("click", () => {
      showToast("🖨️ Opening print dialog...");
      window.print();
    });
  }
}

// ============================================
// REPORTS / TEMPLATES / AUTOMATION / BATCH
// ============================================
function initReports() {
  const btn = getEl("reportsBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const modal = getEl("reportsModal");
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
    showToast("📈 Reports panel");
  });
}

function initTemplates() {
  const btn = getEl("templatesBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const modal = getEl("templatesModal");
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
    showToast("📄 Templates panel");
  });
}

function initAutomation() {
  const btn = getEl("automationBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const modal = getEl("automationModal");
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
    showToast("⚡ Automation panel");
  });
}

function initBatchHistory() {
  const btn = getEl("batchHistoryBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const modal = getEl("batchHistoryModal");
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
    showToast("📚 Bulk actions history");
  });
}

// ============================================
// DRAWERS (Tickets / Work Orders / Violations)
// ============================================
function openDrawer(id) {
  const drawer = getEl(id);
  if (!drawer) return;
  drawer.style.display = "block";
}

function closeDrawer(id) {
  const drawer = getEl(id);
  if (!drawer) return;
  drawer.style.display = "none";
}

function initDrawers() {
  const triggers = document.querySelectorAll("[data-open-drawer]");
  if (!triggers.length) return;

  triggers.forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-open-drawer");
      let id = null;
      if (type === "ticket") id = "drawerTicket";
      if (type === "workOrder") id = "drawerWorkOrder";
      if (type === "violation") id = "drawerViolation";
      if (id) openDrawer(id);
    });
  });
}

// Expose for inline HTML onclick
window.openDrawer = openDrawer;
window.closeDrawer = closeDrawer;

// ============================================
// MODAL CLOSE HELPERS (for inline onclick="...")
// ============================================
function closeModal() {
  const modal = getEl("itemModal");
  if (!modal) return;
  modal.classList.remove("flex");
  modal.classList.add("hidden");
}

function closeAIAssistant() {
  const modal = getEl("aiAssistantModal");
  if (!modal) return;
  modal.classList.remove("flex");
  modal.classList.add("hidden");
}

function closeSLAModal() {
  const modal = getEl("slaModal");
  if (!modal) return;
  modal.classList.remove("flex");
  modal.classList.add("hidden");
}

function closeImportExportModal() {
  const modal = getEl("importExportModal");
  if (!modal) return;
  modal.classList.remove("flex");
  modal.classList.add("hidden");
}

function closeTemplatesModal() {
  const modal = getEl("templatesModal");
  if (!modal) return;
  modal.classList.remove("flex");
  modal.classList.add("hidden");
}

function closeReportsModal() {
  const modal = getEl("reportsModal");
  if (!modal) return;
  modal.classList.remove("flex");
  modal.classList.add("hidden");
}

function closeAutomationModal() {
  const modal = getEl("automationModal");
  if (!modal) return;
  modal.classList.remove("flex");
  modal.classList.add("hidden");
}

function closeBatchHistoryModal() {
  const modal = getEl("batchHistoryModal");
  if (!modal) return;
  modal.classList.remove("flex");
  modal.classList.add("hidden");
}

// Expose globally for your inline onclick attributes
window.closeModal = closeModal;
window.closeAIAssistant = closeAIAssistant;
window.closeSLAModal = closeSLAModal;
window.closeImportExportModal = closeImportExportModal;
window.closeTemplatesModal = closeTemplatesModal;
window.closeReportsModal = closeReportsModal;
window.closeAutomationModal = closeAutomationModal;
window.closeBatchHistoryModal = closeBatchHistoryModal;

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
function initKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    // Ctrl+K → focus search
    if (e.ctrlKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      const searchInput = document.querySelector('input[type="search"]');
      if (searchInput) searchInput.focus();
    }

    // Ctrl+D → toggle dark mode
    if (e.ctrlKey && e.key.toLowerCase() === "d") {
      e.preventDefault();
      const darkBtn = getEl("darkModeToggle");
      if (darkBtn) darkBtn.click();
    }

    // Esc → close any visible modals / drawers
    if (e.key === "Escape") {
      [
        "aiAssistantModal",
        "itemModal",
        "slaModal",
        "importExportModal",
        "templatesModal",
        "reportsModal",
        "automationModal",
        "batchHistoryModal",
        "drawerTicket",
        "drawerWorkOrder",
        "drawerViolation",
      ].forEach((id) => {
        const el = getEl(id);
        if (!el) return;
        if (id.startsWith("drawer")) {
          el.style.display = "none";
        } else {
          el.classList.add("hidden");
          el.classList.remove("flex");
        }
      });
    }
  });
}

// ============================================
// MAIN INITIALIZATION
// ============================================
function initializeApp() {
  console.log("⚙️ Initializing app features...");

  try {
    initDarkMode();
    initNotifications();
    initAI();
    initViewToggle();
    initBulkActions();
    initSearch();
    initExport();
    initReports();
    initTemplates();
    initAutomation();
    initBatchHistory();
    initDrawers();
    initKeyboardShortcuts();

    console.log("✅ App initialized successfully!");
    showToast("🎉 LJ Services CRM v8.0 is ready!", 4000);
  } catch (error) {
    console.error("❌ Error initializing app:", error);
    showToast("⚠️ Some features may not work properly", 5000);
  }
}

// ============================================
// START APPLICATION
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("📄 DOM loaded");
  initLoadingAnimation();
});

console.log("📦 App.js loaded successfully");
