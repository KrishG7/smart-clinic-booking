/// Token Data Model (Queue Token)
class Token {
  final int? id;
  final int? appointmentId;
  final int doctorId;
  final int patientId;
  final int tokenNumber;
  final String tokenDate;
  final String status;
  final String type;
  final int estimatedWaitMinutes;
  final int queuePosition;
  final String? checkInTime;
  final String? doctorName;
  final String? specialization;

  Token({
    this.id,
    this.appointmentId,
    required this.doctorId,
    required this.patientId,
    required this.tokenNumber,
    required this.tokenDate,
    this.status = 'waiting',
    this.type = 'regular',
    this.estimatedWaitMinutes = 0,
    this.queuePosition = 0,
    this.checkInTime,
    this.doctorName,
    this.specialization,
  });

  factory Token.fromJson(Map<String, dynamic> json) {
    return Token(
      id: json['id'],
      appointmentId: json['appointment_id'],
      doctorId: json['doctor_id'] ?? 0,
      patientId: json['patient_id'] ?? 0,
      tokenNumber: json['token_number'] ?? json['tokenNumber'] ?? 0,
      tokenDate: json['token_date'] ?? '',
      status: json['status'] ?? 'waiting',
      type: json['type'] ?? 'regular',
      estimatedWaitMinutes: json['estimated_wait_minutes'] ?? json['estimatedWait'] ?? 0,
      queuePosition: json['queue_position'] ?? json['queuePosition'] ?? 0,
      checkInTime: json['check_in_time'],
      doctorName: json['doctor_name'],
      specialization: json['specialization'],
    );
  }

  bool get isEmergency => type == 'emergency';
  bool get isWaiting => status == 'waiting';
  bool get isActive => status == 'in_progress';
  bool get isCompleted => status == 'completed';
}
