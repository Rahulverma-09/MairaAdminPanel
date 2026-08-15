/**
 * Maira Jewels Admin - Orders Controller
 */

let orderStatusFilter = 'all';
let orderCurrentPage = 1;
const ORDERS_PAGE_SIZE = 10;

function renderOrders() {
    const orders = Storage.getOrders();
    const tbody = document.getElementById('orders-table');
    if (!tbody) return;

    let filtered = orders;
    if (orderStatusFilter !== 'all') {
        filtered = filtered.filter(o => o.status === orderStatusFilter);
    }

    filtered = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / ORDERS_PAGE_SIZE) || 1;
    if (orderCurrentPage > totalPages) {
        orderCurrentPage = totalPages;
    }

    if (totalFiltered === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><div class="empty-state__icon">📦</div><div class="empty-state__text">No orders found</div></td></tr>';
        renderPagination('orders-pagination', 1, 0, ORDERS_PAGE_SIZE, () => {});
        return;
    }

    const paginated = filtered.slice((orderCurrentPage - 1) * ORDERS_PAGE_SIZE, orderCurrentPage * ORDERS_PAGE_SIZE);

    tbody.innerHTML = paginated.map(order => {
        const itemCount = order.items.reduce((sum, i) => sum + (i.quantity || 1), 0);
        return `
            <tr>
                <td><span class="order-code">${escapeHtml(order.id)}</span></td>
                <td><strong>${escapeHtml(order.customer.name)}</strong></td>
                <td><span style="font-weight: 500; color: var(--color-muted);">${itemCount} item(s)</span></td>
                <td><strong style="color: var(--color-charcoal); font-weight: 700;">${formatPrice(order.total)}</strong></td>
                <td>
                    <select class="input input--select order-status-select" data-order-id="${order.id}">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td style="color: var(--color-muted); font-size: 0.82rem;">${formatDate(order.date)}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn--sm btn--secondary" data-view-order="${order.id}">View</button>
                        <button class="btn btn--sm btn--danger" data-delete-order="${order.id}">Delete</button>
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

    tbody.querySelectorAll('.order-status-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const orderId = e.target.dataset.orderId;
            const orders = Storage.getOrders();
            const order = orders.find(o => o.id === orderId);
            if (order) {
                order.status = e.target.value;
                Storage.saveOrders(orders);
                showToast(`Order ${orderId} status updated to ${e.target.value}`, 'success');
            }
        });
    });

    tbody.querySelectorAll('[data-view-order]').forEach(btn => {
        btn.addEventListener('click', () => {
            const order = Storage.getOrders().find(o => o.id === btn.dataset.viewOrder);
            if (order) showOrderDetails(order);
        });
    });

    tbody.querySelectorAll('[data-delete-order]').forEach(btn => {
        btn.addEventListener('click', () => deleteOrder(btn.dataset.deleteOrder));
    });
}

function showOrderDetails(order) {
    const body = document.getElementById('order-details-body');
    if (!body) return;

    const itemsHtml = order.items.map(item => `
        <div class="order-item">
            <img src="${escapeHtml(item.image || '')}" alt="${escapeHtml(item.name)}" onerror="this.src='https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'">
            <div class="order-item__info">
                <div class="order-item__name">${escapeHtml(item.name)}</div>
                <div class="order-item__meta">Qty: ${item.quantity || 1} · ${escapeHtml(item.price || formatPrice(item.priceNum))}</div>
            </div>
            <div class="order-item__price">${formatPrice((item.priceNum || 0) * (item.quantity || 1))}</div>
        </div>
    `).join('');

    body.innerHTML = `
        <div class="detail-section">
            <h4>Order Information</h4>
            <div class="detail-row"><span class="detail-row__label">Order ID</span><span class="detail-row__value">${escapeHtml(order.id)}</span></div>
            <div class="detail-row"><span class="detail-row__label">Date</span><span class="detail-row__value">${formatDate(order.date)}</span></div>
            <div class="detail-row"><span class="detail-row__label">Status</span><span class="detail-row__value">${getStatusBadge(order.status)}</span></div>
            <div class="detail-row"><span class="detail-row__label">Payment Method</span><span class="detail-row__value">${escapeHtml(order.paymentMethod || 'N/A')}</span></div>
        </div>
        <div class="detail-section">
            <h4>Customer Information</h4>
            <div class="detail-row"><span class="detail-row__label">Name</span><span class="detail-row__value">${escapeHtml(order.customer.name)}</span></div>
            <div class="detail-row"><span class="detail-row__label">Email</span><span class="detail-row__value">${escapeHtml(order.customer.email)}</span></div>
            <div class="detail-row"><span class="detail-row__label">Phone</span><span class="detail-row__value">${escapeHtml(order.customer.phone || 'N/A')}</span></div>
            <div class="detail-row"><span class="detail-row__label">Address</span><span class="detail-row__value">${escapeHtml(order.customer.address || 'N/A')}</span></div>
        </div>
        <div class="detail-section">
            <h4>Items (${order.items.length})</h4>
            <div class="order-items-list">${itemsHtml}</div>
        </div>
        <div class="detail-section">
            <h4>Payment Summary</h4>
            <div class="detail-row"><span class="detail-row__label">Subtotal</span><span class="detail-row__value">${formatPrice(order.subtotal)}</span></div>
            <div class="detail-row"><span class="detail-row__label">Tax (8%)</span><span class="detail-row__value">${formatPrice(order.tax)}</span></div>
            <div class="detail-row"><span class="detail-row__label">Total</span><span class="detail-row__value" style="color: var(--color-gold); font-size: 1.1rem;">${formatPrice(order.total)}</span></div>
        </div>
    `;

    openModal('order-modal');
}

function deleteOrder(id) {
    if (!confirm('Are you sure you want to delete this order?')) return;
    const orders = Storage.getOrders().filter(o => o.id !== id);
    Storage.saveOrders(orders);
    renderOrders();
    showToast('Order deleted successfully', 'success');
}

document.addEventListener('DOMContentLoaded', () => {
    initLayout('orders');

    const orderFilter = document.getElementById('order-status-filter');
    if (orderFilter) {
        orderFilter.addEventListener('change', (e) => {
            orderStatusFilter = e.target.value;
            orderCurrentPage = 1;
            renderOrders();
        });
    }

    renderOrders();
});
