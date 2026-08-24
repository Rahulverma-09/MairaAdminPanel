/**
 * Maira Jewels Admin - Contact Inquiries Controller
 */

let contactSearchTerm = '';
let contactStatusFilter = 'all';
let messageCurrentPage = 1;
const MESSAGES_PAGE_SIZE = 10;
let messagesList = [];

async function loadContactMessages() {
    const tbody = document.getElementById('messages-table');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2.5rem; color: var(--color-muted);"><div class="spinner" style="margin: 0 auto 0.5rem;"></div>Loading inquiries...</td></tr>';
    }

    try {
        if (typeof API !== 'undefined' && API.getContactMessages) {
            const res = await API.getContactMessages({ limit: 100 });
            if (res && res.data) {
                messagesList = Array.isArray(res.data) ? res.data : (res.data.contacts || res.data.messages || []);
                Storage.saveMessages(messagesList);
            } else {
                messagesList = [];
            }
        } else {
            messagesList = [];
        }
    } catch (e) {
        console.error('[Contact] API error:', e.message);
        messagesList = Storage.getMessages();
        showToast('Failed to load inquiries: ' + e.message, 'error');
    }
    renderMessages();
}

function renderMessages() {
    const tbody = document.getElementById('messages-table');
    if (!tbody) return;

    let filtered = messagesList;

    if (contactStatusFilter !== 'all') {
        filtered = filtered.filter(m => (m.status || 'new') === contactStatusFilter);
    }

    if (contactSearchTerm) {
        const term = contactSearchTerm.toLowerCase();
        filtered = filtered.filter(m =>
            (m.name && m.name.toLowerCase().includes(term)) ||
            (m.email && m.email.toLowerCase().includes(term)) ||
            (m.subject && m.subject.toLowerCase().includes(term)) ||
            (m.message && m.message.toLowerCase().includes(term))
        );
    }

    const sorted = [...filtered].sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
    const totalFiltered = sorted.length;
    const totalPages = Math.ceil(totalFiltered / MESSAGES_PAGE_SIZE) || 1;
    if (messageCurrentPage > totalPages) {
        messageCurrentPage = totalPages;
    }

    if (totalFiltered === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><div class="empty-state__icon">✉️</div><div class="empty-state__text">No inquiries found</div><div style="font-size:0.8rem; color:var(--color-muted); margin-top:0.25rem;">New messages sent through the customer contact form will appear here.</div></td></tr>';
        renderPagination('messages-pagination', 1, 0, MESSAGES_PAGE_SIZE, () => {});
        return;
    }

    const paginated = sorted.slice((messageCurrentPage - 1) * MESSAGES_PAGE_SIZE, messageCurrentPage * MESSAGES_PAGE_SIZE);

    tbody.innerHTML = paginated.map(msg => {
        const msgId = msg.id || msg._id || 'N/A';
        const isNew = (msg.status || 'new') === 'new';

        return `
            <tr>
                <td><strong style="color: var(--color-charcoal); font-weight: 600;">${escapeHtml(msg.name || 'Anonymous')}</strong></td>
                <td>
                    <a href="mailto:${escapeHtml(msg.email || '')}" style="color: #9e7f47; text-decoration: none;" title="Send email reply">
                        ${escapeHtml(msg.email || '—')}
                    </a>
                </td>
                <td><span style="font-weight: 600; color: var(--color-charcoal); font-size: 0.85rem;">${escapeHtml(msg.subject || 'General Inquiry')}</span></td>
                <td style="max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--color-muted); font-size: 0.82rem;">${escapeHtml(msg.message || '—')}</td>
                <td style="color: var(--color-muted); font-size: 0.82rem;">${formatDate(msg.date || msg.createdAt)}</td>
                <td>${getStatusBadge(msg.status || 'new')}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn--sm btn--secondary" data-view-message="${msgId}">View</button>
                        <button class="btn btn--sm ${isNew ? 'btn--success' : 'btn--secondary'}" data-toggle-message="${msgId}">
                            ${isNew ? 'Mark Read' : 'Mark New'}
                        </button>
                        <button class="btn btn--sm btn--danger" data-delete-message="${msgId}">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // Render pagination
    renderPagination('messages-pagination', messageCurrentPage, totalFiltered, MESSAGES_PAGE_SIZE, (newPage) => {
        messageCurrentPage = newPage;
        renderMessages();
    });

    tbody.querySelectorAll('[data-view-message]').forEach(btn => {
        btn.addEventListener('click', () => {
            const msg = messagesList.find(m => m.id === btn.dataset.viewMessage || m._id === btn.dataset.viewMessage);
            if (msg) showMessageDetails(msg);
        });
    });

    tbody.querySelectorAll('[data-toggle-message]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const msgId = btn.dataset.toggleMessage;
            const msg = messagesList.find(m => m.id === msgId || m._id === msgId);
            if (msg) {
                setButtonLoading(btn, true, 'Updating...');
                const dbId = msg._id || msg.id || msgId;
                const nextStatus = (msg.status || 'new') === 'new' ? 'read' : 'new';
                try {
                    if (typeof API !== 'undefined' && API.updateMessageStatus) {
                        await API.updateMessageStatus(dbId, nextStatus);
                    }
                } catch (err) {
                    console.warn('API message status error:', err);
                } finally {
                    setButtonLoading(btn, false);
                }
                msg.status = nextStatus;
                Storage.saveMessages(messagesList);
                renderMessages();
                showToast(`Inquiry marked as ${nextStatus}`, 'success');
            }
        });
    });

    tbody.querySelectorAll('[data-delete-message]').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('Are you sure you want to delete this message?')) return;
            const msgId = btn.dataset.deleteMessage;
            const msg = messagesList.find(m => m.id === msgId || m._id === msgId);
            const dbId = (msg && msg._id) ? msg._id : msgId;
            setButtonLoading(btn, true, 'Deleting...');
            try {
                if (typeof API !== 'undefined' && API.deleteMessage) {
                    await API.deleteMessage(dbId);
                }
            } catch (err) {
                console.warn('API delete message error:', err);
            } finally {
                setButtonLoading(btn, false);
            }
            messagesList = messagesList.filter(m => m.id !== msgId && m._id !== msgId);
            Storage.saveMessages(messagesList);
            renderMessages();
            showToast('Message deleted successfully', 'success');
        });
    });
}

function showMessageDetails(msg) {
    const body = document.getElementById('message-details-body');
    if (!body) return;

    const msgId = msg.id || msg._id || 'N/A';

    body.innerHTML = `
        <div class="detail-section">
            <div class="detail-row"><span class="detail-row__label">From</span><span class="detail-row__value">${escapeHtml(msg.name || 'Anonymous')}</span></div>
            <div class="detail-row"><span class="detail-row__label">Email</span><span class="detail-row__value"><a href="mailto:${escapeHtml(msg.email || '')}" style="color: #9e7f47; text-decoration: none;">${escapeHtml(msg.email || '—')}</a></span></div>
            <div class="detail-row"><span class="detail-row__label">Subject</span><span class="detail-row__value">${escapeHtml(msg.subject || 'General Inquiry')}</span></div>
            <div class="detail-row"><span class="detail-row__label">Date</span><span class="detail-row__value">${formatDate(msg.date || msg.createdAt)}</span></div>
            <div class="detail-row"><span class="detail-row__label">Status</span><span class="detail-row__value">${getStatusBadge(msg.status || 'new')}</span></div>
        </div>
        <div class="detail-section">
            <h4>Message Content</h4>
            <div style="white-space: pre-wrap; line-height: 1.6; padding: 1.15rem; background: #faf8f5; border-radius: 8px; border: 1px solid #eae3d6; font-size: 0.88rem; color: var(--color-charcoal);">
                ${escapeHtml(msg.message || '')}
            </div>
        </div>
        <div style="margin-top: 1.25rem; display: flex; justify-content: flex-end; gap: 0.6rem;">
            <a href="mailto:${escapeHtml(msg.email || '')}?subject=Re: ${encodeURIComponent(msg.subject || 'Maira Jewels Inquiry')}" class="btn btn--primary" style="text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
                ✉️ Reply via Email
            </a>
        </div>
    `;

    // Mark as read when opened
    if (msg.status === 'new') {
        msg.status = 'read';
        Storage.saveMessages(messagesList);
        renderMessages();
        if (typeof API !== 'undefined' && API.updateMessageStatus) {
            API.updateMessageStatus(msgId, 'read').catch(() => {});
        }
    }

    openModal('message-modal');
}

document.addEventListener('DOMContentLoaded', () => {
    initLayout('contact');
    loadContactMessages();

    const contactSearch = document.getElementById('contact-search');
    if (contactSearch) {
        contactSearch.addEventListener('input', (e) => {
            contactSearchTerm = e.target.value;
            messageCurrentPage = 1;
            renderMessages();
        });
    }

    const contactFilter = document.getElementById('contact-status-filter');
    if (contactFilter) {
        contactFilter.addEventListener('change', (e) => {
            contactStatusFilter = e.target.value;
            messageCurrentPage = 1;
            renderMessages();
        });
    }
});
