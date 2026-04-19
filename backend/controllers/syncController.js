/**
 * Sync Controller
 * Handles background data synchronization between local SQLite and cloud MySQL
 * Implements UC-02: Background Data Synchronization
 */

const Appointment = require('../models/Appointment');
const { query, transaction } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');
const { SYNC_STATUS } = require('../config/auth');

/**
 * Push local data to server (UC-02: Background Sync)
 * POST /api/sync/push
 * Receives an array of locally created/modified records
 */
async function pushSync(req, res) {
    try {
        const { appointments = [], deviceId } = req.body;
        const results = { synced: [], conflicts: [], errors: [] };

        // SECURITY FIX #10: Derive the patientId from JWT — never trust the client-supplied value.
        const patientRows = await query('SELECT id FROM patients WHERE user_id = ?', [req.user.id]);
        if (patientRows.length === 0) {
            return errorResponse(res, 'Patient profile not found for this user', 404);
        }
        const serverPatientId = patientRows[0].id;

        for (const localAppointment of appointments) {
            try {
                // Check if record already exists (by local_id)
                const existing = await Appointment.findByLocalId(localAppointment.localId);

                if (existing) {
                    // Ownership guard: reject if this sync record doesn't belong to the caller
                    if (existing.patient_id !== serverPatientId) {
                        results.errors.push({
                            localId: localAppointment.localId,
                            error: 'Ownership mismatch: appointment does not belong to this user'
                        });
                        continue;
                    }

                    // Conflict resolution: Last Write Wins
                    if (new Date(localAppointment.updatedAt) > new Date(existing.updated_at)) {
                        // Local record is newer — update server
                        await Appointment.updateStatus(existing.id, localAppointment.status);
                        await Appointment.updateSyncStatus(existing.id, SYNC_STATUS.SYNCED);
                        results.synced.push({
                            localId: localAppointment.localId,
                            serverId: existing.id,
                            action: 'updated'
                        });
                    } else {
                        // Server record is newer — flag conflict
                        results.conflicts.push({
                            localId: localAppointment.localId,
                            serverId: existing.id,
                            serverData: existing,
                            action: 'conflict'
                        });
                    }
                } else {
                    // New record — insert with server-verified patientId (ignore client value)
                    const newAppointment = await Appointment.create({
                        patientId: serverPatientId,
                        doctorId: localAppointment.doctorId,
                        appointmentDate: localAppointment.appointmentDate,
                        appointmentTime: localAppointment.appointmentTime,
                        type: localAppointment.type,
                        reason: localAppointment.reason,
                        syncStatus: SYNC_STATUS.SYNCED,
                        localId: localAppointment.localId
                    });

                    results.synced.push({
                        localId: localAppointment.localId,
                        serverId: newAppointment.id,
                        tokenNo: newAppointment.tokenNo,
                        action: 'created'
                    });
                }

                // Log sync operation
                await query(
                    `INSERT INTO sync_log (device_id, table_name, record_id, operation, sync_status)
           VALUES (?, 'appointments', ?, 'insert', 'synced')`,
                    [deviceId, parseInt(localAppointment.localId) || 0]
                );

            } catch (err) {
                results.errors.push({
                    localId: localAppointment.localId,
                    error: err.message
                });
            }
        }

        successResponse(res, {
            message: 'Sync completed',
            summary: {
                total: appointments.length,
                synced: results.synced.length,
                conflicts: results.conflicts.length,
                errors: results.errors.length
            },
            results
        });
    } catch (error) {
        console.error('Push sync error:', error);
        errorResponse(res, 'Sync failed: ' + error.message);
    }
}

/**
 * Pull server data to local device
 * GET /api/sync/pull?since=2025-03-15T00:00:00
 */
async function pullSync(req, res) {
    try {
        const { since } = req.query;

        // Get patient's appointments modified after 'since' timestamp
        let sql = `SELECT a.*, t.token_number, t.status as token_status,
                      t.queue_position, t.estimated_wait_minutes
               FROM appointments a
               LEFT JOIN tokens t ON t.appointment_id = a.id
               WHERE a.patient_id IN (SELECT id FROM patients WHERE user_id = ?)`;
        const params = [req.user.id];

        if (since) {
            sql += ` AND a.updated_at > ?`;
            params.push(since);
        }

        sql += ` ORDER BY a.updated_at DESC`;

        const appointments = await query(sql, params);

        // Get prescriptions
        let prescSql = `SELECT * FROM prescriptions
                    WHERE patient_id IN (SELECT id FROM patients WHERE user_id = ?)`;
        const prescParams = [req.user.id];

        if (since) {
            prescSql += ` AND created_at > ?`;
            prescParams.push(since);
        }

        const prescriptions = await query(prescSql, prescParams);

        successResponse(res, {
            message: 'Pull sync completed',
            timestamp: new Date().toISOString(),
            data: {
                appointments,
                prescriptions
            }
        });
    } catch (error) {
        errorResponse(res, 'Pull sync failed: ' + error.message);
    }
}

/**
 * Get sync status/history
 * GET /api/sync/status
 */
async function getSyncStatus(req, res) {
    try {
        // SECURITY FIX #6: Scope sync logs to the requesting user's own device/appointments.
        // Admins may see all logs; regular users see only their own records.
        let logs;
        let pendingCount;

        if (req.user.role === 'admin') {
            logs = await query(
                `SELECT * FROM sync_log ORDER BY created_at DESC LIMIT 50`
            );
            const pendingRows = await query(
                `SELECT COUNT(*) as count FROM appointments WHERE sync_status = 'pending'`
            );
            pendingCount = pendingRows[0].count;
        } else {
            // For patients, scope to their own appointments
            const patientRows = await query('SELECT id FROM patients WHERE user_id = ?', [req.user.id]);
            const patientId = patientRows[0]?.id;

            logs = await query(
                `SELECT sl.* FROM sync_log sl
                 INNER JOIN appointments a ON sl.record_id = a.id AND sl.table_name = 'appointments'
                 WHERE a.patient_id = ?
                 ORDER BY sl.created_at DESC
                 LIMIT 50`,
                [patientId]
            );
            const pendingRows = await query(
                `SELECT COUNT(*) as count FROM appointments
                 WHERE sync_status = 'pending' AND patient_id = ?`,
                [patientId]
            );
            pendingCount = pendingRows[0]?.count ?? 0;
        }

        successResponse(res, {
            pendingRecords: pendingCount,
            recentLogs: logs
        });
    } catch (error) {
        errorResponse(res, 'Failed to get sync status: ' + error.message);
    }
}

module.exports = { pushSync, pullSync, getSyncStatus };
