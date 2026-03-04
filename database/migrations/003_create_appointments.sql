-- Migration 003: Create Appointments Table
-- Depends on: patients, doctors tables

CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    token_no INT,
    status ENUM('booked', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show') DEFAULT 'booked',
    type ENUM('regular', 'follow_up', 'emergency') DEFAULT 'regular',
    reason TEXT,
    notes TEXT,
    sync_status ENUM('synced', 'pending', 'conflict', 'failed') DEFAULT 'synced',
    local_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_status (status),
    INDEX idx_sync_status (sync_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
