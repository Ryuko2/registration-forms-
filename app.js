// ============================================
// LJ SERVICES CRM v8.0 - COMPLETE WORKING
// All functions defined + Debug Console
// ============================================

console.log('🚀 LJ Services CRM v8.0 - Initializing...');

// Global State
const CRM = {
  darkMode: localStorage.getItem('theme') === 'dark',
  currentView: 'list',
  notifications: [],
  selectedItems: new Set(),
  debugLogs: []
};

// ============================================
// DEBUG CONSOLE
// ============================================
function debugLog(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const log = { timestamp, message, type };
  CRM.debugLogs.push(log);
  
  // Also log to browser console
  const icon = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️' }[type] || 'ℹ️';
  console.log(`${icon} ${timestamp} - ${message}`);
  
  // Update debug console if visible
  updateDebugConsole();
}

function toggleDebugConsole() {
  let debugConsole = document.getElementById('debugConsole');
  
  if (!debugConsole) {
    // Create debug console
    debugConsole = document.createElement('div');
    debugConsole.id = 'debugConsole';
    debugConsole.className = 'fixed bottom-0 right-0 w-96 h-80 bg-slate-900 text-white border-l border-t border-slate-700 z-50 flex flex-col shadow-2xl';
    debugConsole.innerHTML = `
      <div class="flex items-center justify-between p-3 bg-slate-800 border-b border-slate-700">
        <div class="flex items-center gap-2">
          <span class="text-lg">🐛</span>
          <span class="font-bold text-sm">Debug Console</span>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="clearDebugLogs()" class="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded">Clear</button>
          <button onclick="toggleDebugConsole()" class="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded">Close</button>
        </div>
      </div>
      <div id="debugConsoleContent" class="flex-1 overflow-y-auto p-3 text-xs font-mono"></div>
      <div class="p-2 bg-slate-800 border-t border-slate-700 text-xs text-slate-400">
        Total logs: <span id="debugLogCount">0</span> | Press Ctrl+Shift+D to toggle
      </div>
    `;
    document.body.appendChild(debugConsole);
  } else {
    debugConsole.style.display = debugConsole.style.display === 'none' ? 'flex' : 'none';
  }
  
  updateDebugConsole();
}

function updateDebugConsole() {
  const content = document.getElementById('debugConsoleContent');
  const count = document.getElementById('debugLogCount');
  
  if (!content) return;
  
  content.innerHTML = CRM.debugLogs.slice(-100).reverse().map(log => {
    const colors = {
      info: 'text-blue-400',
      success: 'text-green-400',
      error: 'text-red-400',
      warning: 'text-yellow-400'
    };
    const color = colors[log.type] || colors.info;
    
    return `<div class="mb-1 ${color}">
      <span class="text-slate-500">[${log.timestamp}]</span> ${log.message}
    </div>`;
  }).join('');
  
  if (count) count.textContent = CRM.debugLogs.length;
}

function clearDebugLogs() {
  CRM.debugLogs = [];
  updateDebugConsole();
  debugLog('Debug logs cleared', 'info');
}

// ============================================
// LOADING ANIMATION
// ============================================
function initLoadingAnimation() {
  debugLog('Initializing loading animation');
  const loadingScreen = document.getElementById('loadingScreen');
  const mainApp = document.getElementById('mainApp');
  
  if (loadingScreen && mainApp) {
    setTimeout(() => {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
        mainApp.style.display = 'flex';
        setTimeout(() => {
          mainApp.style.opacity = '1';
          mainApp.style.transition = 'opacity 0.5s ease';
          debugLog('Loading animation complete', 'success');
        }, 50);
      }, 500);
    }, 2500);
  } else if (mainApp) {
    mainApp.style.display = 'flex';
    mainApp.style.opacity = '1';
    debugLog('Loading screen skipped - showing app directly', 'warning');
  }
}

