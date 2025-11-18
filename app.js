// ============================================
// LJ SERVICES GROUP - PROFESSIONAL CRM
// With Modal, Comments, and Status Management
// ============================================

console.log("🚀 Loading Professional CRM with Modal + Comments...");

const LJ_STATE = {
  db: null,
  tickets: {},
  workOrders: {},
  violations: {},
  currentItem: null, // Currently open item in modal
  searchQuery: "",
  filterStatus: "all",
  attachments: {}, // File attachments storage
  emailConfig: {
    notifyOnComment: true,
    notifyOnStatusChange: true,
    notifyEmail: "", // Will be set from user or item
  },
};

// ---------- Initialization ----------

document.addEventListener("DOMContentLoaded", () => {
  try {
    initFirebaseBinding();
    initUserProfile();
    initDashboardNavigation();
    initDrawers();
    initModal();
    initSearch();
    initFilters();
    initFileUpload();
    initExport();
    initRealtimeListeners();
    initLogoutButton();
    console.log("✅ Professional CRM initialized!");
  } catch (err) {
    console.error("❌ Error initializing app:", err);
  }
});

function initFirebaseBinding() {
  if (!window.firebase || !firebase.apps.length) {
    console.error("Firebase is not initialized.");
    return;
  }
  LJ_STATE.db = firebase.database();
  console.log("🔥 Firebase ready:", LJ_STATE.db.ref().toString());

  const dbUrlLabel = document.getElementById("dbUrlLabel");
  if (dbUrlLabel && firebase.apps[0].options.databaseURL) {
    dbUrlLabel.textContent = firebase.apps[0].options.databaseURL;
  }
}

function initUserProfile() {
  const nameEl = document.getElementById("userName");
  const emailEl = document.getElementById("userEmail");
  const user = window.currentUser || { name: "Kevin R", email: "kevinr@ljservicesgroup.com" };
  
  if (nameEl) nameEl.textContent = user.name || "User";
  if (emailEl) emailEl.textContent = user.email || "";
  console.log("✅ User:", user.email);
}

function initLogoutButton() {
  const btn = document.getElementById("logoutBtn");
  if (btn) {
    btn.addEventListener("click", () => alert("Logout logic here"));
  }
}

// ---------- Dashboard Navigation ----------

function initDashboardNavigation() {
  const tabButtons = document.querySelectorAll(".dashboard-tab");
  const views = document.querySelectorAll("[data-dashboard-view]");
  const mobileSelect = document.getElementById("mobileDashboardSelect");
  const titleEl = document.getElementById("dashboardTitle");
  const subtitleEl = document.getElementById("dashboardSubtitle");

  const LABELS = {
    main: { title: "Overview", subtitle: "High-level activity across all items." },
    tickets: { title: "Tickets Dashboard", subtitle: "General tickets and internal tasks." },
    workOrders: { title: "Work Orders Dashboard", subtitle: "Vendor work and maintenance." },
    violations: { title: "Violations Dashboard", subtitle: "CC&R enforcement." },
  };

  function setDashboard(id) {
    tabButtons.forEach((btn) => {
      const isActive = btn.dataset.dashboard === id;
      btn.classList.toggle("bg-indigo-50", isActive);
      btn.classList.toggle("text-indigo-700", isActive);
      btn.classList.toggle("text-slate-600", !isActive);
    });

    views.forEach((view) => {
      view.classList.toggle("hidden", view.dataset.dashboardView !== id);
    });

    if (mobileSelect && mobileSelect.value !== id) mobileSelect.value = id;
    if (LABELS[id]) {
      if (titleEl) titleEl.textContent = LABELS[id].title;
      if (subtitleEl) subtitleEl.textContent = LABELS[id].subtitle;
    }
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => setDashboard(btn.dataset.dashboard || "main"));
  });

  if (mobileSelect) {
    mobileSelect.addEventListener("change", (e) => setDashboard(e.target.value || "main"));
  }

  setDashboard("main");
}

// ---------- Search & Filters ----------

