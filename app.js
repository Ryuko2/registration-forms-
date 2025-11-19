// ============================================
// LJ SERVICES CRM - SIMPLE & COMPLETE
// Matches index-v5.html exactly
// ============================================

console.log('🚀 LJ Services CRM Loading...');

// Global storage
const CRM = {
  items: JSON.parse(localStorage.getItem('crmItems') || '[]'),
  darkMode: localStorage.getItem('theme') === 'dark'
};

// ============================================
// SAVE & LOAD
// ============================================
function saveItems() {
  localStorage.setItem('crmItems', JSON.stringify(CRM.items));
  console.log('✅ Saved', CRM.items.length, 'items');
}

// ============================================
// DRAWER FUNCTIONS
// ============================================
function openDrawer(type) {
  const drawerId = 'drawer' + type.charAt(0).toUpperCase() + type.slice(1);
  const drawer = document.getElementById(drawerId);
  if (drawer) {
    drawer.classList.remove('translate-x-full');
    drawer.classList.add('translate-x-0');
    console.log('✅ Opened drawer:', type);
    showToast(`Opening ${type} form`);
  }
}

function closeDrawer(drawerId) {
  const drawer = document.getElementById(drawerId);
  if (drawer) {
    drawer.classList.add('translate-x-full');
    drawer.classList.remove('translate-x-0');
    console.log('✅ Closed drawer:', drawerId);
  }
}

// ============================================
// CREATE FUNCTIONS
// ============================================
function createTicket() {
  const title = document.getElementById('ticketTitle')?.value || 'New Ticket';
  const desc = document.getElementById('ticketDesc')?.value || '';
  
  const item = {
    id: `TKT-${Date.now()}`,
    type: 'ticket',
    title: title,
    description: desc,
    status: 'open',
    priority: 'medium',
    created: new Date().toISOString(),
    createdBy: 'Kevin R'
  };
  
  CRM.items.unshift(item);
  saveItems();
  renderItems();
  closeDrawer('drawerTicket');
  showToast(`✅ Ticket created: ${item.id}`);
  console.log('✅ Created ticket:', item);
  
  // Clear form
  if (document.getElementById('ticketTitle')) document.getElementById('ticketTitle').value = '';
  if (document.getElementById('ticketDesc')) document.getElementById('ticketDesc').value = '';
}

function createWorkOrder() {
  const title = document.getElementById('woTitle')?.value || 'New Work Order';
  const desc = document.getElementById('woDesc')?.value || '';
  
  const item = {
    id: `WO-${Date.now()}`,
    type: 'workorder',
    title: title,
    description: desc,
    status: 'open',
    priority: 'medium',
    created: new Date().toISOString(),
    createdBy: 'Kevin R'
  };
  
  CRM.items.unshift(item);
  saveItems();
  renderItems();
  closeDrawer('drawerWorkOrder');
  showToast(`✅ Work Order created: ${item.id}`);
  console.log('✅ Created work order:', item);
  
  if (document.getElementById('woTitle')) document.getElementById('woTitle').value = '';
  if (document.getElementById('woDesc')) document.getElementById('woDesc').value = '';
}

function createViolation() {
  const title = document.getElementById('violationTitle')?.value || 'New Violation';
  const desc = document.getElementById('violationDesc')?.value || '';
  
  const item = {
    id: `VIO-${Date.now()}`,
    type: 'violation',
    title: title,
    description: desc,
    status: 'open',
    severity: 'medium',
    created: new Date().toISOString(),
    createdBy: 'Kevin R'
  };
  
  CRM.items.unshift(item);
  saveItems();
  renderItems();
  closeDrawer('drawerViolation');
  showToast(`✅ Violation created: ${item.id}`);
  console.log('✅ Created violation:', item);
  
  if (document.getElementById('violationTitle')) document.getElementById('violationTitle').value = '';
  if (document.getElementById('violationDesc')) document.getElementById('violationDesc').value = '';
}

