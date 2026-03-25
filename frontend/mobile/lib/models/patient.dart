/// Patient Data Model
class Patient {
  final int? id;
  final int? userId;
  final String name;
  final String phone;
  final String? email;
  final String? dateOfBirth;
  final String? gender;
  final String? bloodGroup;
  final String? address;
  final String? emergencyContact;
  final String? medicalHistory;

  Patient({
    this.id,
    this.userId,
    required this.name,
    required this.phone,
    this.email,
    this.dateOfBirth,
    this.gender,
    this.bloodGroup,
    this.address,
    this.emergencyContact,
    this.medicalHistory,
  });

  factory Patient.fromJson(Map<String, dynamic> json) {
    return Patient(
      id: json['id'],
      userId: json['user_id'],
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      email: json['email'],
      dateOfBirth: json['date_of_birth'],
      gender: json['gender'],
      bloodGroup: json['blood_group'],
      address: json['address'],
      emergencyContact: json['emergency_contact'],
      medicalHistory: json['medical_history'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'name': name,
      'phone': phone,
      'email': email,
      'date_of_birth': dateOfBirth,
      'gender': gender,
      'blood_group': bloodGroup,
      'address': address,
      'emergency_contact': emergencyContact,
      'medical_history': medicalHistory,
    };
  }

  /// Convert to map for SQLite storage
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'user_id': userId,
      'name': name,
      'phone': phone,
      'email': email,
      'date_of_birth': dateOfBirth,
      'gender': gender,
      'blood_group': bloodGroup,
      'address': address,
      'emergency_contact': emergencyContact,
      'medical_history': medicalHistory,
    };
  }
}
