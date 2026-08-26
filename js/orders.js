/**
 * Maira Jewels Admin - Orders Controller
 */

let orderSearchTerm = '';
let orderStatusFilter = 'all';
let orderCurrentPage = 1;
const ORDERS_PAGE_SIZE = 10;
let ordersList = [];

function extractOrderCustomer(order) {
    if (!order) return { name: 'Anonymous Customer', email: '—', phone: '—', address: '—' };
    if (order.customer && typeof order.customer === 'object') {
        return {
            name: order.customer.name || order.customer.fullName || 'Customer',
            email: order.customer.email || '—',
            phone: order.customer.phone || '—',
            address: order.customer.address || order.customer.shippingAddress || '—'
        };
    }
    const userObj = typeof order.user === 'object' ? order.user : {};
    const shipObj = typeof order.shippingAddress === 'object' ? order.shippingAddress : {};
    return {
        name: order.customerName || userObj.name || userObj.fullName || shipObj.fullName || order.name || 'Anonymous Customer',
        email: order.customerEmail || userObj.email || order.email || '—',
        phone: order.customerPhone || userObj.phone || shipObj.phone || order.phone || '—',
        address: order.address || (shipObj.address ? `${shipObj.address}, ${shipObj.city || ''}` : (typeof order.shippingAddress === 'string' ? order.shippingAddress : '—'))
    };
}

function extractOrderItems(order) {
    if (!order) return [];
    return order.items || order.orderItems || order.products || [];
}

function extractOrderTotal(order) {
    if (!order) return 0;
    if (order.total != null) return parseFloat(order.total) || 0;
    if (order.totalPrice != null) return parseFloat(order.totalPrice) || 0;
    if (order.grandTotal != null) return parseFloat(order.grandTotal) || 0;
    if (order.subtotal != null) return parseFloat(order.subtotal) || 0;
    return 0;
}

async function loadOrdersData() {
    const tbody = document.getElementById('orders-table');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2.5rem; color: var(--color-muted);"><div class="spinner" style="margin: 0 auto 0.5rem;"></div>Loading orders...</td></tr>';
    }

    try {
        if (typeof API !== 'undefined' && API.getOrders) {
            const res = await API.getOrders({ limit: 100 });
            if (res) {
                if (Array.isArray(res)) {
                    ordersList = res;
                } else if (res.data) {
                    ordersList = Array.isArray(res.data) ? res.data : (res.data.orders || res.data.data || []);
                } else if (res.orders) {
                    ordersList = Array.isArray(res.orders) ? res.orders : [];
                } else {
                    ordersList = Storage.getOrders();
                }
                if (ordersList && ordersList.length > 0) {
                    Storage.saveOrders(ordersList);
                }
            } else {
                ordersList = Storage.getOrders();
            }
        } else {
            ordersList = Storage.getOrders();
        }
    } catch (e) {
        console.error('[Orders] API error:', e.message);
        ordersList = Storage.getOrders();
        showToast('Failed to load live orders: ' + e.message, 'error');
    }
    renderOrders();
}