// ============================================
// RENDER ITEMS
// ============================================
function renderItems() {
  const tbody = document.querySelector('tbody');
  if (!tbody) return;
  
  if (CRM.items.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="10" class="text-center py-8 text-gray-500">
        No items yet. Click + Ticket, + Work Order, or + Violation to create one.
      </td></tr>`;
    return;
  }
  
  tbody.innerHTML = CRM.items.map(item => {
    const icon = { ticket: '🎫', workorder: '🔧', violation: '⚠️' }[item.type] || '📄';
    return `<tr class="border-b hover:bg-gray-50">
      <td class="px-4 py-3"><input type="checkbox" class="rounded"></td>
      <td class="px-4 py-3 font-mono text-sm">${icon} ${item.id}</td>
      <td class="px-4 py-3">${item.title}</td>
      <td class="px-4 py-3"><span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">${item.status}</span></td>
      <td class="px-4 py-3"><span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">${item.priority || item.severity}</span></td>
      <td class="px-4 py-3 text-sm">${item.createdBy}</td>
      <td class="px-4 py-3 text-sm">${new Date(item.created).toLocaleDateString()}</td>
      <td class="px-4 py-3">
        <button onclick="deleteItem('${item.id}')" class="text-red-600 hover:text-red-800 text-sm">Delete</button>
      </td>
    </tr>`;
  }).join('');
  
  console.log('✅ Rendered', CRM.items.length, 'items');
}

function deleteItem(id) {
  if (confirm('Delete this item?')) {
    CRM.items = CRM.items.filter(i => i.id !== id);
    saveItems();
    renderItems();
    showToast('🗑️ Item deleted');
  }
}

// ============================================
// MODAL FUNCTIONS
// ============================================
function closeModal() {
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
}
function closeAIAssistant() { const m = document.getElementById('aiAssistantModal'); if (m) m.classList.add('hidden'); }
function closeTemplatesModal() { const m = document.getElementById('templatesModal'); if (m) m.classList.add('hidden'); }
function closeAutomationModal() { const m = document.getElementById('automationModal'); if (m) m.classList.add('hidden'); }
function closeReportsModal() { const m = document.getElementById('reportsModal'); if (m) m.classList.add('hidden'); }
function closeBatchHistoryModal() { const m = document.getElementById('batchHistoryModal'); if (m) m.classList.add('hidden'); }
function closeSLAModal() { const m = document.getElementById('slaModal'); if (m) m.classList.add('hidden'); }
function closeImportExportModal() { const m = document.getElementById('importExportModal'); if (m) m.classList.add('hidden'); }

// ============================================
// TOAST
// ============================================
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl z-50';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================
// DARK MODE
// ============================================
function toggleDarkMode() {
  CRM.darkMode = !CRM.darkMode;
  document.documentElement.classList.toggle('dark');
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', CRM.darkMode ? 'dark' : 'light');
  showToast(CRM.darkMode ? '🌙 Dark mode' : '☀️ Light mode');
}

if (CRM.darkMode) {
  document.documentElement.classList.add('dark');
  document.body.classList.add('dark');
}

// ============================================
// EVENT DELEGATION
// ============================================
document.addEventListener('click', (e) => {
  // Handle drawer buttons
  const drawerBtn = e.target.closest('[data-open-drawer]');
  if (drawerBtn) {
    const type = drawerBtn.getAttribute('data-open-drawer');
    openDrawer(type);
    return;
  }
  
  // Handle dark mode
  if (e.target.id === 'darkModeToggle' || e.target.closest('#darkModeToggle')) {
    toggleDarkMode();
  }
});

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ DOM Ready');
  renderItems();
  showToast('🎉 LJ Services CRM Ready!');
  console.log('📊 Items:', CRM.items.length);
  console.log('💡 Click + buttons to create items');
});

// ============================================
// MAKE FUNCTIONS GLOBAL
// ============================================
window.CRM = CRM;
window.openDrawer = openDrawer;
window.closeDrawer = closeDrawer;
window.createTicket = createTicket;
window.createWorkOrder = createWorkOrder;
window.createViolation = createViolation;
window.renderItems = renderItems;
window.deleteItem = deleteItem;
window.saveItems = saveItems;
window.showToast = showToast;
window.toggleDarkMode = toggleDarkMode;
window.closeModal = closeModal;
window.closeAIAssistant = closeAIAssistant;
window.closeTemplatesModal = closeTemplatesModal;
window.closeAutomationModal = closeAutomationModal;
window.closeReportsModal = closeReportsModal;
window.closeBatchHistoryModal = closeBatchHistoryModal;
window.closeSLAModal = closeSLAModal;
window.closeImportExportModal = closeImportExportModal;

console.log('✅ All functions loaded');
console.log('✅ Ready to create tickets!');
