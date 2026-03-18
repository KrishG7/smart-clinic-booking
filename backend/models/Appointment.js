/**
 * Appointment Model
 * Handles booking, retrieval, and management of appointments
 * Supports offline booking with sync_status tracking
 */

const { query, transaction } = require('../config/database');

class Appointment {
    /**
     * Create a new appointment (supports offline booking via local_id)
     */
    static async create(appointmentData) {
        const {
            patientId, doctorId, appointmentDate, appointmentTime,
            type, reason, syncStatus, localId
        } = appointmentData;

        // Get next token number for the doctor on that date
        const tokenResult = await query(
            `SELECT COALESCE(MAX(token_no), 0) + 1 as nextToken
       FROM appointments
       WHERE doctor_id = ? AND appointment_date = ?`,
            [doctorId, appointmentDate]
        );
        const tokenNo = tokenResult[0].nextToken;

        const result = await query(
            `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time,
       token_no, type, reason, sync_status, local_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [patientId, doctorId, appointmentDate, appointmentTime,
                tokenNo, type || 'regular', reason, syncStatus || 'synced', localId]
        );

        return {
            id: result.insertId,
            tokenNo,
            ...appointmentData
        };
    }

    /**
     * Find appointment by ID
     */
    static async findById(id) {
        const results = await query(
            `SELECT a.*,
              p_user.name as patient_name, p_user.phone as patient_phone,
              d_user.name as doctor_name, d.specialization
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN users p_user ON p.user_id = p_user.id
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users d_user ON d.user_id = d_user.id
       WHERE a.id = ?`,
            [id]
        );
        return results[0] || null;
    }

    /**
     * Find appointment by local_id (for sync purposes)
     */
    static async findByLocalId(localId) {
        const results = await query(
            'SELECT * FROM appointments WHERE local_id = ?',
            [localId]
        );
        return results[0] || null;
    }

    /**
     * Get appointments for a patient
     */
    static async findByPatient(patientId, status = null) {
        let sql = `SELECT a.*,
                      d_user.name as doctor_name, d.specialization
               FROM appointments a
               JOIN doctors d ON a.doctor_id = d.id
               JOIN users d_user ON d.user_id = d_user.id
               WHERE a.patient_id = ?`;
        const params = [patientId];

        if (status) {
            sql += ` AND a.status = ?`;
            params.push(status);
        }

        sql += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC`;
        return await query(sql, params);
    }

    /**
     * Get appointments for a doctor on a specific date
     */
    static async findByDoctor(doctorId, date = null) {
        let sql = `SELECT a.*,
                      p_user.name as patient_name, p_user.phone as patient_phone
               FROM appointments a
               JOIN patients p ON a.patient_id = p.id
               JOIN users p_user ON p.user_id = p_user.id
               WHERE a.doctor_id = ?`;
        const params = [doctorId];

        if (date) {
            sql += ` AND a.appointment_date = ?`;
            params.push(date);
        }

        sql += ` ORDER BY a.token_no ASC`;
        return await query(sql, params);
    }

    /**
     * Update appointment status
     */
    static async updateStatus(id, status, notes = null) {
        let sql = 'UPDATE appointments SET status = ?';
        const params = [status];

        if (notes) {
            sql += ', notes = ?';
            params.push(notes);
        }

        sql += ' WHERE id = ?';
        params.push(id);

        await query(sql, params);
        return Appointment.findById(id);
    }

    /**
     * Update sync status
     */
    static async updateSyncStatus(id, syncStatus) {
        await query(
            'UPDATE appointments SET sync_status = ? WHERE id = ?',
            [syncStatus, id]
        );
    }

    /**
     * Get pending sync records
     */
    static async getPendingSync() {
        return await query(
            `SELECT * FROM appointments WHERE sync_status = 'pending' ORDER BY created_at ASC`
        );
    }

    /**
     * Cancel an appointment
     */
    static async cancel(id) {
        return Appointment.updateStatus(id, 'cancelled');
    }

    /**
     * Get today's appointment stats for a doctor
     */
    static async getTodayStats(doctorId) {
        const results = await query(
            `SELECT
         COUNT(*) as total,
         SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
         SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END) as pending,
         SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
         SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
       FROM appointments
       WHERE doctor_id = ? AND appointment_date = CURDATE()`,
            [doctorId]
        );
        return results[0];
    }

    /**
     * Delete an appointment
     */
    static async delete(id) {
        const result = await query('DELETE FROM appointments WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Appointment;