function renderOrders() {
    const orders = ordersList;
    const tbody = document.getElementById('orders-table');
    if (!tbody) return;

    let filtered = orders;
    if (orderStatusFilter !== 'all') {
        filtered = filtered.filter(o => o.status === orderStatusFilter);
    }

    if (orderSearchTerm) {
        const term = orderSearchTerm.toLowerCase();
        filtered = filtered.filter(o => {
            const orderId = (o.id || o._id || '').toLowerCase();
            const custName = (o.customer && o.customer.name ? o.customer.name : '').toLowerCase();
            const custEmail = (o.customer && o.customer.email ? o.customer.email : '').toLowerCase();
            const custPhone = (o.customer && o.customer.phone ? o.customer.phone : '').toLowerCase();
            const itemsMatched = (o.items || []).some(item => (item.name || '').toLowerCase().includes(term));
            return orderId.includes(term) || custName.includes(term) || custEmail.includes(term) || custPhone.includes(term) || itemsMatched;
        });
    }

    filtered = [...filtered].sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));

    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / ORDERS_PAGE_SIZE) || 1;
    if (orderCurrentPage > totalPages) {
        orderCurrentPage = totalPages;
    }

    if (totalFiltered === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><div class="empty-state__icon">📦</div><div class="empty-state__text">No orders found</div><div style="font-size:0.8rem; color:var(--color-muted); margin-top:0.25rem;">New customer purchases will appear here automatically.</div></td></tr>';
        renderPagination('orders-pagination', 1, 0, ORDERS_PAGE_SIZE, () => {});
        return;
    }

    const paginated = filtered.slice((orderCurrentPage - 1) * ORDERS_PAGE_SIZE, orderCurrentPage * ORDERS_PAGE_SIZE);

    tbody.innerHTML = paginated.map(order => {
        const orderId = order.id || order._id || order.orderNumber || order.code || 'N/A';
        const items = order.items || order.orderItems || order.products || [];
        const itemCount = items.reduce((sum, i) => sum + (i.quantity || i.qty || 1), 0);
        const customer = extractOrderCustomer(order);
        const totalAmount = extractOrderTotal(order);
        const payStatusVal = getPaymentStatusVal(order);
        const payStatusBadge = payStatusVal === 'completed'
            ? `<span class="status-badge status-badge--delivered" style="font-size: 0.68rem; padding: 2px 6px;" title="Payment Verified">Paid</span>`
            : `<span class="status-badge status-badge--pending" style="font-size: 0.68rem; padding: 2px 6px;" title="Awaiting Manual WhatsApp/EFT Payment">Unpaid</span>`;

        return `
            <tr>
                <td><span class="order-code">${escapeHtml(orderId)}</span></td>
                <td>
                    <button type="button" class="btn-link table-clickable-cell" data-customer-order="${escapeHtml(orderId)}" title="View customer profile">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #9e7f47;"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <span>${escapeHtml(customer.name)}</span>
                    </button>
                </td>
                <td>
                    <button type="button" class="table-item-pill" data-items-order="${escapeHtml(orderId)}" title="Click to view ordered items">
                        ${itemCount} ${itemCount === 1 ? 'item' : 'items'}
                    </button>
                </td>
                <td><strong style="color: var(--color-charcoal); font-weight: 700; font-size: 0.92rem;">${formatPrice(totalAmount)}</strong></td>
                <td>
                    <select class="input input--select order-status-select" data-order-id="${escapeHtml(orderId)}">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                    <div style="margin-top: 4px; display: flex; align-items: center; justify-content: center;">
                        ${payStatusBadge}
                    </div>
                </td>
                <td style="color: var(--color-muted); font-size: 0.82rem;">${formatDate(order.date || order.createdAt || order.orderDate)}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn--sm btn--secondary" data-view-order="${escapeHtml(orderId)}">View</button>
                        <button class="btn btn--sm btn--danger" data-delete-order="${escapeHtml(orderId)}">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // Render pagination
    renderPagination('orders-pagination', orderCurrentPage, totalFiltered, ORDERS_PAGE_SIZE, (newPage) => {
        orderCurrentPage = newPage;
        renderOrders();
    });

    // Event listeners
    tbody.querySelectorAll('.order-status-select').forEach(select => {
        select.addEventListener('change', async (e) => {
            const orderId = e.target.dataset.orderId;
            const newStatus = e.target.value;
            try {
                if (typeof API !== 'undefined' && API.updateOrderStatus) {
                    await API.updateOrderStatus(orderId, newStatus);
                }
            } catch (err) {
                console.warn('API status update error:', err);
            }
            const order = ordersList.find(o => o.id === orderId || o._id === orderId);
            if (order) {
                order.status = newStatus;
                Storage.saveOrders(ordersList);
                showToast(`Order ${orderId} status updated to ${newStatus}`, 'success');
            }
        });
    });

    tbody.querySelectorAll('[data-customer-order]').forEach(btn => {
        btn.addEventListener('click', () => {
            const order = ordersList.find(o => o.id === btn.dataset.customerOrder || o._id === btn.dataset.customerOrder);
            if (order) showCustomerModal(order);
        });
    });

    tbody.querySelectorAll('[data-items-order]').forEach(btn => {
        btn.addEventListener('click', () => {
            const order = ordersList.find(o => o.id === btn.dataset.itemsOrder || o._id === btn.dataset.itemsOrder);
            if (order) showOrderItemsModal(order);
        });
    });

    tbody.querySelectorAll('[data-view-order]').forEach(btn => {
        btn.addEventListener('click', () => {
            const order = ordersList.find(o => o.id === btn.dataset.viewOrder || o._id === btn.dataset.viewOrder);
            if (order) showOrderDetails(order);
        });
    });

    tbody.querySelectorAll('[data-delete-order]').forEach(btn => {
        btn.addEventListener('click', () => deleteOrder(btn.dataset.deleteOrder));
    });
}

function showCustomerModal(order) {
    const body = document.getElementById('customer-modal-body');
    if (!body) return;

    const customer = extractOrderCustomer(order);
    const orderId = order.id || order._id || order.orderNumber || order.code || 'N/A';
    const custId = customer.id || customer._id || ('CUST-' + String(orderId).replace(/[^0-9]/g, ''));

    body.innerHTML = `
        <div style="text-align: center; margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid #f3ede2;">
            <div style="width: 54px; height: 54px; border-radius: 50%; background: #f9f5ec; color: #a8894f; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.6rem; font-size: 1.2rem; font-weight: 700; border: 1.5px solid #ece4d2;">
                ${(customer.name || 'C').charAt(0).toUpperCase()}
            </div>
            <h4 style="font-family: var(--font-serif); font-size: 1.2rem; color: var(--color-charcoal); margin-bottom: 0.2rem;">${escapeHtml(customer.name)}</h4>
            <span class="product-id-badge">${escapeHtml(custId)}</span>
        </div>
        <div class="detail-section">
            <h4>Contact Details</h4>
            <div class="detail-row"><span class="detail-row__label">Full Name</span><span class="detail-row__value">${escapeHtml(customer.name)}</span></div>
            <div class="detail-row"><span class="detail-row__label">Email Address</span><span class="detail-row__value"><a href="mailto:${escapeHtml(customer.email)}" style="color: #9e7f47; text-decoration: none;">${escapeHtml(customer.email)}</a></span></div>
            <div class="detail-row"><span class="detail-row__label">Phone Number</span><span class="detail-row__value"><a href="tel:${escapeHtml(customer.phone)}" style="color: var(--color-charcoal); text-decoration: none;">${escapeHtml(customer.phone)}</a></span></div>
        </div>
        <div class="detail-section">
            <h4>Delivery & Shipping Address</h4>
            <div class="detail-row"><span class="detail-row__label">Address</span><span class="detail-row__value" style="max-width: 250px; text-align: right;">${escapeHtml(customer.address)}</span></div>
            <div class="detail-row"><span class="detail-row__label">Associated Order</span><span class="detail-row__value"><span class="order-code">${escapeHtml(orderId)}</span></span></div>
        </div>
    `;

    openModal('customer-modal');
}

function showOrderItemsModal(order) {
    const title = document.getElementById('order-items-title');
    const body = document.getElementById('order-items-body');
    if (!body) return;

    const orderId = order.id || order._id || order.orderNumber || order.code || 'N/A';
    if (title) title.textContent = `Items for Order #${orderId}`;

    const items = extractOrderItems(order);
    if (items.length === 0) {
        body.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--color-muted);">No items recorded for this order.</div>';
    } else {
        const itemsHtml = items.map((item, idx) => {
            const price = item.priceNum != null ? item.priceNum : (parseFloat(item.price) || 0);
            const qty = item.quantity || item.qty || 1;
            const sub = price * qty;
            const img = item.image || (item.images && item.images[0]) || 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80';

            return `
                <div class="order-item" style="padding: 0.85rem 0;">
                    <img src="${escapeHtml(img)}" alt="${escapeHtml(item.name || 'Product')}" onerror="this.src='https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'">
                    <div class="order-item__info">
                        <div class="order-item__name">${escapeHtml(item.name || 'Jewelry Piece')}</div>
                        <div class="order-item__meta" style="color: var(--color-muted); font-size: 0.78rem; margin-top: 2px;">
                            Unit Price: ${formatPrice(price)} · Qty: ${qty}
                        </div>
                    </div>
                    <div class="order-item__price" style="font-weight: 700; color: var(--color-charcoal); font-size: 0.95rem;">
                        ${formatPrice(sub)}
                    </div>
                </div>
            `;
        }).join('');

        body.innerHTML = `
            <div class="order-items-list" style="margin-bottom: 1rem;">
                ${itemsHtml}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid #f3ede2;">
                <span style="font-weight: 600; color: var(--color-muted); font-size: 0.85rem;">Total Items: ${items.reduce((s, i) => s + (i.quantity || i.qty || 1), 0)}</span>
                <span style="font-weight: 700; color: var(--color-charcoal); font-size: 1.1rem;">Total: ${formatPrice(extractOrderTotal(order))}</span>
            </div>
        `;
    }

    openModal('order-items-modal');
}

