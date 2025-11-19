// ============================================
// LJ SERVICES CRM v8.0 - Minimal Working JS
// Rebuilt so everything works on GitHub Pages
// ============================================

console.log('🚀 LJ Services CRM v8.0 - JS starting');

// ------------------------
// Safe element helper
// ------------------------
function getEl(id) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn('⚠️ Element not found:', id);
  }
  return el;
}

// ------------------------
// Toast notifications
// ------------------------
function showToast(message, duration) {
  if (duration === undefined) duration = 3000;

  const container = getEl('toastContainer') || document.body;

  const toast = document.createElement('div');
  toast.className =
    'fixed bottom-6 right-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-lg shadow-2xl z-50 text-sm';
  toast.style.animation = 'slideInRight 0.3s ease';
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(function () {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(function () {
      if (toast && toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
}

// ------------------------
// Loading screen
// ------------------------
function initLoadingAnimation() {
  var loadingScreen = getEl('loadingScreen');
  var mainApp = getEl('mainApp');

  if (!loadingScreen && mainApp) {
    // No loading screen in DOM -> just show app
    mainApp.style.display = 'flex';
    mainApp.style.opacity = '1';
    initializeApp();
    return;
  }

  if (!loadingScreen || !mainApp) {
    console.warn('⚠️ Loading elements missing, skipping animation');
    if (mainApp) {
      mainApp.style.display = 'flex';
      mainApp.style.opacity = '1';
    }
    initializeApp();
    return;
  }

  // Small delay just to show the animation
  setTimeout(function () {
    loadingScreen.style.opacity = '0';
    setTimeout(function () {
      loadingScreen.style.display = 'none';
      mainApp.style.display = 'flex';
      mainApp.style.opacity = '0';
      mainApp.style.transition = 'opacity 0.4s ease';
      requestAnimationFrame(function () {
        mainApp.style.opacity = '1';
      });
      initializeApp();
    }, 500);
  }, 1200);
}

// ------------------------
// Dark mode
// ------------------------
function initDarkMode() {
  var toggle = getEl('darkModeToggle');
  var root = document.documentElement;

  if (!toggle) return;

  // Apply saved theme
  var saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    root.classList.add('dark');
  }

  toggle.addEventListener('click', function () {
    var isDark = root.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    showToast(isDark ? '🌙 Dark mode enabled' : '☀️ Light mode disabled');
  });
}

// ------------------------
// Dashboard switching (left sidebar)
// ------------------------
function initDashboards() {
  var buttons = document.querySelectorAll('[data-dashboard]');
  var views = document.querySelectorAll('[data-dashboard-view]');

  if (!buttons.length || !views.length) return;

  function setActive(target) {
    views.forEach(function (view) {
      var name = view.getAttribute('data-dashboard-view');
      if (name === target) {
        view.classList.remove('hidden');
      } else {
        view.classList.add('hidden');
      }
    });

    buttons.forEach(function (btn) {
      var name = btn.getAttribute('data-dashboard');
      // remove active style
      btn.classList.remove(
        'bg-slate-900',
        'text-white',
        'dark:bg-white',
        'dark:text-slate-900'
      );
      // add active style
      if (name === target) {
        btn.classList.add(
          'bg-slate-900',
          'text-white',
          'dark:bg-white',
          'dark:text-slate-900'
        );
      }
    });
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-dashboard') || 'main';
      setActive(target);
    });
  });

  // Default to "main"
  setActive('main');
}

// ------------------------
// View buttons (List / Kanban / Calendar)
// ------------------------
function initViewButtons() {
  var listBtn = getEl('listViewBtn');
  var kanbanBtn = getEl('kanbanViewBtn');
  var calendarBtn = getEl('calendarViewBtn');

  function setActive(active) {
    [listBtn, kanbanBtn, calendarBtn].forEach(function (btn) {
      if (!btn) return;
      btn.classList.remove(
        'bg-slate-900',
        'text-white',
        'dark:bg-white',
        'dark:text-slate-900'
      );
    });
    if (active && active.classList) {
      active.classList.add(
        'bg-slate-900',
        'text-white',
        'dark:bg-white',
        'dark:text-slate-900'
      );
    }
  }

  if (listBtn) {
    listBtn.addEventListener('click', function () {
      setActive(listBtn);
      showToast('📋 List view (visual only - demo)');
    });
  }
  if (kanbanBtn) {
    kanbanBtn.addEventListener('click', function () {
      setActive(kanbanBtn);
      showToast('🧩 Kanban view (visual only - demo)');
    });
  }
  if (calendarBtn) {
    calendarBtn.addEventListener('click', function () {
      setActive(calendarBtn);
      showToast('📅 Calendar view (visual only - demo)');
    });
  }

  // Default
  setActive(listBtn || kanbanBtn || calendarBtn);
}

// ------------------------
// Drawers (New Ticket / Work Order / Violation)
// ------------------------
function openDrawer(id) {
  var drawer = getEl(id);
  if (!drawer) return;
  drawer.classList.remove('hidden');
  drawer.classList.add('drawer-open');
}

function closeDrawer(id) {
  var drawer = getEl(id);
  if (!drawer) return;
  drawer.classList.remove('drawer-open');
  drawer.classList.add('hidden');
}

// Attach open events by data attribute
function initDrawers() {
  var triggers = document.querySelectorAll('[data-open-drawer]');
  if (!triggers.length) return;

  triggers.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var type = btn.getAttribute('data-open-drawer');
      if (!type) return;
      var id;
      if (type === 'ticket') id = 'drawerTicket';
      if (type === 'workOrder') id = 'drawerWorkOrder';
      if (type === 'violation') id = 'drawerViolation';
      if (id) openDrawer(id);
    });
  });
}

