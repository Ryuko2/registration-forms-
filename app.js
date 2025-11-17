// ============================================
// MAIN APPLICATION JAVASCRIPT
// LJ Services Group Management Dashboard
// ============================================

// Global variables
let currentUser = null;
let tickets = [];
let workOrders = [];
let violations = [];
let currentPage = 'dashboard';

// 19 LJ Services Associations
const ASSOCIATIONS = [
    "Anthony Gardens (ANT)",
    "Bayshore Treasure Condominium (BTC)",
    "Cambridge (CAM)",
    "Eastside Condominium (EAST)",
    "Enclave Waterside Villas (EWVCA)",
    "Futura Sansovino (FSCA)",
    "Island Point South (IPSCA)",
    "Michelle Condominium (MICH)",
    "Monterrey Condominium (MTC)",
    "Normandy Shores (NORM)",
    "Oxford Gates (OX)",
    "Palms Of Sunset (POSS)",
    "Patricia Condominium (PAT)",
    "Ritz Royal (RITZ)",
    "Sage Condominium (SAGE)",
    "The Niche (NICHE)",
    "Tower Gates (TWG)",
    "Vizcaya Villas (VVC)",
    "Wilton Terrace (WTC)"
];

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing LJ Services Dashboard...');
    
    // Setup authentication state listener
    firebaseAuth.onAuthStateChanged(user => {
        if (user) {
            handleUserLogin(user);
        } else {
            showLoginScreen();
        }
    });
    
    // Setup event listeners
    setupEventListeners();
    
    // Populate association dropdowns
    populateAssociationDropdowns();
    
    // Setup mobile menu
    setupMobileMenu();
});

// ============================================
// AUTHENTICATION
// ============================================

function setupEventListeners() {
    // Microsoft login button
    const loginBtn = document.getElementById('microsoftLoginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleMicrosoftLogin);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            navigateToPage(page);
        });
    });
    
    // Create buttons
    const createTicketBtn = document.getElementById('createTicketBtn');
    if (createTicketBtn) {
        createTicketBtn.addEventListener('click', () => openModal('ticketModal'));
    }
    
    const createWorkOrderBtn = document.getElementById('createWorkOrderBtn');
    if (createWorkOrderBtn) {
        createWorkOrderBtn.addEventListener('click', () => openModal('workOrderModal'));
    }
    
    const createViolationBtn = document.getElementById('createViolationBtn');
    if (createViolationBtn) {
        createViolationBtn.addEventListener('click', () => openModal('violationModal'));
    }
    
    // Filters and search
    setupFiltersAndSearch();
}

async function handleMicrosoftLogin() {
    const loginBtn = document.getElementById('microsoftLoginBtn');
    const errorDiv = document.getElementById('loginError');
    
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    errorDiv.style.display = 'none';
    
    try {
        const result = await firebaseAuth.signInWithPopup(microsoftProvider);
        console.log('✅ Login successful:', result.user.email);
    } catch (error) {
        console.error('❌ Login error:', error);
        errorDiv.textContent = `Login failed: ${error.message}`;
        errorDiv.style.display = 'block';
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fab fa-microsoft"></i> Sign in with Microsoft';
    }
}

function handleUserLogin(user) {
    console.log('✅ User logged in:', user.email);
    
    currentUser = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        photo: user.photoURL
    };
    
    // Update UI
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('userAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
    
    // Show main app
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'flex';
    
    // Load data from Firebase
    loadAllData();
}

function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
}

async function handleLogout() {
    try {
        await firebaseAuth.signOut();
        console.log('✅ User logged out');
    } catch (error) {
        console.error('❌ Logout error:', error);
    }
}

// ============================================
// DATA MANAGEMENT
// ============================================

function loadAllData() {
    console.log('📡 Loading data from Firebase...');
    
    // Load tickets
    firebaseDatabase.ref('tickets').on('value', snapshot => {
        tickets = [];
        snapshot.forEach(child => {
            tickets.push({
                id: child.key,
                ...child.val()
            });
        });
        console.log(`✅ Loaded ${tickets.length} tickets`);
        renderTickets();
        updateStats();
    });
    
    // Load work orders
    firebaseDatabase.ref('workOrders').on('value', snapshot => {
        workOrders = [];
        snapshot.forEach(child => {
            workOrders.push({
                id: child.key,
                ...child.val()
            });
        });
        console.log(`✅ Loaded ${workOrders.length} work orders`);
        renderWorkOrders();
        updateStats();
    });
    
    // Load violations
    firebaseDatabase.ref('violations').on('value', snapshot => {
        violations = [];
        snapshot.forEach(child => {
            violations.push({
                id: child.key,
                ...child.val()
            });
        });
        console.log(`✅ Loaded ${violations.length} violations`);
        renderViolations();
        updateStats();
    });
}

