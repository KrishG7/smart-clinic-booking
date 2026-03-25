/// Appointment Data Model
class Appointment {
  final int? id;
  final int patientId;
  final int doctorId;
  final String appointmentDate;
  final String appointmentTime;
  final int? tokenNo;
  final String status;
  final String type;
  final String? reason;
  final String? notes;
  final String syncStatus;
  final String? localId;
  final String? doctorName;
  final String? specialization;
  final String? createdAt;

  Appointment({
    this.id,
    required this.patientId,
    required this.doctorId,
    required this.appointmentDate,
    required this.appointmentTime,
    this.tokenNo,
    this.status = 'booked',
    this.type = 'regular',
    this.reason,
    this.notes,
    this.syncStatus = 'synced',
    this.localId,
    this.doctorName,
    this.specialization,
    this.createdAt,
  });

  factory Appointment.fromJson(Map<String, dynamic> json) {
    return Appointment(
      id: json['id'],
      patientId: json['patient_id'] ?? 0,
      doctorId: json['doctor_id'] ?? 0,
      appointmentDate: json['appointment_date'] ?? '',
      appointmentTime: json['appointment_time'] ?? '',
      tokenNo: json['token_no'],
      status: json['status'] ?? 'booked',
      type: json['type'] ?? 'regular',
      reason: json['reason'],
      notes: json['notes'],
      syncStatus: json['sync_status'] ?? 'synced',
      localId: json['local_id'],
      doctorName: json['doctor_name'],
      specialization: json['specialization'],
      createdAt: json['created_at'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'patientId': patientId,
      'doctorId': doctorId,
      'appointmentDate': appointmentDate,
      'appointmentTime': appointmentTime,
      'type': type,
      'reason': reason,
      'localId': localId,
    };
  }

  /// Convert to map for SQLite storage
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'patient_id': patientId,
      'doctor_id': doctorId,
      'appointment_date': appointmentDate,
      'appointment_time': appointmentTime,
      'token_no': tokenNo,
      'status': status,
      'type': type,
      'reason': reason,
      'sync_status': syncStatus,
      'local_id': localId,
    };
  }

  factory Appointment.fromMap(Map<String, dynamic> map) {
    return Appointment(
      id: map['id'],
      patientId: map['patient_id'],
      doctorId: map['doctor_id'],
      appointmentDate: map['appointment_date'],
      appointmentTime: map['appointment_time'],
      tokenNo: map['token_no'],
      status: map['status'] ?? 'booked',
      type: map['type'] ?? 'regular',
      reason: map['reason'],
      syncStatus: map['sync_status'] ?? 'pending',
      localId: map['local_id'],
    );
  }
}
