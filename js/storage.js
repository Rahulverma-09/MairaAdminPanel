/**
 * Maira Jewels Admin - Storage & Data Layer
 */
const STORAGE_KEYS = {
    PRODUCTS: 'maira_admin_products',
    CATEGORIES: 'maira_admin_categories',
    ORDERS: 'maira_admin_orders',
    PAYMENTS: 'maira_admin_payments',
    MESSAGES: 'maira_admin_messages',
    FAQS: 'maira_admin_faqs',
    CONTACT_INFO: 'maira_admin_contact_info',
    AUTH: 'maira_admin_auth',
    PROFILE: 'maira_admin_profile',
    CREDENTIALS: 'maira_admin_credentials'
};

const DEFAULT_PROFILE = {
    name: 'Admin',
    email: 'admin@mirajewels.com',
    role: 'Administrator',
    avatar: 'A'
};

const DEFAULT_CREDENTIALS = {
    email: 'admin@mirajewels.com',
    password: 'admin123'
};

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

const Storage = {
    getData(key, defaultVal) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultVal;
        } catch (e) {
            return defaultVal;
        }
    },
    saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },
    getProducts() { return this.getData(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS); },
    saveProducts(data) { this.saveData(STORAGE_KEYS.PRODUCTS, data); },
    getCategories() { return this.getData(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES); },
    saveCategories(data) { this.saveData(STORAGE_KEYS.CATEGORIES, data); },
    getOrders() { return this.getData(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS); },
    saveOrders(data) { this.saveData(STORAGE_KEYS.ORDERS, data); },
    getPayments() { return this.getData(STORAGE_KEYS.PAYMENTS, DEFAULT_PAYMENTS); },
    savePayments(data) { this.saveData(STORAGE_KEYS.PAYMENTS, data); },
    getMessages() { return this.getData(STORAGE_KEYS.MESSAGES, DEFAULT_MESSAGES); },
    saveMessages(data) { this.saveData(STORAGE_KEYS.MESSAGES, data); },
    getFaqs() { return this.getData(STORAGE_KEYS.FAQS, DEFAULT_FAQS); },
    saveFaqs(data) { this.saveData(STORAGE_KEYS.FAQS, data); },
    getContactInfo() { return this.getData(STORAGE_KEYS.CONTACT_INFO, DEFAULT_CONTACT_INFO); },
    saveContactInfo(data) { this.saveData(STORAGE_KEYS.CONTACT_INFO, data); },
    getProfile() { return this.getData(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE); },
    saveProfile(data) { this.saveData(STORAGE_KEYS.PROFILE, data); },
    getCredentials() { return this.getData(STORAGE_KEYS.CREDENTIALS, DEFAULT_CREDENTIALS); },
    saveCredentials(data) { this.saveData(STORAGE_KEYS.CREDENTIALS, data); }
};
