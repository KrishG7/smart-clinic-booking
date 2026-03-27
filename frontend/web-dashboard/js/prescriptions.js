/**
 * Prescriptions Module (UC-06)
 * Handles digital prescription creation and management
 */

/**
 * Load prescription form data (patients and appointments)
 */
async function loadPrescriptionData() {
    try {
        const doctorId = getDoctorId();
        const date = new Date().toISOString().split('T')[0];

        // Load today's appointments to populate patient dropdown
        const data = await apiRequest(`/appointments/doctor/${doctorId}?date=${date}`);

        if (data.success) {
            const patientSelect = document.getElementById('prescPatient');
            const appointmentSelect = document.getElementById('prescAppointment');

            // Populate unique patients
            const uniquePatients = new Map();
            data.appointments.forEach(apt => {
                if (!uniquePatients.has(apt.patient_id)) {
                    uniquePatients.set(apt.patient_id, apt.patient_name);
                }
            });

            patientSelect.innerHTML = '<option value="">Select patient...</option>';
            uniquePatients.forEach((name, id) => {
                patientSelect.innerHTML += `<option value="${id}">${name}</option>`;
            });

            // Populate appointments
            appointmentSelect.innerHTML = '<option value="">Select appointment...</option>';
            data.appointments.forEach(apt => {
                appointmentSelect.innerHTML += `<option value="${apt.id}">${apt.patient_name} — ${formatTime(apt.appointment_time)}</option>`;
            });
        }
    } catch (error) {
        console.error('Failed to load prescription data:', error);
    }
}

// Initialize prescription form
document.addEventListener('DOMContentLoaded', () => {
    const prescForm = document.getElementById('prescriptionForm');
    const addMedBtn = document.getElementById('addMedBtn');

    // Add medication row
    if (addMedBtn) {
        addMedBtn.addEventListener('click', () => {
            const medList = document.getElementById('medicationsList');
            const row = document.createElement('div');
            row.className = 'medication-row';
            row.innerHTML = `
        <input type="text" placeholder="Medicine name" class="med-name">
        <input type="text" placeholder="Dosage" class="med-dosage">
        <input type="text" placeholder="Duration" class="med-duration">
      `;
            medList.appendChild(row);
        });
    }

    // Submit prescription
    if (prescForm) {
        prescForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await submitPrescription();
        });
    }
});

/**
 * Submit a new prescription (UC-06: Issue Prescription)
 */
async function submitPrescription() {
    try {
        const patientId = document.getElementById('prescPatient').value;
        const appointmentId = document.getElementById('prescAppointment').value;
        const diagnosis = document.getElementById('diagnosis').value;
        const instructions = document.getElementById('instructions').value;
        const followUpDate = document.getElementById('followUpDate').value;

        // Collect medications
        const medRows = document.querySelectorAll('.medication-row');
        const medications = [];
        medRows.forEach(row => {
            const name = row.querySelector('.med-name').value;
            const dosage = row.querySelector('.med-dosage').value;
            const duration = row.querySelector('.med-duration').value;
            if (name) {
                medications.push({ name, dosage, duration });
            }
        });

        if (!patientId || !appointmentId) {
            showNotification('Please select a patient and appointment', 'error');
            return;
        }

        // For now, use a direct database insert via a custom endpoint
        // In production, this would be a dedicated prescription API
        const data = await apiRequest('/appointments/' + appointmentId + '/status', {
            method: 'PATCH',
            body: JSON.stringify({
                status: 'completed',
                notes: JSON.stringify({
                    diagnosis,
                    medications,
                    instructions,
                    followUpDate,
                    prescribedAt: new Date().toISOString()
                })
            })
        });

        if (data.success) {
            showNotification('💊 Prescription issued successfully!', 'success');
            document.getElementById('prescriptionForm').reset();
        } else {
            showNotification(data.message || 'Failed to issue prescription', 'error');
        }
    } catch (error) {
        showNotification('Failed to submit prescription', 'error');
    }
}
