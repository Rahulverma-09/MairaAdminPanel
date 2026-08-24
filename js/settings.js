/**
 * Maira Jewels Admin - Settings Controller (Live API Direct Sync)
 */

async function loadProfile() {
    let profile = Storage.getProfile();

    try {
        if (typeof API !== 'undefined' && API.getProfile) {
            const res = await API.getProfile();
            if (res && res.data) {
                profile = res.data.user || res.data;
                Storage.saveProfile(profile);
            }
        }
    } catch (e) {
        console.warn('[Settings] Profile fetch error, using cache:', e.message);
    }

    const nameInput = document.getElementById('profile-name');
    const emailInput = document.getElementById('profile-email');
    const roleInput = document.getElementById('profile-role');
    const avatarInput = document.getElementById('profile-avatar');

    if (nameInput) nameInput.value = profile.name || '';
    if (emailInput) emailInput.value = profile.email || '';
    if (roleInput) roleInput.value = profile.role || 'Administrator';
    if (avatarInput) avatarInput.value = profile.avatar || (profile.name ? profile.name.charAt(0).toUpperCase() : 'A');
}

async function handleProfileUpdate(e) {
    e.preventDefault();

    const name = document.getElementById('profile-name').value.trim();
    const email = document.getElementById('profile-email').value.trim();
    const role = document.getElementById('profile-role').value.trim();
    const avatar = document.getElementById('profile-avatar').value.trim().toUpperCase() || (name ? name.charAt(0).toUpperCase() : 'A');

    if (!name || !email) {
        showToast('Name and Email are required', 'error');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) setButtonLoading(submitBtn, true, 'Saving...');

    const profileData = { name, email, role, avatar };

    try {
        if (typeof API !== 'undefined' && API.updateProfile) {
            const res = await API.updateProfile(profileData);
            if (res && res.data) {
                profileData.name = res.data.name || name;
                profileData.email = res.data.email || email;
                profileData.role = res.data.role || role;
                profileData.avatar = res.data.avatar || avatar;
            }
        }
    } catch (err) {
        console.warn('[Settings] Profile API update warning:', err.message);
    } finally {
        if (submitBtn) setButtonLoading(submitBtn, false);
    }

    Storage.saveProfile(profileData);
    if (typeof Storage !== 'undefined' && Storage.saveCredentials) {
        const creds = (Storage.getCredentials && Storage.getCredentials()) || {};
        creds.email = email;
        Storage.saveCredentials(creds);
    }

    // Update sidebar profile live
    const adminName = document.getElementById('admin-name');
    if (adminName) adminName.textContent = name;
    const adminRole = document.querySelector('.admin-user__role');
    if (adminRole) adminRole.textContent = role;
    const adminAvatar = document.getElementById('admin-avatar');
    if (adminAvatar) adminAvatar.textContent = avatar;

    showToast('Profile updated successfully!', 'success');
}

async function handlePasswordUpdate(e) {
    e.preventDefault();

    const currentPass = document.getElementById('current-password').value;
    const newPass = document.getElementById('new-password').value;
    const confirmPass = document.getElementById('confirm-password').value;

    if (!currentPass || !newPass) {
        showToast('Please enter both current and new password', 'error');
        return;
    }

    if (newPass.length < 6) {
        showToast('New password must be at least 6 characters', 'error');
        return;
    }

    if (newPass !== confirmPass) {
        showToast('New passwords do not match', 'error');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) setButtonLoading(submitBtn, true, 'Updating Password...');

    try {
        if (typeof API !== 'undefined' && API.updatePassword) {
            await API.updatePassword({ currentPassword: currentPass, newPassword: newPass });
        }
        document.getElementById('password-form').reset();
        showToast('Password changed successfully!', 'success');
    } catch (err) {
        console.error('[Settings] Password update error:', err.message);
        showToast('Failed to update password: ' + err.message, 'error');
    } finally {
        if (submitBtn) setButtonLoading(submitBtn, false);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initLayout('settings');
    loadProfile();

    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }

    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordUpdate);
    }
});