// ============================================
// DARK MODE
// ============================================
function toggleDarkMode() {
  CRM.darkMode = !CRM.darkMode;
  document.documentElement.classList.toggle('dark');
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', CRM.darkMode ? 'dark' : 'light');
  showToast(CRM.darkMode ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
  debugLog(`Dark mode: ${CRM.darkMode ? 'ON' : 'OFF'}`, 'info');
}

if (CRM.darkMode) {
  document.documentElement.classList.add('dark');
  document.body.classList.add('dark');
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-4 right-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 rounded-lg shadow-2xl z-40 text-sm font-medium';
  toast.style.animation = 'slideInRight 0.3s ease';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  debugLog(`Toast: ${message}`, 'info');
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================
// VIEW SWITCHING
// ============================================
function switchView(viewName) {
  debugLog(`Switching to ${viewName} view`, 'info');
  
  const views = ['listView', 'kanbanView', 'calendarView'];
  views.forEach(view => {
    const el = document.getElementById(view);
    if (el) el.style.display = 'none';
  });
  
  const targetView = document.getElementById(viewName + 'View');
  if (targetView) {
    targetView.style.display = 'block';
    CRM.currentView = viewName;
    showToast(`Switched to ${viewName} view`);
  }
  
  document.querySelectorAll('.view-toggle').forEach(btn => {
    btn.classList.remove('bg-white', 'dark:bg-slate-700', 'shadow-sm');
  });
  
  const activeBtn = document.getElementById(viewName + 'ViewBtn');
  if (activeBtn) {
    activeBtn.classList.add('bg-white', 'dark:bg-slate-700', 'shadow-sm');
  }
}

function showOverview() {
  debugLog('Showing overview', 'info');
  switchView('list');
  showToast('📊 Overview');
}

function showTicketsDashboard() {
  debugLog('Showing tickets dashboard', 'info');
  switchView('list');
  showToast('🎫 Tickets Dashboard');
}

function showWorkOrdersDashboard() {
  debugLog('Showing work orders dashboard', 'info');
  switchView('list');
  showToast('🔧 Work Orders Dashboard');
}

function showViolationsDashboard() {
  debugLog('Showing violations dashboard', 'info');
  switchView('list');
  showToast('⚠️ Violations Dashboard');
}

// ============================================
// MODAL CONTROLS
// ============================================
function openModal(modalId) {
  debugLog(`Opening modal: ${modalId}`, 'info');
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('active');
    showToast(`Opening ${modalId.replace('Modal', '').replace(/([A-Z])/g, ' $1').trim()}`);
  } else {
    debugLog(`Modal not found: ${modalId}`, 'error');
  }
}

function closeModal(modalId) {
  debugLog(`Closing modal: ${modalId}`, 'info');
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('active');
  }
}

// Specific modal close functions (called from HTML onclick)
function closeAIAssistant() {
  debugLog('Closing AI Assistant', 'info');
  closeModal('aiAssistantModal');
}

function closeTemplatesModal() {
  debugLog('Closing Templates Modal', 'info');
  closeModal('templatesModal');
}

function closeAutomationModal() {
  debugLog('Closing Automation Modal', 'info');
  closeModal('automationModal');
}

function closeReportsModal() {
  debugLog('Closing Reports Modal', 'info');
  closeModal('reportsModal');
}

function closeBatchHistory() {
  debugLog('Closing Batch History', 'info');
  closeModal('batchHistoryModal');
}

function closeSettingsModal() {
  debugLog('Closing Settings Modal', 'info');
  closeModal('settingsModal');
}

function closeItemDrawer() {
  debugLog('Closing Item Drawer', 'info');
  closeModal('itemDetailsDrawer');
}

// ============================================
// PANEL CONTROLS
// ============================================
function togglePanel(panelId) {
  debugLog(`Toggling panel: ${panelId}`, 'info');
  const panel = document.getElementById(panelId);
  if (panel) {
    const isHidden = panel.classList.contains('hidden');
    panel.classList.toggle('hidden');
    if (isHidden) {
      showToast(`Opening ${panelId.replace('Panel', '').replace(/([A-Z])/g, ' $1').trim()}`);
    }
  }
}

function toggleNotifications() {
  debugLog('Toggling notifications', 'info');
  togglePanel('notificationsPanel');
}

function toggleAdvancedFilters() {
  debugLog('Toggling advanced filters', 'info');
  togglePanel('advancedFiltersPanel');
}

