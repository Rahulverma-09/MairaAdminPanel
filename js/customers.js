/**
 * Maira Jewels Admin - Customers Controller
 */

let customerSearchTerm = '';
let customerSortBy = 'newest';
let customerCurrentPage = 1;
const CUSTOMERS_PAGE_SIZE = 10;
let customersList = [];
let allOrdersList = [];

async function loadCustomersData() {
    const tbody = document.getElementById('customers-table');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 2.5rem; color: var(--color-muted);"><div class="spinner" style="margin: 0 auto 0.5rem;"></div>Loading customers...</td></tr>';
    }

    // 1. Fetch live orders to aggregate customer spending, order count, and addresses
    try {
        if (typeof API !== 'undefined' && API.getOrders) {
            const ordRes = await API.getOrders({ limit: 200 });
            if (ordRes && ordRes.data) {
                allOrdersList = Array.isArray(ordRes.data) ? ordRes.data : (ordRes.data.orders || []);
                Storage.saveOrders(allOrdersList);
            } else {
                allOrdersList = Storage.getOrders();
            }
        } else {
            allOrdersList = Storage.getOrders();
        }
    } catch (oe) {
        console.warn('[Customers] Orders fetch warning:', oe.message);
        allOrdersList = Storage.getOrders();
    }

    // 2. Fetch live customers from API or extract and sync from orders
    try {
        if (typeof API !== 'undefined' && API.getCustomers) {
            const res = await API.getCustomers({ limit: 100 });
            if (res && res.data) {
                customersList = Array.isArray(res.data) ? res.data : (res.data.customers || []);
            }
        }
    } catch (e) {
        console.warn('[Customers] API error:', e.message);
    }

    // If no standalone customers stored yet, aggregate them gracefully from orders + local storage
    const storedCustomers = Storage.getCustomers();
    const customerMap = new Map();

    // Add live customers from API first
    (customersList || []).forEach(c => {
        const key = (c.email || c.id || c.name || '').toLowerCase().trim();
        if (key) customerMap.set(key, { ...c });
    });

    // Add stored customers next
    (storedCustomers || []).forEach(c => {
        const key = (c.email || c.id || c.name || '').toLowerCase().trim();
        if (key && !customerMap.has(key)) customerMap.set(key, { ...c });
    });

    // Merge/derive from orders
    allOrdersList.forEach(order => {
        const cust = order.customer || {};
        const emailKey = (cust.email || cust.name || '').toLowerCase().trim();
        if (!emailKey) return;

        const orderAmount = Number(order.total != null ? order.total : (order.subtotal || 0));
        const orderDate = order.date || order.createdAt;

        if (customerMap.has(emailKey)) {
            const existing = customerMap.get(emailKey);
            if (!existing.phone && cust.phone) existing.phone = cust.phone;
            if (!existing.address && (cust.address || cust.shippingAddress)) existing.address = cust.address || cust.shippingAddress;
            if (!existing.name && cust.name) existing.name = cust.name;
            // Update oldest date
            if (orderDate && (!existing.createdAt || new Date(orderDate) < new Date(existing.createdAt))) {
                existing.createdAt = orderDate;
            }
        } else {
            const custId = cust.id || cust._id || generateCustomerId(cust.name || 'Customer');
            customerMap.set(emailKey, {
                id: custId,
                name: cust.name || 'Anonymous Customer',
                email: cust.email || '',
                phone: cust.phone || '',
                address: cust.address || cust.shippingAddress || '',
                createdAt: orderDate || new Date().toISOString()
            });
        }
    });

    // Also include live fetched customers
    (customersList || []).forEach(c => {
        const key = (c.email || c.id || c.name || '').toLowerCase().trim();
        if (key) {
            customerMap.set(key, { ...(customerMap.get(key) || {}), ...c });
        }
    });

    customersList = Array.from(customerMap.values());
    Storage.saveCustomers(customersList);

    renderCustomers();
    updateCustomerStats();
}

function generateCustomerId(idx = 1) {
    return `CUST-${String(idx).padStart(3, '0')}`;
}

