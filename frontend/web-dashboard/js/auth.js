/**
 * Auth Module
 * Handles login, OTP verification, and session management
 */

const API_BASE = 'http://localhost:3000/api';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const otpForm = document.getElementById('otpForm');
const toggleOTPBtn = document.getElementById('toggleOTP');
const alertEl = document.getElementById('alertMessage');

let isOTPMode = false;
let otpSent = false;

// Toggle between password and OTP login
if (toggleOTPBtn) {
    toggleOTPBtn.addEventListener('click', () => {
        isOTPMode = !isOTPMode;
        loginForm.style.display = isOTPMode ? 'none' : 'block';
        otpForm.style.display = isOTPMode ? 'block' : 'none';
        toggleOTPBtn.textContent = isOTPMode ? 'Use Password Login' : 'Use OTP Login';
    });
}

// Password Login
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;

        try {
            showLoading(true);
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password })
            });

            const data = await response.json();

            if (data.success) {
                // Save token and user data
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                showAlert('Login successful! Redirecting...', 'success');
                setTimeout(() => window.location.href = 'index.html', 1000);
            } else {
                showAlert(data.message || 'Login failed', 'error');
            }
        } catch (error) {
            showAlert('Connection error. Is the server running?', 'error');
        } finally {
            showLoading(false);
        }
    });
}

// OTP Login
if (otpForm) {
    otpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const phone = document.getElementById('otpPhone').value;

        if (!otpSent) {
            // Send OTP
            try {
                const response = await fetch(`${API_BASE}/auth/send-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone, purpose: 'login' })
                });

                const data = await response.json();

                if (data.success) {
                    otpSent = true;
                    document.querySelector('.otp-input-group').style.display = 'block';
                    document.getElementById('otpBtn').textContent = 'Verify OTP';
                    showAlert('OTP sent! For demo, use: 123456', 'success');
                } else {
                    showAlert(data.message || 'Failed to send OTP', 'error');
                }
            } catch (error) {
                showAlert('Connection error', 'error');
            }
        } else {
            // Verify OTP
            const otp = document.getElementById('otpCode').value;
            try {
                const response = await fetch(`${API_BASE}/auth/verify-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone, otp })
                });

                const data = await response.json();

                if (data.success) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    showAlert('Login successful!', 'success');
                    setTimeout(() => window.location.href = 'index.html', 1000);
                } else {
                    showAlert(data.message || 'Invalid OTP', 'error');
                }
            } catch (error) {
                showAlert('Connection error', 'error');
            }
        }
    });
}

// Helper: Show alert message
function showAlert(message, type = 'info') {
    if (!alertEl) return;
    alertEl.textContent = message;
    alertEl.className = `alert alert-${type}`;
    alertEl.style.display = 'block';
    setTimeout(() => { alertEl.style.display = 'none'; }, 4000);
}

// Helper: Toggle loading state
function showLoading(loading) {
    const btn = document.getElementById('loginBtn');
    if (!btn) return;
    btn.querySelector('.btn-text').style.display = loading ? 'none' : 'inline';
    btn.querySelector('.btn-loader').style.display = loading ? 'inline' : 'none';
    btn.disabled = loading;
}