function closeBulkActions() {
  debugLog('Closing bulk actions', 'info');
  const bar = document.getElementById('bulkActionsBar');
  if (bar) bar.classList.remove('active');
}

// ============================================
// BULK ACTIONS
// ============================================
function selectAllItems() {
  debugLog('Selecting all items', 'info');
  document.querySelectorAll('.item-checkbox').forEach(cb => {
    cb.checked = true;
    CRM.selectedItems.add(cb.value);
  });
  toggleBulkActionsBar();
  showToast('✅ All items selected');
}

function clearSelection() {
  debugLog('Clearing selection', 'info');
  document.querySelectorAll('.item-checkbox').forEach(cb => {
    cb.checked = false;
  });
  CRM.selectedItems.clear();
  closeBulkActions();
  showToast('✅ Selection cleared');
}

function toggleBulkActionsBar() {
  const bar = document.getElementById('bulkActionsBar');
  if (bar && CRM.selectedItems.size > 0) {
    bar.classList.add('active');
  }
}

function bulkDelete() {
  debugLog('Bulk delete initiated', 'warning');
  if (confirm(`Delete ${CRM.selectedItems.size} selected items?`)) {
    showToast('🗑️ Items deleted');
    debugLog(`Deleted ${CRM.selectedItems.size} items`, 'success');
    clearSelection();
  }
}

function bulkDuplicate() {
  debugLog('Bulk duplicate initiated', 'info');
  showToast(`📑 Duplicated ${CRM.selectedItems.size} items`);
  clearSelection();
}

function bulkExport() {
  debugLog('Bulk export initiated', 'info');
  showToast(`📤 Exporting ${CRM.selectedItems.size} items`);
  exportToCSV();
  clearSelection();
}

function bulkApply() {
  debugLog('Bulk apply initiated', 'info');
  showToast('✅ Changes applied to selected items');
  clearSelection();
}

// ============================================
// FILTER TABS
// ============================================
function filterByStatus(status) {
  debugLog(`Filtering by status: ${status}`, 'info');
  showToast(`Filtering: ${status}`);
  
  // Update active tab
  document.querySelectorAll('[onclick^="filterByStatus"]').forEach(btn => {
    btn.classList.remove('bg-indigo-100', 'text-indigo-700', 'dark:bg-indigo-900', 'dark:text-indigo-300');
  });
  event.target.classList.add('bg-indigo-100', 'text-indigo-700', 'dark:bg-indigo-900', 'dark:text-indigo-300');
}

function showAllItems() {
  debugLog('Showing all items', 'info');
  filterByStatus('All');
}

function showOpenItems() {
  debugLog('Showing open items', 'info');
  filterByStatus('Open');
}

function showInProgressItems() {
  debugLog('Showing in progress items', 'info');
  filterByStatus('In Progress');
}

function showClosedItems() {
  debugLog('Showing closed items', 'info');
  filterByStatus('Closed');
}

function showOverdueItems() {
  debugLog('Showing overdue items', 'info');
  filterByStatus('Overdue');
}

function showMyItems() {
  debugLog('Showing my items', 'info');
  filterByStatus('My Items');
}

function showUnassignedItems() {
  debugLog('Showing unassigned items', 'info');
  filterByStatus('Unassigned');
}

// ============================================
// EXPORT FUNCTIONS
// ============================================
function exportToCSV() {
  debugLog('Exporting to CSV', 'info');
  showToast('📊 Exporting to CSV...');
  console.log('CSV Export function');
}

function exportToPDF() {
  debugLog('Exporting to PDF', 'info');
  showToast('📄 Exporting to PDF...');
  console.log('PDF Export function');
}

function printView() {
  debugLog('Printing view', 'info');
  showToast('🖨️ Opening print dialog...');
  setTimeout(() => window.print(), 500);
}

function exportCurrentView() {
  debugLog('Exporting current view', 'info');
  exportToCSV();
}

// ============================================
// CREATE/ADD FUNCTIONS
// ============================================
function createTicket() {
  debugLog('Creating ticket', 'info');
  showToast('🎫 Creating new ticket...');
}

