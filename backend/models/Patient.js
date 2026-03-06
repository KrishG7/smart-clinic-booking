/**
 * Patient Model
 * Handles all database operations for patient records
 */

const { query, transaction } = require('../config/database');

class Patient {
    /**
     * Create a new patient profile
     */
    static async create(patientData) {
        const { userId, dateOfBirth, gender, bloodGroup, address, emergencyContact, medicalHistory } = patientData;

        const result = await query(
            `INSERT INTO patients (user_id, date_of_birth, gender, blood_group, address, emergency_contact, medical_history)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, dateOfBirth, gender, bloodGroup, address, emergencyContact, medicalHistory]
        );

        return { id: result.insertId, ...patientData };
    }

    /**
     * Find patient by ID
     */
    static async findById(id) {
        const results = await query(
            `SELECT p.*, u.name, u.phone, u.email
       FROM patients p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
            [id]
        );
        return results[0] || null;
    }

    /**
     * Find patient by user ID
     */
    static async findByUserId(userId) {
        const results = await query(
            `SELECT p.*, u.name, u.phone, u.email
       FROM patients p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = ?`,
            [userId]
        );
        return results[0] || null;
    }

    /**
     * Get all patients with optional pagination
     */
    static async findAll(page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const results = await query(
            `SELECT p.*, u.name, u.phone, u.email
       FROM patients p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        const countResult = await query('SELECT COUNT(*) as total FROM patients');
        return {
            patients: results,
            total: countResult[0].total,
            page,
            totalPages: Math.ceil(countResult[0].total / limit)
        };
    }

    /**
     * Update patient profile
     */
    static async update(id, updateData) {
        const fields = [];
        const values = [];

        const allowedFields = ['date_of_birth', 'gender', 'blood_group', 'address', 'emergency_contact', 'medical_history'];

        // Map camelCase to snake_case
        const fieldMapping = {
            dateOfBirth: 'date_of_birth',
            gender: 'gender',
            bloodGroup: 'blood_group',
            address: 'address',
            emergencyContact: 'emergency_contact',
            medicalHistory: 'medical_history'
        };

        for (const [key, dbField] of Object.entries(fieldMapping)) {
            if (updateData[key] !== undefined) {
                fields.push(`${dbField} = ?`);
                values.push(updateData[key]);
            }
        }

        if (fields.length === 0) return null;

        values.push(id);
        await query(
            `UPDATE patients SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return Patient.findById(id);
    }

    /**
     * Delete a patient record
     */
    static async delete(id) {
        const result = await query('DELETE FROM patients WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    /**
     * Search patients by name or phone
     */
    static async search(searchTerm) {
        const results = await query(
            `SELECT p.*, u.name, u.phone, u.email
       FROM patients p
       JOIN users u ON p.user_id = u.id
       WHERE u.name LIKE ? OR u.phone LIKE ?
       LIMIT 20`,
            [`%${searchTerm}%`, `%${searchTerm}%`]
        );
        return results;
    }
}

module.exports = Patient;
