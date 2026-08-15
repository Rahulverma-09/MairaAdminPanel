/**
 * Maira Jewels Admin - Products Controller
 */

let productSearchTerm = '';
let productCategoryFilter = 'all';
let productCurrentPage = 1;
const PRODUCTS_PAGE_SIZE = 10;

function renderProducts() {
    const products = Storage.getProducts();
    const categories = Storage.getCategories();
    const tbody = document.getElementById('products-table');
    if (!tbody) return;

    // Populate category filter
    const filterSelect = document.getElementById('product-category-filter');
    if (filterSelect) {
        const currentVal = filterSelect.value;
        filterSelect.innerHTML = '<option value="all">All Categories</option>' +
            categories.map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('');
        filterSelect.value = currentVal || 'all';
    }

    // Populate category select in modal
    const catSelect = document.getElementById('product-category');
    if (catSelect) {
        const currentVal = catSelect.value;
        catSelect.innerHTML = categories.map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('');
        if (currentVal) catSelect.value = currentVal;
    }

    // Filter products
    let filtered = products;
    if (productSearchTerm) {
        const term = productSearchTerm.toLowerCase();
        filtered = filtered.filter(p =>
            (p.name && p.name.toLowerCase().includes(term)) ||
            (p.specs && p.specs.toLowerCase().includes(term)) ||
            (p.metal && p.metal.toLowerCase().includes(term)) ||
            (p.gem && p.gem.toLowerCase().includes(term))
        );
    }
    if (productCategoryFilter !== 'all') {
        filtered = filtered.filter(p => p.category === productCategoryFilter);
    }

    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / PRODUCTS_PAGE_SIZE) || 1;
    if (productCurrentPage > totalPages) {
        productCurrentPage = totalPages;
    }

    if (totalFiltered === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><div class="empty-state__icon">💎</div><div class="empty-state__text">No products found</div></td></tr>';
        renderPagination('products-pagination', 1, 0, PRODUCTS_PAGE_SIZE, () => {});
        return;
    }

    const paginated = filtered.slice((productCurrentPage - 1) * PRODUCTS_PAGE_SIZE, productCurrentPage * PRODUCTS_PAGE_SIZE);

    tbody.innerHTML = paginated.map(product => {
        let badgeHtml = '—';
        if (product.badge) {
            const badgeType = product.badge.toLowerCase();
            badgeHtml = `<span class="status-badge status-badge--${badgeType}"><span class="status-dot"></span>${escapeHtml(product.badge)}</span>`;
        }
        return `
            <tr>
                <td><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" class="product-thumb" onerror="this.src='https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'"></td>
                <td><strong style="color: var(--color-charcoal); font-size: 0.92rem;">${escapeHtml(product.name)}</strong></td>
                <td><span style="font-weight: 500;">${escapeHtml(product.category)}</span></td>
                <td><strong style="color: var(--color-charcoal); font-weight: 700;">${escapeHtml(product.price)}</strong></td>
                <td style="color: var(--color-muted);">${escapeHtml(product.metal || '—')}</td>
                <td style="color: var(--color-muted);">${escapeHtml(product.gem || '—')}</td>
                <td>${badgeHtml}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn--sm btn--secondary" data-edit-product="${product.id}">Edit</button>
                        <button class="btn btn--sm btn--danger" data-delete-product="${product.id}">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // Render pagination
    renderPagination('products-pagination', productCurrentPage, totalFiltered, PRODUCTS_PAGE_SIZE, (newPage) => {
        productCurrentPage = newPage;
        renderProducts();
    });

    // Attach event handlers
    tbody.querySelectorAll('[data-edit-product]').forEach(btn => {
        btn.addEventListener('click', () => editProduct(btn.dataset.editProduct));
    });
    tbody.querySelectorAll('[data-delete-product]').forEach(btn => {
        btn.addEventListener('click', () => deleteProduct(btn.dataset.deleteProduct));
    });
}

function openProductModal(product) {
    document.getElementById('product-modal-title').textContent = product ? 'Edit Product' : 'Add Product';
    document.getElementById('product-id').value = product ? product.id : '';
    document.getElementById('product-name').value = product ? product.name : '';
    document.getElementById('product-category').value = product ? product.category : '';
    document.getElementById('product-price').value = product ? product.priceNum : '';
    document.getElementById('product-metal').value = product ? product.metal : '';
    document.getElementById('product-gem').value = product ? product.gem : '';
    document.getElementById('product-badge').value = product ? product.badge : '';
    document.getElementById('product-specs').value = product ? product.specs : '';
    document.getElementById('product-image').value = product ? product.image : '';
    document.getElementById('product-thumbs').value = product && product.thumbs ? product.thumbs.join(', ') : '';
    openModal('product-modal');
}

function editProduct(id) {
    const product = Storage.getProducts().find(p => p.id === id);
    if (product) openProductModal(product);
}

function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const products = Storage.getProducts().filter(p => p.id !== id);
    Storage.saveProducts(products);
    renderProducts();
    showToast('Product deleted successfully', 'success');
}

function handleProductForm(e) {
    e.preventDefault();
    const id = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value.trim();
    const category = document.getElementById('product-category').value;
    const priceNum = parseFloat(document.getElementById('product-price').value) || 0;
    const metal = document.getElementById('product-metal').value.trim();
    const gem = document.getElementById('product-gem').value.trim();
    const badge = document.getElementById('product-badge').value;
    const specs = document.getElementById('product-specs').value.trim();
    const image = document.getElementById('product-image').value.trim();
    const thumbsStr = document.getElementById('product-thumbs').value.trim();

    if (!name || !category || !priceNum) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const thumbs = thumbsStr
        ? thumbsStr.split(',').map(t => t.trim()).filter(t => t)
        : [image];

    const products = Storage.getProducts();
    const productData = {
        id: id || generateId('item'),
        name,
        category,
        price: formatPrice(priceNum),
        priceNum,
        metal: metal || '18K Gold',
        gem: gem || 'Diamond',
        specs: specs || `${metal || '18K Gold'} · ${gem || 'Diamond'}`,
        badge,
        image: image || 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
        thumbs: thumbs.length > 0 ? thumbs : [image || 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80']
    };

    if (id) {
        const idx = products.findIndex(p => p.id === id);
        if (idx > -1) products[idx] = productData;
    } else {
        products.push(productData);
    }

    Storage.saveProducts(products);
    closeModal('product-modal');
    renderProducts();
    showToast(id ? 'Product updated successfully' : 'Product added successfully', 'success');
}

document.addEventListener('DOMContentLoaded', () => {
    initLayout('products');
    renderProducts();

    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => openProductModal(null));
    }

    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', handleProductForm);
    }

    const productSearch = document.getElementById('product-search');
    if (productSearch) {
        productSearch.addEventListener('input', (e) => {
            productSearchTerm = e.target.value;
            productCurrentPage = 1;
            renderProducts();
        });
    }

    const productCatFilter = document.getElementById('product-category-filter');
    if (productCatFilter) {
        productCatFilter.addEventListener('change', (e) => {
            productCategoryFilter = e.target.value;
            productCurrentPage = 1;
            renderProducts();
        });
    }
});
