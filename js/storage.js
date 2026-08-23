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
    CREDENTIALS: 'maira_admin_credentials',
    CUSTOMERS: 'maira_admin_customers'
};

const DEFAULT_PROFILE = {
    name: 'Admin',
    email: '',
    role: 'Administrator',
    avatar: 'A'
};

const DEFAULT_CREDENTIALS = {
    email: '',
    password: ''
};

const DEFAULT_CATEGORIES = [];

const DEFAULT_PRODUCTS = [];

const DEFAULT_ORDERS = [];

const DEFAULT_PAYMENTS = [];

const DEFAULT_CUSTOMERS = [];

const DEFAULT_MESSAGES = [];

const DEFAULT_FAQS = [];

const DEFAULT_CONTACT_INFO = {
    address: '',
    hours: '',
    phone: '',
    email: ''
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
    getCustomers() { return this.getData(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS); },
    saveCustomers(data) { this.saveData(STORAGE_KEYS.CUSTOMERS, data); },
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
