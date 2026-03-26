/**
 * Queue Module
 * Handles live token queue display and management
 */

/**
 * Load and display the current queue
 */
async function loadQueue() {
    const queueList = document.getElementById('queueList');

    try {
        const doctorId = getDoctorId();
        const data = await apiRequest(`/tokens/queue/${doctorId}`);

        if (data.success && data.queue.length > 0) {
            queueList.innerHTML = data.queue.map(token => `
        <div class="queue-item ${token.type === 'emergency' ? 'emergency' : ''} ${token.status === 'in_progress' ? 'active' : ''}">
          <div class="queue-token-num">#${token.tokenNumber}</div>
          <div class="queue-patient-info">
            <div class="queue-patient-name">${token.patientName}</div>
            <div class="queue-patient-phone">${token.patientPhone || ''}</div>
          </div>
          <div>
            ${statusBadge(token.status)}
            ${token.type === 'emergency' ? '<span class="badge badge-emergency">EMERGENCY</span>' : ''}
          </div>
          <div class="queue-wait">
            ${token.status === 'waiting' ? `~${token.estimatedWait} min` : ''}
            ${token.checkInTime ? '✅ Checked In' : ''}
          </div>
        </div>
      `).join('');
        } else {
            queueList.innerHTML = '<p class="empty-state">No patients in queue</p>';
        }
    } catch (error) {
        queueList.innerHTML = '<p class="empty-state">Failed to load queue. Check server connection.</p>';
    }
}

// Refresh queue button
document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('refreshQueueBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadQueue();
            showNotification('Queue refreshed', 'info');
        });
    }
});
