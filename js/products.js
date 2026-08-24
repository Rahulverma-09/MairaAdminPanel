/**
 * Maira Jewels Admin - Products Controller
 */

let productSearchTerm = '';
let productCategoryFilter = 'all';
let productCurrentPage = 1;
const PRODUCTS_PAGE_SIZE = 10;
let productsList = [];

// State for images & spec badges currently in the modal
let currentProductImages = [];
let currentProductSpecs = [];

async function loadProductsData() {
    const tbody = document.getElementById('products-table');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2.5rem; color: var(--color-muted);"><div class="spinner" style="margin: 0 auto 0.5rem;"></div>Loading products...</td></tr>';
    }

    // 1. Fetch Categories live from API
    try {
        if (typeof API !== 'undefined' && API.getCategories) {
            const catRes = await API.getCategories();
            if (catRes && catRes.data) {
                const cats = Array.isArray(catRes.data) ? catRes.data : (catRes.data.categories || []);
                Storage.saveCategories(cats);
            }
        }
    } catch (ce) {
        console.warn('[Products] Categories fetch error:', ce);
    }

    // 2. Fetch Products live from API
    try {
        if (typeof API !== 'undefined' && API.getProducts) {
            const res = await API.getProducts({ limit: 100 });
            if (res && res.data) {
                const rawList = Array.isArray(res.data) ? res.data : (res.data.products || []);
                productsList = rawList.map((p, index) => {
                    const cleanId = getProductDisplayId(p, index);
                    p.productId = cleanId;
                    p.code = cleanId;
                    // Persist to backend DB asynchronously if not yet stored
                    if (p._id && API.updateProduct && (!p.productId || isMongoId(p.productId))) {
                        API.updateProduct(p._id, { productId: cleanId, code: cleanId }).catch(err => {
                            console.warn('[Products] Background sync of productId:', err);
                        });
                    }
                    return p;
                });
                Storage.saveProducts(productsList);
            } else {
                productsList = [];
            }
        } else {
            productsList = [];
        }
    } catch (e) {
        console.error('[Products] API fetch error:', e.message);
        productsList = Storage.getProducts();
        showToast('Failed to load products from server: ' + e.message, 'error');
    }
    renderProducts();
}

function parseSpecsBadges(specs) {
    if (!specs) return [];
    if (Array.isArray(specs)) return specs.map(s => String(s).trim()).filter(Boolean);
    if (typeof specs === 'string') {
        return specs.split(/[,•\n|•·\u2022]+/g).map(s => s.trim()).filter(Boolean);
    }
    return [];
}

