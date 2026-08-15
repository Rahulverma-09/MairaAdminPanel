/**
 * Maira Jewels Admin - FAQ Controller
 */

let faqSearchTerm = '';
let faqCurrentPage = 1;
const FAQ_PAGE_SIZE = 10;

function renderFaqs() {
    const faqs = Storage.getFaqs();
    const tbody = document.getElementById('faq-table');
    if (!tbody) return;

    let filtered = faqs;
    if (faqSearchTerm) {
        const term = faqSearchTerm.toLowerCase();
        filtered = filtered.filter(f =>
            f.question.toLowerCase().includes(term) ||
            f.answer.toLowerCase().includes(term) ||
            f.category.toLowerCase().includes(term)
        );
    }

    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / FAQ_PAGE_SIZE) || 1;
    if (faqCurrentPage > totalPages) {
        faqCurrentPage = totalPages;
    }

    if (totalFiltered === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><div class="empty-state__icon">❓</div><div class="empty-state__text">No FAQs found</div></td></tr>';
        renderPagination('faq-pagination', 1, 0, FAQ_PAGE_SIZE, () => {});
        return;
    }

    const paginated = filtered.slice((faqCurrentPage - 1) * FAQ_PAGE_SIZE, faqCurrentPage * FAQ_PAGE_SIZE);

    tbody.innerHTML = paginated.map(faq => `
        <tr>
            <td style="max-width: 300px;"><strong style="color: var(--color-charcoal);">${escapeHtml(faq.question)}</strong></td>
            <td style="max-width: 350px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--color-muted);">${escapeHtml(faq.answer)}</td>
            <td><span class="status-badge status-badge--info">${escapeHtml(faq.category)}</span></td>
            <td>${getStatusBadge(faq.status)}</td>
            <td>
                <div class="actions">
                    <button class="btn btn--sm btn--secondary" data-edit-faq="${faq.id}">Edit</button>
                    <button class="btn btn--sm btn--success" data-toggle-faq="${faq.id}">${faq.status === 'active' ? 'Deactivate' : 'Activate'}</button>
                    <button class="btn btn--sm btn--danger" data-delete-faq="${faq.id}">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');

    // Render pagination
    renderPagination('faq-pagination', faqCurrentPage, totalFiltered, FAQ_PAGE_SIZE, (newPage) => {
        faqCurrentPage = newPage;
        renderFaqs();
    });

    tbody.querySelectorAll('[data-edit-faq]').forEach(btn => {
        btn.addEventListener('click', () => editFaq(btn.dataset.editFaq));
    });
    tbody.querySelectorAll('[data-toggle-faq]').forEach(btn => {
        btn.addEventListener('click', () => toggleFaqStatus(btn.dataset.toggleFaq));
    });
    tbody.querySelectorAll('[data-delete-faq]').forEach(btn => {
        btn.addEventListener('click', () => deleteFaq(btn.dataset.deleteFaq));
    });
}

function openFaqModal(faq) {
    document.getElementById('faq-modal-title').textContent = faq ? 'Edit FAQ' : 'Add FAQ';
    document.getElementById('faq-id').value = faq ? faq.id : '';
    document.getElementById('faq-question').value = faq ? faq.question : '';
    document.getElementById('faq-answer').value = faq ? faq.answer : '';
    document.getElementById('faq-category').value = faq ? faq.category : 'General';
    document.getElementById('faq-status').value = faq ? faq.status : 'active';
    openModal('faq-modal');
}

function editFaq(id) {
    const faq = Storage.getFaqs().find(f => f.id === id);
    if (faq) openFaqModal(faq);
}

function toggleFaqStatus(id) {
    const faqs = Storage.getFaqs();
    const faq = faqs.find(f => f.id === id);
    if (faq) {
        faq.status = faq.status === 'active' ? 'inactive' : 'active';
        Storage.saveFaqs(faqs);
        renderFaqs();
        showToast(`FAQ ${faq.status === 'active' ? 'activated' : 'deactivated'}`, 'success');
    }
}

function deleteFaq(id) {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    const faqs = Storage.getFaqs().filter(f => f.id !== id);
    Storage.saveFaqs(faqs);
    renderFaqs();
    showToast('FAQ deleted successfully', 'success');
}

function handleFaqForm(e) {
    e.preventDefault();
    const id = document.getElementById('faq-id').value;
    const question = document.getElementById('faq-question').value.trim();
    const answer = document.getElementById('faq-answer').value.trim();
    const category = document.getElementById('faq-category').value;
    const status = document.getElementById('faq-status').value;

    if (!question || !answer) {
        showToast('Question and Answer are required', 'error');
        return;
    }

    const faqs = Storage.getFaqs();
    const faqData = {
        id: id || generateId('faq'),
        question,
        answer,
        category,
        status
    };

    if (id) {
        const idx = faqs.findIndex(f => f.id === id);
        if (idx > -1) faqs[idx] = faqData;
    } else {
        faqs.push(faqData);
    }

    Storage.saveFaqs(faqs);
    closeModal('faq-modal');
    renderFaqs();
    showToast(id ? 'FAQ updated successfully' : 'FAQ added successfully', 'success');
}

document.addEventListener('DOMContentLoaded', () => {
    initLayout('faq');

    const addFaqBtn = document.getElementById('add-faq-btn');
    if (addFaqBtn) {
        addFaqBtn.addEventListener('click', () => openFaqModal(null));
    }

    const faqForm = document.getElementById('faq-form');
    if (faqForm) {
        faqForm.addEventListener('submit', handleFaqForm);
    }

    const faqSearch = document.getElementById('faq-search');
    if (faqSearch) {
        faqSearch.addEventListener('input', (e) => {
            faqSearchTerm = e.target.value;
            faqCurrentPage = 1;
            renderFaqs();
        });
    }

    renderFaqs();
});