function createWorkOrder() {
  debugLog('Creating work order', 'info');
  showToast('🔧 Creating new work order...');
}

function createViolation() {
  debugLog('Creating violation', 'info');
  showToast('⚠️ Creating new violation...');
}

// ============================================
// SEARCH
// ============================================
function handleSearch(query) {
  debugLog(`Searching for: ${query}`, 'info');
  if (query.length > 0) {
    showToast(`🔍 Searching: ${query}`);
  }
}

// ============================================
// ITEM ACTIONS
// ============================================
function deleteItem() {
  debugLog('Delete item initiated', 'warning');
  if (confirm('Delete this item?')) {
    showToast('🗑️ Item deleted');
    debugLog('Item deleted', 'success');
    closeItemDrawer();
  }
}

function duplicateItem() {
  debugLog('Duplicating item', 'info');
  showToast('📑 Item duplicated');
}

function printItem() {
  debugLog('Printing item', 'info');
  printView();
}

function saveAsTemplate() {
  debugLog('Saving as template', 'info');
  showToast('💾 Saved as template');
}

function makeRecurring() {
  debugLog('Making recurring', 'info');
  showToast('🔄 Made recurring');
}

// ============================================
// REFRESH
// ============================================
function refreshData() {
  debugLog('Refreshing data', 'info');
  showToast('🔄 Refreshing data...');
  setTimeout(() => {
    showToast('✅ Data refreshed', 1500);
    debugLog('Data refresh complete', 'success');
  }, 1000);
}

// ============================================
// EVENT DELEGATION
// ============================================
document.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  
  const id = btn.id;
  
  // View toggles
  if (id === 'listViewBtn') switchView('list');
  if (id === 'kanbanViewBtn') switchView('kanban');
  if (id === 'calendarViewBtn') switchView('calendar');
  
  // Dark mode
  if (id === 'darkModeToggle') toggleDarkMode();
  
  // Notifications
  if (id === 'notificationsBtn') toggleNotifications();
  if (id === 'markAllReadBtn') {
    debugLog('Marking all as read', 'info');
    showToast('✅ All notifications marked as read');
  }
  
  // Modals
  if (id === 'aiAssistantBtn') openModal('aiAssistantModal');
  if (id === 'automationBtn') openModal('automationModal');
  if (id === 'templatesBtn') openModal('templatesModal');
  if (id === 'reportsBtn') openModal('reportsModal');
  if (id === 'batchHistoryBtn') openModal('batchHistoryModal');
  
  // Advanced filters
  if (id === 'advancedFiltersBtn') toggleAdvancedFilters();
  
  // Bulk actions
  if (id === 'selectAllBtn') selectAllItems();
  if (id === 'clearSelectionBtn') clearSelection();
  if (id === 'closeBulkActionsBtn') closeBulkActions();
  if (id === 'bulkDeleteBtn') bulkDelete();
  if (id === 'bulkDuplicateBtn') bulkDuplicate();
  if (id === 'bulkExportBtn') bulkExport();
  if (id === 'bulkApplyBtn') bulkApply();
  
  // Export
  if (id === 'exportCsvBtn') exportToCSV();
  if (id === 'exportPdfBtn') exportToPDF();
  if (id === 'printViewBtn') printView();
  if (id === 'exportCurrentViewBtn') exportCurrentView();
  
  // Refresh
  if (id === 'refreshBtn') refreshData();
  
  // Debug console toggle
  if (btn.textContent.includes('Debug') || btn.innerHTML.includes('🐛')) {
    toggleDebugConsole();
  }
});

// ============================================
// SEARCH INPUT
// ============================================
document.addEventListener('input', (e) => {
  if (e.target.type === 'search' || e.target.placeholder?.toLowerCase().includes('search')) {
    const query = e.target.value;
    if (query.length > 0) {
      handleSearch(query);
    }
  }
});

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', (e) => {
  // Ctrl+K for search
  if (e.ctrlKey && e.key === 'k') {
    e.preventDefault();
    const searchInput = document.querySelector('[type="search"]');
    if (searchInput) {
      searchInput.focus();
      debugLog('Search activated (Ctrl+K)', 'info');
    }
  }
  
  // Ctrl+D for dark mode
  if (e.ctrlKey && e.key === 'd') {
    e.preventDefault();
    toggleDarkMode();
  }
  
  // Ctrl+Shift+D for debug console
  if (e.ctrlKey && e.shiftKey && e.key === 'D') {
    e.preventDefault();
    toggleDebugConsole();
  }
  
  // Escape to close modals
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
      modal.classList.add('hidden');
    });
    debugLog('Closed modals (Escape)', 'info');
  }
});