function renderProducts() {
    const products = productsList;
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
        catSelect.innerHTML = '<option value="">Select a category</option>' +
            categories.map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('');
        if (currentVal) catSelect.value = currentVal;
    }

    // Filter products
    let filtered = products;
    if (productSearchTerm) {
        const term = productSearchTerm.toLowerCase();
        filtered = filtered.filter(p => {
            const displayId = getProductDisplayId(p).toLowerCase();
            return displayId.includes(term) ||
                ((p.id || p._id || '') && (p.id || p._id || '').toLowerCase().includes(term)) ||
                (p.name && p.name.toLowerCase().includes(term)) ||
                (p.category && p.category.toLowerCase().includes(term)) ||
                (p.details && p.details.toLowerCase().includes(term)) ||
                (p.specs && String(p.specs).toLowerCase().includes(term)) ||
                (p.description && p.description.toLowerCase().includes(term)) ||
                (p.badge && p.badge.toLowerCase().includes(term));
        });
    }
    if (productCategoryFilter !== 'all') {
        filtered = filtered.filter(p => (p.category || '').toLowerCase() === productCategoryFilter.toLowerCase());
    }

    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / PRODUCTS_PAGE_SIZE) || 1;
    if (productCurrentPage > totalPages) {
        productCurrentPage = totalPages;
    }

    if (totalFiltered === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><div class="empty-state__icon">💎</div><div class="empty-state__text">No products found</div><div style="font-size:0.8rem; color:var(--color-muted); margin-top:0.25rem;">Click "+ Add Product" to add your first piece.</div></td></tr>';
        renderPagination('products-pagination', 1, 0, PRODUCTS_PAGE_SIZE, () => {});
        return;
    }

    const paginated = filtered.slice((productCurrentPage - 1) * PRODUCTS_PAGE_SIZE, productCurrentPage * PRODUCTS_PAGE_SIZE);

    tbody.innerHTML = paginated.map((product, index) => {
        const dbId = product._id || product.id || 'N/A';
        const displayProdId = getProductDisplayId(product, (productCurrentPage - 1) * PRODUCTS_PAGE_SIZE + index);
        let badgeHtml = '—';
        if (product.badge) {
            const badgeType = product.badge.toLowerCase().replace(/\s+/g, '-');
            badgeHtml = `<span class="status-badge status-badge--${badgeType}"><span class="status-dot"></span>${escapeHtml(product.badge)}</span>`;
        }

        const images = (product.images && product.images.length > 0) 
            ? product.images 
            : (product.thumbs && product.thumbs.length > 0 ? product.thumbs : [product.image || 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80']);
        const primaryImg = images[0] || 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80';
        const imgCount = images.length;

        const detailsSnippet = product.details
            ? `<div class="table-product-desc" title="${escapeHtml(product.details)}"><strong>Details:</strong> ${escapeHtml(product.details)}</div>`
            : (product.description ? `<div class="table-product-desc" title="${escapeHtml(product.description)}">${escapeHtml(product.description)}</div>` : '');

        // Render specifications as badges
        const specsArray = parseSpecsBadges(product.specs);
        let specsBadgesHtml = '—';
        if (specsArray.length > 0) {
            specsBadgesHtml = `
                <div class="table-specs-badges">
                    ${specsArray.map(spec => `<span class="table-spec-chip">🏷️ ${escapeHtml(spec)}</span>`).join('')}
                </div>
            `;
        } else if (product.specs && typeof product.specs === 'string') {
            specsBadgesHtml = `<span class="table-spec-chip">${escapeHtml(product.specs)}</span>`;
        }

        return `
            <tr>
                <td>
                    <span class="product-id-badge">${escapeHtml(displayProdId)}</span>
                </td>
                <td>
                    <div class="table-product-cell">
                        <div class="product-thumb-wrap">
                            <img src="${escapeHtml(primaryImg)}" alt="${escapeHtml(product.name)}" class="product-thumb" onerror="this.src='https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'">
                            ${imgCount > 1 ? `<span class="img-count-badge" title="${imgCount} images">${imgCount}</span>` : ''}
                        </div>
                        <div class="table-product-info">
                            <strong class="table-product-title">${escapeHtml(product.name)}</strong>
                            ${detailsSnippet}
                        </div>
                    </div>
                </td>
                <td><span style="font-weight: 600; color: #4a443d;">${escapeHtml(product.category)}</span></td>
                <td style="text-align: right;"><strong style="color: var(--color-charcoal); font-weight: 700; font-size: 0.92rem;">${escapeHtml(product.price || formatPrice(product.priceNum || 0))}</strong></td>
                <td>
                    ${specsBadgesHtml}
                </td>
                <td style="text-align: center;">${badgeHtml}</td>
                <td style="text-align: center;">
                    <div class="actions" style="justify-content: center;">
                        <button class="btn btn--sm btn--secondary" data-edit-product="${escapeHtml(dbId)}">Edit</button>
                        <button class="btn btn--sm btn--danger" data-delete-product="${escapeHtml(dbId)}">Delete</button>
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

function renderSpecsBadges() {
    const container = document.getElementById('specs-badges-list');
    const hiddenInput = document.getElementById('product-specs');
    if (!container) return;

    if (hiddenInput) {
        hiddenInput.value = currentProductSpecs.join(' • ');
    }

    if (currentProductSpecs.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = currentProductSpecs.map((spec, index) => `
        <span class="spec-badge-pill">
            <span>🏷️ ${escapeHtml(spec)}</span>
            <button type="button" class="btn-remove-spec" data-remove-spec="${index}" title="Remove badge">&times;</button>
        </span>
    `).join('');

    container.querySelectorAll('[data-remove-spec]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.removeSpec, 10);
            currentProductSpecs.splice(idx, 1);
            renderSpecsBadges();
        });
    });
}

function addSpecBadge(text) {
    const clean = (text || '').trim();
    if (!clean) return;
    
    // Split by commas if user pasted comma-separated specs
    const parts = clean.split(/[,|]+/).map(p => p.trim()).filter(Boolean);
    parts.forEach(part => {
        if (!currentProductSpecs.includes(part)) {
            currentProductSpecs.push(part);
        }
    });
    renderSpecsBadges();
}

function renderModalPreviews() {
    const container = document.getElementById('image-previews-container');
    if (!container) return;

    if (currentProductImages.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; font-size: 0.76rem; color: var(--color-muted); font-style: italic;">No images added yet. Upload files or enter URL above.</div>';
        return;
    }

    container.innerHTML = currentProductImages.map((imgUrl, index) => `
        <div class="image-preview-card">
            <img src="${escapeHtml(imgUrl)}" alt="Product Image ${index + 1}" onerror="this.src='https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'">
            ${index === 0 ? '<span class="primary-tag">Main</span>' : ''}
            <button type="button" class="btn-remove-img" data-remove-index="${index}" title="Remove Image">&times;</button>
        </div>
    `).join('');

    container.querySelectorAll('[data-remove-index]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.removeIndex, 10);
            currentProductImages.splice(idx, 1);
            renderModalPreviews();
        });
    });
}

function openProductModal(product) {
    const isEdit = !!product;
    document.getElementById('product-modal-title').textContent = isEdit ? 'Edit Product' : 'Add Product';
    
    const idInput = document.getElementById('product-id');
    const nameInput = document.getElementById('product-name');
    const catSelect = document.getElementById('product-category');
    const priceInput = document.getElementById('product-price');
    const badgeSelect = document.getElementById('product-badge');
    const detailsInput = document.getElementById('product-details');
    const specsInput = document.getElementById('product-specs');
    const specsTextInput = document.getElementById('product-specs-input');
    const descTextarea = document.getElementById('product-description');

    if (isEdit) {
        const prodId = product._id || product.id || '';
        idInput.value = prodId;
        nameInput.value = product.name || '';
        catSelect.value = product.category || '';
        priceInput.value = product.priceNum != null ? product.priceNum : (typeof product.price === 'number' ? product.price : '');
        badgeSelect.value = product.badge || '';
        if (detailsInput) detailsInput.value = product.details || '';
        if (specsTextInput) specsTextInput.value = '';
        descTextarea.value = product.description || '';
        
        currentProductSpecs = parseSpecsBadges(product.specs);
        if (specsInput) specsInput.value = currentProductSpecs.join(' • ');

        currentProductImages = (product.images && product.images.length > 0)
            ? [...product.images]
            : (product.thumbs && product.thumbs.length > 0 ? [...product.thumbs] : [product.image || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80']);
    } else {
        idInput.value = '';
        nameInput.value = '';
        catSelect.value = '';
        priceInput.value = '';
        badgeSelect.value = '';
        if (detailsInput) detailsInput.value = '';
        if (specsTextInput) specsTextInput.value = '';
        if (specsInput) specsInput.value = '';
        descTextarea.value = '';
        currentProductSpecs = [];
        currentProductImages = [];
    }

    renderSpecsBadges();
    renderModalPreviews();
    openModal('product-modal');
}

function editProduct(id) {
    const product = productsList.find(p => (p.id === id || p._id === id));
    if (product) openProductModal(product);
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const targetProduct = productsList.find(p => p.id === id || p._id === id);
    const dbId = (targetProduct && targetProduct._id) ? targetProduct._id : id;
    try {
        if (typeof API !== 'undefined' && API.deleteProduct) {
            await API.deleteProduct(dbId);
        }
        productsList = productsList.filter(p => p.id !== id && p._id !== id);
        Storage.saveProducts(productsList);
        renderProducts();
        showToast('Product deleted successfully', 'success');
    } catch (e) {
        console.error('API delete error:', e);
        showToast('Failed to delete product: ' + e.message, 'error');
    }
}

async function handleProductForm(e) {
    e.preventDefault();
    const isEdit = !!document.getElementById('product-id').value;
    let id = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value.trim();
    const category = document.getElementById('product-category').value;
    const priceNum = parseFloat(document.getElementById('product-price').value) || 0;
    const badge = document.getElementById('product-badge').value;
    const details = (document.getElementById('product-details') ? document.getElementById('product-details').value.trim() : '');
    const description = document.getElementById('product-description').value.trim();

    // Check if there's unsubmitted text in the specs input box
    const specsTextInput = document.getElementById('product-specs-input');
    if (specsTextInput && specsTextInput.value.trim()) {
        addSpecBadge(specsTextInput.value.trim());
        specsTextInput.value = '';
    }

    const specsString = currentProductSpecs.length > 0 ? currentProductSpecs.join(' • ') : 'Crafted with premium materials';

    if (!name || !category || isNaN(priceNum) || priceNum <= 0) {
        showToast('Please fill in all required fields with valid values', 'error');
        return;
    }

    // Auto-generate Product ID if new
    const autogenCode = generateProductId(name);
    if (!id) {
        id = autogenCode;
    }

    const imagesToSave = currentProductImages.length > 0 
        ? currentProductImages 
        : ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80'];

    const productData = {
        id,
        productId: autogenCode,
        code: autogenCode,
        name,
        category,
        price: formatPrice(priceNum),
        priceNum,
        details: details || '',
        specs: specsString,
        description: description || details || '',
        badge,
        image: imagesToSave[0],
        images: imagesToSave,
        thumbs: imagesToSave
    };

    let savedProduct = productData;
    try {
        if (typeof API !== 'undefined') {
            const targetProduct = productsList.find(p => p.id === id || p._id === id);
            const dbId = (targetProduct && targetProduct._id) ? targetProduct._id : id;
            if (isEdit && API.updateProduct) {
                const apiRes = await API.updateProduct(dbId, productData);
                if (apiRes && apiRes.data) {
                    savedProduct = apiRes.data.product || apiRes.data;
                }
            } else if (!isEdit && API.createProduct) {
                const apiRes = await API.createProduct(productData);
                if (apiRes && apiRes.data) {
                    savedProduct = apiRes.data.product || apiRes.data;
                }
            }
        }
    } catch (apiErr) {
        console.error('API product sync error:', apiErr);
        showToast('Failed to save product: ' + apiErr.message, 'error');
        return;
    }

    closeModal('product-modal');
    showToast(isEdit ? 'Product updated successfully' : `Product ${savedProduct.name || productData.name} added successfully`, 'success');
    await loadProductsData();
}

document.addEventListener('DOMContentLoaded', () => {
    initLayout('products');
    loadProductsData();

    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => openProductModal(null));
    }

    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', handleProductForm);
    }

    // Image Upload Handling (Dropzone + File Input + Trigger Button)
    const dropzone = document.getElementById('image-upload-dropzone');
    const fileInput = document.getElementById('product-file-input');
    const triggerUploadBtn = document.getElementById('btn-trigger-upload');

    if (triggerUploadBtn && fileInput) {
        triggerUploadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            fileInput.click();
        });
    }

    if (dropzone && fileInput) {
        dropzone.addEventListener('click', () => fileInput.click());

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });

        ['dragleave', 'dragend'].forEach(evt => {
            dropzone.addEventListener(evt, () => dropzone.classList.remove('dragover'));
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFilesUpload(e.dataTransfer.files);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleFilesUpload(e.target.files);
                // Reset file input value so user can re-upload same file if desired
                fileInput.value = '';
            }
        });
    }

    function handleFilesUpload(fileList) {
        let validFiles = 0;
        Array.from(fileList).forEach(file => {
            if (!file.type.startsWith('image/')) {
                showToast(`File "${file.name}" is not an image`, 'error');
                return;
            }
            validFiles++;
            const reader = new FileReader();
            reader.onload = (e) => {
                currentProductImages.push(e.target.result);
                renderModalPreviews();
            };
            reader.readAsDataURL(file);
        });
        if (validFiles > 0) {
            showToast(`Added ${validFiles} image(s) successfully`, 'success');
        }
    }

    const productSearch = document.getElementById('product-search');
    if (productSearch) {
        productSearch.addEventListener('input', (e) => {
            productSearchTerm = e.target.value;
            productCurrentPage = 1;
            renderProducts();
        });
    }

    // Specifications Badges Input Handler (Enter key + Add button)
    const btnAddSpec = document.getElementById('btn-add-spec');
    const specsTextInput = document.getElementById('product-specs-input');

    if (btnAddSpec && specsTextInput) {
        btnAddSpec.addEventListener('click', (e) => {
            e.preventDefault();
            const val = specsTextInput.value.trim();
            if (val) {
                addSpecBadge(val);
                specsTextInput.value = '';
                specsTextInput.focus();
            }
        });

        specsTextInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const val = specsTextInput.value.trim();
                if (val) {
                    addSpecBadge(val);
                    specsTextInput.value = '';
                }
            }
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

