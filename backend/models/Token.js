/**
 * Token Model
 * Manages live queue tokens for doctors
 * Supports queue progression, emergency interrupts, and wait time estimation
 */

const { query, transaction } = require('../config/database');

class Token {
    /**
     * Issue a new token for a patient
     */
    static async create(tokenData) {
        const { appointmentId, doctorId, patientId, type } = tokenData;

        // Get next token number for the doctor today
        const tokenResult = await query(
            `SELECT COALESCE(MAX(token_number), 0) + 1 as nextNumber
       FROM tokens
       WHERE doctor_id = ? AND token_date = CURDATE()`,
            [doctorId]
        );
        const tokenNumber = tokenResult[0].nextNumber;

        // Calculate queue position
        const positionResult = await query(
            `SELECT COUNT(*) + 1 as position
       FROM tokens
       WHERE doctor_id = ? AND token_date = CURDATE()
       AND status IN ('waiting', 'in_progress')`,
            [doctorId]
        );
        const queuePosition = positionResult[0].position;

        // Estimate wait time (based on average consultation time of 15 mins)
        const estimatedWait = (queuePosition - 1) * 15;

        const result = await query(
            `INSERT INTO tokens (appointment_id, doctor_id, patient_id, token_number,
       token_date, type, estimated_wait_minutes, queue_position)
       VALUES (?, ?, ?, ?, CURDATE(), ?, ?, ?)`,
            [appointmentId, doctorId, patientId, tokenNumber,
                type || 'regular', estimatedWait, queuePosition]
        );

        return {
            id: result.insertId,
            tokenNumber,
            queuePosition,
            estimatedWait,
            ...tokenData
        };
    }

    /**
     * Find token by ID
     */
    static async findById(id) {
        const results = await query(
            `SELECT t.*,
              p_user.name as patient_name, p_user.phone as patient_phone,
              d_user.name as doctor_name
       FROM tokens t
       JOIN patients p ON t.patient_id = p.id
       JOIN users p_user ON p.user_id = p_user.id
       JOIN doctors d ON t.doctor_id = d.id
       JOIN users d_user ON d.user_id = d_user.id
       WHERE t.id = ?`,
            [id]
        );
        return results[0] || null;
    }

    /**
     * Get current queue for a doctor (today's waiting/in-progress tokens)
     */
    static async getQueue(doctorId) {
        return await query(
            `SELECT t.*,
              p_user.name as patient_name, p_user.phone as patient_phone
       FROM tokens t
       JOIN patients p ON t.patient_id = p.id
       JOIN users p_user ON p.user_id = p_user.id
       WHERE t.doctor_id = ? AND t.token_date = CURDATE()
       AND t.status IN ('waiting', 'in_progress', 'emergency')
       ORDER BY
         CASE WHEN t.type = 'emergency' THEN 0 ELSE 1 END,
         t.queue_position ASC`,
            [doctorId]
        );
    }

    /**
     * Get currently active token for a doctor
     */
    static async getCurrentToken(doctorId) {
        const results = await query(
            `SELECT t.*, p_user.name as patient_name
       FROM tokens t
       JOIN patients p ON t.patient_id = p.id
       JOIN users p_user ON p.user_id = p_user.id
       WHERE t.doctor_id = ? AND t.token_date = CURDATE()
       AND t.status = 'in_progress'
       LIMIT 1`,
            [doctorId]
        );
        return results[0] || null;
    }

