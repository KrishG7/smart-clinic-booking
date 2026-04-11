import 'dart:math';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../services/local_db_service.dart';
import '../utils/theme.dart';
import '../widgets/custom_button.dart';

/// Booking Screen (UC-01: Offline-Capable Booking)
/// Allows patients to book appointments, with offline fallback
class BookingScreen extends StatefulWidget {
  const BookingScreen({super.key});

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  List<dynamic> _doctors = [];
  List<dynamic> _slots = [];
  int? _selectedDoctorId;
  String? _selectedDate;
  String? _selectedTime;
  final _reasonController = TextEditingController();
  bool _loading = false;
  bool _loadingSlots = false;

  @override
  void initState() {
    super.initState();
    _loadDoctors();
  }

  Future<void> _loadDoctors() async {
    try {
      final result = await ApiService().get('/doctors');
      if (result['success'] == true) {
        setState(() {
          _doctors = result['doctors'] ?? [];
        });
      }
    } catch (e) {
      _showSnackbar('Failed to load doctors. You can still book offline.');
    }
  }

  Future<void> _loadSlots() async {
    if (_selectedDoctorId == null || _selectedDate == null) return;
    setState(() {
      _loadingSlots = true;
    });

    try {
      final result = await ApiService()
          .get('/doctors/$_selectedDoctorId/slots?date=$_selectedDate');
      if (result['success'] == true) {
        setState(() {
          _slots = result['slots'] ?? [];
        });
      }
    } catch (e) {
      // Generate offline slots
      setState(() {
        _slots = List.generate(
            16,
            (i) => {
                  'time':
                      '${(9 + i ~/ 4).toString().padLeft(2, '0')}:${((i % 4) * 15).toString().padLeft(2, '0')}:00',
                  'available': true,
                });
      });
    } finally {
      setState(() {
        _loadingSlots = false;
      });
    }
  }

  Future<void> _bookAppointment() async {
    if (_selectedDoctorId == null ||
        _selectedDate == null ||
        _selectedTime == null) {
      _showSnackbar('Please select doctor, date, and time');
      return;
    }

    setState(() {
      _loading = true;
    });

    try {
      // Try online booking first
      final result = await ApiService().post('/appointments', {
        'doctorId': _selectedDoctorId,
        'appointmentDate': _selectedDate,
        'appointmentTime': _selectedTime,
        'reason': _reasonController.text,
      });

      if (!mounted) return;
      if (result['success'] == true) {
        _showSnackbar(
            'Appointment booked! Token #${result['token']?['tokenNumber'] ?? ''}');
        Navigator.pop(context);
      } else {
        _showSnackbar(result['message'] ?? 'Booking failed');
      }
    } catch (e) {
      // Offline booking — save to local SQLite with the real patient ID
      final user = await AuthService().getUser();
      // The user map stores the DB user.id; the patient profile ID is resolved on sync
      final int realUserId = (user?['id'] as num?)?.toInt() ?? 0;

      final localId =
          'local_${DateTime.now().millisecondsSinceEpoch}_${Random().nextInt(9999)}';
      await LocalDbService().saveAppointment({
        'patient_id': realUserId,   // real user ID — no longer hardcoded to 1
        'doctor_id': _selectedDoctorId,
        'appointment_date': _selectedDate,
        'appointment_time': _selectedTime,
        'reason': _reasonController.text,
        'status': 'booked',
        'sync_status': 'pending',
        'local_id': localId,
      });
      if (!mounted) return;
      _showSnackbar('📱 Saved offline! Will sync when online.');
      Navigator.pop(context);
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  void _showSnackbar(String message) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Book Appointment')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Select Doctor
            const Text('Select Doctor',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: AppTheme.bgSecondary,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppTheme.border),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<int>(
                  isExpanded: true,
                  hint: const Text('Choose a doctor'),
                  value: _selectedDoctorId,
                  dropdownColor: AppTheme.bgSecondary,
                  items: _doctors
                      .map((d) => DropdownMenuItem<int>(
                            value: d['id'],
                            child:
                                Text('${d['name']} — ${d['specialization']}'),
                          ))
                      .toList(),
                  onChanged: (val) {
                    setState(() {
                      _selectedDoctorId = val;
                      _slots = [];
                    });
                    if (_selectedDate != null) _loadSlots();
                  },
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Select Date
            const Text('Select Date',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            GestureDetector(
              onTap: () async {
                final date = await showDatePicker(
                  context: context,
                  initialDate: DateTime.now(),
                  firstDate: DateTime.now(),
                  lastDate: DateTime.now().add(const Duration(days: 30)),
                );
                if (date != null) {
                  setState(() {
                    _selectedDate = date.toIso8601String().split('T')[0];
                  });
                  _loadSlots();
                }
              },
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.bgSecondary,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppTheme.border),
                ),
                child: Text(
                  _selectedDate ?? 'Tap to select date',
                  style: TextStyle(
                      color: _selectedDate != null
                          ? AppTheme.textPrimary
                          : AppTheme.textMuted),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Time Slots
            const Text('Available Slots',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            if (_loadingSlots)
              const Center(child: CircularProgressIndicator())
            else if (_slots.isEmpty)
              const Text('Select a doctor and date to see slots',
                  style: TextStyle(color: AppTheme.textMuted))
            else
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children:
                    _slots.where((s) => s['available'] == true).map((slot) {
                  final time = slot['time'] as String;
                  final isSelected = _selectedTime == time;
                  return GestureDetector(
                    onTap: () => setState(() {
                      _selectedTime = time;
                    }),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 10),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? AppTheme.primaryLight
                            : AppTheme.bgSecondary,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                            color: isSelected
                                ? AppTheme.primaryLight
                                : AppTheme.border),
                      ),
                      child: Text(time.substring(0, 5),
                          style: TextStyle(
                              color: isSelected
                                  ? Colors.white
                                  : AppTheme.textPrimary,
                              fontWeight: FontWeight.w500)),
                    ),
                  );
                }).toList(),
              ),
            const SizedBox(height: 20),

            // Reason
            const Text('Reason (Optional)',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            TextField(
              controller: _reasonController,
              maxLines: 3,
              decoration: const InputDecoration(
                  hintText: 'Describe your symptoms or reason for visit'),
            ),
            const SizedBox(height: 32),

            // Book Button
            CustomButton(
              text: 'Book Appointment',
              onPressed: _bookAppointment,
              isLoading: _loading,
              icon: Icons.check_circle,
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _reasonController.dispose();
    super.dispose();
  }
}
