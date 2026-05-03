/**
 * Doctor Model
 * Handles all database operations for doctor records
 */

const { query } = require('../config/database');

class Doctor {
    /**
     * Create a new doctor profile
     */
    static async create(doctorData) {
        const {
            userId, specialization, qualification, clinicAddress, experienceYears,
            consultationFee, maxPatientsPerDay, availableDays,
            slotStartTime, slotEndTime, slotDurationMinutes
        } = doctorData;

        const result = await query(
            `INSERT INTO doctors (user_id, specialization, qualification, clinic_address, experience_years,
       consultation_fee, max_patients_per_day, available_days, slot_start_time,
       slot_end_time, slot_duration_minutes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, specialization, qualification, clinicAddress, experienceYears || 0,
                consultationFee || 0, maxPatientsPerDay || 30, availableDays || 'Mon,Tue,Wed,Thu,Fri',
                slotStartTime || '09:00:00', slotEndTime || '17:00:00', slotDurationMinutes || 15]
        );

        return { id: result.insertId, ...doctorData };
    }

    /**
     * Find doctor by ID
     */
    static async findById(id) {
        const results = await query(
            `SELECT d.*, u.name, u.phone, u.email
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       WHERE d.id = ?`,
            [id]
        );
        return results[0] || null;
    }

    /**
     * Find doctor by user ID
     */
    static async findByUserId(userId) {
        const results = await query(
            `SELECT d.*, u.name, u.phone, u.email
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       WHERE d.user_id = ?`,
            [userId]
        );
        return results[0] || null;
    }

    /**
     * Get all doctors with optional filters
     */
    static async findAll(filters = {}) {
        let sql = `SELECT d.*, u.name, u.phone, u.email
               FROM doctors d
               JOIN users u ON d.user_id = u.id
               WHERE d.is_available = TRUE AND u.is_active = TRUE`;
        const params = [];

        if (filters.specialization) {
            sql += ` AND d.specialization = ?`;
            params.push(filters.specialization);
        }

        sql += ` ORDER BY u.name ASC`;
        return await query(sql, params);
    }

    /**
     * Get all specializations
     */
    static async getSpecializations() {
        const results = await query(
            'SELECT DISTINCT specialization FROM doctors WHERE is_available = TRUE ORDER BY specialization'
        );
        return results.map(r => r.specialization);
    }

    /**
     * Update doctor profile
     */
    static async update(id, updateData) {
        const fieldMapping = {
            specialization: 'specialization',
            qualification: 'qualification',
            clinicAddress: 'clinic_address',
            experienceYears: 'experience_years',
            consultationFee: 'consultation_fee',
            maxPatientsPerDay: 'max_patients_per_day',
            availableDays: 'available_days',
            slotStartTime: 'slot_start_time',
            slotEndTime: 'slot_end_time',
            slotDurationMinutes: 'slot_duration_minutes',
            isAvailable: 'is_available'
        };

        const fields = [];
        const values = [];

        for (const [key, dbField] of Object.entries(fieldMapping)) {
            if (updateData[key] !== undefined) {
                fields.push(`${dbField} = ?`);
                values.push(updateData[key]);
            }
        }

        if (fields.length === 0) return null;

        values.push(id);
        await query(`UPDATE doctors SET ${fields.join(', ')} WHERE id = ?`, values);
        return Doctor.findById(id);
    }

    /**
     * Get available time slots for a doctor on a given date
     */
    static async getAvailableSlots(doctorId, date) {
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) return [];

        // Get booked appointments for this doctor on this date
        const booked = await query(
            `SELECT appointment_time FROM appointments
       WHERE doctor_id = ? AND appointment_date = ? AND status != 'cancelled'`,
            [doctorId, date]
        );

        const bookedTimes = booked.map(a => String(a.appointment_time));

        // Generate all possible slots
        const slots = [];
        const startMinutes = timeToMinutes(doctor.slot_start_time);
        const endMinutes = timeToMinutes(doctor.slot_end_time);
        const duration = doctor.slot_duration_minutes;

        for (let m = startMinutes; m < endMinutes; m += duration) {
            const timeStr = minutesToTime(m);
            let available = !bookedTimes.includes(timeStr);

            // If the requested date is today, ensure the slot is in the future
            if (available && date === new Date().toISOString().split('T')[0]) {
                const now = new Date();
                const nowMinutes = now.getHours() * 60 + now.getMinutes();
                if (m <= nowMinutes + 15) { // 15 min buffer
                    available = false;
                }
            }

            slots.push({
                time: timeStr,
                available: available
            });
        }

        return slots;
    }

    /**
     * Get today's patient count for a doctor
     */
    static async getTodayPatientCount(doctorId) {
        const result = await query(
            `SELECT COUNT(*) as count FROM appointments
       WHERE doctor_id = ? AND appointment_date = CURDATE() AND status != 'cancelled'`,
            [doctorId]
        );
        return result[0].count;
    }

    /**
     * Delete a doctor record
     */
    static async delete(id) {
        const result = await query('DELETE FROM doctors WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

// Helper: Convert TIME string to minutes
function timeToMinutes(timeStr) {
    const parts = String(timeStr).split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

// Helper: Convert minutes to TIME string
function minutesToTime(minutes) {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}:00`;
}

module.exports = Doctor;
