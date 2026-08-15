/**
 * Maira Jewels Admin - Categories Controller
 */

let categoryCurrentPage = 1;
const CATEGORIES_PAGE_SIZE = 10;

function renderCategories() {
    const categories = Storage.getCategories();
    const products = Storage.getProducts();
    const tbody = document.getElementById('categories-table');
    if (!tbody) return;

    const totalFiltered = categories.length;
    const totalPages = Math.ceil(totalFiltered / CATEGORIES_PAGE_SIZE) || 1;
    if (categoryCurrentPage > totalPages) {
        categoryCurrentPage = totalPages;
    }

    if (totalFiltered === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state"><div class="empty-state__icon">🏷️</div><div class="empty-state__text">No categories found</div></td></tr>';
        renderPagination('categories-pagination', 1, 0, CATEGORIES_PAGE_SIZE, () => {});
        return;
    }

    const paginated = categories.slice((categoryCurrentPage - 1) * CATEGORIES_PAGE_SIZE, categoryCurrentPage * CATEGORIES_PAGE_SIZE);

    tbody.innerHTML = paginated.map(cat => {
        const productCount = products.filter(p => p.category === cat.name).length;
        return `
            <tr>
                <td><strong style="color: var(--color-charcoal);">${escapeHtml(cat.name)}</strong></td>
                <td style="color: var(--color-muted);">${escapeHtml(cat.description || '—')}</td>
                <td><span class="status-badge status-badge--info">${productCount} product${productCount === 1 ? '' : 's'}</span></td>
                <td>
                    <div class="actions">
                        <button class="btn btn--sm btn--secondary" data-edit-category="${cat.id}">Edit</button>
                        <button class="btn btn--sm btn--danger" data-delete-category="${cat.id}">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // Render pagination
    renderPagination('categories-pagination', categoryCurrentPage, totalFiltered, CATEGORIES_PAGE_SIZE, (newPage) => {
        categoryCurrentPage = newPage;
        renderCategories();
    });

    tbody.querySelectorAll('[data-edit-category]').forEach(btn => {
        btn.addEventListener('click', () => editCategory(btn.dataset.editCategory));
    });
    tbody.querySelectorAll('[data-delete-category]').forEach(btn => {
        btn.addEventListener('click', () => deleteCategory(btn.dataset.deleteCategory));
    });
}

function openCategoryModal(category) {
    document.getElementById('category-modal-title').textContent = category ? 'Edit Category' : 'Add Category';
    document.getElementById('category-id').value = category ? category.id : '';
    document.getElementById('category-name').value = category ? category.name : '';
    document.getElementById('category-description').value = category ? category.description : '';
    openModal('category-modal');
}

function editCategory(id) {
    const category = Storage.getCategories().find(c => c.id === id);
    if (category) openCategoryModal(category);
}

function deleteCategory(id) {
    const category = Storage.getCategories().find(c => c.id === id);
    if (!category) return;
    const productCount = Storage.getProducts().filter(p => p.category === category.name).length;
    if (productCount > 0) {
        if (!confirm(`This category has ${productCount} product(s). Deleting it will not delete the products but they will be uncategorized. Continue?`)) return;
    } else {
        if (!confirm('Are you sure you want to delete this category?')) return;
    }
    const categories = Storage.getCategories().filter(c => c.id !== id);
    Storage.saveCategories(categories);
    renderCategories();
    showToast('Category deleted successfully', 'success');
}

function handleCategoryForm(e) {
    e.preventDefault();
    const id = document.getElementById('category-id').value;
    const name = document.getElementById('category-name').value.trim();
    const description = document.getElementById('category-description').value.trim();

    if (!name) {
        showToast('Category name is required', 'error');
        return;
    }

    const categories = Storage.getCategories();
    const catData = { id: id || generateId('cat'), name, description };

    if (id) {
        const idx = categories.findIndex(c => c.id === id);
        if (idx > -1) categories[idx] = catData;
    } else {
        categories.push(catData);
    }

    Storage.saveCategories(categories);
    closeModal('category-modal');
    renderCategories();
    showToast(id ? 'Category updated successfully' : 'Category added successfully', 'success');
}

document.addEventListener('DOMContentLoaded', () => {
    initLayout('categories');

    const addCategoryBtn = document.getElementById('add-category-btn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', () => openCategoryModal(null));
    }

    const categoryForm = document.getElementById('category-form');
    if (categoryForm) {
        categoryForm.addEventListener('submit', handleCategoryForm);
    }

    renderCategories();
});
