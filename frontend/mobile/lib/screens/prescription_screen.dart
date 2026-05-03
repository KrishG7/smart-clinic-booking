import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../utils/theme.dart';

/// Prescription Screen (UC-06)
/// Lists every prescription the logged-in patient has received from any
/// doctor, hitting the dedicated /api/prescriptions/my endpoint.
class PrescriptionScreen extends StatefulWidget {
  const PrescriptionScreen({super.key});

  @override
  State<PrescriptionScreen> createState() => _PrescriptionScreenState();
}

class _PrescriptionScreenState extends State<PrescriptionScreen> {
  List<Map<String, dynamic>> _prescriptions = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadPrescriptions();
  }

  Future<void> _loadPrescriptions() async {
    if (mounted) {
      setState(() {
        _loading = true;
        _error = null;
      });
    }

    try {
      final result = await ApiService().get('/prescriptions/my');
      if (!mounted) return;
      if (result['success'] == true) {
        final raw = result['prescriptions'];
        setState(() {
          _prescriptions = raw is List
              ? raw
                  .whereType<Map>()
                  .map((m) => m.cast<String, dynamic>())
                  .toList()
              : [];
        });
      } else {
        setState(() {
          _error = result['message']?.toString() ?? 'Could not load prescriptions';
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = 'Could not load prescriptions';
      });
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  String _formatDate(dynamic raw) {
    if (raw == null) return '—';
    try {
      final d = DateTime.parse(raw.toString()).toLocal();
      const months = [
        'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',
      ];
      return '${d.day} ${months[d.month - 1]} ${d.year}';
    } catch (_) {
      return raw.toString();
    }
  }

  String _doctorLabel(dynamic name) {
    final s = (name as String?)?.trim() ?? '';
    if (s.isEmpty) return 'Unknown Doctor';
    // Remove any existing "Dr." or "Dr" prefix (case insensitive) followed by optional period and space
    final cleaned = s.replaceFirst(RegExp(r'^dr\.?\s*', caseSensitive: false), '');
    return 'Dr. $cleaned';
  }

  Widget _empty() {
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      children: const [
        SizedBox(height: 120),
        Icon(Icons.medical_services_outlined,
            size: 64, color: AppTheme.textMuted),
        SizedBox(height: 16),
        Center(
          child: Text(
            'No prescriptions yet',
            style: TextStyle(color: AppTheme.textMuted, fontSize: 16),
          ),
        ),
        SizedBox(height: 8),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: 32),
          child: Text(
            'Once a doctor issues a prescription during one of your visits, '
            'it will appear here automatically.',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
          ),
        ),
      ],
    );
  }

  Widget _card(Map<String, dynamic> rx) {
    final medsRaw = rx['medications'];
    final meds = medsRaw is List
        ? medsRaw.whereType<Map>().map((m) => m.cast<String, dynamic>()).toList()
        : <Map<String, dynamic>>[];

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header — doctor + visit date
            Row(
              children: [
                const Icon(Icons.medical_services, color: AppTheme.secondary),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _doctorLabel(rx['doctorName']),
                    style: const TextStyle(
                        fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                ),
                Text(
                  _formatDate(rx['appointmentDate']),
                  style: const TextStyle(
                      color: AppTheme.textMuted, fontSize: 13),
                ),
              ],
            ),
            if (rx['specialization'] != null &&
                (rx['specialization'] as String).isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(rx['specialization'],
                  style: const TextStyle(color: AppTheme.textSecondary)),
            ],

            // Diagnosis
            if ((rx['diagnosis'] ?? '').toString().isNotEmpty) ...[
              const Divider(height: 24),
              const Text('Diagnosis',
                  style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textMuted,
                      letterSpacing: 1.2)),
              const SizedBox(height: 4),
              Text(rx['diagnosis'].toString()),
            ],

            // Medications
            if (meds.isNotEmpty) ...[
              const SizedBox(height: 12),
              const Text('Medications',
                  style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textMuted,
                      letterSpacing: 1.2)),
              const SizedBox(height: 6),
              ...meds.map((m) => Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.fiber_manual_record,
                            size: 8, color: AppTheme.secondary),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                m['name']?.toString() ?? 'Medication',
                                style:
                                    const TextStyle(fontWeight: FontWeight.w600),
                              ),
                              if ((m['dose'] ?? '').toString().isNotEmpty ||
                                  (m['frequency'] ?? '').toString().isNotEmpty)
                                Text(
                                  [
                                    if ((m['dose'] ?? '').toString().isNotEmpty)
                                      'Dose: ${m['dose']}',
                                    if ((m['frequency'] ?? '').toString().isNotEmpty)
                                      m['frequency'].toString(),
                                  ].join(' · '),
                                  style: const TextStyle(
                                      color: AppTheme.textSecondary,
                                      fontSize: 13),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  )),
            ],

            // Instructions
            if ((rx['instructions'] ?? '').toString().isNotEmpty) ...[
              const SizedBox(height: 12),
              const Text('Instructions',
                  style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textMuted,
                      letterSpacing: 1.2)),
              const SizedBox(height: 4),
              Text(rx['instructions'].toString(),
                  style: const TextStyle(color: AppTheme.textSecondary)),
            ],

            // Follow-up
            if (rx['followUpDate'] != null) ...[
              const SizedBox(height: 12),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.amber.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(
                      color: Colors.amber.withValues(alpha: 0.4)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.event,
                        size: 14, color: Colors.amberAccent),
                    const SizedBox(width: 6),
                    Text(
                      'Follow-up: ${_formatDate(rx['followUpDate'])}',
                      style: const TextStyle(
                          fontSize: 12,
                          color: Colors.amberAccent,
                          fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    Widget body;
    if (_loading) {
      body = const Center(child: CircularProgressIndicator());
    } else if (_error != null) {
      body = ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          const SizedBox(height: 120),
          const Icon(Icons.error_outline,
              size: 56, color: AppTheme.textMuted),
          const SizedBox(height: 12),
          Center(
            child: Text(_error!,
                textAlign: TextAlign.center,
                style: const TextStyle(color: AppTheme.textMuted)),
          ),
        ],
      );
    } else if (_prescriptions.isEmpty) {
      body = _empty();
    } else {
      body = ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _prescriptions.length,
        itemBuilder: (context, i) => _card(_prescriptions[i]),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Prescriptions'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadPrescriptions,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadPrescriptions,
        child: body,
      ),
    );
  }
}