function getCustomerOrdersAndRevenue(customer) {
    const custEmail = (customer.email || '').toLowerCase().trim();
    const custName = (customer.name || '').toLowerCase().trim();
    const custId = (customer.id || customer._id || '').toLowerCase().trim();

    const matchedOrders = allOrdersList.filter(o => {
        const oCust = o.customer || {};
        const oEmail = (oCust.email || '').toLowerCase().trim();
        const oName = (oCust.name || '').toLowerCase().trim();
        const oCustId = (oCust.id || oCust._id || '').toLowerCase().trim();
        return (custEmail && oEmail === custEmail) || (custName && oName === custName) || (custId && oCustId === custId);
    });

    const totalRevenue = matchedOrders.reduce((sum, o) => {
        // Exclude cancelled orders from revenue
        if (o.status === 'cancelled') return sum;
        return sum + Number(o.total != null ? o.total : (o.subtotal || 0));
    }, 0);

    return {
        orders: matchedOrders,
        totalOrders: matchedOrders.length,
        totalRevenue: totalRevenue
    };
}

function updateCustomerStats() {
    const totalCustomers = customersList.length;
    let totalRevenue = 0;
    let totalOrders = 0;

    customersList.forEach(c => {
        const { totalRevenue: rev, totalOrders: ord } = getCustomerOrdersAndRevenue(c);
        totalRevenue += rev;
        totalOrders += ord;
    });

    const avgOrderVal = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

    const elCust = document.getElementById('stat-total-customers');
    const elRev = document.getElementById('stat-customer-revenue');
    const elOrd = document.getElementById('stat-customer-orders');
    const elAov = document.getElementById('stat-customer-aov');

    if (elCust) elCust.textContent = totalCustomers.toLocaleString();
    if (elRev) elRev.textContent = formatPrice(totalRevenue);
    if (elOrd) elOrd.textContent = totalOrders.toLocaleString();
    if (elAov) elAov.textContent = formatPrice(avgOrderVal);
}