// ============================================
// NAVIGATION
// ============================================

function navigateToPage(page) {
    currentPage = page;
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
    
    // Show/hide pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.add('hidden');
    });
    
    const pageElement = document.getElementById(`${page}Page`);
    if (pageElement) {
        pageElement.classList.remove('hidden');
    }
    
    // Close mobile menu
    closeMobileMenu();
    
    // Render appropriate content
    switch(page) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'tickets':
            renderTickets();
            break;
        case 'workorders':
            renderWorkOrders();
            break;
        case 'violations':
            renderViolations();
            break;
    }
}

// ============================================
// MODAL MANAGEMENT
// ============================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        
        // Clear form if it exists
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// ============================================
// TICKETS
// ============================================

async async function saveTicket() {
    const form = document.getElementById('ticketForm');
    const formData = new FormData(form);
    
    const ticket = {
        title: formData.get('title'),
        association: formData.get('association'),
        priority: formData.get('priority'),
        status: formData.get('status'),
        description: formData.get('description'),
        createdBy: currentUser.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    try {
        await firebaseDatabase.ref('tickets').push(ticket);
        console.log('✅ Ticket created successfully');
        closeModal('ticketModal');
        form.reset();
    } catch (error) {
        console.error('❌ Error creating ticket:', error);
        alert('Failed to create ticket. Please try again.');
    }
}

function renderTickets() {
    const container = document.getElementById('ticketsList');
    if (!container) return;
    
    // Apply filters
    let filteredTickets = [...tickets];
    
    const statusFilter = document.getElementById('ticketStatusFilter')?.value;
    const associationFilter = document.getElementById('ticketAssociationFilter')?.value;
    const searchQuery = document.getElementById('ticketSearch')?.value.toLowerCase();
    
    if (statusFilter) {
        filteredTickets = filteredTickets.filter(t => t.status === statusFilter);
    }
    
    if (associationFilter) {
        filteredTickets = filteredTickets.filter(t => t.association === associationFilter);
    }
    
    if (searchQuery) {
        filteredTickets = filteredTickets.filter(t => 
            t.title.toLowerCase().includes(searchQuery) ||
            (t.description && t.description.toLowerCase().includes(searchQuery))
        );
    }
    
    // Render tickets
    if (filteredTickets.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon"><i class="fas fa-ticket-alt"></i></div>
                <div class="empty-title">No tickets found</div>
                <div class="empty-text">Create your first ticket to get started</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredTickets.map(ticket => `
        <div class="card" onclick="viewTicket('${ticket.id}')">
            <div class="card-header">
                <div>
                    <div class="card-title">${ticket.title}</div>
                    <div class="card-meta">
                        <span class="badge badge-${ticket.status}">${ticket.status.replace('-', ' ')}</span>
                        <span class="badge badge-${ticket.priority}">${ticket.priority}</span>
                    </div>
                </div>
            </div>
            <div class="card-content">
                <p><i class="fas fa-building"></i> ${ticket.association}</p>
                ${ticket.description ? `<p style="margin-top: 8px;">${ticket.description.substring(0, 100)}${ticket.description.length > 100 ? '...' : ''}</p>` : ''}
            </div>
            <div class="card-footer">
                <span><i class="fas fa-user"></i> ${ticket.createdBy}</span>
                <span><i class="fas fa-clock"></i> ${formatDate(ticket.createdAt)}</span>
            </div>
        </div>
    `).join('');
}

function viewTicket(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    // Create a detail modal (you can expand this)
    alert(`Ticket: ${ticket.title}\n\nStatus: ${ticket.status}\nAssociation: ${ticket.association}\nPriority: ${ticket.priority}\n\nDescription: ${ticket.description || 'No description'}`);
}

// ============================================
// WORK ORDERS
// ============================================

async async function saveWorkOrder() {
    const form = document.getElementById('workOrderForm');
    const formData = new FormData(form);
    
    const workOrder = {
        title: formData.get('title'),
        association: formData.get('association'),
        type: formData.get('type'),
        status: formData.get('status'),
        description: formData.get('description'),
        createdBy: currentUser.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    try {
        await firebaseDatabase.ref('workOrders').push(workOrder);
        console.log('✅ Work order created successfully');
        closeModal('workOrderModal');
        form.reset();
    } catch (error) {
        console.error('❌ Error creating work order:', error);
        alert('Failed to create work order. Please try again.');
    }
}

function renderWorkOrders() {
    const container = document.getElementById('workOrdersList');
    if (!container) return;
    
    // Apply filters
    let filteredWorkOrders = [...workOrders];
    
    const statusFilter = document.getElementById('workOrderStatusFilter')?.value;
    const associationFilter = document.getElementById('workOrderAssociationFilter')?.value;
    const searchQuery = document.getElementById('workOrderSearch')?.value.toLowerCase();
    
    if (statusFilter) {
        filteredWorkOrders = filteredWorkOrders.filter(wo => wo.status === statusFilter);
    }
    
    if (associationFilter) {
        filteredWorkOrders = filteredWorkOrders.filter(wo => wo.association === associationFilter);
    }
    
    if (searchQuery) {
        filteredWorkOrders = filteredWorkOrders.filter(wo => 
            wo.title.toLowerCase().includes(searchQuery) ||
            (wo.description && wo.description.toLowerCase().includes(searchQuery))
        );
    }
    
    // Render work orders
    if (filteredWorkOrders.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon"><i class="fas fa-tools"></i></div>
                <div class="empty-title">No work orders found</div>
                <div class="empty-text">Create your first work order to get started</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredWorkOrders.map(wo => `
        <div class="card" onclick="viewWorkOrder('${wo.id}')">
            <div class="card-header">
                <div>
                    <div class="card-title">${wo.title}</div>
                    <div class="card-meta">
                        <span class="badge badge-${wo.status}">${wo.status.replace('-', ' ')}</span>
                        <span class="badge" style="background: #e0e7ff; color: #3730a3;">${wo.type}</span>
                    </div>
                </div>
            </div>
            <div class="card-content">
                <p><i class="fas fa-building"></i> ${wo.association}</p>
                ${wo.description ? `<p style="margin-top: 8px;">${wo.description.substring(0, 100)}${wo.description.length > 100 ? '...' : ''}</p>` : ''}
            </div>
            <div class="card-footer">
                <span><i class="fas fa-user"></i> ${wo.createdBy}</span>
                <span><i class="fas fa-clock"></i> ${formatDate(wo.createdAt)}</span>
            </div>
        </div>
    `).join('');
}

function viewWorkOrder(workOrderId) {
    const workOrder = workOrders.find(wo => wo.id === workOrderId);
    if (!workOrder) return;
    
    alert(`Work Order: ${workOrder.title}\n\nStatus: ${workOrder.status}\nType: ${workOrder.type}\nAssociation: ${workOrder.association}\n\nDescription: ${workOrder.description || 'No description'}`);
}

// ============================================
// VIOLATIONS
// ============================================

async async function saveViolation() {
    const form = document.getElementById('violationForm');
    const formData = new FormData(form);
    
    const violation = {
        homeowner: formData.get('homeowner'),
        association: formData.get('association'),
        unit: formData.get('unit'),
        violationType: formData.get('violationType'),
        step: parseInt(formData.get('step')),
        description: formData.get('description'),
        createdBy: currentUser.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
    };
    
    try {
        await firebaseDatabase.ref('violations').push(violation);
        console.log('✅ Violation created successfully');
        closeModal('violationModal');
        form.reset();
    } catch (error) {
        console.error('❌ Error creating violation:', error);
        alert('Failed to create violation. Please try again.');
    }
}

function renderViolations() {
    const container = document.getElementById('violationsList');
    if (!container) return;
    
    // Apply filters
    let filteredViolations = [...violations];
    
    const stepFilter = document.getElementById('violationStepFilter')?.value;
    const associationFilter = document.getElementById('violationAssociationFilter')?.value;
    const searchQuery = document.getElementById('violationSearch')?.value.toLowerCase();
    
    if (stepFilter) {
        filteredViolations = filteredViolations.filter(v => v.step === parseInt(stepFilter));
    }
    
    if (associationFilter) {
        filteredViolations = filteredViolations.filter(v => v.association === associationFilter);
    }
    
    if (searchQuery) {
        filteredViolations = filteredViolations.filter(v => 
            v.homeowner.toLowerCase().includes(searchQuery) ||
            v.violationType.toLowerCase().includes(searchQuery) ||
            (v.description && v.description.toLowerCase().includes(searchQuery))
        );
    }
    
    // Render violations
    if (filteredViolations.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <div class="empty-title">No violations found</div>
                <div class="empty-text">Create your first violation notice to get started</div>
            </div>
        `;
        return;
    }
    
    const stepLabels = {
        1: '1st Notice',
        2: '2nd Notice',
        3: '3rd Notice',
        4: 'Hearing Letter'
    };
    
    const stepColors = {
        1: 'background: #fef3c7; color: #92400e;',
        2: 'background: #fed7aa; color: #9a3412;',
        3: 'background: #fee2e2; color: #991b1b;',
        4: 'background: #fecaca; color: #7f1d1d;'
    };
    
    container.innerHTML = filteredViolations.map(v => `
        <div class="card" onclick="viewViolation('${v.id}')">
            <div class="card-header">
                <div>
                    <div class="card-title">${v.homeowner}</div>
                    <div class="card-meta">
                        <span class="badge" style="${stepColors[v.step]}">${stepLabels[v.step]}</span>
                        <span class="badge" style="background: #e0e7ff; color: #3730a3;">${v.violationType}</span>
                    </div>
                </div>
            </div>
            <div class="card-content">
                <p><i class="fas fa-building"></i> ${v.association}</p>
                <p><i class="fas fa-home"></i> Unit ${v.unit}</p>
                ${v.description ? `<p style="margin-top: 8px;">${v.description.substring(0, 100)}${v.description.length > 100 ? '...' : ''}</p>` : ''}
            </div>
            <div class="card-footer">
                <span><i class="fas fa-user"></i> ${v.createdBy}</span>
                <span><i class="fas fa-clock"></i> ${formatDate(v.createdAt)}</span>
            </div>
        </div>
    `).join('');
}

function viewViolation(violationId) {
    const violation = violations.find(v => v.id === violationId);
    if (!violation) return;
    
    const stepLabels = {
        1: '1st Notice (Warning)',
        2: '2nd Notice',
        3: '3rd Notice',
        4: 'Hearing Letter'
    };
    
    alert(`Violation: ${violation.homeowner}\n\nStep: ${stepLabels[violation.step]}\nType: ${violation.violationType}\nAssociation: ${violation.association}\nUnit: ${violation.unit}\n\nDescription: ${violation.description || 'No description'}`);
}

// ============================================
// DASHBOARD
// ============================================

function renderDashboard() {
    const container = document.getElementById('recentActivity');
    if (!container) return;
    
    // Combine all items and sort by date
    const allItems = [
        ...tickets.map(t => ({ ...t, type: 'ticket' })),
        ...workOrders.map(wo => ({ ...wo, type: 'workorder' })),
        ...violations.map(v => ({ ...v, type: 'violation' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
    
    if (allItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon"><i class="fas fa-chart-line"></i></div>
                <div class="empty-title">No activity yet</div>
                <div class="empty-text">Start creating tickets, work orders, or violations</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = allItems.map(item => {
        const typeConfig = {
            ticket: { icon: 'fa-ticket-alt', label: 'Ticket', color: '#667eea' },
            workorder: { icon: 'fa-tools', label: 'Work Order', color: '#764ba2' },
            violation: { icon: 'fa-exclamation-triangle', label: 'Violation', color: '#dc2626' }
        };
        
        const config = typeConfig[item.type];
        
        return `
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">${item.title || item.homeowner || 'Untitled'}</div>
                        <div class="card-meta">
                            <span class="badge" style="background: ${config.color}20; color: ${config.color};">
                                <i class="fas ${config.icon}"></i> ${config.label}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="card-content">
                    <p><i class="fas fa-building"></i> ${item.association}</p>
                </div>
                <div class="card-footer">
                    <span><i class="fas fa-user"></i> ${item.createdBy}</span>
                    <span><i class="fas fa-clock"></i> ${formatDate(item.createdAt)}</span>
                </div>
            </div>
        `;
    }).join('');
}

function updateStats() {
    // Update ticket stats
    const totalTicketsEl = document.getElementById('totalTickets');
    const openTicketsEl = document.getElementById('openTickets');
    
    if (totalTicketsEl) totalTicketsEl.textContent = tickets.length;
    if (openTicketsEl) openTicketsEl.textContent = tickets.filter(t => t.status === 'open').length;
    
    // Update work order stats
    const totalWorkOrdersEl = document.getElementById('totalWorkOrders');
    if (totalWorkOrdersEl) totalWorkOrdersEl.textContent = workOrders.length;
    
    // Update violation stats
    const totalViolationsEl = document.getElementById('totalViolations');
    if (totalViolationsEl) totalViolationsEl.textContent = violations.length;
    
    // Update dashboard if on dashboard page
    if (currentPage === 'dashboard') {
        renderDashboard();
    }
}

// ============================================
// FILTERS AND SEARCH
// ============================================

function setupFiltersAndSearch() {
    // Ticket filters
    const ticketStatusFilter = document.getElementById('ticketStatusFilter');
    const ticketAssociationFilter = document.getElementById('ticketAssociationFilter');
    const ticketSearch = document.getElementById('ticketSearch');
    
    if (ticketStatusFilter) ticketStatusFilter.addEventListener('change', renderTickets);
    if (ticketAssociationFilter) ticketAssociationFilter.addEventListener('change', renderTickets);
    if (ticketSearch) ticketSearch.addEventListener('input', renderTickets);
    
    // Work order filters
    const workOrderStatusFilter = document.getElementById('workOrderStatusFilter');
    const workOrderAssociationFilter = document.getElementById('workOrderAssociationFilter');
    const workOrderSearch = document.getElementById('workOrderSearch');
    
    if (workOrderStatusFilter) workOrderStatusFilter.addEventListener('change', renderWorkOrders);
    if (workOrderAssociationFilter) workOrderAssociationFilter.addEventListener('change', renderWorkOrders);
    if (workOrderSearch) workOrderSearch.addEventListener('input', renderWorkOrders);
    
    // Violation filters
    const violationStepFilter = document.getElementById('violationStepFilter');
    const violationAssociationFilter = document.getElementById('violationAssociationFilter');
    const violationSearch = document.getElementById('violationSearch');
    
    if (violationStepFilter) violationStepFilter.addEventListener('change', renderViolations);
    if (violationAssociationFilter) violationAssociationFilter.addEventListener('change', renderViolations);
    if (violationSearch) violationSearch.addEventListener('input', renderViolations);
}

// ============================================
// UTILITIES
// ============================================

function populateAssociationDropdowns() {
    const selectors = [
        '#ticketForm select[name="association"]',
        '#workOrderForm select[name="association"]',
        '#violationForm select[name="association"]',
        '#ticketAssociationFilter',
        '#workOrderAssociationFilter',
        '#violationAssociationFilter'
    ];
    
    selectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            const isFilter = selector.includes('Filter');
            const options = ASSOCIATIONS.map(assoc => 
                `<option value="${assoc}">${assoc}</option>`
            ).join('');
            
            if (isFilter) {
                element.innerHTML = '<option value="">All Associations</option>' + options;
            } else {
                element.innerHTML = '<option value="">Select Association</option>' + options;
            }
        }
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
}

function setupMobileMenu() {
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const sidebar = document.getElementById('sidebar');
    
    // Show mobile button on small screens
    function checkMobile() {
        if (window.innerWidth <= 768) {
            mobileBtn.style.display = 'flex';
        } else {
            mobileBtn.style.display = 'none';
            sidebar.classList.remove('mobile-open');
            mobileOverlay.classList.remove('active');
        }
    }
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Toggle menu
    mobileBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
        mobileOverlay.classList.toggle('active');
    });
    
    // Close on overlay click
    mobileOverlay.addEventListener('click', closeMobileMenu);
}

function closeMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    sidebar.classList.remove('mobile-open');
    mobileOverlay.classList.remove('active');
}

// ============================================
// GLOBAL EXPORTS
// ============================================

window.openModal = openModal;
window.closeModal = closeModal;
window.saveTicket = saveTicket;
window.saveWorkOrder = saveWorkOrder;
window.saveViolation = saveViolation;
window.viewTicket = viewTicket;
window.viewWorkOrder = viewWorkOrder;
window.viewViolation = viewViolation;

console.log('✅ Application initialized successfully!');
