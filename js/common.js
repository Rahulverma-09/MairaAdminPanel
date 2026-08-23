/**
 * Maira Jewels Admin - Common UI & Layout Utilities
 */

// ============ AUTH ============
function isAuthenticated() {
    const token = localStorage.getItem('maira_admin_token') || localStorage.getItem('token') || localStorage.getItem('admin_token');
    const authFlag = localStorage.getItem(typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.AUTH : 'maira_admin_auth') === 'true';
    return !!(token || authFlag);
}

function requireAuth() {
    if (!isAuthenticated()) {
        const isSubDir = window.location.pathname.includes('/html/');
        window.location.href = isSubDir ? '../index.html' : 'index.html';
        return false;
    }
    return true;
}

// Immediate route guard for all admin html sub-pages
(function enforceRouteGuard() {
    if (window.location.pathname.includes('/html/')) {
        requireAuth();
    }
})();

// ============ FORMATTING & UTILITIES ============
function formatPrice(val) {
    return '$' + Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatAddress(addr) {
    if (!addr) return '—';
    if (typeof addr === 'string') return addr.trim() || '—';
    if (typeof addr === 'object') {
        const street = addr.street || addr.line1 || addr.addressLine1 || addr.address || addr.streetAddress || '';
        const city = addr.city || '';
        const state = addr.state || '';
        const pin = addr.pincode || addr.zip || addr.postalCode || '';
        const country = addr.country || '';
        const parts = [street, city, state, pin, country].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : '—';
    }
    return String(addr);
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    if (typeof str === 'object') {
        return escapeHtml(formatAddress(str));
    }
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
}

function generateId(prefix) {
    return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function isMongoId(str) {
    if (!str || typeof str !== 'string') return false;
    return /^[0-9a-fA-F]{24}$/.test(str.trim());
}

function generateProductId(name, idx) {
    let clean = (name || '').replace(/[^a-zA-Z]/g, '').toUpperCase();
    if (clean.length < 3) {
        clean = (clean + 'PRD').substring(0, 3);
    } else {
        clean = clean.substring(0, 3);
    }
    if (idx) {
        return `${clean}-${String(100 + Number(idx)).padStart(3, '0')}`;
    }
    const randNum = Math.floor(100 + Math.random() * 900);
    return `${clean}-${randNum}`;
}

function getProductDisplayId(product, index = 0) {
    if (!product) return `PRD-${String(index + 1).padStart(3, '0')}`;
    let candidate = product.productId || product.code;
    if (candidate && !isMongoId(candidate)) {
        return candidate;
    }
    if (product.id && !isMongoId(product.id)) {
        return product.id;
    }
    const autogen = generateProductId(product.name || 'Product', index + 1);
    product.productId = autogen;
    product.code = autogen;
    return autogen;
}

function generateCategoryId(name, idx) {
    let clean = (name || '').replace(/[^a-zA-Z]/g, '').toUpperCase();
    if (clean.length < 3) {
        clean = (clean + 'CAT').substring(0, 3);
    } else {
        clean = clean.substring(0, 3);
    }
    if (idx) {
        return `CAT-${clean}-${String(100 + Number(idx)).padStart(3, '0')}`;
    }
    const randNum = Math.floor(1000 + Math.random() * 9000);
    return `CAT-${clean}-${randNum}`;
}

function getCategoryDisplayId(category, index = 0) {
    if (!category) return `CAT-${String(index + 1).padStart(3, '0')}`;
    let candidate = category.categoryId || category.code;
    if (candidate && !isMongoId(candidate)) {
        return candidate;
    }
    if (category.id && !isMongoId(category.id)) {
        return category.id;
    }
    const autogen = generateCategoryId(category.name || 'Category', index + 1);
    category.categoryId = autogen;
    category.code = autogen;
    return autogen;
}

function getStatusBadge(status) {
    const clean = (status || '').toLowerCase();
    const cls = 'status-badge status-badge--' + clean;
    return `<span class="${cls}"><span class="status-dot"></span>${escapeHtml(status || 'N/A')}</span>`;
}

// ============ TOAST NOTIFICATIONS ============
function showToast(msg, type) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = 'toast show' + (type ? ' toast--' + type : '');
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

// ============ MODAL HELPERS ============
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('open');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('open');
}

// ============ PAGINATION HELPER ============
function renderPagination(containerId, currentPage, totalItems, pageSize, onPageChange) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    if (totalItems === 0) {
        container.innerHTML = '';
        return;
    }

    const start = Math.min((currentPage - 1) * pageSize + 1, totalItems);
    const end = Math.min(currentPage * pageSize, totalItems);

    let navHtml = '';

    // Prev button
    navHtml += `<button class="pagination-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''} title="Previous Page">‹</button>`;

    // Page numbers
    for (let p = 1; p <= totalPages; p++) {
        if (totalPages > 7) {
            // Smart truncation
            if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                navHtml += `<button class="pagination-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
            } else if (p === currentPage - 2 || p === currentPage + 2) {
                navHtml += `<span style="padding: 0 4px; color: var(--color-muted);">…</span>`;
            }
        } else {
            navHtml += `<button class="pagination-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
        }
    }

    // Next button
    navHtml += `<button class="pagination-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''} title="Next Page">›</button>`;

    container.innerHTML = `
        <div class="pagination-info">
            Showing <strong>${start}</strong> to <strong>${end}</strong> of <strong>${totalItems}</strong> entries
        </div>
        <div class="pagination-nav">
            ${navHtml}
        </div>
    `;

    container.querySelectorAll('.pagination-btn:not(:disabled)').forEach(btn => {
        btn.addEventListener('click', () => {
            const pageNum = parseInt(btn.dataset.page, 10);
            if (pageNum && pageNum !== currentPage && pageNum >= 1 && pageNum <= totalPages) {
                onPageChange(pageNum);
            }
        });
    });
}