function renderCustomers() {
    const tbody = document.getElementById('customers-table');
    if (!tbody) return;

    let filtered = [...customersList];

    // Search filter
    if (customerSearchTerm) {
        const term = customerSearchTerm.toLowerCase().trim();
        filtered = filtered.filter(c => {
            const id = (c.id || c._id || '').toLowerCase();
            const name = (c.name || '').toLowerCase();
            const email = (c.email || '').toLowerCase();
            const phone = (c.phone || '').toLowerCase();
            const addr = formatAddress(c.address).toLowerCase();
            return id.includes(term) || name.includes(term) || email.includes(term) || phone.includes(term) || addr.includes(term);
        });
    }

    // Sorting
    filtered.sort((a, b) => {
        const statA = getCustomerOrdersAndRevenue(a);
        const statB = getCustomerOrdersAndRevenue(b);

        if (customerSortBy === 'revenue-high') {
            return statB.totalRevenue - statA.totalRevenue;
        } else if (customerSortBy === 'orders-high') {
            return statB.totalOrders - statA.totalOrders;
        } else if (customerSortBy === 'name-asc') {
            return (a.name || '').localeCompare(b.name || '');
        } else {
            // Newest first
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
    });

    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / CUSTOMERS_PAGE_SIZE) || 1;
    if (customerCurrentPage > totalPages) {
        customerCurrentPage = totalPages;
    }

    if (totalFiltered === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><div class="empty-state__icon">👥</div><div class="empty-state__text">No customers found</div><div style="font-size:0.8rem; color:var(--color-muted); margin-top:0.25rem;">Customers who place orders or are added manually will appear here.</div></td></tr>';
        renderPagination('customers-pagination', 1, 0, CUSTOMERS_PAGE_SIZE, () => {});
        return;
    }

    const paginated = filtered.slice((customerCurrentPage - 1) * CUSTOMERS_PAGE_SIZE, customerCurrentPage * CUSTOMERS_PAGE_SIZE);

    tbody.innerHTML = paginated.map((customer, index) => {
        let custId = customer.customerId || customer.id || customer._id || 'CUST-001';
        if (typeof custId === 'string' && (custId.length > 12 || !custId.startsWith('CUST-'))) {
            custId = `CUST-${String((index || 0) + 1).padStart(3, '0')}`;
        }
        const { totalOrders, totalRevenue } = getCustomerOrdersAndRevenue(customer);
        const name = customer.name || 'Anonymous Customer';
        const initial = name.charAt(0).toUpperCase() || 'C';
        const email = customer.email || '—';
        const phone = customer.phone || '—';
        const formattedAddr = formatAddress(customer.address);
        const sinceDate = customer.createdAt || customer.date || new Date().toISOString();

        return `
            <tr>
                <td><span class="product-id-badge">${escapeHtml(custId)}</span></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #f7f3eb 0%, #ede3d1 100%); color: #a8894f; display: flex; align-items: center; justify-content: center; font-size: 0.95rem; font-weight: 700; border: 1.5px solid #ebdcc5; flex-shrink: 0; box-shadow: 0 2px 4px rgba(168,137,79,0.1);">
                            ${initial}
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <button type="button" class="btn-link table-clickable-cell" data-view-customer="${custId}" style="font-weight: 700; color: var(--color-charcoal); font-size: 0.92rem; padding: 0; text-align: left; background: none; border: none; cursor: pointer;">
                                ${escapeHtml(name)}
                            </button>
                            <span style="font-size: 0.72rem; font-weight: 600; color: ${totalOrders > 3 ? '#b8860b' : (totalOrders > 0 ? '#2e7d32' : '#7c746b')}; display: inline-flex; align-items: center; gap: 3px;">
                                ${totalOrders > 3 ? '⭐ Frequent Buyer' : (totalOrders > 0 ? '✓ Verified Buyer' : '🌱 New Prospect')}
                            </span>
                        </div>
                    </div>
                </td>
                <td>
                    <div style="display: flex; flex-direction: column; gap: 0.2rem;">
                        ${email !== '—' ? `<a href="mailto:${escapeHtml(email)}" style="color: #a8894f; font-weight: 600; font-size: 0.84rem; text-decoration: none;">${escapeHtml(email)}</a>` : '<span style="color: var(--color-muted); font-size: 0.84rem;">—</span>'}
                        <span style="color: #6c635a; font-size: 0.78rem;">${escapeHtml(phone)}</span>
                    </div>
                </td>
                <td>
                    <span style="color: #5a524a; font-size: 0.82rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; max-width: 200px;" title="${escapeHtml(formattedAddr)}">
                        ${escapeHtml(formattedAddr)}
                    </span>
                </td>
                <td style="text-align: center;">
                    <span style="display: inline-flex; align-items: center; gap: 4px; font-weight: 600; font-size: 0.8rem; color: #5a5045; background: #f5f0e6; padding: 4px 10px; border-radius: 16px; border: 1px solid #e4dacb;">
                        📦 ${totalOrders} ${totalOrders === 1 ? 'Order' : 'Orders'}
                    </span>
                </td>
                <td style="text-align: right;">
                    <strong style="color: #171513; font-weight: 700; font-size: 0.95rem;">${formatPrice(totalRevenue)}</strong>
                </td>
                <td>
                    <span style="color: var(--color-muted); font-size: 0.82rem; font-weight: 500;">${formatDate(sinceDate)}</span>
                </td>
                <td style="text-align: center;">
                    <div class="actions" style="justify-content: center;">
                        <button class="btn btn--sm btn--secondary" data-view-customer="${custId}" title="View Customer Details">View</button>
                        <button class="btn btn--sm btn--secondary" data-edit-customer="${custId}" title="Edit Customer">Edit</button>
                        <button class="btn btn--sm btn--danger" data-delete-customer="${custId}" title="Delete Customer">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // Pagination
    renderPagination('customers-pagination', customerCurrentPage, totalFiltered, CUSTOMERS_PAGE_SIZE, (newPage) => {
        customerCurrentPage = newPage;
        renderCustomers();
    });

    // Row action listeners
    tbody.querySelectorAll('[data-view-customer]').forEach(btn => {
        btn.addEventListener('click', () => viewCustomerDetails(btn.dataset.viewCustomer));
    });

    tbody.querySelectorAll('[data-edit-customer]').forEach(btn => {
        btn.addEventListener('click', () => editCustomer(btn.dataset.editCustomer));
    });

    tbody.querySelectorAll('[data-delete-customer]').forEach(btn => {
        btn.addEventListener('click', () => deleteCustomer(btn.dataset.deleteCustomer));
    });
}

function openCustomerModal(customer) {
    const isEdit = !!customer;
    document.getElementById('customer-modal-title').textContent = isEdit ? 'Edit Customer' : 'Add Customer';
    document.getElementById('customer-id-input').value = isEdit ? (customer.id || customer._id || '') : '';
    document.getElementById('customer-name-input').value = isEdit ? (customer.name || '') : '';
    document.getElementById('customer-email-input').value = isEdit ? (customer.email || '') : '';
    document.getElementById('customer-phone-input').value = isEdit ? (customer.phone || '') : '';
    document.getElementById('customer-address-input').value = isEdit ? formatAddress(customer.address) : '';
    
    const sinceInput = document.getElementById('customer-since-input');
    if (sinceInput) {
        if (isEdit && customer.createdAt) {
            try {
                sinceInput.value = new Date(customer.createdAt).toISOString().split('T')[0];
            } catch (e) {
                sinceInput.value = '';
            }
        } else {
            sinceInput.value = new Date().toISOString().split('T')[0];
        }
    }

    openModal('customer-modal');
}

function editCustomer(id) {
    const cust = customersList.find(c => c.id === id || c._id === id);
    if (cust) openCustomerModal(cust);
}

function viewCustomerDetails(id) {
    const cust = customersList.find(c => c.id === id || c._id === id);
    if (!cust) return;

    const modalBody = document.getElementById('customer-view-modal-body');
    if (!modalBody) return;

    const { orders, totalOrders, totalRevenue } = getCustomerOrdersAndRevenue(cust);
    const initial = (cust.name || 'C').charAt(0).toUpperCase();

    let ordersHtml = '';
    if (orders.length === 0) {
        ordersHtml = '<div style="text-align: center; padding: 1.5rem; color: var(--color-muted); background: #faf8f5; border-radius: 8px; border: 1px dashed #e0d7c7;">No purchase orders found for this customer.</div>';
    } else {
        ordersHtml = `
            <div class="table-responsive" style="max-height: 220px; overflow-y: auto;">
                <table class="table" style="font-size: 0.82rem;">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Items</th>
                            <th>Status</th>
                            <th>Total Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(o => {
                            const oId = o.id || o._id || 'N/A';
                            const itemCount = (o.items || []).reduce((s, i) => s + (i.quantity || 1), 0);
                            const amount = o.total != null ? o.total : (o.subtotal || 0);
                            return `
                                <tr>
                                    <td><span class="order-code">${escapeHtml(oId)}</span></td>
                                    <td>${formatDate(o.date || o.createdAt)}</td>
                                    <td>${itemCount} ${itemCount === 1 ? 'item' : 'items'}</td>
                                    <td>${getStatusBadge(o.status)}</td>
                                    <td><strong>${formatPrice(amount)}</strong></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    modalBody.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid #ede5d7;">
            <div style="width: 62px; height: 62px; border-radius: 50%; background: #f7f3eb; color: #a8894f; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; border: 2px solid #ebdcc5; flex-shrink: 0;">
                ${initial}
            </div>
            <div>
                <h3 style="font-family: var(--font-serif); font-size: 1.35rem; color: var(--color-charcoal); margin-bottom: 0.2rem;">${escapeHtml(cust.name || 'Anonymous Customer')}</h3>
                <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
                    <span class="product-id-badge">${escapeHtml(cust.id || cust._id || 'N/A')}</span>
                    <span style="font-size: 0.8rem; color: var(--color-muted);">Customer Since: <strong>${formatDate(cust.createdAt)}</strong></span>
                </div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.5rem;">
            <div class="detail-section" style="background: #faf8f5; padding: 1rem; border-radius: 8px; border: 1px solid #ede5d7;">
                <h4 style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.6px; color: var(--color-muted); margin-bottom: 0.75rem; font-weight: 700;">Contact & Communication</h4>
                <div class="detail-row" style="margin-bottom: 0.5rem;"><span class="detail-row__label" style="font-size: 0.8rem; color: #7c746b;">Email:</span> <span class="detail-row__value" style="font-weight: 600;"><a href="mailto:${escapeHtml(cust.email || '')}" style="color: #a8894f; text-decoration: none;">${escapeHtml(cust.email || '—')}</a></span></div>
                <div class="detail-row" style="margin-bottom: 0.5rem;"><span class="detail-row__label" style="font-size: 0.8rem; color: #7c746b;">Phone:</span> <span class="detail-row__value" style="font-weight: 600;">${escapeHtml(cust.phone || '—')}</span></div>
                <div class="detail-row"><span class="detail-row__label" style="font-size: 0.8rem; color: #7c746b;">Address:</span> <span class="detail-row__value" style="font-weight: 500; font-size: 0.82rem;">${escapeHtml(formatAddress(cust.address))}</span></div>
            </div>
            <div class="detail-section" style="background: #faf8f5; padding: 1rem; border-radius: 8px; border: 1px solid #ede5d7;">
                <h4 style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.6px; color: var(--color-muted); margin-bottom: 0.75rem; font-weight: 700;">Financial & Purchase Summary</h4>
                <div class="detail-row" style="margin-bottom: 0.5rem;"><span class="detail-row__label" style="font-size: 0.8rem; color: #7c746b;">Lifetime Orders:</span> <span class="detail-row__value" style="font-weight: 700; color: var(--color-charcoal);">${totalOrders}</span></div>
                <div class="detail-row" style="margin-bottom: 0.5rem;"><span class="detail-row__label" style="font-size: 0.8rem; color: #7c746b;">Lifetime Revenue:</span> <span class="detail-row__value" style="font-weight: 700; color: #059669; font-size: 1rem;">${formatPrice(totalRevenue)}</span></div>
                <div class="detail-row"><span class="detail-row__label" style="font-size: 0.8rem; color: #7c746b;">Average Spend / Order:</span> <span class="detail-row__value" style="font-weight: 600;">${totalOrders > 0 ? formatPrice(totalRevenue / totalOrders) : '$0.00'}</span></div>
            </div>
        </div>

        <div>
            <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--color-charcoal); margin-bottom: 0.75rem;">Associated Purchase Orders (${orders.length})</h4>
            ${ordersHtml}
        </div>
    `;

    openModal('customer-view-modal');
}

async function deleteCustomer(id) {
    const cust = customersList.find(c => c.id === id || c._id === id);
    if (!cust) return;

    if (!confirm(`Are you sure you want to remove customer "${cust.name}"?`)) return;

    try {
        if (typeof API !== 'undefined' && API.deleteCustomer) {
            await API.deleteCustomer(id);
        }
    } catch (e) {
        console.warn('API delete customer error:', e);
    }

    customersList = customersList.filter(c => c.id !== id && c._id !== id);
    Storage.saveCustomers(customersList);
    renderCustomers();
    updateCustomerStats();
    showToast('Customer deleted successfully', 'success');
}

async function handleCustomerForm(e) {
    e.preventDefault();
    const idInput = document.getElementById('customer-id-input').value;
    const isEdit = !!idInput;
    const name = document.getElementById('customer-name-input').value.trim();
    const email = document.getElementById('customer-email-input').value.trim();
    const phone = document.getElementById('customer-phone-input').value.trim();
    const address = document.getElementById('customer-address-input').value.trim();
    const sinceDate = document.getElementById('customer-since-input').value;

    if (!name || !email) {
        showToast('Name and Email are required', 'error');
        return;
    }

    let custId = idInput;
    if (!custId) {
        custId = generateCustomerId(name);
    }

    const customerData = {
        id: custId,
        name,
        email,
        phone,
        address,
        createdAt: sinceDate ? new Date(sinceDate).toISOString() : new Date().toISOString()
    };

    try {
        if (typeof API !== 'undefined') {
            if (isEdit && API.updateCustomer) {
                await API.updateCustomer(custId, customerData);
            } else if (!isEdit && API.createCustomer) {
                await API.createCustomer(customerData);
            }
        }
    } catch (apiErr) {
        console.warn('API customer sync error:', apiErr.message);
    }

    if (isEdit) {
        const idx = customersList.findIndex(c => c.id === custId || c._id === custId);
        if (idx !== -1) customersList[idx] = { ...customersList[idx], ...customerData };
    } else {
        customersList.unshift(customerData);
    }

    Storage.saveCustomers(customersList);
    closeModal('customer-modal');
    showToast(isEdit ? 'Customer updated successfully' : 'Customer created successfully', 'success');
    renderCustomers();
    updateCustomerStats();
}

document.addEventListener('DOMContentLoaded', () => {
    initLayout('customers');

    loadCustomersData();

    const addBtn = document.getElementById('add-customer-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => openCustomerModal(null));
    }

    const customerForm = document.getElementById('customer-form');
    if (customerForm) {
        customerForm.addEventListener('submit', handleCustomerForm);
    }

    const searchInput = document.getElementById('customer-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            customerSearchTerm = e.target.value;
            customerCurrentPage = 1;
            renderCustomers();
        });
    }

    const sortSelect = document.getElementById('customer-sort');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            customerSortBy = e.target.value;
            customerCurrentPage = 1;
            renderCustomers();
        });
    }
});
