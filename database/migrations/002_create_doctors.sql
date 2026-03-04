-- Migration 002: Create Doctors Table
-- Depends on: users table

CREATE TABLE IF NOT EXISTS doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    qualification VARCHAR(200),
    experience_years INT DEFAULT 0,
    consultation_fee DECIMAL(10, 2) DEFAULT 0.00,
    max_patients_per_day INT DEFAULT 30,
    available_days VARCHAR(50) DEFAULT 'Mon,Tue,Wed,Thu,Fri',
    slot_start_time TIME DEFAULT '09:00:00',
    slot_end_time TIME DEFAULT '17:00:00',
    slot_duration_minutes INT DEFAULT 15,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_specialization (specialization)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
