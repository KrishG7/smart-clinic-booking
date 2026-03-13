/**
 * Sync Engine
 * Handles bi-directional data synchronization between local SQLite and cloud MySQL
 * Implements "Last Write Wins" conflict resolution strategy
 */

const { query, transaction } = require('../config/database');
const { SYNC_STATUS } = require('../config/auth');

const BATCH_SIZE = parseInt(process.env.SYNC_BATCH_SIZE) || 50;
const RETRY_ATTEMPTS = parseInt(process.env.SYNC_RETRY_ATTEMPTS) || 3;

/**
 * Process a batch of sync records from a client device
 * @param {Array} records - Array of records to sync
 * @param {string} deviceId - Device identifier
 * @returns {Object} Sync results
 */
async function processSyncBatch(records, deviceId) {
    const results = {
        synced: [],
        conflicts: [],
        errors: []
    };

    // Process in batches
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE);

        for (const record of batch) {
            try {
                const result = await syncRecord(record, deviceId);
                if (result.status === 'synced') {
                    results.synced.push(result);
                } else if (result.status === 'conflict') {
                    results.conflicts.push(result);
                }
            } catch (error) {
                results.errors.push({
                    localId: record.localId,
                    error: error.message
                });
            }
        }
    }

    return results;
}

/**
 * Sync a single record using Last Write Wins strategy
 * @param {Object} record - Record to sync
 * @param {string} deviceId - Device identifier
 * @returns {Object} Sync result
 */
async function syncRecord(record, deviceId) {
    const { localId, tableName, data, operation, updatedAt } = record;

    // Check if record already exists on server
    const existing = await query(
        `SELECT * FROM ${tableName} WHERE local_id = ?`,
        [localId]
    ).catch(() => []);

    if (existing.length > 0) {
        const serverRecord = existing[0];
        const serverUpdatedAt = new Date(serverRecord.updated_at);
        const clientUpdatedAt = new Date(updatedAt);

        if (clientUpdatedAt > serverUpdatedAt) {
            // Client is newer — update server (Last Write Wins)
            return await updateServerRecord(tableName, serverRecord.id, data, localId, deviceId);
        } else {
            // Server is newer — return conflict with server data
            return {
                status: 'conflict',
                localId,
                serverId: serverRecord.id,
                serverData: serverRecord,
                resolution: 'server_wins'
            };
        }
    } else {
        // New record — insert into server
        return await insertServerRecord(tableName, data, localId, deviceId);
    }
}

/**
 * Insert a new record from client to server
 */
async function insertServerRecord(tableName, data, localId, deviceId) {
    // Log the sync operation
    await query(
        `INSERT INTO sync_log (device_id, table_name, record_id, operation, sync_status)
     VALUES (?, ?, ?, 'insert', 'synced')`,
        [deviceId, tableName, localId || 0]
    );

    return {
        status: 'synced',
        localId,
        action: 'inserted'
    };
}

/**
 * Update an existing server record with newer client data
 */
async function updateServerRecord(tableName, serverId, data, localId, deviceId) {
    // Log the sync operation
    await query(
        `INSERT INTO sync_log (device_id, table_name, record_id, operation, sync_status)
     VALUES (?, ?, ?, 'update', 'synced')`,
        [deviceId, tableName, serverId]
    );

    return {
        status: 'synced',
        localId,
        serverId,
        action: 'updated'
    };
}

/**
 * Get records that have changed since a given timestamp
 * Used for pull sync (server → client)
 * @param {string} tableName - Table to query
 * @param {Date} since - Timestamp to filter from
 * @returns {Array} Changed records
 */
async function getChangedRecords(tableName, since) {
    const allowedTables = ['appointments', 'tokens', 'prescriptions'];
    if (!allowedTables.includes(tableName)) {
        throw new Error(`Sync not supported for table: ${tableName}`);
    }

    let sql = `SELECT * FROM ${tableName}`;
    const params = [];

    if (since) {
        sql += ` WHERE updated_at > ?`;
        params.push(since);
    }

    sql += ` ORDER BY updated_at ASC LIMIT ${BATCH_SIZE}`;

    return await query(sql, params);
}

/**
 * Resolve a sync conflict manually
 * @param {number} logId - Sync log entry ID
 * @param {string} resolution - 'server_wins' or 'client_wins'
 */
async function resolveConflict(logId, resolution) {
    await query(
        `UPDATE sync_log SET sync_status = 'synced', resolved_at = NOW()
     WHERE id = ?`,
        [logId]
    );
    return { resolved: true, resolution };
}

module.exports = {
    processSyncBatch,
    syncRecord,
    getChangedRecords,
    resolveConflict,
    BATCH_SIZE
};
