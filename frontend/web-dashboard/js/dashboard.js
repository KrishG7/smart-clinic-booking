/**
 * Dashboard Module
 * Loads and displays dashboard statistics and current token info
 */

/**
 * Initialize dashboard data
 */
async function initDashboard() {
    await loadDashboardStats();
    await loadCurrentToken();

    // Set up event listeners
    document.getElementById('callNextBtn').addEventListener('click', handleCallNext);
    document.getElementById('emergencyBtn').addEventListener('click', showEmergencyModal);
    document.getElementById('skipBtn').addEventListener('click', handleSkip);
    document.getElementById('cancelEmergency').addEventListener('click', hideEmergencyModal);
    document.getElementById('confirmEmergency').addEventListener('click', handleEmergency);

    // Refresh every 30 seconds
    setInterval(async () => {
        await loadDashboardStats();
        await loadCurrentToken();
    }, 30000);
}

/**
 * Load today's statistics
 */
async function loadDashboardStats() {
    try {
        const doctorId = getDoctorId();
        const data = await apiRequest(`/tokens/stats/${doctorId}`);

        if (data.success) {
            const stats = data.stats;
            document.getElementById('totalPatients').textContent = stats.total || 0;
            document.getElementById('completedPatients').textContent = stats.completed || 0;
            document.getElementById('waitingPatients').textContent = stats.waiting || 0;
            document.getElementById('emergencyCount').textContent = stats.emergencies || 0;
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

/**
 * Load current serving token
 */
async function loadCurrentToken() {
    try {
        const doctorId = getDoctorId();
        const data = await apiRequest(`/tokens/queue/${doctorId}`);

        if (data.success && data.currentToken) {
            document.querySelector('.token-number-large').textContent = `#${data.currentToken.tokenNumber}`;
            document.querySelector('.token-patient').textContent = data.currentToken.patientName;
        } else {
            document.querySelector('.token-number-large').textContent = '--';
            document.querySelector('.token-patient').textContent = 'No patient currently';
        }
    } catch (error) {
        console.error('Failed to load current token:', error);
    }
}

/**
 * Handle "Call Next Patient" button
 */
async function handleCallNext() {
    try {
        const doctorId = getDoctorId();
        const data = await apiRequest('/tokens/next', {
            method: 'POST',
            body: JSON.stringify({ doctorId })
        });

        if (data.success && data.nextToken) {
            showNotification(`Now serving Token #${data.nextToken.tokenNumber} — ${data.nextToken.patientName}`, 'success');
            await loadDashboardStats();
            await loadCurrentToken();
        } else {
            showNotification(data.message || 'No more patients in queue', 'info');
        }
    } catch (error) {
        showNotification('Failed to call next patient', 'error');
    }
}

/**
 * Handle skip current token
 */
async function handleSkip() {
    try {
        const doctorId = getDoctorId();
        const queueData = await apiRequest(`/tokens/queue/${doctorId}`);

        if (queueData.success && queueData.currentToken) {
            // Find the active token's ID from the queue
            const activeToken = queueData.queue.find(t => t.status === 'in_progress');
            if (activeToken) {
                await apiRequest(`/tokens/${activeToken.id}/skip`, { method: 'POST' });
                showNotification('Token skipped', 'info');
                await loadDashboardStats();
                await loadCurrentToken();
            }
        } else {
            showNotification('No active token to skip', 'info');
        }
    } catch (error) {
        showNotification('Failed to skip token', 'error');
    }
}

/**
 * Show emergency modal
 */
function showEmergencyModal() {
    document.getElementById('emergencyModal').style.display = 'flex';
}

/**
 * Hide emergency modal
 */
function hideEmergencyModal() {
    document.getElementById('emergencyModal').style.display = 'none';
}

/**
 * Handle emergency token creation
 */
async function handleEmergency() {
    try {
        const patientId = document.getElementById('emergencyPatient').value;
        if (!patientId) {
            showNotification('Please enter a patient ID', 'error');
            return;
        }

        const doctorId = getDoctorId();
        const data = await apiRequest('/tokens/emergency', {
            method: 'POST',
            body: JSON.stringify({ doctorId, patientId: parseInt(patientId) })
        });

        if (data.success) {
            showNotification('🚨 Emergency token issued!', 'success');
            hideEmergencyModal();
            await loadDashboardStats();
            await loadCurrentToken();
        } else {
            showNotification(data.message || 'Failed to create emergency token', 'error');
        }
    } catch (error) {
        showNotification('Emergency token creation failed', 'error');
    }
}
