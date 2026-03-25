/**
 * App Module
 * Core application initialization, navigation, and API utilities
 */

const API_BASE = 'http://localhost:3000/api';

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }

    // Set user info in sidebar
    document.getElementById('userName').textContent = user.name || 'User';
    document.getElementById('userRole').textContent = user.role || 'staff';

    // Set current date
    const now = new Date();
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    // Initialize navigation
    initNavigation();

    // Initialize dashboard
    if (typeof initDashboard === 'function') initDashboard();
    if (typeof initAppointments === 'function') initAppointments();

    // Logout handler
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Mobile menu toggle
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
});

/**
 * Initialize sidebar navigation
 */
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;

            // Update active nav
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            // Show corresponding section
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            const targetSection = document.getElementById(`section-${section}`);
            if (targetSection) targetSection.classList.add('active');

            // Update page title
            document.getElementById('pageTitle').textContent =
                item.querySelector('.nav-text').textContent;

            // Close mobile menu
            document.getElementById('sidebar').classList.remove('open');

            // Load section data
            if (section === 'queue' && typeof loadQueue === 'function') loadQueue();
            if (section === 'appointments' && typeof loadAppointments === 'function') loadAppointments();
            if (section === 'prescriptions' && typeof loadPrescriptionData === 'function') loadPrescriptionData();
        });
    });
}

/**
 * Make an authenticated API request
 */
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: { ...defaultOptions.headers, ...options.headers }
    });

    if (response.status === 401) {
        logout();
        throw new Error('Session expired');
    }

    return await response.json();
}

/**
 * Show a notification toast
 */
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.alert');
    if (existing) existing.remove();

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    document.body.appendChild(alert);

    setTimeout(() => alert.remove(), 4000);
}

/**
 * Logout user
 */
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

/**
 * Get the current doctor's ID
 */
function getDoctorId() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // For demo, return doctor ID 1 if role is doctor
    return 1; // Simplified for demo
}

/**
 * Format a status to a badge HTML
 */
function statusBadge(status) {
    return `<span class="badge badge-${status}">${status.replace('_', ' ')}</span>`;
}