function initSearch() {
  const searchInput = document.getElementById("globalSearch");
  const clearButton = document.getElementById("clearFilters");
  
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    LJ_STATE.searchQuery = e.target.value.toLowerCase().trim();
    updateResultsCount();
    renderTables();
    
    // Show/hide clear button
    if (clearButton) {
      clearButton.classList.toggle("hidden", !LJ_STATE.searchQuery && LJ_STATE.filterStatus === "all");
    }
  });

  // Clear filters button
  if (clearButton) {
    clearButton.addEventListener("click", () => {
      LJ_STATE.searchQuery = "";
      LJ_STATE.filterStatus = "all";
      searchInput.value = "";
      
      // Reset filter buttons
      const filterButtons = document.querySelectorAll("[data-filter-status]");
      filterButtons.forEach((btn) => {
        btn.classList.remove("bg-indigo-100", "text-indigo-700");
        btn.classList.add("bg-slate-100", "text-slate-600");
        if (btn.dataset.filterStatus === "all") {
          btn.classList.add("bg-indigo-100", "text-indigo-700");
          btn.classList.remove("bg-slate-100", "text-slate-600");
        }
      });
      
      clearButton.classList.add("hidden");
      updateResultsCount();
      renderTables();
    });
  }
}

function initFilters() {
  const filterButtons = document.querySelectorAll("[data-filter-status]");
  const clearButton = document.getElementById("clearFilters");
  
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Update active button
      filterButtons.forEach((b) => {
        b.classList.remove("bg-indigo-100", "text-indigo-700");
        b.classList.add("bg-slate-100", "text-slate-600");
      });
      btn.classList.add("bg-indigo-100", "text-indigo-700");
      btn.classList.remove("bg-slate-100", "text-slate-600");
      
      // Set filter
      LJ_STATE.filterStatus = btn.dataset.filterStatus || "all";
      updateResultsCount();
      renderTables();
      
      // Show/hide clear button
      if (clearButton) {
        clearButton.classList.toggle("hidden", !LJ_STATE.searchQuery && LJ_STATE.filterStatus === "all");
      }
    });
  });
}

function updateResultsCount() {
  const resultsEl = document.getElementById("searchResults");
  if (!resultsEl) return;

  const ticketsArray = objToArray(LJ_STATE.tickets);
  const workOrdersArray = objToArray(LJ_STATE.workOrders);
  const violationsArray = objToArray(LJ_STATE.violations);
  const allItems = [...ticketsArray, ...workOrdersArray, ...violationsArray];

  let filtered = applyFilters(allItems);
  
  const total = allItems.length;
  const showing = filtered.length;
  
  if (LJ_STATE.searchQuery || LJ_STATE.filterStatus !== "all") {
    resultsEl.textContent = `Showing ${showing} of ${total} items`;
  } else {
    resultsEl.textContent = `${total} total items`;
  }
}

function applyFilters(items) {
  let filtered = items;

  // Apply search filter
  if (LJ_STATE.searchQuery) {
    filtered = filtered.filter((item) => {
      const searchable = [
        item.title,
        item.association,
        item.referenceNumber,
        item.vendor,
        item.ruleBroken,
        item.description,
        item.status,
        item.priority,
      ].join(" ").toLowerCase();
      return searchable.includes(LJ_STATE.searchQuery);
    });
  }

  // Apply status filter
  if (LJ_STATE.filterStatus !== "all") {
    filtered = filtered.filter((item) => 
      (item.status || "").toLowerCase() === LJ_STATE.filterStatus.toLowerCase()
    );
  }

  return filtered;
}

// ---------- File Upload System ----------

function initFileUpload() {
  const fileInput = document.getElementById("fileInput");
  if (!fileInput) return;

  fileInput.addEventListener("change", (e) => {
    handleFileUpload(e.target.files);
    fileInput.value = ""; // Reset input
  });
}

function handleFileUpload(files) {
  if (!files || !files.length || !LJ_STATE.currentItem) return;

  const { id, type } = LJ_STATE.currentItem;
  const path = type === "ticket" ? "tickets" : type === "workOrder" ? "workOrders" : "violations";

  Array.from(files).forEach((file) => {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast(`${file.name} is too large (max 5MB)`, "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const attachment = {
        name: file.name,
        size: file.size,
        type: file.type,
        data: e.target.result, // Base64 data
        uploadedBy: window.currentUser?.name || "User",
        uploadedAt: Date.now(),
      };

      const attachmentId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      LJ_STATE.db.ref(`${path}/${id}/attachments/${attachmentId}`).set(attachment)
        .then(() => {
          showToast(`${file.name} uploaded!`, "success");
          addHistoryEntry("file_uploaded", `File uploaded: ${file.name}`);
          sendEmailNotification("file_uploaded", `New file attached: ${file.name}`);
        })
        .catch((err) => {
          console.error("Error uploading file:", err);
          showToast(`Error uploading ${file.name}`, "error");
        });
    };

    reader.readAsDataURL(file);
  });
}

