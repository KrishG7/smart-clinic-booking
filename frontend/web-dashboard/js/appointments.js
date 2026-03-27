/**
 * Appointments Module
 * Handles appointment list display and management
 */

/**
 * Initialize appointments module
 */
function initAppointments() {
    // Set default date to today
    const dateInput = document.getElementById('appointmentDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
        dateInput.addEventListener('change', loadAppointments);
    }
}

/**
 * Load appointments for the selected date
 */
async function loadAppointments() {
    const tableBody = document.getElementById('appointmentsBody');
    const dateInput = document.getElementById('appointmentDate');
    const date = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];

    try {
        const doctorId = getDoctorId();
        const data = await apiRequest(`/appointments/doctor/${doctorId}?date=${date}`);

        if (data.success && data.appointments.length > 0) {
            tableBody.innerHTML = data.appointments.map(apt => `
        <tr>
          <td><strong>#${apt.token_no || '--'}</strong></td>
          <td>${apt.patient_name}</td>
          <td>${apt.patient_phone || '--'}</td>
          <td>${formatTime(apt.appointment_time)}</td>
          <td>${apt.type || 'regular'}</td>
          <td>${statusBadge(apt.status)}</td>
          <td>
            ${apt.status === 'booked' ?
                    `<button class="btn btn-primary btn-sm" onclick="updateAppointmentStatus(${apt.id}, 'checked_in')">Check In</button>` :
                    apt.status === 'checked_in' ?
                        `<button class="btn btn-primary btn-sm" onclick="updateAppointmentStatus(${apt.id}, 'in_progress')">Start</button>` :
                        apt.status === 'in_progress' ?
                            `<button class="btn btn-primary btn-sm" onclick="updateAppointmentStatus(${apt.id}, 'completed')">Complete</button>` :
                            '--'
                }
            ${['booked', 'checked_in'].includes(apt.status) ?
                    `<button class="btn btn-link" onclick="updateAppointmentStatus(${apt.id}, 'cancelled')">Cancel</button>` : ''
                }
          </td>
        </tr>
      `).join('');
        } else {
            tableBody.innerHTML = '<tr><td colspan="7" class="empty-state">No appointments for this date</td></tr>';
        }
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="7" class="empty-state">Failed to load appointments</td></tr>';
    }
}

/**
 * Update an appointment's status
 */
async function updateAppointmentStatus(id, status) {
    try {
        const data = await apiRequest(`/appointments/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });

        if (data.success) {
            showNotification(`Appointment ${status.replace('_', ' ')}`, 'success');
            loadAppointments();
        } else {
            showNotification(data.message || 'Update failed', 'error');
        }
    } catch (error) {
        showNotification('Failed to update appointment', 'error');
    }
}

/**
 * Format time string (HH:MM:SS → HH:MM AM/PM)
 */
function formatTime(timeStr) {
    if (!timeStr) return '--';
    const parts = String(timeStr).split(':');
    let hours = parseInt(parts[0]);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
}