function getPaymentMethodDisplay(order) {
    if (!order) return 'WhatsApp / Direct Bank Transfer';
    const raw = order.paymentMethod || order.method || order.payment_method || '';
    if (!raw) return 'WhatsApp / Bank Transfer (Manual Payment)';
    if (raw.toLowerCase().includes('whatsapp') || raw.toLowerCase().includes('bank') || raw.toLowerCase().includes('manual') || raw.toLowerCase().includes('details')) {
        return raw;
    }
    return raw;
}

function getPaymentStatusVal(order) {
    if (!order) return 'pending';
    if (order.paymentStatus) {
        const s = String(order.paymentStatus).toLowerCase();
        if (s === 'paid' || s === 'completed') return 'completed';
        if (s === 'unpaid' || s === 'pending') return 'pending';
        return s;
    }
    if (order.isPaid === true) return 'completed';
    if (order.isPaid === false) return 'pending';
    if (order.status === 'delivered') return 'completed';
    return 'pending'; // Default is pending/unpaid until manually verified
}

function showOrderDetails(order) {
    const body = document.getElementById('order-details-body');
    if (!body) return;

    const orderId = order.id || order._id || order.orderNumber || order.code || 'N/A';
    const items = extractOrderItems(order);
    const customer = extractOrderCustomer(order);
    const payMethodDisplay = getPaymentMethodDisplay(order);
    const payStatusVal = getPaymentStatusVal(order);

    const itemsHtml = items.map(item => `
        <div class="order-item">
            <img src="${escapeHtml(item.image || (item.images && item.images[0]) || '')}" alt="${escapeHtml(item.name || 'Product')}" onerror="this.src='https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'">
            <div class="order-item__info">
                <div class="order-item__name">${escapeHtml(item.name || 'Piece')}</div>
                <div class="order-item__meta">Qty: ${item.quantity || item.qty || 1} · ${escapeHtml(item.price || formatPrice(item.priceNum || 0))}</div>
            </div>
            <div class="order-item__price">${formatPrice((item.priceNum || parseFloat(item.price) || 0) * (item.quantity || item.qty || 1))}</div>
        </div>
    `).join('');

    body.innerHTML = `
        <div class="detail-section">
            <h4>Order Information</h4>
            <div class="detail-row"><span class="detail-row__label">Order ID</span><span class="detail-row__value"><span class="order-code">${escapeHtml(orderId)}</span></span></div>
            <div class="detail-row"><span class="detail-row__label">Date</span><span class="detail-row__value">${formatDate(order.date || order.createdAt || order.orderDate)}</span></div>
            <div class="detail-row"><span class="detail-row__label">Order Status</span><span class="detail-row__value">${getStatusBadge(order.status)}</span></div>
            <div class="detail-row"><span class="detail-row__label">Payment Method</span><span class="detail-row__value"><strong>${escapeHtml(payMethodDisplay)}</strong></span></div>
            <div class="detail-row">
                <span class="detail-row__label">Payment Status</span>
                <span class="detail-row__value">
                    <select id="modal-payment-status-select" class="input input--select input--sm" style="font-weight: 600; padding: 3px 8px; font-size: 0.85rem; border-color: #d1c7b7;">
                        <option value="pending" ${payStatusVal === 'pending' ? 'selected' : ''}>⏳ Pending / Unpaid (Awaiting WhatsApp/EFT Payment)</option>
                        <option value="completed" ${payStatusVal === 'completed' ? 'selected' : ''}>✅ Paid (Completed)</option>
                        <option value="failed" ${payStatusVal === 'failed' ? 'selected' : ''}>❌ Failed</option>
                        <option value="refunded" ${payStatusVal === 'refunded' ? 'selected' : ''}>↩️ Refunded</option>
                    </select>
                </span>
            </div>
        </div>
        <div class="detail-section">
            <h4>Customer Information</h4>
            <div class="detail-row"><span class="detail-row__label">Name</span><span class="detail-row__value">${escapeHtml(customer.name)}</span></div>
            <div class="detail-row"><span class="detail-row__label">Email</span><span class="detail-row__value">${escapeHtml(customer.email)}</span></div>
            <div class="detail-row"><span class="detail-row__label">Phone</span><span class="detail-row__value">${escapeHtml(customer.phone)}</span></div>
            <div class="detail-row"><span class="detail-row__label">Address</span><span class="detail-row__value">${escapeHtml(customer.address)}</span></div>
        </div>
        <div class="detail-section">
            <h4>Items (${items.length})</h4>
            <div class="order-items-list">${itemsHtml || '<p style="color:var(--color-muted); font-size:0.8rem;">No items listed.</p>'}</div>
        </div>
        <div class="detail-section">
            <h4>Payment Summary</h4>
            <div class="detail-row"><span class="detail-row__label">Subtotal</span><span class="detail-row__value">${formatPrice(order.subtotal || extractOrderTotal(order))}</span></div>
            <div class="detail-row"><span class="detail-row__label">Tax</span><span class="detail-row__value">${formatPrice(order.tax || 0)}</span></div>
            <div class="detail-row"><span class="detail-row__label">Total</span><span class="detail-row__value" style="color: #9e7f47; font-size: 1.1rem; font-weight: 700;">${formatPrice(extractOrderTotal(order))}</span></div>
        </div>
    `;

    const modalPaySelect = document.getElementById('modal-payment-status-select');
    if (modalPaySelect) {
        modalPaySelect.addEventListener('change', async (e) => {
            const newPayStatus = e.target.value;
            order.paymentStatus = newPayStatus;
            order.isPaid = (newPayStatus === 'completed');
            
            try {
                if (typeof API !== 'undefined' && API.updateOrderPaymentStatus) {
                    await API.updateOrderPaymentStatus(orderId, newPayStatus);
                }
            } catch (err) {
                console.warn('[Orders] Payment status update API warning:', err.message);
            }
            
            Storage.saveOrders(ordersList);
            renderOrders();
            showToast(`Payment status updated to ${newPayStatus.toUpperCase()}`, 'success');
        });
    }

    openModal('order-modal');
}

async function deleteOrder(id) {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
        if (typeof API !== 'undefined' && API.deleteOrder) {
            await API.deleteOrder(id);
        }
        ordersList = ordersList.filter(o => o.id !== id && o._id !== id);
        Storage.saveOrders(ordersList);
        renderOrders();
        showToast('Order deleted successfully', 'success');
    } catch (e) {
        console.error('API delete order error:', e);
        showToast('Failed to delete order: ' + e.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initLayout('orders');
    loadOrdersData();

    const orderFilter = document.getElementById('order-status-filter');
    if (orderFilter) {
        orderFilter.addEventListener('change', (e) => {
            orderStatusFilter = e.target.value;
            orderCurrentPage = 1;
            renderOrders();
        });
    }

    const orderSearch = document.getElementById('order-search');
    if (orderSearch) {
        orderSearch.addEventListener('input', (e) => {
            orderSearchTerm = e.target.value;
            orderCurrentPage = 1;
            renderOrders();
        });
    }
});
