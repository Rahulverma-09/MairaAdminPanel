/**
 * Maira Jewels Admin - Payments Controller (Live API Direct Sync)
 */

let paymentStatusFilter = 'all';
let paymentCurrentPage = 1;
const PAYMENTS_PAGE_SIZE = 10;
let paymentsList = [];

async function loadPaymentsData() {
    const tbody = document.getElementById('payments-table');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2.5rem; color: var(--color-muted);"><div class="spinner" style="margin: 0 auto 0.5rem;"></div>Loading payments...</td></tr>';
    }

    try {
        // Try live payments endpoint first, fallback to orders if payments are tracked under orders
        if (typeof API !== 'undefined' && API.getPayments) {
            try {
                const res = await API.getPayments({ limit: 100 });
                if (res && res.data) {
                    paymentsList = Array.isArray(res.data) ? res.data : (res.data.payments || []);
                    Storage.savePayments(paymentsList);
                }
            } catch (pErr) {
                // If backend does not have standalone /payments route, extract payments from live orders
                if (API.getOrders) {
                    const ordRes = await API.getOrders({ limit: 100 });
                    if (ordRes && ordRes.data) {
                        const orders = Array.isArray(ordRes.data) ? ordRes.data : (ordRes.data.orders || []);
                        paymentsList = orders.map(o => ({
                            id: 'PAY-' + (o.id || o._id || '').substring(0, 8),
                            orderId: o.id || o._id || 'N/A',
                            method: o.paymentMethod || 'Credit Card',
                            amount: o.total || o.subtotal || 0,
                            status: o.paymentStatus || (o.status === 'cancelled' ? 'failed' : 'completed'),
                            date: o.date || o.createdAt || new Date().toISOString()
                        }));
                        Storage.savePayments(paymentsList);
                    }
                }
            }
        } else {
            paymentsList = Storage.getPayments();
        }
    } catch (e) {
        console.error('[Payments] API error:', e.message);
        paymentsList = Storage.getPayments();
        showToast('Failed to load payments: ' + e.message, 'error');
    }
    renderPayments();
}

function renderPayments() {
    const payments = paymentsList;
    const tbody = document.getElementById('payments-table');
    if (!tbody) return;

    let filtered = payments;
    if (paymentStatusFilter !== 'all') {
        filtered = filtered.filter(p => p.status === paymentStatusFilter);
    }

    filtered = [...filtered].sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));

    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / PAYMENTS_PAGE_SIZE) || 1;
    if (paymentCurrentPage > totalPages) {
        paymentCurrentPage = totalPages;
    }

    if (totalFiltered === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><div class="empty-state__icon">💳</div><div class="empty-state__text">No payments found</div></td></tr>';
        renderPagination('payments-pagination', 1, 0, PAYMENTS_PAGE_SIZE, () => {});
        return;
    }

    const paginated = filtered.slice((paymentCurrentPage - 1) * PAYMENTS_PAGE_SIZE, paymentCurrentPage * PAYMENTS_PAGE_SIZE);

    tbody.innerHTML = paginated.map(payment => {
        const paymentId = payment.id || payment._id || 'N/A';
        return `
        <tr>
            <td><span class="order-code">${escapeHtml(paymentId)}</span></td>
            <td><span class="order-code" style="background:#f8f9fa; border-color:#e2e8f0; color:#475569;">${escapeHtml(payment.orderId || 'N/A')}</span></td>
            <td><span style="font-weight: 500;">${escapeHtml(payment.method || payment.paymentMethod || 'Credit Card')}</span></td>
            <td><strong style="color: var(--color-charcoal); font-weight: 700;">${formatPrice(payment.amount || 0)}</strong></td>
            <td>
                <select class="input input--select payment-status-select" data-payment-id="${paymentId}">
                    <option value="completed" ${payment.status === 'completed' ? 'selected' : ''}>Completed</option>
                    <option value="pending" ${payment.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="failed" ${payment.status === 'failed' ? 'selected' : ''}>Failed</option>
                    <option value="refunded" ${payment.status === 'refunded' ? 'selected' : ''}>Refunded</option>
                </select>
            </td>
            <td style="color: var(--color-muted); font-size: 0.82rem;">${formatDate(payment.date || payment.createdAt)}</td>
            <td>
                <div class="actions">
                    <button class="btn btn--sm btn--secondary" data-view-payment="${paymentId}">View</button>
                    <button class="btn btn--sm btn--danger" data-delete-payment="${paymentId}">Delete</button>
                </div>
            </td>
        </tr>
    `;
    }).join('');

    // Render pagination
    renderPagination('payments-pagination', paymentCurrentPage, totalFiltered, PAYMENTS_PAGE_SIZE, (newPage) => {
        paymentCurrentPage = newPage;
        renderPayments();
    });

    tbody.querySelectorAll('.payment-status-select').forEach(select => {
        select.addEventListener('change', async (e) => {
            const paymentId = e.target.dataset.paymentId;
            const newStatus = e.target.value;
            try {
                if (typeof API !== 'undefined' && API.updatePaymentStatus) {
                    await API.updatePaymentStatus(paymentId, newStatus);
                }
            } catch (err) {
                console.warn('[Payments] API status update warning:', err.message);
            }
            const payment = paymentsList.find(p => p.id === paymentId || p._id === paymentId);
            if (payment) {
                payment.status = newStatus;
                Storage.savePayments(paymentsList);
                showToast(`Payment ${paymentId} status updated to ${newStatus}`, 'success');
            }
        });
    });

    tbody.querySelectorAll('[data-view-payment]').forEach(btn => {
        btn.addEventListener('click', () => {
            const payment = paymentsList.find(p => p.id === btn.dataset.viewPayment || p._id === btn.dataset.viewPayment);
            if (payment) showPaymentDetails(payment);
        });
    });

    tbody.querySelectorAll('[data-delete-payment]').forEach(btn => {
        btn.addEventListener('click', () => deletePayment(btn.dataset.deletePayment));
    });
}