// ------------------------
// Modals
// ------------------------
function openModalById(id) {
  var modal = getEl(id);
  if (!modal) return;
  modal.classList.remove('hidden');
}

function closeModalById(id) {
  var modal = getEl(id);
  if (!modal) return;
  modal.classList.add('hidden');
}

// Generic item modal (used by onclick="closeModal()")
function closeModal() {
  closeModalById('itemModal');
}

// Specific modals referenced in HTML
function closeAIAssistant() { closeModalById('aiAssistantModal'); }
function closeSLAModal() { closeModalById('slaModal'); }
function closeImportExportModal() { closeModalById('importExportModal'); }
function closeTemplatesModal() { closeModalById('templatesModal'); }
function closeReportsModal() { closeModalById('reportsModal'); }
function closeAutomationModal() { closeModalById('automationModal'); }
function closeBatchHistoryModal() { closeModalById('batchHistoryModal'); }

// We also auto-wire open buttons if present
function initModals() {
  var aiBtn = getEl('aiAssistantBtn');
  if (aiBtn) {
    aiBtn.addEventListener('click', function () {
      openModalById('aiAssistantModal');
    });
  }

  var templatesBtn = getEl('templatesBtn');
  if (templatesBtn) {
    templatesBtn.addEventListener('click', function () {
      openModalById('templatesModal');
    });
  }

  var reportsBtn = getEl('reportsBtn');
  if (reportsBtn) {
    reportsBtn.addEventListener('click', function () {
      openModalById('reportsModal');
    });
  }

  var automationBtn = getEl('automationBtn');
  if (automationBtn) {
    automationBtn.addEventListener('click', function () {
      openModalById('automationModal');
    });
  }

  var batchHistoryBtn = getEl('batchHistoryBtn');
  if (batchHistoryBtn) {
    batchHistoryBtn.addEventListener('click', function () {
      openModalById('batchHistoryModal');
    });
  }

  // Optional: if you add a button with data-open-import-export
  var importExportBtn = document.querySelector('[data-open-import-export]');
  if (importExportBtn) {
    importExportBtn.addEventListener('click', function () {
      openModalById('importExportModal');
    });
  }
}

// ------------------------
// Simple search (logs only)
// ------------------------
function initSearch() {
  var searchInput = document.querySelector('input[type="search"]');
  if (!searchInput) return;

  searchInput.addEventListener('input', function (e) {
    var value = (e.target.value || '').toLowerCase();
    console.log('🔍 Search:', value);
    // You can later add real filtering here
  });
}

// ------------------------
// Bulk actions bar (visual only)
// ------------------------
function initBulkActions() {
  var selectAllBtn = getEl('selectAllBtn');
  var clearBtn = getEl('clearSelectionBtn');
  var closeBulkBtn = getEl('closeBulkActionsBtn');
  var bulkBar = document.querySelector('.bulk-actions-bar');

  if (!bulkBar) return;

  function openBar() {
    bulkBar.classList.add('active');
  }
  function closeBar() {
    bulkBar.classList.remove('active');
  }

  if (selectAllBtn) {
    selectAllBtn.addEventListener('click', function () {
      openBar();
      showToast('✅ All items selected (demo only)');
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      closeBar();
      showToast('✨ Selection cleared (demo only)');
    });
  }
  if (closeBulkBtn) {
    closeBulkBtn.addEventListener('click', function () {
      closeBar();
    });
  }
}

// ------------------------
// Initialize app after loading
// ------------------------
function initializeApp() {
  try {
    console.log('⚙️ Initializing LJ CRM UI...');
    initDarkMode();
    initDashboards();
    initViewButtons();
    initDrawers();
    initModals();
    initSearch();
    initBulkActions();

    showToast('✅ CRM dashboard ready');
  } catch (err) {
    console.error('❌ Error during initializeApp:', err);
    showToast('⚠️ Some features may not work properly', 5000);
  }
}

// ------------------------
// Startup
// ------------------------
document.addEventListener('DOMContentLoaded', function () {
  console.log('📄 DOM loaded (from app.js)');
  initLoadingAnimation();
});

console.log('📦 app.js loaded (end of file)');
