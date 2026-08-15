/**
 * Maira Jewels Admin - Contact Controller
 */

let messageCurrentPage = 1;
const MESSAGES_PAGE_SIZE = 10;

function renderContact() {
    // Render store contact info
    const contactInfo = Storage.getContactInfo();
    const addressDisplay = document.getElementById('contact-address-display');
    const hoursDisplay = document.getElementById('contact-hours-display');
    const phoneDisplay = document.getElementById('contact-phone-display');
    const emailDisplay = document.getElementById('contact-email-display');

    if (addressDisplay) addressDisplay.textContent = contactInfo.address || 'N/A';
    if (hoursDisplay) hoursDisplay.textContent = contactInfo.hours || 'N/A';
    if (phoneDisplay) phoneDisplay.textContent = contactInfo.phone || 'N/A';
    if (emailDisplay) emailDisplay.textContent = contactInfo.email || 'N/A';

    // Render messages
    renderMessages();
}

function renderMessages() {
    const messages = Storage.getMessages();
    const tbody = document.getElementById('messages-table');
    if (!tbody) return;

    const sorted = [...messages].sort((a, b) => new Date(b.date) - new Date(a.date));
    const totalFiltered = sorted.length;
    const totalPages = Math.ceil(totalFiltered / MESSAGES_PAGE_SIZE) || 1;
    if (messageCurrentPage > totalPages) {
        messageCurrentPage = totalPages;
    }

    if (totalFiltered === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><div class="empty-state__icon">✉️</div><div class="empty-state__text">No messages found</div></td></tr>';
        renderPagination('messages-pagination', 1, 0, MESSAGES_PAGE_SIZE, () => {});
        return;
    }

    const paginated = sorted.slice((messageCurrentPage - 1) * MESSAGES_PAGE_SIZE, messageCurrentPage * MESSAGES_PAGE_SIZE);

    tbody.innerHTML = paginated.map(msg => `
        <tr>
            <td><strong style="color: var(--color-charcoal);">${escapeHtml(msg.name)}</strong></td>
            <td style="color: var(--color-muted);">${escapeHtml(msg.email)}</td>
            <td>${escapeHtml(msg.subject)}</td>
            <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--color-muted);">${escapeHtml(msg.message)}</td>
            <td style="color: var(--color-muted); font-size: 0.82rem;">${formatDate(msg.date)}</td>
            <td>${getStatusBadge(msg.status)}</td>
            <td>
                <div class="actions">
                    <button class="btn btn--sm btn--secondary" data-view-message="${msg.id}">View</button>
                    <button class="btn btn--sm btn--success" data-toggle-message="${msg.id}">${msg.status === 'new' ? 'Mark Read' : 'Mark New'}</button>
                    <button class="btn btn--sm btn--danger" data-delete-message="${msg.id}">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');

    // Render pagination
    renderPagination('messages-pagination', messageCurrentPage, totalFiltered, MESSAGES_PAGE_SIZE, (newPage) => {
        messageCurrentPage = newPage;
        renderMessages();
    });

    tbody.querySelectorAll('[data-view-message]').forEach(btn => {
        btn.addEventListener('click', () => {
            const msg = Storage.getMessages().find(m => m.id === btn.dataset.viewMessage);
            if (msg) showMessageDetails(msg);
        });
    });

    tbody.querySelectorAll('[data-toggle-message]').forEach(btn => {
        btn.addEventListener('click', () => {
            const msgId = btn.dataset.toggleMessage;
            const messages = Storage.getMessages();
            const msg = messages.find(m => m.id === msgId);
            if (msg) {
                msg.status = msg.status === 'new' ? 'read' : 'new';
                Storage.saveMessages(messages);
                renderMessages();
                showToast(`Message marked as ${msg.status}`, 'success');
            }
        });
    });

    tbody.querySelectorAll('[data-delete-message]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!confirm('Are you sure you want to delete this message?')) return;
            const messages = Storage.getMessages().filter(m => m.id !== btn.dataset.deleteMessage);
            Storage.saveMessages(messages);
            renderMessages();
            showToast('Message deleted successfully', 'success');
        });
    });
}

function showMessageDetails(msg) {
    const body = document.getElementById('message-details-body');
    if (!body) return;

    body.innerHTML = `
        <div class="detail-section">
            <div class="detail-row"><span class="detail-row__label">From</span><span class="detail-row__value">${escapeHtml(msg.name)} (${escapeHtml(msg.email)})</span></div>
            <div class="detail-row"><span class="detail-row__label">Subject</span><span class="detail-row__value">${escapeHtml(msg.subject)}</span></div>
            <div class="detail-row"><span class="detail-row__label">Date</span><span class="detail-row__value">${formatDate(msg.date)}</span></div>
            <div class="detail-row"><span class="detail-row__label">Status</span><span class="detail-row__value">${getStatusBadge(msg.status)}</span></div>
        </div>
        <div class="detail-section">
            <h4>Message</h4>
            <p style="white-space: pre-wrap; line-height: 1.6; padding: 1rem; background: var(--color-bg); border-radius: 8px; border: 1px solid var(--color-border);">${escapeHtml(msg.message)}</p>
        </div>
    `;

    // Mark as read when opened
    if (msg.status === 'new') {
        const messages = Storage.getMessages();
        const found = messages.find(m => m.id === msg.id);
        if (found) {
            found.status = 'read';
            Storage.saveMessages(messages);
            renderMessages();
        }
    }

    openModal('message-modal');
}

function openContactInfoModal() {
    const info = Storage.getContactInfo();
    document.getElementById('contact-address').value = info.address || '';
    document.getElementById('contact-hours').value = info.hours || '';
    document.getElementById('contact-phone').value = info.phone || '';
    document.getElementById('contact-email').value = info.email || '';
    openModal('contact-info-modal');
}

function handleContactInfoForm(e) {
    e.preventDefault();
    const info = {
        address: document.getElementById('contact-address').value.trim(),
        hours: document.getElementById('contact-hours').value.trim(),
        phone: document.getElementById('contact-phone').value.trim(),
        email: document.getElementById('contact-email').value.trim()
    };
    Storage.saveContactInfo(info);
    closeModal('contact-info-modal');
    renderContact();
    showToast('Contact info updated successfully', 'success');
}

document.addEventListener('DOMContentLoaded', () => {
    initLayout('contact');
    renderContact();

    const editInfoBtn = document.getElementById('edit-contact-info-btn');
    if (editInfoBtn) {
        editInfoBtn.addEventListener('click', openContactInfoModal);
    }

    const contactInfoForm = document.getElementById('contact-info-form');
    if (contactInfoForm) {
        contactInfoForm.addEventListener('submit', handleContactInfoForm);
    }
});