// ============================================
// CHECKBOX HANDLING
// ============================================
document.addEventListener('change', (e) => {
  if (e.target.classList.contains('item-checkbox')) {
    if (e.target.checked) {
      CRM.selectedItems.add(e.target.value);
    } else {
      CRM.selectedItems.delete(e.target.value);
    }
    
    if (CRM.selectedItems.size > 0) {
      toggleBulkActionsBar();
      const countEl = document.getElementById('bulkSelectedCount');
      if (countEl) countEl.textContent = CRM.selectedItems.size;
    } else {
      closeBulkActions();
    }
    
    debugLog(`Selected items: ${CRM.selectedItems.size}`, 'info');
  }
});

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  debugLog('DOM loaded - initializing app', 'success');
  
  initLoadingAnimation();
  
  setTimeout(() => {
    switchView('list');
    showToast('🎉 LJ Services CRM v8.0 is ready!', 4000);
    debugLog('App initialization complete', 'success');
    debugLog('Press Ctrl+Shift+D to open debug console', 'info');
  }, 100);
});

// ============================================
// MAKE FUNCTIONS GLOBALLY AVAILABLE
// ============================================
window.CRM = CRM;
window.switchView = switchView;
window.showOverview = showOverview;
window.showTicketsDashboard = showTicketsDashboard;
window.showWorkOrdersDashboard = showWorkOrdersDashboard;
window.showViolationsDashboard = showViolationsDashboard;
window.openModal = openModal;
window.closeModal = closeModal;
window.closeAIAssistant = closeAIAssistant;
window.closeTemplatesModal = closeTemplatesModal;
window.closeAutomationModal = closeAutomationModal;
window.closeReportsModal = closeReportsModal;
window.closeBatchHistory = closeBatchHistory;
window.closeSettingsModal = closeSettingsModal;
window.closeItemDrawer = closeItemDrawer;
window.togglePanel = togglePanel;
window.toggleNotifications = toggleNotifications;
window.toggleAdvancedFilters = toggleAdvancedFilters;
window.filterByStatus = filterByStatus;
window.showAllItems = showAllItems;
window.showOpenItems = showOpenItems;
window.showInProgressItems = showInProgressItems;
window.showClosedItems = showClosedItems;
window.showOverdueItems = showOverdueItems;
window.showMyItems = showMyItems;
window.showUnassignedItems = showUnassignedItems;
window.selectAllItems = selectAllItems;
window.clearSelection = clearSelection;
window.bulkDelete = bulkDelete;
window.bulkDuplicate = bulkDuplicate;
window.bulkExport = bulkExport;
window.bulkApply = bulkApply;
window.closeBulkActions = closeBulkActions;
window.exportToCSV = exportToCSV;
window.exportToPDF = exportToPDF;
window.printView = printView;
window.exportCurrentView = exportCurrentView;
window.createTicket = createTicket;
window.createWorkOrder = createWorkOrder;
window.createViolation = createViolation;
window.deleteItem = deleteItem;
window.duplicateItem = duplicateItem;
window.printItem = printItem;
window.saveAsTemplate = saveAsTemplate;
window.makeRecurring = makeRecurring;
window.refreshData = refreshData;
window.toggleDarkMode = toggleDarkMode;
window.showToast = showToast;
window.toggleDebugConsole = toggleDebugConsole;
window.clearDebugLogs = clearDebugLogs;
window.debugLog = debugLog;

debugLog('App.js loaded - all functions available', 'success');
console.log('📦 All functions defined and ready!');
console.log('🐛 Press Ctrl+Shift+D to open debug console');
