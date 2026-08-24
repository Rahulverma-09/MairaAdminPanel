/**
 * Maira Jewels Admin - FAQ Controller
 */

let faqSearchTerm = '';
let faqStatusFilter = 'all';
let faqCurrentPage = 1;
const FAQ_PAGE_SIZE = 10;
let faqsList = [];

async function loadFaqsData() {
    const tbody = document.getElementById('faq-table');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2.5rem; color: var(--color-muted);"><div class="spinner" style="margin: 0 auto 0.5rem;"></div>Loading FAQs...</td></tr>';
    }

    try {
        if (typeof API !== 'undefined' && API.getFaqs) {
            const res = await API.getFaqs({ limit: 100 });
            if (res && res.data) {
                faqsList = Array.isArray(res.data) ? res.data : (res.data.faqs || []);
                Storage.saveFaqs(faqsList);
            } else {
                faqsList = [];
            }
        } else {
            faqsList = [];
        }
    } catch (e) {
        console.error('[FAQs] API error:', e.message);
        faqsList = Storage.getFaqs();
        showToast('Failed to load FAQs: ' + e.message, 'error');
    }
    renderFaqs();
}

function renderFaqs() {
    const faqs = faqsList;
    const tbody = document.getElementById('faq-table');
    if (!tbody) return;

    let filtered = faqs;
    if (faqStatusFilter !== 'all') {
        filtered = filtered.filter(f => {
            const status = (f.status || 'active').toLowerCase();
            const isApproved = f.isApproved || status === 'approved' || status === 'active';
            if (faqStatusFilter === 'approved') return isApproved;
            if (faqStatusFilter === 'pending') return !f.answer || status === 'pending';
            return status === faqStatusFilter;
        });
    }

    if (faqSearchTerm) {
        const term = faqSearchTerm.toLowerCase();
        filtered = filtered.filter(f =>
            ((f.id || f._id || '') && (f.id || f._id || '').toLowerCase().includes(term)) ||
            (f.question && f.question.toLowerCase().includes(term)) ||
            (f.answer && f.answer.toLowerCase().includes(term)) ||
            (f.category && f.category.toLowerCase().includes(term))
        );
    }

    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / FAQ_PAGE_SIZE) || 1;
    if (faqCurrentPage > totalPages) {
        faqCurrentPage = totalPages;
    }

    if (totalFiltered === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><div class="empty-state__icon">❓</div><div class="empty-state__text">No FAQs found</div><div style="font-size:0.8rem; color:var(--color-muted); margin-top:0.25rem;">Click "+ Add FAQ" or wait for customer questions.</div></td></tr>';
        renderPagination('faq-pagination', 1, 0, FAQ_PAGE_SIZE, () => {});
        return;
    }

    const paginated = filtered.slice((faqCurrentPage - 1) * FAQ_PAGE_SIZE, faqCurrentPage * FAQ_PAGE_SIZE);

    tbody.innerHTML = paginated.map(faq => {
        const faqId = faq.id || faq._id || 'N/A';
        const hasAnswer = !!(faq.answer && faq.answer.trim());
        const isApproved = faq.isApproved !== false && (faq.status === 'approved' || faq.status === 'active');

        let statusBadgeHtml = '';
        if (isApproved && hasAnswer) {
            statusBadgeHtml = '<span class="status-badge status-badge--delivered"><span class="status-dot"></span>Live & Approved</span>';
        } else if (!hasAnswer) {
            statusBadgeHtml = '<span class="status-badge status-badge--pending"><span class="status-dot"></span>Awaiting Reply</span>';
        } else {
            statusBadgeHtml = '<span class="status-badge status-badge--cancelled"><span class="status-dot"></span>Draft / Hidden</span>';
        }

        const answerSnippet = hasAnswer 
            ? `<span style="color: #524b43; font-size: 0.82rem; line-height: 1.45;">${escapeHtml(faq.answer)}</span>`
            : `<span style="color: #b45309; font-size: 0.8rem; font-style: italic; font-weight: 500;">No answer yet. Click Reply to answer.</span>`;

        return `
            <tr>
                <td><span class="product-id-badge">${escapeHtml(faqId)}</span></td>
                <td style="max-width: 260px;">
                    <strong style="color: var(--color-charcoal); font-weight: 600; font-size: 0.88rem; line-height: 1.35; display: block;">
                        ${escapeHtml(faq.question)}
                    </strong>
                </td>
                <td style="max-width: 320px;">
                    <div style="max-height: 70px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                        ${answerSnippet}
                    </div>
                </td>
                <td>
                    <span style="font-weight: 600; font-size: 0.76rem; color: #6e6459; background: #f6f2ea; padding: 2px 8px; border-radius: 6px; border: 1px solid #eae3d6; white-space: nowrap;">
                        ${escapeHtml(faq.category || 'General')}
                    </span>
                </td>
                <td>${statusBadgeHtml}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn--sm btn--secondary" data-reply-faq="${faqId}" title="Reply or edit official answer">Reply</button>
                        <button class="btn btn--sm ${isApproved ? 'btn--secondary' : 'btn--success'}" data-toggle-approve="${faqId}" title="${isApproved ? 'Unpublish from website' : 'Approve and publish to website'}">
                            ${isApproved ? 'Unpublish' : 'Approve'}
                        </button>
                        <button class="btn btn--sm btn--danger" data-delete-faq="${faqId}">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // Render pagination
    renderPagination('faq-pagination', faqCurrentPage, totalFiltered, FAQ_PAGE_SIZE, (newPage) => {
        faqCurrentPage = newPage;
        renderFaqs();
    });

    tbody.querySelectorAll('[data-reply-faq]').forEach(btn => {
        btn.addEventListener('click', () => openReplyModal(btn.dataset.replyFaq));
    });
    tbody.querySelectorAll('[data-toggle-approve]').forEach(btn => {
        btn.addEventListener('click', () => toggleFaqApproval(btn.dataset.toggleApprove));
    });
    tbody.querySelectorAll('[data-delete-faq]').forEach(btn => {
        btn.addEventListener('click', () => deleteFaq(btn.dataset.deleteFaq, btn));
    });
}

function openFaqModal(faq) {
    const isEdit = !!faq;
    document.getElementById('faq-modal-title').textContent = isEdit ? 'Edit FAQ' : 'Add FAQ';
    document.getElementById('faq-id').value = isEdit ? (faq.id || faq._id || '') : '';
    document.getElementById('faq-question').value = isEdit ? (faq.question || '') : '';
    document.getElementById('faq-answer').value = isEdit ? (faq.answer || '') : '';
    document.getElementById('faq-category').value = isEdit ? (faq.category || 'General') : 'Shipping & Delivery';
    document.getElementById('faq-status').value = isEdit ? (faq.status || 'approved') : 'approved';
    openModal('faq-modal');
}

function openReplyModal(id) {
    const faq = faqsList.find(f => f.id === id || f._id === id);
    if (!faq) return;

    document.getElementById('faq-reply-id').value = faq.id || faq._id || '';
    document.getElementById('faq-reply-question-text').textContent = faq.question || '';
    document.getElementById('faq-reply-answer').value = faq.answer || '';
    
    const isApproved = faq.isApproved !== false && (faq.status === 'approved' || faq.status === 'active');
    document.getElementById('faq-reply-approve-checkbox').checked = isApproved || !faq.answer;

    openModal('faq-reply-modal');
}

async function handleFaqReplyForm(e) {
    e.preventDefault();
    const id = document.getElementById('faq-reply-id').value;
    const answer = document.getElementById('faq-reply-answer').value.trim();
    const approve = document.getElementById('faq-reply-approve-checkbox').checked;

    if (!answer) {
        showToast('Please enter an answer before publishing', 'error');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) setButtonLoading(submitBtn, true, 'Publishing...');

    try {
        if (typeof API !== 'undefined' && API.replyFaq) {
            await API.replyFaq(id, answer, approve);
        }
    } catch (apiErr) {
        console.warn('API reply error:', apiErr);
    } finally {
        if (submitBtn) setButtonLoading(submitBtn, false);
    }

    const faq = faqsList.find(f => f.id === id || f._id === id);
    if (faq) {
        faq.answer = answer;
        faq.status = approve ? 'approved' : 'inactive';
        faq.isApproved = approve;
        Storage.saveFaqs(faqsList);
    }

    closeModal('faq-reply-modal');
    renderFaqs();
    showToast(approve ? 'Answer published live to website!' : 'Answer saved as draft.', 'success');
}

async function toggleFaqApproval(id) {
    const faq = faqsList.find(f => f.id === id || f._id === id);
    if (!faq) return;

    const currentlyApproved = faq.isApproved !== false && (faq.status === 'approved' || faq.status === 'active');
    const newApproved = !currentlyApproved;
    const newStatus = newApproved ? 'approved' : 'inactive';

    try {
        if (typeof API !== 'undefined' && API.replyFaq) {
            await API.replyFaq(id, faq.answer || '', newApproved);
        }
    } catch (err) {
        console.warn('API approve toggle error:', err);
    }

    faq.status = newStatus;
    faq.isApproved = newApproved;
    Storage.saveFaqs(faqsList);
    renderFaqs();
    showToast(newApproved ? 'FAQ approved for live website view' : 'FAQ hidden from website', 'success');
}

async function deleteFaq(id, btnElement) {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    if (btnElement) setButtonLoading(btnElement, true, 'Deleting...');
    const faq = faqsList.find(f => f.id === id || f._id === id);
    const dbId = (faq && faq._id) ? faq._id : id;
    try {
        if (typeof API !== 'undefined' && API.deleteFaq) {
            await API.deleteFaq(dbId);
        }
    } catch (e) {
        console.warn('API delete FAQ error:', e);
    } finally {
        if (btnElement) setButtonLoading(btnElement, false);
    }
    faqsList = faqsList.filter(f => f.id !== id && f._id !== id);
    Storage.saveFaqs(faqsList);
    renderFaqs();
    showToast('FAQ deleted successfully', 'success');
}

async function handleFaqForm(e) {
    e.preventDefault();
    const idInput = document.getElementById('faq-id').value;
    const isEdit = !!idInput;
    const question = document.getElementById('faq-question').value.trim();
    const answer = document.getElementById('faq-answer').value.trim();
    const category = document.getElementById('faq-category').value;
    const status = document.getElementById('faq-status').value;

    if (!question) {
        showToast('Question is required', 'error');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) setButtonLoading(submitBtn, true, isEdit ? 'Saving...' : 'Creating...');

    let faqId = idInput;
    if (!faqId) {
        faqId = generateId('FAQ');
    }

    const faqData = {
        id: faqId,
        question,
        answer,
        category,
        status,
        isApproved: (status === 'approved' || status === 'active')
    };

    try {
        if (typeof API !== 'undefined') {
            const targetFaq = faqsList.find(f => f.id === faqId || f._id === faqId);
            const dbId = (targetFaq && targetFaq._id) ? targetFaq._id : faqId;
            if (isEdit && API.updateFaq) {
                await API.updateFaq(dbId, faqData);
            } else if (!isEdit && API.createFaq) {
                await API.createFaq(faqData);
            }
        }
    } catch (apiErr) {
        console.warn('API FAQ sync warning:', apiErr);
    } finally {
        if (submitBtn) setButtonLoading(submitBtn, false);
    }

    if (isEdit) {
        const idx = faqsList.findIndex(f => f.id === faqId || f._id === faqId);
        if (idx > -1) {
            faqsList[idx] = { ...faqsList[idx], ...faqData };
        }
    } else {
        faqsList.unshift(faqData);
    }

    Storage.saveFaqs(faqsList);
    closeModal('faq-modal');
    renderFaqs();
    showToast(isEdit ? 'FAQ updated successfully' : 'FAQ created successfully', 'success');
}

document.addEventListener('DOMContentLoaded', () => {
    initLayout('faq');
    loadFaqsData();

    const addFaqBtn = document.getElementById('add-faq-btn');
    if (addFaqBtn) {
        addFaqBtn.addEventListener('click', () => openFaqModal(null));
    }

    const faqForm = document.getElementById('faq-form');
    if (faqForm) {
        faqForm.addEventListener('submit', handleFaqForm);
    }

    const faqReplyForm = document.getElementById('faq-reply-form');
    if (faqReplyForm) {
        faqReplyForm.addEventListener('submit', handleFaqReplyForm);
    }

    const faqSearch = document.getElementById('faq-search');
    if (faqSearch) {
        faqSearch.addEventListener('input', (e) => {
            faqSearchTerm = e.target.value;
            faqCurrentPage = 1;
            renderFaqs();
        });
    }

    const statusFilter = document.getElementById('faq-status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            faqStatusFilter = e.target.value;
            faqCurrentPage = 1;
            renderFaqs();
        });
    }
});
