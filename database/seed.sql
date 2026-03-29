-- ============================================
-- Seed Data for Smart Clinic Booking
-- Sample data for testing and demo purposes
-- ============================================

USE smart_clinic;

-- ============================================
-- Seed Users
-- ============================================
INSERT INTO users (name, phone, email, password_hash, role) VALUES
-- Patients (password: test123 - hashed with bcryptjs)
('Rahul Sharma', '9876543210', 'rahul@example.com', '$2a$10$RLmxZPeoF7UZ0Xbg8fdwVOjAq.AhFAd0TZMV86qXI.U1Fi8781K1y', 'patient'),
('Priya Patel', '9876543213', 'priya@example.com', '$2a$10$RLmxZPeoF7UZ0Xbg8fdwVOjAq.AhFAd0TZMV86qXI.U1Fi8781K1y', 'patient'),
('Amit Kumar', '9876543214', 'amit@example.com', '$2a$10$RLmxZPeoF7UZ0Xbg8fdwVOjAq.AhFAd0TZMV86qXI.U1Fi8781K1y', 'patient'),

-- Doctors
('Dr. Sanjay Mehta', '9876543211', 'drsanjay@clinic.com', '$2a$10$RLmxZPeoF7UZ0Xbg8fdwVOjAq.AhFAd0TZMV86qXI.U1Fi8781K1y', 'doctor'),
('Dr. Neha Gupta', '9876543215', 'drneha@clinic.com', '$2a$10$RLmxZPeoF7UZ0Xbg8fdwVOjAq.AhFAd0TZMV86qXI.U1Fi8781K1y', 'doctor'),

-- Staff/Admin
('Admin Staff', '9876543212', 'admin@clinic.com', '$2a$10$RLmxZPeoF7UZ0Xbg8fdwVOjAq.AhFAd0TZMV86qXI.U1Fi8781K1y', 'admin');

-- ============================================
-- Seed Patients
-- ============================================
INSERT INTO patients (user_id, date_of_birth, gender, blood_group, address, emergency_contact) VALUES
(1, '1995-03-15', 'male', 'O+', '123 Main Street, New Delhi', '9876543299'),
(2, '1998-07-22', 'female', 'A+', '456 Park Avenue, Mumbai', '9876543298'),
(3, '1990-11-10', 'male', 'B+', '789 Lake Road, Bangalore', '9876543297');

-- ============================================
-- Seed Doctors
-- ============================================
INSERT INTO doctors (user_id, specialization, qualification, experience_years, consultation_fee, max_patients_per_day) VALUES
(4, 'General Medicine', 'MBBS, MD', 15, 500.00, 30),
(5, 'Pediatrics', 'MBBS, DCH', 10, 600.00, 25);

-- ============================================
-- Seed Appointments (for today's date)
-- ============================================
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, token_no, status, type, reason) VALUES
(1, 1, CURDATE(), '09:00:00', 1, 'booked', 'regular', 'General checkup'),
(2, 1, CURDATE(), '09:15:00', 2, 'booked', 'regular', 'Fever and cold'),
(3, 1, CURDATE(), '09:30:00', 3, 'booked', 'regular', 'Follow-up visit'),
(1, 2, CURDATE(), '10:00:00', 1, 'booked', 'regular', 'Child vaccination');

-- ============================================
-- Seed Tokens (for today's queue)
-- ============================================
INSERT INTO tokens (appointment_id, doctor_id, patient_id, token_number, token_date, status, type, estimated_wait_minutes, queue_position) VALUES
(1, 1, 1, 1, CURDATE(), 'waiting', 'regular', 0, 1),
(2, 1, 2, 2, CURDATE(), 'waiting', 'regular', 15, 2),
(3, 1, 3, 3, CURDATE(), 'waiting', 'regular', 30, 3),
(4, 2, 1, 1, CURDATE(), 'waiting', 'regular', 0, 1);
