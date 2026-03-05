-- Migration 004: Create Tokens Table
-- Depends on: appointments, doctors, patients tables

CREATE TABLE IF NOT EXISTS tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT,
    doctor_id INT NOT NULL,
    patient_id INT NOT NULL,
    token_number INT NOT NULL,
    token_date DATE NOT NULL,
    status ENUM('waiting', 'in_progress', 'completed', 'skipped', 'cancelled', 'emergency') DEFAULT 'waiting',
    type ENUM('regular', 'emergency') DEFAULT 'regular',
    check_in_time TIMESTAMP NULL,
    start_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    estimated_wait_minutes INT DEFAULT 0,
    queue_position INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_doctor_date (doctor_id, token_date),
    INDEX idx_status (status),
    INDEX idx_token_date (token_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
