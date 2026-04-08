require('dotenv').config();
const { query } = require('./config/database');

async function migrate() {
    try {
        await query('ALTER TABLE doctors ADD COLUMN clinic_address TEXT;');
        console.log('Successfully added clinic_address to doctors table.');
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Field clinic_address already exists.');
        } else {
            console.error('Error altering table:', err.message);
        }
    } finally {
        process.exit();
    }
}
migrate();
