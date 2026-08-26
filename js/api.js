/**
 * Maira Jewels Admin - Backend API Client & Seamless Sync Layer
 * Interfacing directly with https://maira-backend-mngd.onrender.com/api/v1
 */

const API_BASE_URL = 'https://maira-backend-mngd.onrender.com/api/v1';

const API = {
    getToken: function () {
        return localStorage.getItem('maira_admin_token') || localStorage.getItem('token') || localStorage.getItem('admin_token') || '';
    },

    setToken: function (token) {
        if (token) {
            localStorage.setItem('maira_admin_token', token);
            localStorage.setItem('token', token);
            localStorage.setItem('maira_admin_auth', 'true');
        } else {
            localStorage.removeItem('maira_admin_token');
            localStorage.removeItem('token');
            localStorage.removeItem('admin_token');
            localStorage.removeItem('maira_admin_auth');
        }
    },

    request: async function (endpoint, options = {}) {
        const url = API_BASE_URL + endpoint;
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers: headers
            });

            if (response.status === 401 || response.status === 403) {
                console.warn('[API Auth Guard] Token invalid or expired. Terminating session.');
                this.setToken(null);
                const isSubDir = window.location.pathname.includes('/html/');
                window.location.href = isSubDir ? '../index.html' : 'index.html';
                throw new Error('Session expired. Please log in again.');
            }

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || ('Request failed with status ' + response.status));
            }

            return data;
        } catch (error) {
            if (!endpoint.includes('/auth/profile')) {
                console.error('[API Error] ' + endpoint + ':', error.message);
            }
            throw error;
        }
    },

    adminLogin: async function (email, password) {
        const res = await this.request('/auth/admin-login', {
            method: 'POST',
            body: JSON.stringify({ email: email, password: password })
        });
        const token = res?.data?.token || res?.token || res?.data?.accessToken || res?.accessToken || res?.data?.jwt;
        if (token) {
            this.setToken(token);
            const userObj = res?.data?.user || res?.user || { name: 'Admin', email: email, role: 'Administrator', avatar: (email.charAt(0).toUpperCase() || 'A') };
            if (typeof Storage !== 'undefined') {
                Storage.saveProfile(userObj);
            }
        }
        return res;
    },

    getProducts: async function (params = {}) {
        // Always sort by _id (indexed) to avoid MongoDB in-memory sort memory limit (32MB).
        // Sorting on non-indexed fields with large collections exceeds the limit and aborts.
        const mergedParams = { sort: '_id', ...params };
        const query = new URLSearchParams(mergedParams).toString();
        const endpoint = '/products' + (query ? '?' + query : '');
        return await this.request(endpoint);
    },

    getProductById: async function (id) {
        return await this.request('/products/' + id);
    },

    createProduct: async function (productData) {
        return await this.request('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    },

    updateProduct: async function (id, productData) {
        return await this.request('/products/' + id, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    },

    deleteProduct: async function (id) {
        return await this.request('/products/' + id, {
            method: 'DELETE'
        });
    },

    getCategories: async function () {
        return await this.request('/categories');
    },

    getCategoryById: async function (id) {
        return await this.request('/categories/' + id);
    },

    createCategory: async function (categoryData) {
        return await this.request('/categories', {
            method: 'POST',
            body: JSON.stringify(categoryData)
        });
    },

    updateCategory: async function (id, categoryData) {
        return await this.request('/categories/' + id, {
            method: 'PUT',
            body: JSON.stringify(categoryData)
        });
    },

    deleteCategory: async function (id) {
        return await this.request('/categories/' + id, {
            method: 'DELETE'
        });
    },

    getOrders: async function (params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = '/orders' + (query ? '?' + query : '');
        try {
            return await this.request(endpoint);
        } catch (e) {
            try {
                return await this.request('/orders/all' + (query ? '?' + query : ''));
            } catch (e2) {
                return await this.request('/orders/admin' + (query ? '?' + query : ''));
            }
        }
    },

    createOrder: async function (orderData) {
        return await this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    },

    getOrderById: async function (id) {
        return await this.request('/orders/' + id);
    },

    updateOrderStatus: async function (id, status, paymentStatus) {
        return await this.request('/orders/' + id + '/status', {
            method: 'PATCH',
            body: JSON.stringify({ status, paymentStatus })
        });
    },

    updateOrderPaymentStatus: async function (id, paymentStatus) {
        try {
            return await this.request('/orders/' + id + '/payment-status', {
                method: 'PATCH',
                body: JSON.stringify({ paymentStatus })
            });
        } catch (e) {
            try {
                return await this.request('/orders/' + id + '/status', {
                    method: 'PATCH',
                    body: JSON.stringify({ paymentStatus })
                });
            } catch (e2) {
                return await this.request('/orders/' + id, {
                    method: 'PUT',
                    body: JSON.stringify({ paymentStatus })
                });
            }
        }
    },

    deleteOrder: async function (id) {
        return await this.request('/orders/' + id, {
            method: 'DELETE'
        });
    },

    getFaqs: async function (params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = '/faqs' + (query ? '?' + query : '');
        return await this.request(endpoint);
    },

    createFaq: async function (faqData) {
        return await this.request('/faqs', {
            method: 'POST',
            body: JSON.stringify(faqData)
        });
    },

    updateFaq: async function (id, faqData) {
        return await this.request('/faqs/' + id, {
            method: 'PUT',
            body: JSON.stringify(faqData)
        });
    },

    replyFaq: async function (id, answer, approved = true) {
        return await this.request('/faqs/' + id + '/reply', {
            method: 'PATCH',
            body: JSON.stringify({ answer, status: approved ? 'approved' : 'active', isApproved: approved })
        });
    },

    deleteFaq: async function (id) {
        return await this.request('/faqs/' + id, {
            method: 'DELETE'
        });
    },

    getContactMessages: async function (params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = '/contacts' + (query ? '?' + query : '');
        return await this.request(endpoint);
    },

    updateMessageStatus: async function (id, status) {
        return await this.request('/contacts/' + id + '/status', {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    },

    getPayments: async function (params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = '/payments' + (query ? '?' + query : '');
        return await this.request(endpoint);
    },

    updatePaymentStatus: async function (id, status) {
        return await this.request('/payments/' + id + '/status', {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    },

    deletePayment: async function (id) {
        return await this.request('/payments/' + id, {
            method: 'DELETE'
        });
    },

    getCustomers: async function (params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = '/customers' + (query ? '?' + query : '');
        return await this.request(endpoint);
    },

    getCustomerById: async function (id) {
        return await this.request('/customers/' + id);
    },

    createCustomer: async function (customerData) {
        return await this.request('/customers', {
            method: 'POST',
            body: JSON.stringify(customerData)
        });
    },

    updateCustomer: async function (id, customerData) {
        return await this.request('/customers/' + id, {
            method: 'PUT',
            body: JSON.stringify(customerData)
        });
    },

    deleteCustomer: async function (id) {
        return await this.request('/customers/' + id, {
            method: 'DELETE'
        });
    },

    getProfile: async function () {
        const token = this.getToken();
        if (token) {
            try {
                const res = await this.request('/auth/me');
                if (res && (res.data || res.user)) {
                    const userObj = res.data?.user || res.data || res.user;
                    if (typeof Storage !== 'undefined') Storage.saveProfile(userObj);
                    return { success: true, data: { user: userObj } };
                }
            } catch (e1) {
                try {
                    const res2 = await this.request('/auth/profile');
                    if (res2 && (res2.data || res2.user)) {
                        const userObj2 = res2.data?.user || res2.data || res2.user;
                        if (typeof Storage !== 'undefined') Storage.saveProfile(userObj2);
                        return { success: true, data: { user: userObj2 } };
                    }
                } catch (e2) {
                    // Silently fall back to cached profile if backend route does not exist
                }
            }
        }
        const cachedProfile = (typeof Storage !== 'undefined' && Storage.getProfile) ? Storage.getProfile() : { name: 'Admin', role: 'Administrator', email: 'admin@mairajewels.com' };
        return { success: true, data: { user: cachedProfile } };
    },

    updateProfile: async function (profileData) {
        try {
            return await this.request('/auth/profile', {
                method: 'PUT',
                body: JSON.stringify(profileData)
            });
        } catch (e1) {
            try {
                return await this.request('/auth/me', {
                    method: 'PUT',
                    body: JSON.stringify(profileData)
                });
            } catch (e2) {
                return await this.request('/users/profile', {
                    method: 'PUT',
                    body: JSON.stringify(profileData)
                });
            }
        }
    },

    updatePassword: async function (passwordData) {
        return await this.request('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify(passwordData)
        });
    }
};

window.API = API;
