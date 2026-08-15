/**
 * Maira Jewels Admin - Settings Controller
 */

function loadProfile() {
    const profile = Storage.getProfile();
    const creds = Storage.getCredentials();

    const nameInput = document.getElementById('profile-name');
    const emailInput = document.getElementById('profile-email');
    const roleInput = document.getElementById('profile-role');
    const avatarInput = document.getElementById('profile-avatar');

    if (nameInput) nameInput.value = profile.name || 'Admin';
    if (emailInput) emailInput.value = creds.email || profile.email || 'admin@mirajewels.com';
    if (roleInput) roleInput.value = profile.role || 'Administrator';
    if (avatarInput) avatarInput.value = profile.avatar || 'A';
}

function handleProfileUpdate(e) {
    e.preventDefault();

    const name = document.getElementById('profile-name').value.trim();
    const email = document.getElementById('profile-email').value.trim();
    const role = document.getElementById('profile-role').value.trim();
    const avatar = document.getElementById('profile-avatar').value.trim().toUpperCase() || (name ? name.charAt(0).toUpperCase() : 'A');

    if (!name || !email) {
        showToast('Name and Email are required', 'error');
        return;
    }

    // Save profile
    const profile = { name, email, role, avatar };
    Storage.saveProfile(profile);

    // Sync credentials email
    const creds = Storage.getCredentials();
    creds.email = email;
    Storage.saveCredentials(creds);

    // Update sidebar profile live
    const adminName = document.getElementById('admin-name');
    if (adminName) adminName.textContent = name;
    const adminRole = document.querySelector('.admin-user__role');
    if (adminRole) adminRole.textContent = role;
    const adminAvatar = document.getElementById('admin-avatar');
    if (adminAvatar) adminAvatar.textContent = avatar;

    showToast('Profile updated successfully!', 'success');
}

function handlePasswordUpdate(e) {
    e.preventDefault();

    const currentPass = document.getElementById('current-password').value;
    const newPass = document.getElementById('new-password').value;
    const confirmPass = document.getElementById('confirm-password').value;

    const creds = Storage.getCredentials();

    if (currentPass !== creds.password) {
        showToast('Current password is incorrect', 'error');
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

    creds.password = newPass;
    Storage.saveCredentials(creds);

    document.getElementById('password-form').reset();
    showToast('Password changed successfully!', 'success');
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
