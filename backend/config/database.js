/**
 * Database Configuration
 * Manages MySQL connection pool for the cloud database
 */

const mysql = require('mysql2/promise');

// Create connection pool for better performance
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smart_clinic_booking',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

/**
 * Connect to MySQL database and verify connection
 */
async function connectDB() {
    try {
        const connection = await pool.getConnection();
        console.log(`📦 MySQL connected to ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
        connection.release();
        return pool;
    } catch (error) {
        console.error('❌ MySQL connection failed:', error.message);
        throw error;
    }
}

/**
 * Execute a SQL query with parameters
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
async function query(sql, params = []) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Database query error:', error.message);
        console.error('Query:', sql);
        throw error;
    }
}

/**
 * Execute a transaction with multiple queries
 * @param {Function} callback - Function receiving connection for transaction
 * @returns {Promise<any>} Transaction result
 */
async function transaction(callback) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = { pool, connectDB, query, transaction };
