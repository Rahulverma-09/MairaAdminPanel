/**
 * Maira Jewels Admin - Categories Controller
 */

let categorySearchTerm = '';
let categoryCurrentPage = 1;
let currentCategoryImage = '';
const CATEGORIES_PAGE_SIZE = 10;
let categoriesList = [];
let allProductsList = [];

async function loadCategoriesData() {
    const tbody = document.getElementById('categories-table');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2.5rem; color: var(--color-muted);"><div class="spinner" style="margin: 0 auto 0.5rem;"></div>Loading categories...</td></tr>';
    }

    // 1. Fetch live categories from API
    try {
        if (typeof API !== 'undefined' && API.getCategories) {
            const res = await API.getCategories();
            if (res && res.data) {
                const rawCats = Array.isArray(res.data) ? res.data : (res.data.categories || []);
                categoriesList = rawCats.map((c, index) => {
                    const cleanId = getCategoryDisplayId(c, index);
                    c.categoryId = cleanId;
                    c.code = cleanId;
                    // Persist to backend DB asynchronously if not yet stored
                    if (c._id && API.updateCategory && (!c.categoryId || isMongoId(c.categoryId))) {
                        API.updateCategory(c._id, { categoryId: cleanId, code: cleanId }).catch(err => {
                            console.warn('[Categories] Background sync of categoryId:', err);
                        });
                    }
                    return c;
                });
                Storage.saveCategories(categoriesList);
            } else {
                categoriesList = Storage.getCategories();
            }
        } else {
            categoriesList = Storage.getCategories();
        }
    } catch (e) {
        console.error('[Categories] API error:', e.message);
        categoriesList = Storage.getCategories();
        showToast('Failed to load categories: ' + e.message, 'error');
    }

    // 2. Fetch live products from API to calculate real-time product counts
    try {
        if (typeof API !== 'undefined' && API.getProducts) {
            const prodRes = await API.getProducts(); // sort=_id set by default in API.getProducts
            if (prodRes && prodRes.data) {
                allProductsList = Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data.products || []);
                Storage.saveProducts(allProductsList);
            } else {
                allProductsList = Storage.getProducts();
            }
        } else {
            allProductsList = Storage.getProducts();
        }
    } catch (pe) {
        console.warn('[Categories] Could not sync products count:', pe.message);
        allProductsList = Storage.getProducts();
    }

    renderCategories();
}

function countLinkedProducts(catObj, products) {
    if (!catObj || !Array.isArray(products) || products.length === 0) return 0;
    const catName = (catObj.name || '').toLowerCase().trim();
    const catId = (catObj.categoryId || catObj.code || catObj.id || catObj._id || '').toLowerCase().trim();

    if (!catName && !catId) return 0;

    const singular = catName.endsWith('s') ? catName.slice(0, -1) : catName;
    const plural = catName.endsWith('s') ? catName : catName + 's';

    return products.filter(p => {
        if (!p) return false;
        
        let pCat = '';
        let pCatId = '';
        if (typeof p.category === 'string') {
            pCat = p.category.toLowerCase().trim();
        } else if (p.category && typeof p.category === 'object') {
            pCat = (p.category.name || '').toLowerCase().trim();
            pCatId = (p.category.id || p.category._id || p.category.categoryId || '').toLowerCase().trim();
        }

        if (p.categoryId) {
            const pid = String(p.categoryId).toLowerCase().trim();
            if (catId && pid === catId) return true;
        }

        if (pCatId && catId && pCatId === catId) return true;
        if (!pCat) return false;

        return pCat === catName ||
               pCat === singular ||
               pCat === plural ||
               pCat.includes(catName) ||
               catName.includes(pCat);
    }).length;
}