function showPaymentDetails(payment) {
    const body = document.getElementById('payment-details-body');
    if (!body) return;

    body.innerHTML = `
        <div class="detail-section">
            <div class="detail-row"><span class="detail-row__label">Payment ID</span><span class="detail-row__value">${escapeHtml(payment.id || payment._id || 'N/A')}</span></div>
            <div class="detail-row"><span class="detail-row__label">Order ID</span><span class="detail-row__value">${escapeHtml(payment.orderId || 'N/A')}</span></div>
            <div class="detail-row"><span class="detail-row__label">Method</span><span class="detail-row__value">${escapeHtml(payment.method || payment.paymentMethod || 'Credit Card')}</span></div>
            <div class="detail-row"><span class="detail-row__label">Card Last 4</span><span class="detail-row__value">${escapeHtml(payment.last4 || 'N/A')}</span></div>
            <div class="detail-row"><span class="detail-row__label">Amount</span><span class="detail-row__value" style="color: var(--color-gold); font-size: 1.1rem;">${formatPrice(payment.amount || 0)}</span></div>
            <div class="detail-row"><span class="detail-row__label">Status</span><span class="detail-row__value">${getStatusBadge(payment.status)}</span></div>
            <div class="detail-row"><span class="detail-row__label">Date</span><span class="detail-row__value">${formatDate(payment.date || payment.createdAt)}</span></div>
        </div>
    `;

    openModal('payment-modal');
}

async function deletePayment(id) {
    if (!confirm('Are you sure you want to delete this payment record?')) return;
    try {
        if (typeof API !== 'undefined' && API.deletePayment) {
            await API.deletePayment(id);
        }
        paymentsList = paymentsList.filter(p => p.id !== id && p._id !== id);
        Storage.savePayments(paymentsList);
        renderPayments();
        showToast('Payment deleted successfully', 'success');
    } catch (e) {
        console.error('[Payments] API delete error:', e.message);
        showToast('Failed to delete payment: ' + e.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initLayout('payments');

    const paymentFilter = document.getElementById('payment-status-filter');
    if (paymentFilter) {
        paymentFilter.addEventListener('change', (e) => {
            paymentStatusFilter = e.target.value;
            paymentCurrentPage = 1;
            renderPayments();
        });
    }

    loadPaymentsData();
});
