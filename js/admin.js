/* =============================================
   Maira Jewels — Admin Panel Core Logic
   ============================================= */

(function () {
    'use strict';

    // ============ STORAGE KEYS ============
    const STORAGE_KEYS = {
        PRODUCTS: 'maira_admin_products',
        CATEGORIES: 'maira_admin_categories',
        ORDERS: 'maira_admin_orders',
        PAYMENTS: 'maira_admin_payments',
        MESSAGES: 'maira_admin_messages',
        FAQS: 'maira_admin_faqs',
        CONTACT_INFO: 'maira_admin_contact_info',
        AUTH: 'maira_admin_auth'
    };

    // ============ DEFAULT SEED DATA ============
    const DEFAULT_CATEGORIES = [
        { id: 'cat-1', name: 'Rings', description: 'Elegant rings crafted with precision and luxury.' },
        { id: 'cat-2', name: 'Earrings', description: 'Statement earrings for every occasion.' },
        { id: 'cat-3', name: 'Necklaces', description: 'Timeless necklaces and pendants.' },
        { id: 'cat-4', name: 'Bracelets', description: 'Refined bracelets and bangles.' }
    ];

    const DEFAULT_PRODUCTS = [
        {
            id: 'item-1', name: 'Eternal Solitaire Ring', category: 'Rings', price: '$2,450.00', priceNum: 2450,
            metal: '18K White Gold', gem: 'Diamond', specs: '18K White Gold · 1.5 Carat Diamond', badge: 'NEW',
            image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            id: 'item-2', name: 'Aurelia Gold Band', category: 'Rings', price: '$1,890.00', priceNum: 1890,
            metal: '24K Gold', gem: 'Diamond', specs: '24K Pure Gold · Solitaire Diamond Accent', badge: '',
            image: 'https://images.unsplash.com/photo-1603564158650-9b23f9d0b14b?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1603564158650-9b23f9d0b14b?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            id: 'item-3', name: 'Rosé Promise Ring', category: 'Rings', price: '$3,200.00', priceNum: 3200,
            metal: 'Rose Gold', gem: 'Diamond', specs: 'Rose Gold · Pink Diamond Halo', badge: 'BESTSELLER',
            image: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            id: 'item-4', name: 'Emerald Royal Ring', category: 'Rings', price: '$1,133.00', priceNum: 1133,
            metal: '18K Gold', gem: 'Emerald', specs: '18K Yellow Gold · Royal Emerald Cut', badge: '',
            image: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1603564158650-9b23f9d0b14b?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            id: 'item-5', name: 'Sunburst Fan Earrings', category: 'Earrings', price: '$448.00', priceNum: 448,
            metal: '18K Gold', gem: 'Diamond', specs: '18K Yellow Gold · 11.2gm Diamond Drops', badge: 'NEW',
            image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            id: 'item-6', name: 'Tree Of Life Drops', category: 'Earrings', price: '$333.00', priceNum: 333,
            metal: '18K Gold', gem: 'Diamond', specs: '18K Gold · 7.2gm Filigree', badge: '',
            image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            id: 'item-7', name: 'Golden Crescent Moons', category: 'Earrings', price: '$558.00', priceNum: 558,
            metal: '18K Gold', gem: 'Diamond', specs: '18K Gold · Celestial Diamond Inlay', badge: '',
            image: 'https://images.unsplash.com/photo-1535632741717-e47896068228?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1535632741717-e47896068228?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            id: 'item-8', name: 'Sapphire Heirloom Ring', category: 'Rings', price: '$5,400.00', priceNum: 5400,
            metal: '18K Gold', gem: 'Sapphire', specs: '18K Gold · Ceylon Royal Sapphire', badge: 'LIMITED',
            image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            id: 'item-9', name: 'Twisted Vow Band', category: 'Rings', price: '$2,100.00', priceNum: 2100,
            metal: 'White Gold', gem: 'Diamond', specs: '18K White Gold · Diamond Pave', badge: '',
            image: 'https://images.unsplash.com/photo-1535632741717-e47896068228?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1535632741717-e47896068228?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            id: 'item-10', name: 'Pearl Whisper Ring', category: 'Rings', price: '$1,650.00', priceNum: 1650,
            metal: '24K Gold', gem: 'Pearl', specs: '22K Gold · South Sea Lustre Pearl', badge: '',
            image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1603564158650-9b23f9d0b14b?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            id: 'item-11', name: 'Ruby Reverie Solitaire', category: 'Rings', price: '$6,800.00', priceNum: 6800,
            metal: 'Rose Gold', gem: 'Ruby', specs: '18K Rose Gold · Burmese Pigeon Ruby', badge: 'NEW',
            image: 'https://images.unsplash.com/photo-1599643478518-a784e5f4b940?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1599643478518-a784e5f4b940?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            id: 'item-12', name: 'Empress Diamond Pendant', category: 'Necklaces', price: '$4,250.00', priceNum: 4250,
            metal: 'Platinum', gem: 'Diamond', specs: 'Platinum · Pear Cut Diamond Pendant', badge: 'BESTSELLER',
            image: 'https://images.unsplash.com/photo-1535632741717-e47896068228?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1535632741717-e47896068228?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            id: 'item-13', name: 'Golden Bangle Curve', category: 'Bracelets', price: '$2,850.00', priceNum: 2850,
            metal: '18K Gold', gem: 'Diamond', specs: '18K Yellow Gold · Diamond Accent Bangle', badge: '',
            image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1603564158650-9b23f9d0b14b?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            id: 'item-14', name: 'Diamond Tennis Bracelet', category: 'Bracelets', price: '$7,500.00', priceNum: 7500,
            metal: 'Platinum', gem: 'Diamond', specs: 'Platinum · 5.0 Carat Diamond Tennis Line', badge: 'LUXURY',
            image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
            ]
        }
    ];

    const DEFAULT_ORDERS = [
        {
            id: 'ORD-1001', customer: { name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1 555-0101', address: '123 Main St, New York, NY 10001' },
            items: [
                { name: 'Eternal Solitaire Ring', price: '$2,450.00', priceNum: 2450, quantity: 1, image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80' },
                { name: 'Sunburst Fan Earrings', price: '$448.00', priceNum: 448, quantity: 2, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80' }
            ],
            subtotal: 3346, tax: 267.68, total: 3613.68,
            status: 'delivered', date: '2026-08-05', paymentMethod: 'Credit Card'
        },
        {
            id: 'ORD-1002', customer: { name: 'Michael Chen', email: 'michael@example.com', phone: '+1 555-0102', address: '456 Oak Ave, Los Angeles, CA 90001' },
            items: [
                { name: 'Rosé Promise Ring', price: '$3,200.00', priceNum: 3200, quantity: 1, image: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80' }
            ],
            subtotal: 3200, tax: 256, total: 3456,
            status: 'shipped', date: '2026-08-06', paymentMethod: 'PayPal'
        },
        {
            id: 'ORD-1003', customer: { name: 'Emily Rodriguez', email: 'emily@example.com', phone: '+1 555-0103', address: '789 Pine Rd, Chicago, IL 60601' },
            items: [
                { name: 'Diamond Tennis Bracelet', price: '$7,500.00', priceNum: 7500, quantity: 1, image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80' },
                { name: 'Tree Of Life Drops', price: '$333.00', priceNum: 333, quantity: 1, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80' }
            ],
            subtotal: 7833, tax: 626.64, total: 8459.64,
            status: 'processing', date: '2026-08-07', paymentMethod: 'Credit Card'
        },
        {
            id: 'ORD-1004', customer: { name: 'David Kim', email: 'david@example.com', phone: '+1 555-0104', address: '321 Elm St, Houston, TX 77001' },
            items: [
                { name: 'Empress Diamond Pendant', price: '$4,250.00', priceNum: 4250, quantity: 1, image: 'https://images.unsplash.com/photo-1535632741717-e47896068228?auto=format&fit=crop&w=800&q=80' }
            ],
            subtotal: 4250, tax: 340, total: 4590,
            status: 'pending', date: '2026-08-08', paymentMethod: 'Bank Transfer'
        },
        {
            id: 'ORD-1005', customer: { name: 'Jessica Brown', email: 'jessica@example.com', phone: '+1 555-0105', address: '654 Maple Dr, Miami, FL 33101' },
            items: [
                { name: 'Golden Bangle Curve', price: '$2,850.00', priceNum: 2850, quantity: 1, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80' },
                { name: 'Pearl Whisper Ring', price: '$1,650.00', priceNum: 1650, quantity: 1, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80' }
            ],
            subtotal: 4500, tax: 360, total: 4860,
            status: 'cancelled', date: '2026-08-04', paymentMethod: 'Credit Card'
        }
    ];

    const DEFAULT_PAYMENTS = [
        { id: 'PAY-2001', orderId: 'ORD-1001', method: 'Credit Card', amount: 3613.68, status: 'completed', date: '2026-08-05', last4: '4242' },
        { id: 'PAY-2002', orderId: 'ORD-1002', method: 'PayPal', amount: 3456, status: 'completed', date: '2026-08-06', last4: 'N/A' },
        { id: 'PAY-2003', orderId: 'ORD-1003', method: 'Credit Card', amount: 8459.64, status: 'completed', date: '2026-08-07', last4: '1234' },
        { id: 'PAY-2004', orderId: 'ORD-1004', method: 'Bank Transfer', amount: 4590, status: 'pending', date: '2026-08-08', last4: 'N/A' },
        { id: 'PAY-2005', orderId: 'ORD-1005', method: 'Credit Card', amount: 4860, status: 'refunded', date: '2026-08-04', last4: '5678' }
    ];

    const DEFAULT_MESSAGES = [
        { id: 'MSG-3001', name: 'Olivia Wilson', email: 'olivia@example.com', subject: 'Custom Ring Inquiry', message: 'I would like to inquire about a custom engagement ring. Can you provide more details about the customization process and pricing?', date: '2026-08-07', status: 'new' },
        { id: 'MSG-3002', name: 'James Taylor', email: 'james@example.com', subject: 'Order Status', message: 'I placed an order last week and would like to know the current status of my delivery. My order number is ORD-1002.', date: '2026-08-06', status: 'read' },
        { id: 'MSG-3003', name: 'Sophia Martinez', email: 'sophia@example.com', subject: 'Product Question', message: 'Are the gold-plated pieces waterproof? I am interested in the Sunburst Fan Earrings but want to make sure they will last with daily wear.', date: '2026-08-05', status: 'new' },
        { id: 'MSG-3004', name: 'William Anderson', email: 'william@example.com', subject: 'Return Request', message: 'I would like to return an item I purchased. What is your return policy and how do I initiate a return?', date: '2026-08-04', status: 'read' }
    ];

    const DEFAULT_FAQS = [
        {
            id: 'faq-1',
            question: 'What is your Shipping & Delivery policy?',
            answer: 'We use Courier Guy for delivery, which takes 3–4 working days. Locker deliveries also take 4–5 working days to reach the selected locker. Please note that once your parcel is handed over to the courier, delivery is no longer in our control. We will not be held responsible if you have inputted incorrect delivery details — please always double-check your information. Please use your correct postal code to ensure fast delivery and the safety of your package.',
            category: 'Shipping & Delivery',
            status: 'active'
        },
        {
            id: 'faq-2',
            question: 'What is your Return & Exchange policy?',
            answer: 'We offer exchanges within 7 days of receiving your order. Items must be unused and in their original condition and packaging. No refunds are available. Shipping and courier charges are non-refundable, and customers are responsible for return courier costs.',
            category: 'Returns & Exchanges',
            status: 'active'
        },
        {
            id: 'faq-3',
            question: 'How should I care for my fine jewellery?',
            answer: 'Keep your jewellery away from perfume, lotion, water, sweat, chemicals, and cleaners. Store in a dry place and handle with care.',
            category: 'Product Care',
            status: 'active'
        },
        {
            id: 'faq-4',
            question: 'Are your pieces waterproof and tarnish-free?',
            answer: 'Yes! All our pieces are 18K Plated and 316L Premium Steel, meaning they are completely Tarnish Free, Hypoallergenic, and Waterproof. This makes our store your ultimate one-stop jewellery shop.',
            category: 'Product Care',
            status: 'active'
        },
        {
            id: 'faq-5',
            question: 'How long does delivery take?',
            answer: 'We use Courier Guy for delivery, which takes 3–4 working days. Locker deliveries also take 4–5 working days to reach the selected locker.',
            category: 'Shipping & Delivery',
            status: 'active'
        }
    ];

    const DEFAULT_CONTACT_INFO = {
        address: 'Sandton City / Hyde Park, Johannesburg, South Africa',
        hours: 'Mon – Sat: 09:00 – 18:00 | Sun: 10:00 – 15:00',
        phone: '083 922 8383',
        email: 'mairajewels.za@gmail.com'
    };

    // ============ STORAGE HELPERS ============
    function getData(key, defaultVal) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultVal;
        } catch (e) {
            return defaultVal;
        }
    }

    function saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // ============ DATA ACCESS ============
    function getProducts() { return getData(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS); }
    function saveProducts(data) { saveData(STORAGE_KEYS.PRODUCTS, data); }
    function getCategories() { return getData(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES); }
    function saveCategories(data) { saveData(STORAGE_KEYS.CATEGORIES, data); }
    function getOrders() { return getData(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS); }
    function saveOrders(data) { saveData(STORAGE_KEYS.ORDERS, data); }
    function getPayments() { return getData(STORAGE_KEYS.PAYMENTS, DEFAULT_PAYMENTS); }
    function savePayments(data) { saveData(STORAGE_KEYS.PAYMENTS, data); }
    function getMessages() { return getData(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES); }
    function saveMessages(data) { saveData(STORAGE_KEYS.MESSAGES, data); }
    function getFaqs() { return getData(STORAGE_KEYS.FAQS, DEFAULT_FAQS); }
    function saveFaqs(data) { saveData(STORAGE_KEYS.FAQS, data); }
    function getContactInfo() { return getData(STORAGE_KEYS.CONTACT_INFO, DEFAULT_CONTACT_INFO); }
    function saveContactInfo(data) { saveData(STORAGE_KEYS.CONTACT_INFO, data); }

    // ============ AUTH ============
    function isAuthenticated() {
        return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
    }

    function requireAuth() {
        if (!isAuthenticated()) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    // ============ UTILITIES ============
    function formatPrice(val) {
        return '$' + Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function generateId(prefix) {
        return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    function showToast(msg, type) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = msg;
        toast.className = 'toast show' + (type ? ' toast--' + type : '');
        setTimeout(() => {
            toast.className = 'toast';
        }, 3000);
    }

    function getStatusBadge(status) {
        const cls = 'status-badge status-badge--' + (status || '').toLowerCase();
        return `<span class="${cls}">${escapeHtml(status || 'N/A')}</span>`;
    }

    // ============ MODAL HELPERS ============
    function openModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.add('open');
    }

    function closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.remove('open');
    }

    // ============ NAVIGATION ============
    const sectionTitles = {
        dashboard: 'Dashboard',
        products: 'Products',
        categories: 'Categories',
        orders: 'Orders',
        payments: 'Payments',
        faq: 'FAQ Management',
        contact: 'Contact Management'
    };

    function showSection(sectionName) {
        // Update sidebar
        document.querySelectorAll('.sidebar__link').forEach(link => {
            link.classList.toggle('active', link.dataset.section === sectionName);
        });

        // Update sections
        document.querySelectorAll('.section').forEach(sec => {
            sec.classList.toggle('active', sec.id === 'section-' + sectionName);
        });

        // Update title
        const title = document.getElementById('page-title');
        if (title) title.textContent = sectionTitles[sectionName] || 'Dashboard';

        // Render section data
        if (sectionName === 'dashboard') renderDashboard();
        if (sectionName === 'products') renderProducts();
        if (sectionName === 'categories') renderCategories();
        if (sectionName === 'orders') renderOrders();
        if (sectionName === 'payments') renderPayments();
        if (sectionName === 'faq') renderFaqs();
        if (sectionName === 'contact') renderContact();
    }

    // ============ DASHBOARD ============
    function renderDashboard() {
        const products = getProducts();
        const categories = getCategories();
        const orders = getOrders();
        const payments = getPayments();
        const messages = getMessages();
        const faqs = getFaqs();

        // Stats
        document.getElementById('stat-products').textContent = products.length;
        document.getElementById('stat-categories').textContent = categories.length;
        document.getElementById('stat-orders').textContent = orders.length;
        document.getElementById('stat-payments').textContent = payments.length;
        document.getElementById('stat-messages').textContent = messages.length;

        // Revenue (sum of completed payments)
        const revenue = payments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + (p.amount || 0), 0);
        document.getElementById('stat-revenue').textContent = formatPrice(revenue);

        // Recent orders
        const recentOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
        const recentOrdersTable = document.getElementById('recent-orders-table');
        if (recentOrdersTable) {
            if (recentOrders.length === 0) {
                recentOrdersTable.innerHTML = '<tr><td colspan="5" class="empty-state">No orders yet</td></tr>';
            } else {
                recentOrdersTable.innerHTML = recentOrders.map(order => `
                    <tr>
                        <td><strong>${escapeHtml(order.id)}</strong></td>
                        <td>${escapeHtml(order.customer.name)}</td>
                        <td>${formatPrice(order.total)}</td>
                        <td>${getStatusBadge(order.status)}</td>
                        <td>${formatDate(order.date)}</td>
                    </tr>
                `).join('');
            }
        }

        // FAQ count in stats
        const statFaqs = document.getElementById('stat-faqs');
        if (statFaqs) statFaqs.textContent = faqs.length;

        // Recent messages
        const recentMessages = [...messages].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);
        const recentMessagesList = document.getElementById('recent-messages-list');
        if (recentMessagesList) {
            if (recentMessages.length === 0) {
                recentMessagesList.innerHTML = '<div class="empty-state">No messages yet</div>';
            } else {
                recentMessagesList.innerHTML = recentMessages.map(msg => `
                    <div class="message-item" data-message-id="${msg.id}">
                        <div class="message-item__name">${escapeHtml(msg.name)} ${msg.status === 'new' ? '<span class="status-badge status-badge--new">NEW</span>' : ''}</div>
                        <div class="message-item__subject">${escapeHtml(msg.subject)}</div>
                        <div class="message-item__date">${formatDate(msg.date)}</div>
                    </div>
                `).join('');

                // Click handler for recent messages
                recentMessagesList.querySelectorAll('.message-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const msgId = item.dataset.messageId;
                        const msg = messages.find(m => m.id === msgId);
                        if (msg) showMessageDetails(msg);
                    });
                });
            }
        }
    }

    // ============ PRODUCTS ============
    let productSearchTerm = '';
    let productCategoryFilter = 'all';

    function renderProducts() {
        const products = getProducts();
        const categories = getCategories();
        const tbody = document.getElementById('products-table');
        if (!tbody) return;

        // Populate category filter
        const filterSelect = document.getElementById('product-category-filter');
        if (filterSelect) {
            const currentVal = filterSelect.value;
            filterSelect.innerHTML = '<option value="all">All Categories</option>' +
                categories.map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('');
            filterSelect.value = currentVal;
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
                p.name.toLowerCase().includes(term) ||
                p.specs.toLowerCase().includes(term) ||
                p.metal.toLowerCase().includes(term) ||
                p.gem.toLowerCase().includes(term)
            );
        }
        if (productCategoryFilter !== 'all') {
            filtered = filtered.filter(p => p.category === productCategoryFilter);
        }

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><div class="empty-state__icon">💎</div><div class="empty-state__text">No products found</div></td></tr>';
            return;
        }

        tbody.innerHTML = filtered.map(product => `
            <tr>
                <td><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" class="product-thumb" onerror="this.src='https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'"></td>
                <td><strong>${escapeHtml(product.name)}</strong></td>
                <td>${escapeHtml(product.category)}</td>
                <td>${escapeHtml(product.price)}</td>
                <td>${escapeHtml(product.metal)}</td>
                <td>${escapeHtml(product.gem)}</td>
                <td>${product.badge ? `<span class="status-badge status-badge--new">${escapeHtml(product.badge)}</span>` : '—'}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn--sm btn--secondary" data-edit-product="${product.id}">Edit</button>
                        <button class="btn btn--sm btn--danger" data-delete-product="${product.id}">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');

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
        const product = getProducts().find(p => p.id === id);
        if (product) openProductModal(product);
    }

    function deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        const products = getProducts().filter(p => p.id !== id);
        saveProducts(products);
        renderProducts();
        renderDashboard();
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

        const products = getProducts();
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

        saveProducts(products);
        closeModal('product-modal');
        renderProducts();
        renderDashboard();
        showToast(id ? 'Product updated successfully' : 'Product added successfully', 'success');
    }

    // ============ CATEGORIES ============
    function renderCategories() {
        const categories = getCategories();
        const products = getProducts();
        const tbody = document.getElementById('categories-table');
        if (!tbody) return;

        if (categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-state"><div class="empty-state__icon">🏷️</div><div class="empty-state__text">No categories found</div></td></tr>';
            return;
        }

        tbody.innerHTML = categories.map(cat => {
            const productCount = products.filter(p => p.category === cat.name).length;
            return `
                <tr>
                    <td><strong>${escapeHtml(cat.name)}</strong></td>
                    <td>${escapeHtml(cat.description || '—')}</td>
                    <td>${productCount}</td>
                    <td>
                        <div class="actions">
                            <button class="btn btn--sm btn--secondary" data-edit-category="${cat.id}">Edit</button>
                            <button class="btn btn--sm btn--danger" data-delete-category="${cat.id}">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

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
        const category = getCategories().find(c => c.id === id);
        if (category) openCategoryModal(category);
    }

    function deleteCategory(id) {
        const category = getCategories().find(c => c.id === id);
        if (!category) return;
        const productCount = getProducts().filter(p => p.category === category.name).length;
        if (productCount > 0) {
            if (!confirm(`This category has ${productCount} product(s). Deleting it will not delete the products but they will be uncategorized. Continue?`)) return;
        } else {
            if (!confirm('Are you sure you want to delete this category?')) return;
        }
        const categories = getCategories().filter(c => c.id !== id);
        saveCategories(categories);
        renderCategories();
        renderDashboard();
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

        const categories = getCategories();
        const catData = { id: id || generateId('cat'), name, description };

        if (id) {
            const idx = categories.findIndex(c => c.id === id);
            if (idx > -1) categories[idx] = catData;
        } else {
            categories.push(catData);
        }

        saveCategories(categories);
        closeModal('category-modal');
        renderCategories();
        renderDashboard();
        showToast(id ? 'Category updated successfully' : 'Category added successfully', 'success');
    }

    // ============ ORDERS ============
    let orderStatusFilter = 'all';

    function renderOrders() {
        const orders = getOrders();
        const tbody = document.getElementById('orders-table');
        if (!tbody) return;

        let filtered = orders;
        if (orderStatusFilter !== 'all') {
            filtered = filtered.filter(o => o.status === orderStatusFilter);
        }

        // Sort by date descending
        filtered = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><div class="empty-state__icon">📦</div><div class="empty-state__text">No orders found</div></td></tr>';
            return;
        }

        tbody.innerHTML = filtered.map(order => {
            const itemCount = order.items.reduce((sum, i) => sum + (i.quantity || 1), 0);
            return `
                <tr>
                    <td><strong>${escapeHtml(order.id)}</strong></td>
                    <td>${escapeHtml(order.customer.name)}</td>
                    <td>${itemCount} item(s)</td>
                    <td>${formatPrice(order.total)}</td>
                    <td>
                        <select class="input input--select order-status-select" data-order-id="${order.id}">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                    <td>${formatDate(order.date)}</td>
                    <td>
                        <div class="actions">
                            <button class="btn btn--sm btn--secondary" data-view-order="${order.id}">View</button>
                            <button class="btn btn--sm btn--danger" data-delete-order="${order.id}">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Attach event handlers
        tbody.querySelectorAll('.order-status-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const orderId = e.target.dataset.orderId;
                const orders = getOrders();
                const order = orders.find(o => o.id === orderId);
                if (order) {
                    order.status = e.target.value;
                    saveOrders(orders);
                    renderDashboard();
                    showToast(`Order ${orderId} status updated to ${e.target.value}`, 'success');
                }
            });
        });

        tbody.querySelectorAll('[data-view-order]').forEach(btn => {
            btn.addEventListener('click', () => {
                const order = getOrders().find(o => o.id === btn.dataset.viewOrder);
                if (order) showOrderDetails(order);
            });
        });

        tbody.querySelectorAll('[data-delete-order]').forEach(btn => {
            btn.addEventListener('click', () => deleteOrder(btn.dataset.deleteOrder));
        });
    }

    function showOrderDetails(order) {
        const body = document.getElementById('order-details-body');
        if (!body) return;

        const itemsHtml = order.items.map(item => `
            <div class="order-item">
                <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" onerror="this.src='https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'">
                <div class="order-item__info">
                    <div class="order-item__name">${escapeHtml(item.name)}</div>
                    <div class="order-item__meta">Qty: ${item.quantity || 1}</div>
                </div>
                <div class="order-item__price">${formatPrice((item.priceNum || 0) * (item.quantity || 1))}</div>
            </div>
        `).join('');

        body.innerHTML = `
            <div class="detail-section">
                <h4>Order Information</h4>
                <div class="detail-row"><span class="detail-row__label">Order ID</span><span class="detail-row__value">${escapeHtml(order.id)}</span></div>
                <div class="detail-row"><span class="detail-row__label">Date</span><span class="detail-row__value">${formatDate(order.date)}</span></div>
                <div class="detail-row"><span class="detail-row__label">Status</span><span class="detail-row__value">${getStatusBadge(order.status)}</span></div>
                <div class="detail-row"><span class="detail-row__label">Payment Method</span><span class="detail-row__value">${escapeHtml(order.paymentMethod || 'N/A')}</span></div>
            </div>
            <div class="detail-section">
                <h4>Customer Information</h4>
                <div class="detail-row"><span class="detail-row__label">Name</span><span class="detail-row__value">${escapeHtml(order.customer.name)}</span></div>
                <div class="detail-row"><span class="detail-row__label">Email</span><span class="detail-row__value">${escapeHtml(order.customer.email)}</span></div>
                <div class="detail-row"><span class="detail-row__label">Phone</span><span class="detail-row__value">${escapeHtml(order.customer.phone || 'N/A')}</span></div>
                <div class="detail-row"><span class="detail-row__label">Address</span><span class="detail-row__value">${escapeHtml(order.customer.address || 'N/A')}</span></div>
            </div>
            <div class="detail-section">
                <h4>Items (${order.items.length})</h4>
                <div class="order-items-list">${itemsHtml}</div>
            </div>
            <div class="detail-section">
                <h4>Payment Summary</h4>
                <div class="detail-row"><span class="detail-row__label">Subtotal</span><span class="detail-row__value">${formatPrice(order.subtotal)}</span></div>
                <div class="detail-row"><span class="detail-row__label">Tax (8%)</span><span class="detail-row__value">${formatPrice(order.tax)}</span></div>
                <div class="detail-row"><span class="detail-row__label">Total</span><span class="detail-row__value" style="color: var(--color-gold); font-size: 1.1rem;">${formatPrice(order.total)}</span></div>
            </div>
        `;

        openModal('order-modal');
    }

    function deleteOrder(id) {
        if (!confirm('Are you sure you want to delete this order?')) return;
        const orders = getOrders().filter(o => o.id !== id);
        saveOrders(orders);
        renderOrders();
        renderDashboard();
        showToast('Order deleted successfully', 'success');
    }

    // ============ PAYMENTS ============
    let paymentStatusFilter = 'all';

    function renderPayments() {
        const payments = getPayments();
        const tbody = document.getElementById('payments-table');
        if (!tbody) return;

        let filtered = payments;
        if (paymentStatusFilter !== 'all') {
            filtered = filtered.filter(p => p.status === paymentStatusFilter);
        }

        filtered = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><div class="empty-state__icon">💳</div><div class="empty-state__text">No payments found</div></td></tr>';
            return;
        }

        tbody.innerHTML = filtered.map(payment => `
            <tr>
                <td><strong>${escapeHtml(payment.id)}</strong></td>
                <td>${escapeHtml(payment.orderId)}</td>
                <td>${escapeHtml(payment.method)}</td>
                <td>${formatPrice(payment.amount)}</td>
                <td>
                    <select class="input input--select payment-status-select" data-payment-id="${payment.id}">
                        <option value="completed" ${payment.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="pending" ${payment.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="failed" ${payment.status === 'failed' ? 'selected' : ''}>Failed</option>
                        <option value="refunded" ${payment.status === 'refunded' ? 'selected' : ''}>Refunded</option>
                    </select>
                </td>
                <td>${formatDate(payment.date)}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn--sm btn--secondary" data-view-payment="${payment.id}">View</button>
                        <button class="btn btn--sm btn--danger" data-delete-payment="${payment.id}">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('.payment-status-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const paymentId = e.target.dataset.paymentId;
                const payments = getPayments();
                const payment = payments.find(p => p.id === paymentId);
                if (payment) {
                    payment.status = e.target.value;
                    savePayments(payments);
                    renderDashboard();
                    showToast(`Payment ${paymentId} status updated to ${e.target.value}`, 'success');
                }
            });
        });

        tbody.querySelectorAll('[data-view-payment]').forEach(btn => {
            btn.addEventListener('click', () => {
                const payment = getPayments().find(p => p.id === btn.dataset.viewPayment);
                if (payment) showPaymentDetails(payment);
            });
        });

        tbody.querySelectorAll('[data-delete-payment]').forEach(btn => {
            btn.addEventListener('click', () => deletePayment(btn.dataset.deletePayment));
        });
    }

    function showPaymentDetails(payment) {
        const body = document.getElementById('payment-details-body');
        if (!body) return;

        body.innerHTML = `
            <div class="detail-section">
                <h4>Payment Information</h4>
                <div class="detail-row"><span class="detail-row__label">Payment ID</span><span class="detail-row__value">${escapeHtml(payment.id)}</span></div>
                <div class="detail-row"><span class="detail-row__label">Order ID</span><span class="detail-row__value">${escapeHtml(payment.orderId)}</span></div>
                <div class="detail-row"><span class="detail-row__label">Method</span><span class="detail-row__value">${escapeHtml(payment.method)}</span></div>
                <div class="detail-row"><span class="detail-row__label">Card Last 4</span><span class="detail-row__value">${escapeHtml(payment.last4 || 'N/A')}</span></div>
                <div class="detail-row"><span class="detail-row__label">Amount</span><span class="detail-row__value" style="color: var(--color-gold); font-size: 1.1rem;">${formatPrice(payment.amount)}</span></div>
                <div class="detail-row"><span class="detail-row__label">Status</span><span class="detail-row__value">${getStatusBadge(payment.status)}</span></div>
                <div class="detail-row"><span class="detail-row__label">Date</span><span class="detail-row__value">${formatDate(payment.date)}</span></div>
            </div>
        `;

        openModal('payment-modal');
    }

    function deletePayment(id) {
        if (!confirm('Are you sure you want to delete this payment record?')) return;
        const payments = getPayments().filter(p => p.id !== id);
        savePayments(payments);
        renderPayments();
        renderDashboard();
        showToast('Payment deleted successfully', 'success');
    }

    // ============ MESSAGES ============
    function renderMessages() {
        const messages = getMessages();
        const tbody = document.getElementById('messages-table');
        if (!tbody) return;

        const sorted = [...messages].sort((a, b) => new Date(b.date) - new Date(a.date));

        if (sorted.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><div class="empty-state__icon">✉️</div><div class="empty-state__text">No messages found</div></td></tr>';
            return;
        }

        tbody.innerHTML = sorted.map(msg => `
            <tr>
                <td><strong>${escapeHtml(msg.name)}</strong></td>
                <td>${escapeHtml(msg.email)}</td>
                <td>${escapeHtml(msg.subject)}</td>
                <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(msg.message)}</td>
                <td>${formatDate(msg.date)}</td>
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

        tbody.querySelectorAll('[data-view-message]').forEach(btn => {
            btn.addEventListener('click', () => {
                const msg = getMessages().find(m => m.id === btn.dataset.viewMessage);
                if (msg) showMessageDetails(msg);
            });
        });

        tbody.querySelectorAll('[data-toggle-message]').forEach(btn => {
            btn.addEventListener('click', () => {
                const messages = getMessages();
                const msg = messages.find(m => m.id === btn.dataset.toggleMessage);
                if (msg) {
                    msg.status = msg.status === 'new' ? 'read' : 'new';
                    saveMessages(messages);
                    renderMessages();
                    renderDashboard();
                    showToast(`Message marked as ${msg.status}`, 'success');
                }
            });
        });

        tbody.querySelectorAll('[data-delete-message]').forEach(btn => {
            btn.addEventListener('click', () => deleteMessage(btn.dataset.deleteMessage));
        });
    }

    function showMessageDetails(msg) {
        const body = document.getElementById('message-details-body');
        if (!body) return;

        // Mark as read when viewed
        const messages = getMessages();
        const storedMsg = messages.find(m => m.id === msg.id);
        if (storedMsg && storedMsg.status === 'new') {
            storedMsg.status = 'read';
            saveMessages(messages);
            renderMessages();
            renderDashboard();
        }

        body.innerHTML = `
            <div class="detail-section">
                <h4>Sender Information</h4>
                <div class="detail-row"><span class="detail-row__label">Name</span><span class="detail-row__value">${escapeHtml(msg.name)}</span></div>
                <div class="detail-row"><span class="detail-row__label">Email</span><span class="detail-row__value">${escapeHtml(msg.email)}</span></div>
                <div class="detail-row"><span class="detail-row__label">Date</span><span class="detail-row__value">${formatDate(msg.date)}</span></div>
                <div class="detail-row"><span class="detail-row__label">Status</span><span class="detail-row__value">${getStatusBadge(msg.status)}</span></div>
            </div>
            <div class="detail-section">
                <h4>Subject</h4>
                <p style="font-size: 1rem; font-weight: 600;">${escapeHtml(msg.subject)}</p>
            </div>
            <div class="detail-section">
                <h4>Message</h4>
                <p style="font-size: 0.95rem; line-height: 1.7; white-space: pre-wrap;">${escapeHtml(msg.message)}</p>
            </div>
        `;

        openModal('message-modal');
    }

    function deleteMessage(id) {
        if (!confirm('Are you sure you want to delete this message?')) return;
        const messages = getMessages().filter(m => m.id !== id);
        saveMessages(messages);
        renderMessages();
        renderDashboard();
        showToast('Message deleted successfully', 'success');
    }

    // ============ FAQ MANAGEMENT ============
    let faqSearchTerm = '';

    function renderFaqs() {
        const faqs = getFaqs();
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

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><div class="empty-state__icon">❓</div><div class="empty-state__text">No FAQs found</div></td></tr>';
            return;
        }

        tbody.innerHTML = filtered.map(faq => `
            <tr>
                <td style="max-width: 300px;"><strong>${escapeHtml(faq.question)}</strong></td>
                <td style="max-width: 350px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(faq.answer)}</td>
                <td><span class="status-badge status-badge--info">${escapeHtml(faq.category)}</span></td>
                <td>${faq.status === 'active' ? '<span class="status-badge status-badge--delivered">Active</span>' : '<span class="status-badge status-badge--cancelled">Inactive</span>'}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn--sm btn--secondary" data-edit-faq="${faq.id}">Edit</button>
                        <button class="btn btn--sm btn--success" data-toggle-faq="${faq.id}">${faq.status === 'active' ? 'Deactivate' : 'Activate'}</button>
                        <button class="btn btn--sm btn--danger" data-delete-faq="${faq.id}">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');

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
        const faq = getFaqs().find(f => f.id === id);
        if (faq) openFaqModal(faq);
    }

    function toggleFaqStatus(id) {
        const faqs = getFaqs();
        const faq = faqs.find(f => f.id === id);
        if (faq) {
            faq.status = faq.status === 'active' ? 'inactive' : 'active';
            saveFaqs(faqs);
            renderFaqs();
            showToast(`FAQ ${faq.status === 'active' ? 'activated' : 'deactivated'} successfully`, 'success');
        }
    }

    function deleteFaq(id) {
        if (!confirm('Are you sure you want to delete this FAQ?')) return;
        const faqs = getFaqs().filter(f => f.id !== id);
        saveFaqs(faqs);
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
            showToast('Please fill in both question and answer', 'error');
            return;
        }

        const faqs = getFaqs();
        const faqData = { id: id || generateId('faq'), question, answer, category, status };

        if (id) {
            const idx = faqs.findIndex(f => f.id === id);
            if (idx > -1) faqs[idx] = faqData;
        } else {
            faqs.push(faqData);
        }

        saveFaqs(faqs);
        closeModal('faq-modal');
        renderFaqs();
        showToast(id ? 'FAQ updated successfully' : 'FAQ added successfully', 'success');
    }

    // ============ CONTACT MANAGEMENT ============
    function renderContact() {
        // Render contact info
        const contactInfo = getContactInfo();
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

    function openContactInfoModal() {
        const contactInfo = getContactInfo();
        document.getElementById('contact-address').value = contactInfo.address || '';
        document.getElementById('contact-hours').value = contactInfo.hours || '';
        document.getElementById('contact-phone').value = contactInfo.phone || '';
        document.getElementById('contact-email').value = contactInfo.email || '';
        openModal('contact-info-modal');
    }

    function handleContactInfoForm(e) {
        e.preventDefault();
        const contactInfo = {
            address: document.getElementById('contact-address').value.trim(),
            hours: document.getElementById('contact-hours').value.trim(),
            phone: document.getElementById('contact-phone').value.trim(),
            email: document.getElementById('contact-email').value.trim()
        };

        saveContactInfo(contactInfo);
        closeModal('contact-info-modal');
        renderContact();
        showToast('Contact information updated successfully', 'success');
    }

    // ============ INIT ============
    function init() {
        if (!requireAuth()) return;

        // Set admin name
        const adminName = document.getElementById('admin-name');
        if (adminName) adminName.textContent = 'Admin';
        const adminAvatar = document.getElementById('admin-avatar');
        if (adminAvatar) adminAvatar.textContent = 'A';

        // Set current date
        const dateEl = document.getElementById('current-date');
        if (dateEl) {
            dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        }

        // Sidebar navigation
        document.querySelectorAll('.sidebar__link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showSection(link.dataset.section);
                // Close mobile sidebar
                document.getElementById('sidebar').classList.remove('open');
            });
        });

        // Sidebar toggle (mobile)
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                document.getElementById('sidebar').classList.toggle('open');
            });
        }

        // Dashboard "View All" links
        document.querySelectorAll('[data-goto]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showSection(link.dataset.goto);
            });
        });

        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem(STORAGE_KEYS.AUTH);
                window.location.href = 'index.html';
            });
        }

        // Product modal
        const addProductBtn = document.getElementById('add-product-btn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => openProductModal(null));
        }

        const productForm = document.getElementById('product-form');
        if (productForm) {
            productForm.addEventListener('submit', handleProductForm);
        }

        // Product search
        const productSearch = document.getElementById('product-search');
        if (productSearch) {
            productSearch.addEventListener('input', (e) => {
                productSearchTerm = e.target.value;
                renderProducts();
            });
        }

        // Product category filter
        const productCatFilter = document.getElementById('product-category-filter');
        if (productCatFilter) {
            productCatFilter.addEventListener('change', (e) => {
                productCategoryFilter = e.target.value;
                renderProducts();
            });
        }

        // Category modal
        const addCategoryBtn = document.getElementById('add-category-btn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => openCategoryModal(null));
        }

        const categoryForm = document.getElementById('category-form');
        if (categoryForm) {
            categoryForm.addEventListener('submit', handleCategoryForm);
        }

        // Order status filter
        const orderFilter = document.getElementById('order-status-filter');
        if (orderFilter) {
            orderFilter.addEventListener('change', (e) => {
                orderStatusFilter = e.target.value;
                renderOrders();
            });
        }

        // Payment status filter
        const paymentFilter = document.getElementById('payment-status-filter');
        if (paymentFilter) {
            paymentFilter.addEventListener('change', (e) => {
                paymentStatusFilter = e.target.value;
                renderPayments();
            });
        }

        // FAQ modal
        const addFaqBtn = document.getElementById('add-faq-btn');
        if (addFaqBtn) {
            addFaqBtn.addEventListener('click', () => openFaqModal(null));
        }

        const faqForm = document.getElementById('faq-form');
        if (faqForm) {
            faqForm.addEventListener('submit', handleFaqForm);
        }

        // FAQ search
        const faqSearch = document.getElementById('faq-search');
        if (faqSearch) {
            faqSearch.addEventListener('input', (e) => {
                faqSearchTerm = e.target.value;
                renderFaqs();
            });
        }

        // Contact info modal
        const editContactInfoBtn = document.getElementById('edit-contact-info-btn');
        if (editContactInfoBtn) {
            editContactInfoBtn.addEventListener('click', openContactInfoModal);
        }

        const contactInfoForm = document.getElementById('contact-info-form');
        if (contactInfoForm) {
            contactInfoForm.addEventListener('submit', handleContactInfoForm);
        }

        // Modal close buttons
        document.querySelectorAll('[data-close]').forEach(btn => {
            btn.addEventListener('click', () => {
                closeModal(btn.dataset.close);
            });
        });

        // Close modal on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.remove('open');
                }
            });
        });

        // Close modal on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
            }
        });

        // Initial render
        showSection('dashboard');
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();