function renderCategories() {
    const categories = categoriesList;
    const products = allProductsList;
    const tbody = document.getElementById('categories-table');
    if (!tbody) return;

    let filtered = categories;
    if (categorySearchTerm) {
        const term = categorySearchTerm.toLowerCase();
        filtered = filtered.filter(c => {
            const displayId = getCategoryDisplayId(c).toLowerCase();
            return displayId.includes(term) ||
                ((c.id || c._id || '') && (c.id || c._id || '').toLowerCase().includes(term)) ||
                (c.name && c.name.toLowerCase().includes(term)) ||
                (c.description && c.description.toLowerCase().includes(term));
        });
    }

    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / CATEGORIES_PAGE_SIZE) || 1;
    if (categoryCurrentPage > totalPages) {
        categoryCurrentPage = totalPages;
    }

    if (totalFiltered === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><div class="empty-state__icon">🏷️</div><div class="empty-state__text">No categories found</div><div style="font-size:0.8rem; color:var(--color-muted); margin-top:0.25rem;">Click "+ Add Category" to create your first collection.</div></td></tr>';
        renderPagination('categories-pagination', 1, 0, CATEGORIES_PAGE_SIZE, () => {});
        return;
    }

    const paginated = filtered.slice((categoryCurrentPage - 1) * CATEGORIES_PAGE_SIZE, categoryCurrentPage * CATEGORIES_PAGE_SIZE);

    tbody.innerHTML = paginated.map((cat, index) => {
        const dbId = cat._id || cat.id || 'N/A';
        const displayCatId = getCategoryDisplayId(cat, (categoryCurrentPage - 1) * CATEGORIES_PAGE_SIZE + index);
        const catName = cat.name || '';
        const count = countLinkedProducts(cat, products);
        
        return `
            <tr>
                <td style="width: 50px; text-align: center;">
                    <div style="width: 38px; height: 38px; border-radius: 6px; overflow: hidden; background: #f5f0e6; border: 1px solid #e2dacd; display: flex; align-items: center; justify-content: center; margin: 0 auto; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">
                        ${cat.image ? `<img src="${cat.image}" alt="${escapeHtml(catName)}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=100&q=80';">` : '<span style="font-size: 16px; color: #bfa15f;">💎</span>'}
                    </div>
                </td>
                <td><span class="product-id-badge">${escapeHtml(displayCatId)}</span></td>
                <td>
                    <div style="font-weight: 700; color: var(--color-charcoal); font-size: 0.88rem; letter-spacing: -0.1px;">${escapeHtml(catName)}</div>
                </td>
                <td>
                    <span style="color: #6c635a; font-size: 0.8rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; max-width: 320px;">
                        ${escapeHtml(cat.description || '—')}
                    </span>
                </td>
                <td style="text-align: center;">
                    <span style="display: inline-flex; align-items: center; gap: 5px; font-weight: 600; font-size: 0.8rem; color: #5a5045; background: #f5f0e6; padding: 3px 10px; border-radius: 16px; border: 1px solid #e4dacb;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #a8894f;"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                        ${count} ${count === 1 ? 'Product' : 'Products'}
                    </span>
                </td>
                <td style="text-align: center;">
                    <div class="actions" style="justify-content: center;">
                        <button class="btn btn--sm btn--secondary" data-edit-category="${escapeHtml(dbId)}">Edit</button>
                        <button class="btn btn--sm btn--danger" data-delete-category="${escapeHtml(dbId)}">Delete</button>
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
        btn.addEventListener('click', () => deleteCategory(btn.dataset.deleteCategory, btn));
    });
}

function openCategoryModal(category) {
    const isEdit = !!category;
    document.getElementById('category-modal-title').textContent = isEdit ? 'Edit Category' : 'Add Category';
    document.getElementById('category-id').value = isEdit ? (category._id || category.id || '') : '';
    document.getElementById('category-name').value = isEdit ? (category.name || '') : '';
    document.getElementById('category-description').value = isEdit ? (category.description || '') : '';
    currentCategoryImage = isEdit ? (category.image || '') : '';
    renderCategoryImagePreview();
    openModal('category-modal');
}

function editCategory(id) {
    const category = categoriesList.find(c => (c.id === id || c._id === id));
    if (category) openCategoryModal(category);
}

async function deleteCategory(id, btnElement) {
    const category = categoriesList.find(c => (c.id === id || c._id === id));
    if (!category) return;
    
    const productCount = countLinkedProducts(category, allProductsList);
    
    if (productCount > 0) {
        if (!confirm(`This category has ${productCount} product(s) linked to it. Are you sure you want to delete it?`)) return;
    } else {
        if (!confirm('Are you sure you want to delete this category?')) return;
    }

    if (btnElement) setButtonLoading(btnElement, true, 'Deleting...');
    const dbId = category._id || category.id || id;
    try {
        if (typeof API !== 'undefined' && API.deleteCategory) {
            await API.deleteCategory(dbId);
        }
        categoriesList = categoriesList.filter(c => c.id !== id && c._id !== id);
        Storage.saveCategories(categoriesList);
        renderCategories();
        showToast('Category deleted successfully', 'success');
    } catch (e) {
        console.error('API delete category error:', e);
        showToast('Failed to delete category: ' + e.message, 'error');
    } finally {
        if (btnElement) setButtonLoading(btnElement, false);
    }
}

async function handleCategoryForm(e) {
    e.preventDefault();
    const idInput = document.getElementById('category-id').value;
    const isEdit = !!idInput;
    const name = document.getElementById('category-name').value.trim();
    const description = document.getElementById('category-description').value.trim();

    if (!name) {
        showToast('Category name is required', 'error');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) setButtonLoading(submitBtn, true, isEdit ? 'Saving...' : 'Creating...');

    // Auto-generate Category ID if new
    const autogenCode = generateCategoryId(name);
    let catId = idInput;
    if (!catId) {
        catId = autogenCode;
    }

    const catData = { 
        id: catId,
        categoryId: autogenCode,
        code: autogenCode,
        name, 
        description, 
        image: currentCategoryImage 
    };

    let savedCategory = catData;
    try {
        if (typeof API !== 'undefined') {
            const targetCategory = categoriesList.find(c => c.id === catId || c._id === catId);
            const dbId = (targetCategory && targetCategory._id) ? targetCategory._id : catId;
            if (isEdit && API.updateCategory) {
                const apiRes = await API.updateCategory(dbId, catData);
                if (apiRes && apiRes.data) {
                    savedCategory = apiRes.data.category || apiRes.data;
                }
            } else if (!isEdit && API.createCategory) {
                const apiRes = await API.createCategory(catData);
                if (apiRes && apiRes.data) {
                    savedCategory = apiRes.data.category || apiRes.data;
                }
            }
        }
    } catch (apiErr) {
        console.error('API category sync error:', apiErr);
        showToast('Failed to save category: ' + apiErr.message, 'error');
        if (submitBtn) setButtonLoading(submitBtn, false);
        return;
    }

    if (submitBtn) setButtonLoading(submitBtn, false);
    closeModal('category-modal');
    showToast(isEdit ? 'Category updated successfully' : `Category ${savedCategory.name || catData.name} created successfully`, 'success');
    await loadCategoriesData();
}

document.addEventListener('DOMContentLoaded', () => {
    initLayout('categories');

    const dropzone = document.getElementById('category-upload-dropzone');
    const fileInput = document.getElementById('category-file-input');
    const triggerUploadBtn = document.getElementById('btn-trigger-category-upload');
    const btnRemoveImg = document.getElementById('btn-remove-category-image');

    if (triggerUploadBtn && fileInput) {
        triggerUploadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            fileInput.click();
        });
    }

    if (btnRemoveImg) {
        btnRemoveImg.addEventListener('click', (e) => {
            e.preventDefault();
            currentCategoryImage = '';
            renderCategoryImagePreview();
            if (fileInput) fileInput.value = '';
        });
    }

    if (dropzone && fileInput) {
        dropzone.addEventListener('click', () => fileInput.click());

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = 'var(--color-gold-dark, #bfa15f)';
            dropzone.style.background = '#f7f4ed';
        });

        ['dragleave', 'dragend'].forEach(evt => {
            dropzone.addEventListener(evt, () => {
                dropzone.style.borderColor = '#d5cbbe';
                dropzone.style.background = '#faf8f5';
            });
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = '#d5cbbe';
            dropzone.style.background = '#faf8f5';
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleCategoryFileUpload(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleCategoryFileUpload(e.target.files[0]);
                fileInput.value = '';
            }
        });
    }

    function handleCategoryFileUpload(file) {
        if (!file.type.startsWith('image/')) {
            showToast('Selected file is not an image', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            currentCategoryImage = e.target.result;
            renderCategoryImagePreview();
            showToast('Image uploaded successfully', 'success');
        };
        reader.readAsDataURL(file);
    }

    loadCategoriesData();

    const addCategoryBtn = document.getElementById('add-category-btn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', () => openCategoryModal(null));
    }

    const categoryForm = document.getElementById('category-form');
    if (categoryForm) {
        categoryForm.addEventListener('submit', handleCategoryForm);
    }

    const searchInput = document.getElementById('category-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            categorySearchTerm = e.target.value;
            categoryCurrentPage = 1;
            renderCategories();
        });
    }
});

function renderCategoryImagePreview() {
    const previewContainer = document.getElementById('category-image-preview-container');
    const previewImg = document.getElementById('category-image-preview');
    const dropzone = document.getElementById('category-upload-dropzone');
    if (!previewContainer || !previewImg) return;

    if (currentCategoryImage) {
        previewImg.src = currentCategoryImage;
        previewContainer.style.display = 'block';
        if (dropzone) dropzone.style.display = 'none';
    } else {
        previewImg.src = '';
        previewContainer.style.display = 'none';
        if (dropzone) dropzone.style.display = 'block';
    }
}
