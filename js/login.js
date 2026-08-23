/* =============================================
   Maira Jewels — Admin Login Logic (Live API Direct Sync)
   ============================================= */

(function () {
    'use strict';

    const AUTH_KEY = 'maira_admin_auth';

    // If already authenticated with token, redirect to dashboard
    const existingToken = localStorage.getItem('maira_admin_token') || localStorage.getItem('token') || localStorage.getItem('admin_token');
    const isAuthFlag = localStorage.getItem(AUTH_KEY) === 'true';
    if (existingToken || isAuthFlag) {
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

    async function handleLogin(e) {
        e.preventDefault();
        hideError();

        const email = document.getElementById('admin-email').value.trim();
        const password = document.getElementById('admin-password').value;

        if (!email || !password) {
            showError('Please enter both email and password.');
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : 'LOG IN TO ADMIN';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'LOGGING IN...';
        }

        try {
            if (typeof API === 'undefined' || !API.adminLogin) {
                throw new Error('API client is not initialized. Please ensure backend is running.');
            }

            const res = await API.adminLogin(email, password);
            if (res && (res.success || res.statusCode === 200 || res.data?.token)) {
                localStorage.setItem(AUTH_KEY, 'true');
                window.location.href = 'html/dashboard.html';
                return;
            } else {
                throw new Error(res?.message || 'Login failed. Invalid credentials.');
            }
        } catch (err) {
            console.error('[Login Error]:', err.message);
            showError(err.message || 'Invalid email or password. Please verify backend connection.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    }

    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
})();