// ============ COMMON LAYOUT INIT ============
function initLayout(activeSection) {
    if (!requireAuth()) return;

    // Set admin user profile dynamically
    const profile = Storage.getProfile ? Storage.getProfile() : { name: 'Admin', role: 'Administrator', avatar: 'A' };
    const adminName = document.getElementById('admin-name');
    if (adminName) adminName.textContent = profile.name || 'Admin';
    const adminRole = document.querySelector('.admin-user__role');
    if (adminRole) adminRole.textContent = profile.role || 'Administrator';
    const adminAvatar = document.getElementById('admin-avatar');
    if (adminAvatar) adminAvatar.textContent = profile.avatar || (profile.name ? profile.name.charAt(0).toUpperCase() : 'A');

    // Set current date
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    // Highlight current active sidebar link
    if (activeSection) {
        document.querySelectorAll('.sidebar__link').forEach(link => {
            link.classList.toggle('active', link.dataset.section === activeSection);
        });
    }

    // Sidebar toggle (mobile)
    let sidebarBackdrop = document.getElementById('sidebar-backdrop');
    if (!sidebarBackdrop) {
        sidebarBackdrop = document.createElement('div');
        sidebarBackdrop.id = 'sidebar-backdrop';
        sidebarBackdrop.className = 'sidebar-backdrop';
        document.body.appendChild(sidebarBackdrop);
    }

    const sidebar = document.getElementById('sidebar');
    const toggleBtns = document.querySelectorAll('.mobile-menu-btn, #sidebar-toggle');
    
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (sidebar) {
                sidebar.classList.toggle('open');
                sidebarBackdrop.classList.toggle('open', sidebar.classList.contains('open'));
            }
        });
    });

    if (sidebarBackdrop && sidebar) {
        sidebarBackdrop.addEventListener('click', () => {
            sidebar.classList.remove('open');
            sidebarBackdrop.classList.remove('open');
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (typeof API !== 'undefined' && API.setToken) {
                API.setToken(null);
            } else {
                localStorage.removeItem('maira_admin_token');
                localStorage.removeItem('token');
                localStorage.removeItem('admin_token');
                localStorage.removeItem('maira_admin_auth');
            }
            const isSubDir = window.location.pathname.includes('/html/');
            window.location.href = isSubDir ? '../index.html' : 'index.html';
        });
    }

    // Modal close triggers
    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(btn.dataset.close);
        });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('open');
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
        }
    });
}