    /**
     * Call next token in queue (UC-03: Call Next Token)
     */
    static async callNext(doctorId) {
        return await transaction(async (connection) => {
            // Complete current in-progress token
            await connection.execute(
                `UPDATE tokens SET status = 'completed', end_time = NOW()
         WHERE doctor_id = ? AND token_date = CURDATE() AND status = 'in_progress'`,
                [doctorId]
            );

            // Get next waiting token (emergency first)
            const [nextTokens] = await connection.execute(
                `SELECT id FROM tokens
         WHERE doctor_id = ? AND token_date = CURDATE() AND status IN ('waiting', 'emergency')
         ORDER BY
           CASE WHEN type = 'emergency' THEN 0 ELSE 1 END,
           queue_position ASC
         LIMIT 1`,
                [doctorId]
            );

            if (nextTokens.length === 0) return null;

            // Update next token to in_progress
            await connection.execute(
                `UPDATE tokens SET status = 'in_progress', start_time = NOW()
         WHERE id = ?`,
                [nextTokens[0].id]
            );

            // Recalculate wait times for remaining tokens
            const [remaining] = await connection.execute(
                `SELECT id FROM tokens
         WHERE doctor_id = ? AND token_date = CURDATE() AND status = 'waiting'
         ORDER BY queue_position ASC`,
                [doctorId]
            );

            for (let i = 0; i < remaining.length; i++) {
                await connection.execute(
                    `UPDATE tokens SET queue_position = ?, estimated_wait_minutes = ?
           WHERE id = ?`,
                    [i + 1, (i + 1) * 15, remaining[i].id]
                );
            }

            // Return the newly active token
            const [activeToken] = await connection.execute(
                `SELECT t.*, p_user.name as patient_name, p_user.phone as patient_phone
         FROM tokens t
         JOIN patients p ON t.patient_id = p.id
         JOIN users p_user ON p.user_id = p_user.id
         WHERE t.id = ?`,
                [nextTokens[0].id]
            );

            return activeToken[0] || null;
        });
    }

    /**
     * Emergency interrupt (UC-04: Emergency Interrupt)
     * Insert emergency token at the top of the queue
     */
    static async emergencyInterrupt(doctorId, patientId, appointmentId = null) {
        return await transaction(async (connection) => {
            // Get next token number
            const [tokenResult] = await connection.execute(
                `SELECT COALESCE(MAX(token_number), 0) + 1 as nextNumber
         FROM tokens WHERE doctor_id = ? AND token_date = CURDATE()`,
                [doctorId]
            );
            const tokenNumber = tokenResult[0].nextNumber;

            // Insert emergency token at position 0
            const [result] = await connection.execute(
                `INSERT INTO tokens (appointment_id, doctor_id, patient_id, token_number,
         token_date, status, type, estimated_wait_minutes, queue_position)
         VALUES (?, ?, ?, ?, CURDATE(), 'emergency', 'emergency', 0, 0)`,
                [appointmentId, doctorId, patientId, tokenNumber]
            );

            // Shift all waiting tokens' positions by 1
            await connection.execute(
                `UPDATE tokens SET queue_position = queue_position + 1,
         estimated_wait_minutes = estimated_wait_minutes + 15
         WHERE doctor_id = ? AND token_date = CURDATE()
         AND status = 'waiting' AND id != ?`,
                [doctorId, result.insertId]
            );

            return Token.findById(result.insertId);
        });
    }

    /**
     * Check in a patient (UC-05: Patient Check-In)
     */
    static async checkIn(tokenId) {
        await query(
            `UPDATE tokens SET check_in_time = NOW() WHERE id = ?`,
            [tokenId]
        );
        return Token.findById(tokenId);
    }

    /**
     * Skip a token
     */
    static async skip(tokenId) {
        await query(
            `UPDATE tokens SET status = 'skipped' WHERE id = ?`,
            [tokenId]
        );
        return Token.findById(tokenId);
    }

    /**
     * Get today's token stats for a doctor
     */
    static async getTodayStats(doctorId) {
        const results = await query(
            `SELECT
         COUNT(*) as total,
         SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
         SUM(CASE WHEN status = 'waiting' THEN 1 ELSE 0 END) as waiting,
         SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
         SUM(CASE WHEN status = 'skipped' THEN 1 ELSE 0 END) as skipped,
         SUM(CASE WHEN type = 'emergency' THEN 1 ELSE 0 END) as emergencies
       FROM tokens
       WHERE doctor_id = ? AND token_date = CURDATE()`,
            [doctorId]
        );
        return results[0];
    }

    /**
     * Get token by patient for today
     */
    static async findByPatientToday(patientId) {
        return await query(
            `SELECT t.*, d_user.name as doctor_name, d.specialization
       FROM tokens t
       JOIN doctors d ON t.doctor_id = d.id
       JOIN users d_user ON d.user_id = d_user.id
       WHERE t.patient_id = ? AND t.token_date = CURDATE()
       ORDER BY t.created_at DESC`,
            [patientId]
        );
    }
}

module.exports = Token;
