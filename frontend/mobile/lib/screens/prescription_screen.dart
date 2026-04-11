import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../utils/theme.dart';

/// Prescription Screen (UC-06)
/// Displays prescriptions issued to the patient
class PrescriptionScreen extends StatefulWidget {
  const PrescriptionScreen({super.key});

  @override
  State<PrescriptionScreen> createState() => _PrescriptionScreenState();
}

class _PrescriptionScreenState extends State<PrescriptionScreen> {
  List<dynamic> _appointments = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadPrescriptions();
  }

  Future<void> _loadPrescriptions() async {
    setState(() {
      _loading = true;
    });

    try {
      final result =
          await ApiService().get('/appointments/my?status=completed');
      if (result['success'] == true) {
        setState(() {
          _appointments = result['appointments'] ?? [];
        });
      }
    } catch (e) {
      // Handle offline
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Prescriptions')),
      body: RefreshIndicator(
        onRefresh: _loadPrescriptions,
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _appointments.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.medical_services_outlined,
                            size: 64, color: AppTheme.textMuted),
                        SizedBox(height: 16),
                        Text('No prescriptions yet',
                            style: TextStyle(
                                color: AppTheme.textMuted, fontSize: 16)),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _appointments.length,
                    itemBuilder: (context, index) {
                      final apt = _appointments[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Icon(Icons.medical_services,
                                      color: AppTheme.secondary),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      apt['doctor_name'] ?? 'Doctor',
                                      style: const TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w600),
                                    ),
                                  ),
                                  Text(
                                    apt['appointment_date'] ?? '',
                                    style: const TextStyle(
                                        color: AppTheme.textMuted,
                                        fontSize: 13),
                                  ),
                                ],
                              ),
                              if (apt['specialization'] != null) ...[
                                const SizedBox(height: 4),
                                Text(apt['specialization'],
                                    style: const TextStyle(
                                        color: AppTheme.textSecondary)),
                              ],
                              if (apt['notes'] != null) ...[
                                const Divider(height: 24),
                                const Text('Prescription Notes:',
                                    style:
                                        TextStyle(fontWeight: FontWeight.w600)),
                                const SizedBox(height: 4),
                                Text(apt['notes'],
                                    style: const TextStyle(
                                        color: AppTheme.textSecondary)),
                              ],
                            ],
                          ),
                        ),
                      );
                    },
                  ),
      ),
    );
  }
}