function loadAttachments() {
  if (!LJ_STATE.currentItem || !LJ_STATE.db) return;

  const { id, type } = LJ_STATE.currentItem;
  const path = type === "ticket" ? "tickets" : type === "workOrder" ? "workOrders" : "violations";

  LJ_STATE.db.ref(`${path}/${id}/attachments`).on("value", (snap) => {
    const attachments = snap.val() || {};
    renderAttachments(attachments);
  });
}

function renderAttachments(attachments) {
  const container = document.getElementById("attachmentsList");
  if (!container) return;

  const attachmentsArray = Object.entries(attachments).sort((a, b) => 
    (b[1].uploadedAt || 0) - (a[1].uploadedAt || 0)
  );

  if (!attachmentsArray.length) {
    container.innerHTML = '<p class="text-xs text-slate-400 text-center py-4">No attachments yet</p>';
    return;
  }

  container.innerHTML = attachmentsArray.map(([id, attachment]) => {
    const icon = attachment.type.startsWith('image/') ? '🖼️' :
                 attachment.type.includes('pdf') ? '📄' :
                 attachment.type.includes('word') ? '📝' :
                 attachment.type.includes('excel') || attachment.type.includes('sheet') ? '📊' : '📎';

    const sizeKB = Math.round(attachment.size / 1024);
    const timeStr = attachment.uploadedAt ? new Date(attachment.uploadedAt).toLocaleString() : "";

    return `
      <div class="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 group">
        <span class="text-lg">${icon}</span>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-medium text-slate-900 truncate">${escapeHtml(attachment.name)}</p>
          <p class="text-[10px] text-slate-500">${sizeKB}KB • ${escapeHtml(attachment.uploadedBy || "")}</p>
        </div>
        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onclick="downloadAttachment('${escapeAttr(attachment.data)}', '${escapeAttr(attachment.name)}')"
            class="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
            title="Download"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button 
            onclick="deleteAttachment('${escapeAttr(id)}')"
            class="p-1 text-rose-600 hover:bg-rose-50 rounded"
            title="Delete"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function downloadAttachment(data, filename) {
  const link = document.createElement('a');
  link.href = data;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function deleteAttachment(attachmentId) {
  if (!LJ_STATE.currentItem || !LJ_STATE.db) return;
  if (!confirm("Delete this file?")) return;

  const { id, type } = LJ_STATE.currentItem;
  const path = type === "ticket" ? "tickets" : type === "workOrder" ? "workOrders" : "violations";

  LJ_STATE.db.ref(`${path}/${id}/attachments/${attachmentId}`).remove()
    .then(() => {
      showToast("File deleted", "success");
      addHistoryEntry("file_deleted", "File was deleted");
    })
    .catch((err) => {
      console.error("Error deleting file:", err);
      showToast("Error deleting file", "error");
    });
}

// Make functions available globally
window.downloadAttachment = downloadAttachment;
window.deleteAttachment = deleteAttachment;

// ---------- Email Notifications ----------

function sendEmailNotification(eventType, message) {
  // Get notification settings
  const notifyOnComment = document.getElementById("notifyOnComment")?.checked ?? true;
  const notifyOnStatusChange = document.getElementById("notifyOnStatusChange")?.checked ?? true;
  const notifyEmail = document.getElementById("notifyEmail")?.value || window.currentUser?.email;

  // Check if we should notify for this event
  if (eventType === "comment_added" && !notifyOnComment) return;
  if (eventType === "status_changed" && !notifyOnStatusChange) return;
  if (!notifyEmail) return;

  const { title, referenceNumber, type } = LJ_STATE.currentItem || {};

  // Prepare email data
  const emailData = {
    to: notifyEmail,
    subject: `[${referenceNumber}] ${title}`,
    body: message,
    itemType: type,
    itemId: LJ_STATE.currentItem?.id,
    timestamp: Date.now(),
  };

  // Store notification request in Firebase (for your backend to process)
  if (LJ_STATE.db) {
    LJ_STATE.db.ref('notifications').push(emailData)
      .then(() => {
        console.log("📧 Email notification queued:", emailData);
      })
      .catch((err) => {
        console.error("Error queueing notification:", err);
      });
  }

  // Show toast
  showToast("Email notification sent!", "info");
}

// ---------- Export to CSV ----------

function initExport() {
  // Export current view button
  const exportViewBtn = document.getElementById("exportCurrentViewBtn");
  if (exportViewBtn) {
    exportViewBtn.addEventListener("click", () => {
      exportCurrentView();
    });
  }

  // Export from modal button
  const exportCsvBtn = document.getElementById("exportCsvBtn");
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener("click", () => {
      if (LJ_STATE.currentItem) {
        exportSingleItem(LJ_STATE.currentItem);
      }
    });
  }
}

function exportCurrentView() {
  const ticketsArray = objToArray(LJ_STATE.tickets);
  const workOrdersArray = objToArray(LJ_STATE.workOrders);
  const violationsArray = objToArray(LJ_STATE.violations);
  const allItems = [...ticketsArray, ...workOrdersArray, ...violationsArray];

  // Apply current filters
  const filtered = applyFilters(allItems);

  if (!filtered.length) {
    showToast("No items to export", "info");
    return;
  }

  exportToCSV(filtered, "LJ_Services_Export");
}

function exportSingleItem(item) {
  exportToCSV([item], `${item.referenceNumber || 'Item'}_Export`);
}

function exportToCSV(items, filename) {
  // Define CSV headers
  const headers = [
    "Reference Number",
    "Title",
    "Type",
    "Association",
    "Status",
    "Priority",
    "Vendor",
    "Rule Broken",
    "Description",
    "Created",
    "Created By",
    "Assigned To",
  ];

  // Convert items to CSV rows
  const rows = items.map(item => {
    const type = item.dashboard?.includes("Work Order") ? "Work Order" :
                 item.dashboard?.includes("Violation") ? "Violation" : "Ticket";

    return [
      item.referenceNumber || "",
      item.title || "",
      type,
      item.association || "",
      item.status || "",
      item.priority || "",
      item.vendor || "",
      item.ruleBroken || "",
      (item.description || "").replace(/"/g, '""'), // Escape quotes
      item.createdAt || "",
      item.createdBy || "",
      item.assignedTo || "",
    ];
  });

  // Build CSV content
  let csv = headers.join(",") + "\n";
  rows.forEach(row => {
    csv += row.map(cell => `"${cell}"`).join(",") + "\n";
  });

  // Create download link
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast(`Exported ${items.length} items to CSV`, "success");
}

// ---------- Drawer Management ----------

function initDrawers() {
  const backdrop = document.getElementById("drawerBackdrop");
  
  initSingleDrawer("ticket", "ticketDrawer", "ticketForm", createTicket);
  initSingleDrawer("workOrder", "workOrderDrawer", "workOrderForm", createWorkOrder);
  initSingleDrawer("violation", "violationDrawer", "violationForm", createViolation);

  if (backdrop) {
    backdrop.addEventListener("click", closeAllDrawers);
  }
}

function initSingleDrawer(type, drawerId, formId, submitHandler) {
  const drawer = document.getElementById(drawerId);
  const form = document.getElementById(formId);
  const openButtons = document.querySelectorAll(`[data-open-drawer="${type}"]`);
  const closeButtons = drawer?.querySelectorAll("[data-close-drawer]");

  if (!drawer || !form) return;

  openButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      closeAllDrawers();
      closeModal();
      form.reset();
      openDrawer(drawer);
    });
  });

  closeButtons.forEach((btn) => {
    btn.addEventListener("click", () => closeDrawer(drawer));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submitHandler(form)
      .then(() => {
        closeDrawer(drawer);
        form.reset();
        showToast("Created successfully!", "success");
      })
      .catch((err) => {
        console.error("Error:", err);
        showToast("Error creating item", "error");
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
}

function closeDrawer(drawer) {
  drawer.classList.remove("drawer-open");
  drawer.classList.add("drawer-enter");
  
  setTimeout(() => {
    const anyOpen = document.querySelector(".drawer-open");
    if (!anyOpen) {
      const backdrop = document.getElementById("drawerBackdrop");
      if (backdrop) {
        backdrop.classList.add("pointer-events-none", "opacity-0");
        backdrop.classList.remove("opacity-100");
      }
    }
  }, 100);
}

function closeAllDrawers() {
  ["ticketDrawer", "workOrderDrawer", "violationDrawer"].forEach((id) => {
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

// ---------- Modal Management ----------

function initModal() {
  const modal = document.getElementById("itemModal");
  const backdrop = document.getElementById("modalBackdrop");
  const closeButtons = document.querySelectorAll("[data-close-modal]");

  if (!modal || !backdrop) return;

  closeButtons.forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });

  backdrop.addEventListener("click", closeModal);

  // Status update
  const statusSelect = document.getElementById("modalStatus");
  if (statusSelect) {
    statusSelect.addEventListener("change", (e) => {
      updateItemStatus(e.target.value);
    });
  }

  // Comment form
  const commentForm = document.getElementById("commentForm");
  if (commentForm) {
    commentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      addComment();
    });
  }

  // Close button
  const closeBtn = document.getElementById("closeItemBtn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => updateItemStatus("Closed"));
  }

  // Delete button
  const deleteBtn = document.getElementById("deleteItemBtn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", deleteItem);
  }
}

function openModal(item, type) {
  const modal = document.getElementById("itemModal");
  const backdrop = document.getElementById("modalBackdrop");
  
  if (!modal || !backdrop) return;

  LJ_STATE.currentItem = { ...item, type };
  
  // Populate modal
  document.getElementById("modalTitle").textContent = item.title || "Untitled";
  document.getElementById("modalRefNumber").textContent = item.referenceNumber || item.id;
  document.getElementById("modalAssociation").textContent = item.association || "–";
  document.getElementById("modalStatus").value = item.status || "Open";
  document.getElementById("modalPriority").textContent = item.priority || "–";
  document.getElementById("modalCreated").textContent = item.createdAt 
    ? new Date(item.createdAt).toLocaleString() 
    : "–";
  document.getElementById("modalDescription").textContent = item.description || "No description.";

  // Type-specific fields
  const vendorSection = document.getElementById("modalVendorSection");
  const violationSection = document.getElementById("modalViolationSection");

  if (vendorSection) vendorSection.classList.add("hidden");
  if (violationSection) violationSection.classList.add("hidden");

  if (type === "workOrder" && vendorSection) {
    vendorSection.classList.remove("hidden");
    document.getElementById("modalVendor").textContent = item.vendor || "–";
    document.getElementById("modalEstimatedCost").textContent = item.estimatedCost || "–";
  } else if (type === "violation" && violationSection) {
    violationSection.classList.remove("hidden");
    document.getElementById("modalRuleBroken").textContent = item.ruleBroken || "–";
    document.getElementById("modalNoticeStep").textContent = item.noticeStep || "–";
  }

  // Load comments and history
  loadComments();
  loadHistory();
  loadAttachments();

  // Set email notification settings
  const notifyEmailInput = document.getElementById("notifyEmail");
  if (notifyEmailInput) {
    notifyEmailInput.value = item.notifyEmail || window.currentUser?.email || "";
  }

  // Show modal
  modal.classList.remove("modal-enter");
  modal.classList.add("modal-open");
  modal.classList.remove("pointer-events-none");
  backdrop.classList.remove("pointer-events-none", "opacity-0");
  backdrop.classList.add("opacity-100");
}

function closeModal() {
  const modal = document.getElementById("itemModal");
  const backdrop = document.getElementById("modalBackdrop");
  
  if (!modal || !backdrop) return;

  modal.classList.remove("modal-open");
  modal.classList.add("modal-enter");
  modal.classList.add("pointer-events-none");
  backdrop.classList.add("pointer-events-none", "opacity-0");
  backdrop.classList.remove("opacity-100");

  LJ_STATE.currentItem = null;
}

// ---------- Comments System ----------

function loadComments() {
  if (!LJ_STATE.currentItem || !LJ_STATE.db) return;

  const { id, type } = LJ_STATE.currentItem;
  const path = type === "ticket" ? "tickets" : type === "workOrder" ? "workOrders" : "violations";

  LJ_STATE.db.ref(`${path}/${id}/comments`).on("value", (snap) => {
    const comments = snap.val() || {};
    renderComments(comments);
  });
}

function renderComments(comments) {
  const container = document.getElementById("commentsList");
  if (!container) return;

  const commentsArray = Object.values(comments).sort((a, b) => 
    (b.timestamp || 0) - (a.timestamp || 0)
  );

  if (!commentsArray.length) {
    container.innerHTML = '<p class="text-xs text-slate-400 text-center py-4">No comments yet. Add the first one!</p>';
    return;
  }

  container.innerHTML = commentsArray.map((comment) => {
    const initial = (comment.author || "U").charAt(0).toUpperCase();
    const timeStr = comment.timestamp ? new Date(comment.timestamp).toLocaleString() : "";
    
    return `
      <div class="flex gap-3">
        <div class="flex-shrink-0">
          <div class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <span class="text-xs font-semibold text-indigo-700">${initial}</span>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-slate-900">${escapeHtml(comment.author || "Unknown")}</span>
            <span class="text-[10px] text-slate-400">${timeStr}</span>
          </div>
          <p class="text-sm text-slate-700 mt-1">${escapeHtml(comment.text || "")}</p>
        </div>
      </div>
    `;
  }).join("");
}

function addComment() {
  if (!LJ_STATE.currentItem || !LJ_STATE.db) return;

  const textarea = document.getElementById("commentInput");
  const text = textarea.value.trim();

  if (!text) return;

  const { id, type } = LJ_STATE.currentItem;
  const path = type === "ticket" ? "tickets" : type === "workOrder" ? "workOrders" : "violations";

  const comment = {
    text,
    author: window.currentUser?.name || "User",
    authorEmail: window.currentUser?.email || "",
    timestamp: Date.now(),
  };

  const commentId = `comment-${Date.now()}`;

  LJ_STATE.db.ref(`${path}/${id}/comments/${commentId}`).set(comment)
    .then(() => {
      textarea.value = "";
      addHistoryEntry("comment_added", `Comment added by ${comment.author}`);
      sendEmailNotification("comment_added", `${comment.author} commented: "${comment.text}"`);
      showToast("Comment added!", "success");
    })
    .catch((err) => {
      console.error("Error adding comment:", err);
      showToast("Error adding comment", "error");
    });
}

// ---------- Status Updates ----------

function updateItemStatus(newStatus) {
  if (!LJ_STATE.currentItem || !LJ_STATE.db) return;

  const { id, type, status: oldStatus } = LJ_STATE.currentItem;
  const path = type === "ticket" ? "tickets" : type === "workOrder" ? "workOrders" : "violations";

  LJ_STATE.db.ref(`${path}/${id}`).update({
    status: newStatus,
    lastUpdated: Date.now(),
  })
  .then(() => {
    LJ_STATE.currentItem.status = newStatus;
    addHistoryEntry("status_changed", `Status changed from "${oldStatus}" to "${newStatus}"`);
    sendEmailNotification("status_changed", `Status changed from "${oldStatus}" to "${newStatus}"`);
    showToast(`Status updated to ${newStatus}`, "success");
  })
  .catch((err) => {
    console.error("Error updating status:", err);
    showToast("Error updating status", "error");
  });
}

// ---------- History Timeline ----------

function loadHistory() {
  if (!LJ_STATE.currentItem || !LJ_STATE.db) return;

  const { id, type } = LJ_STATE.currentItem;
  const path = type === "ticket" ? "tickets" : type === "workOrder" ? "workOrders" : "violations";

  LJ_STATE.db.ref(`${path}/${id}/history`).on("value", (snap) => {
    const history = snap.val() || {};
    renderHistory(history);
  });
}

function renderHistory(history) {
  const container = document.getElementById("historyList");
  if (!container) return;

  const historyArray = Object.values(history).sort((a, b) => 
    (b.timestamp || 0) - (a.timestamp || 0)
  );

  if (!historyArray.length) {
    container.innerHTML = '<p class="text-slate-400 text-center py-4">No history yet.</p>';
    return;
  }

  container.innerHTML = historyArray.map((entry) => {
    const icon = entry.action === "status_changed" ? "🔄" :
                 entry.action === "comment_added" ? "💬" :
                 entry.action === "created" ? "✨" :
                 entry.action === "file_uploaded" ? "📎" :
                 entry.action === "file_deleted" ? "🗑️" : "📝";

    const timeStr = entry.timestamp ? new Date(entry.timestamp).toLocaleString() : "";

    return `
      <div class="flex gap-2">
        <div class="text-base">${icon}</div>
        <div class="flex-1 min-w-0">
          <p class="text-slate-700">${escapeHtml(entry.description || "")}</p>
          <p class="text-[10px] text-slate-400 mt-0.5">${timeStr}</p>
        </div>
      </div>
    `;
  }).join("");
}

function addHistoryEntry(action, description) {
  if (!LJ_STATE.currentItem || !LJ_STATE.db) return;

  const { id, type } = LJ_STATE.currentItem;
  const path = type === "ticket" ? "tickets" : type === "workOrder" ? "workOrders" : "violations";

  const entry = {
    action,
    description,
    user: window.currentUser?.name || "User",
    timestamp: Date.now(),
  };

  const entryId = `history-${Date.now()}`;
  LJ_STATE.db.ref(`${path}/${id}/history/${entryId}`).set(entry);
}

// ---------- Delete Item ----------

function deleteItem() {
  if (!LJ_STATE.currentItem || !LJ_STATE.db) return;

  if (!confirm("Delete this item? This cannot be undone.")) return;

  const { id, type } = LJ_STATE.currentItem;
  const path = type === "ticket" ? "tickets" : type === "workOrder" ? "workOrders" : "violations";

  LJ_STATE.db.ref(`${path}/${id}`).remove()
    .then(() => {
      closeModal();
      showToast("Item deleted", "success");
    })
    .catch((err) => {
      console.error("Error deleting:", err);
      showToast("Error deleting item", "error");
    });
}

// ---------- Create Functions ----------

function createTicket(form) {
  if (!LJ_STATE.db) return Promise.reject(new Error("DB not ready"));

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
    status: "Open",
    description: get("description"),
    createdAt: now.toISOString(),
    createdAtMillis: now.getTime(),
    createdBy: window.currentUser?.email || "system",
    history: {
      "initial": {
        action: "created",
        description: `Ticket created by ${window.currentUser?.name || "User"}`,
        user: window.currentUser?.name || "User",
        timestamp: now.getTime(),
      }
    }
  };

  return LJ_STATE.db.ref(`tickets/${id}`).set(ticket);
}

function createWorkOrder(form) {
  if (!LJ_STATE.db) return Promise.reject(new Error("DB not ready"));

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
    estimatedCost: get("estimatedCost"),
    status: "Open",
    description: get("description"),
    createdAt: now.toISOString(),
    createdAtMillis: now.getTime(),
    createdBy: window.currentUser?.email || "system",
    history: {
      "initial": {
        action: "created",
        description: `Work order created by ${window.currentUser?.name || "User"}`,
        user: window.currentUser?.name || "User",
        timestamp: now.getTime(),
      }
    }
  };

  return LJ_STATE.db.ref(`workOrders/${id}`).set(workOrder);
}

function createViolation(form) {
  if (!LJ_STATE.db) return Promise.reject(new Error("DB not ready"));

  const get = (name) => (form.elements[name] ? form.elements[name].value.trim() : "");
  const now = new Date();
  const id = `VIO-${Date.now()}`;
  const refNum = `VIO-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;

  const violation = {
    id,
    referenceNumber: refNum,
    title: get("title"),
    association: get("association"),
    ruleBroken: get("ruleBroken"),
    noticeStep: get("noticeStep") || "1st Notice",
    status: "Open",
    description: get("description"),
    createdAt: now.toISOString(),
    createdAtMillis: now.getTime(),
    createdBy: window.currentUser?.email || "system",
    history: {
      "initial": {
        action: "created",
        description: `Violation created by ${window.currentUser?.name || "User"}`,
        user: window.currentUser?.name || "User",
        timestamp: now.getTime(),
      }
    }
  };

  return LJ_STATE.db.ref(`violations/${id}`).set(violation);
}

// ---------- Firebase Listeners ----------

function initRealtimeListeners() {
  if (!LJ_STATE.db) return;

  LJ_STATE.db.ref("tickets").on("value", (snap) => {
    LJ_STATE.tickets = snap.val() || {};
    renderAll();
  });

  LJ_STATE.db.ref("workOrders").on("value", (snap) => {
    LJ_STATE.workOrders = snap.val() || {};
    renderAll();
  });

  LJ_STATE.db.ref("violations").on("value", (snap) => {
    LJ_STATE.violations = snap.val() || {};
    renderAll();
  });
}

// ---------- Rendering ----------

function renderAll() {
  renderStatCards();
  renderRecentActivity();
  renderTables();
  updateResultsCount();
}

function renderStatCards() {
  const ticketsArray = objToArray(LJ_STATE.tickets);
  const workOrdersArray = objToArray(LJ_STATE.workOrders);
  const violationsArray = objToArray(LJ_STATE.violations);
  const allItems = [...ticketsArray, ...workOrdersArray, ...violationsArray];

  const total = allItems.length;
  const openCount = allItems.filter(t => (t.status || "").toLowerCase() !== "closed").length;

  document.getElementById("totalTicketsCard").textContent = String(total);
  document.getElementById("openTicketsCard").textContent = String(openCount);
  document.getElementById("totalWorkOrdersCard").textContent = String(workOrdersArray.length);
  document.getElementById("totalViolationsCard").textContent = String(violationsArray.length);
}

function renderRecentActivity() {
  const container = document.getElementById("recentActivityList");
  if (!container) return;

  const items = [
    ...objToArray(LJ_STATE.tickets).map(t => ({ ...t, source: "Ticket", type: "ticket" })),
    ...objToArray(LJ_STATE.workOrders).map(t => ({ ...t, source: "Work Order", type: "workOrder" })),
    ...objToArray(LJ_STATE.violations).map(t => ({ ...t, source: "Violation", type: "violation" })),
  ];

  if (!items.length) {
    container.innerHTML = '<p class="text-xs text-slate-400 py-4 text-center">No activity yet.</p>';
    return;
  }

  items.sort((a, b) => (b.createdAtMillis || 0) - (a.createdAtMillis || 0));
  const latest = items.slice(0, 10);

  container.innerHTML = latest.map(item => {
    const badgeClass = item.source === "Work Order" ? "bg-amber-50 text-amber-700" :
                       item.source === "Violation" ? "bg-rose-50 text-rose-700" :
                       "bg-indigo-50 text-indigo-700";

    return `
      <div class="py-2.5 cursor-pointer hover:bg-slate-50 -mx-5 px-5" onclick='openModal(${JSON.stringify(item)}, "${item.type}")'>
        <div class="flex items-center gap-2 mb-1">
          <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${badgeClass}">
            ${escapeHtml(item.source)}
          </span>
          <span class="text-xs text-slate-400">${escapeHtml(item.referenceNumber || "")}</span>
        </div>
        <p class="text-sm font-medium text-slate-900">${escapeHtml(item.title || "")}</p>
        <p class="text-xs text-slate-500">${escapeHtml(item.association || "")}</p>
      </div>
    `;
  }).join("");
}

function renderTables() {
  renderSimpleTable("ticketsTableBody", objToArray(LJ_STATE.tickets), "ticket");
  renderSimpleTable("workOrdersTableBody", objToArray(LJ_STATE.workOrders), "workOrder");
  renderSimpleTable("violationsTableBody", objToArray(LJ_STATE.violations), "violation");
}

function renderSimpleTable(tbodyId, items, type) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  // Apply filters
  const filtered = applyFilters(items);

  if (!filtered.length) {
    const message = (LJ_STATE.searchQuery || LJ_STATE.filterStatus !== "all")
      ? `No ${type}s match your filters. Try adjusting your search or filters.`
      : `No ${type}s yet.`;
    
    tbody.innerHTML = `<tr><td colspan="5" class="px-3 py-4 text-center text-xs text-slate-400">${message}</td></tr>`;
    return;
  }

  // Sort by date (newest first)
  filtered.sort((a, b) => (b.createdAtMillis || 0) - (a.createdAtMillis || 0));

  tbody.innerHTML = filtered.map(item => {
    const statusClass = (item.status || "").toLowerCase() === "closed" ? "bg-emerald-50 text-emerald-700" :
                        (item.status || "").toLowerCase() === "in progress" ? "bg-amber-50 text-amber-700" :
                        "bg-sky-50 text-sky-700";

    const thirdColumn = type === "workOrder" ? escapeHtml(item.vendor || "–") :
                        type === "violation" ? escapeHtml(item.ruleBroken || "–") :
                        `<span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] bg-slate-50 text-slate-600">
                           ${escapeHtml(item.priority || "–")}
                         </span>`;

    // Highlight search matches
    let titleDisplay = escapeHtml(item.title || "");
    if (LJ_STATE.searchQuery && item.title) {
      const regex = new RegExp(`(${LJ_STATE.searchQuery})`, 'gi');
      titleDisplay = escapeHtml(item.title).replace(regex, '<mark class="bg-yellow-200">$1</mark>');
    }

    return `
      <tr class="hover:bg-slate-50 cursor-pointer" onclick='openModal(${JSON.stringify(item)}, "${type}")'>
        <td class="px-3 py-2">
          <p class="text-sm font-medium text-slate-900">${titleDisplay}</p>
          <p class="text-[11px] text-slate-400">${escapeHtml(item.referenceNumber || "")}</p>
        </td>
        <td class="px-3 py-2 text-xs text-slate-600">${escapeHtml(item.association || "")}</td>
        <td class="px-3 py-2 text-xs">${thirdColumn}</td>
        <td class="px-3 py-2">
          <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${statusClass}">
            ${escapeHtml(item.status || "")}
          </span>
        </td>
        <td class="px-3 py-2 text-right">
          <button 
            onclick="event.stopPropagation(); openModal(${JSON.stringify(item)}, '${type}')"
            class="inline-flex items-center rounded-lg border border-slate-200 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-100"
          >
            View
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

// ---------- Toast Notifications ----------

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const colors = {
    success: "bg-emerald-500",
    error: "bg-rose-500",
    info: "bg-indigo-500",
  };

  const toast = document.createElement("div");
  toast.className = `${colors[type]} text-white px-4 py-2 rounded-lg shadow-lg text-sm mb-2`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

// ---------- Helpers ----------

function objToArray(obj) {
  if (!obj) return [];
  return Object.keys(obj).map(key => obj[key]);
}

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Make openModal available globally
window.openModal = openModal;
