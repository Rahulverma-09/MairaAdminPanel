/* =============================================
   Maira Jewels — Admin Login Logic
   ============================================= */

(function () {
    'use strict';

    const AUTH_KEY = 'maira_admin_auth';
    const CREDENTIALS_KEY = 'maira_admin_credentials';
    const DEFAULT_CREDENTIALS = {
        email: 'admin@mirajewels.com',
        password: 'admin123'
    };

    function getCredentials() {
        try {
            const data = localStorage.getItem(CREDENTIALS_KEY);
            return data ? JSON.parse(data) : DEFAULT_CREDENTIALS;
        } catch (e) {
            return DEFAULT_CREDENTIALS;
        }
    }

    // If already authenticated, redirect to dashboard in html/ folder
    if (localStorage.getItem(AUTH_KEY) === 'true') {
        window.location.href = 'html/dashboard.html';
        return;
    }

    function showError(msg) {
        const errorEl = document.getElementById('login-error');
        if (errorEl) {
            errorEl.textContent = msg;
            errorEl.style.display = 'block';
        }
    }

    function hideError() {
        const errorEl = document.getElementById('login-error');
        if (errorEl) {
            errorEl.style.display = 'none';
        }
    }

    function handleLogin(e) {
        e.preventDefault();
        hideError();

        const email = document.getElementById('admin-email').value.trim();
        const password = document.getElementById('admin-password').value;

        if (!email || !password) {
            showError('Please enter both email and password.');
            return;
        }

        const creds = getCredentials();

        if (email.toLowerCase() === creds.email.toLowerCase() && password === creds.password) {
            localStorage.setItem(AUTH_KEY, 'true');
            window.location.href = 'html/dashboard.html';
        } else {
            showError('Invalid email or password. Please try again.');
        }
    }

    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
})();