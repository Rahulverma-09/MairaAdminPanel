/**
 * Maira Jewels Admin - Payments Controller
 */

let paymentStatusFilter = 'all';
let paymentCurrentPage = 1;
const PAYMENTS_PAGE_SIZE = 10;

function renderPayments() {
    const payments = Storage.getPayments();
    const tbody = document.getElementById('payments-table');
    if (!tbody) return;

    let filtered = payments;
    if (paymentStatusFilter !== 'all') {
        filtered = filtered.filter(p => p.status === paymentStatusFilter);
    }

    filtered = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

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

    tbody.innerHTML = paginated.map(payment => `
        <tr>
            <td><span class="order-code">${escapeHtml(payment.id)}</span></td>
            <td><span class="order-code" style="background:#f8f9fa; border-color:#e2e8f0; color:#475569;">${escapeHtml(payment.orderId)}</span></td>
            <td><span style="font-weight: 500;">${escapeHtml(payment.method)}</span></td>
            <td><strong style="color: var(--color-charcoal); font-weight: 700;">${formatPrice(payment.amount)}</strong></td>
            <td>
                <select class="input input--select payment-status-select" data-payment-id="${payment.id}">
                    <option value="completed" ${payment.status === 'completed' ? 'selected' : ''}>Completed</option>
                    <option value="pending" ${payment.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="failed" ${payment.status === 'failed' ? 'selected' : ''}>Failed</option>
                    <option value="refunded" ${payment.status === 'refunded' ? 'selected' : ''}>Refunded</option>
                </select>
            </td>
            <td style="color: var(--color-muted); font-size: 0.82rem;">${formatDate(payment.date)}</td>
            <td>
                <div class="actions">
                    <button class="btn btn--sm btn--secondary" data-view-payment="${payment.id}">View</button>
                    <button class="btn btn--sm btn--danger" data-delete-payment="${payment.id}">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');

    // Render pagination
    renderPagination('payments-pagination', paymentCurrentPage, totalFiltered, PAYMENTS_PAGE_SIZE, (newPage) => {
        paymentCurrentPage = newPage;
        renderPayments();
    });

    tbody.querySelectorAll('.payment-status-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const paymentId = e.target.dataset.paymentId;
            const payments = Storage.getPayments();
            const payment = payments.find(p => p.id === paymentId);
            if (payment) {
                payment.status = e.target.value;
                Storage.savePayments(payments);
                showToast(`Payment ${paymentId} status updated to ${e.target.value}`, 'success');
            }
        });
    });

    tbody.querySelectorAll('[data-view-payment]').forEach(btn => {
        btn.addEventListener('click', () => {
            const payment = Storage.getPayments().find(p => p.id === btn.dataset.viewPayment);
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
            <div class="detail-row"><span class="detail-row__label">Payment ID</span><span class="detail-row__value">${escapeHtml(payment.id)}</span></div>
            <div class="detail-row"><span class="detail-row__label">Order ID</span><span class="detail-row__value">${escapeHtml(payment.orderId)}</span></div>
            <div class="detail-row"><span class="detail-row__label">Method</span><span class="detail-row__value">${escapeHtml(payment.method)}</span></div>
            <div class="detail-row"><span class="detail-row__label">Card Last 4</span><span class="detail-row__value">${escapeHtml(payment.last4 || 'N/A')}</span></div>
            <div class="detail-row"><span class="detail-row__label">Amount</span><span class="detail-row__value" style="color: var(--color-gold); font-size: 1.1rem;">${formatPrice(payment.amount)}</span></div>
            <div class="detail-row"><span class="detail-row__label">Status</span><span class="detail-row__value">${getStatusBadge(payment.status)}</span></div>
            <div class="detail-row"><span class="detail-row__label">Date</span><span class="detail-row__value">${formatDate(payment.date)}</span></div>
        </div>
    `;

    openModal('payment-modal');
}

function deletePayment(id) {
    if (!confirm('Are you sure you want to delete this payment record?')) return;
    const payments = Storage.getPayments().filter(p => p.id !== id);
    Storage.savePayments(payments);
    renderPayments();
    showToast('Payment deleted successfully', 'success');
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

    renderPayments();
});
