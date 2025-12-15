// Settings Modal Functions

function openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const emailEl = document.getElementById('settings-email');
    
    // Set current user email
    if (auth.currentUser) {
        emailEl.textContent = auth.currentUser.email;
    }
    
    // Clear previous messages
    document.getElementById('password-error').textContent = '';
    document.getElementById('password-success').textContent = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    
    modal.classList.remove('hidden');
}

function closeSettingsModal() {
    document.getElementById('settings-modal').classList.add('hidden');
}

async function changePassword() {
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorEl = document.getElementById('password-error');
    const successEl = document.getElementById('password-success');
    
    // Clear previous messages
    errorEl.textContent = '';
    successEl.textContent = '';
    
    // Validation
    if (!newPassword || !confirmPassword) {
        errorEl.textContent = 'Please fill in both password fields';
        return;
    }
    
    if (newPassword !== confirmPassword) {
        errorEl.textContent = 'Passwords do not match';
        return;
    }
    
    if (newPassword.length < 6) {
        errorEl.textContent = 'Password must be at least 6 characters';
        return;
    }
    
    try {
        await auth.currentUser.updatePassword(newPassword);
        successEl.textContent = 'Password updated successfully!';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
    } catch (error) {
        console.error('Password update error:', error);
        if (error.code === 'auth/requires-recent-login') {
            errorEl.textContent = 'Please log out and log back in, then try again';
        } else {
            errorEl.textContent = error.message || 'Failed to update password';
        }
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('settings-modal');
    if (e.target === modal) {
        closeSettingsModal();
    }
});
