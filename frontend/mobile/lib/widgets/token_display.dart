import 'package:flutter/material.dart';
import '../utils/theme.dart';

/// Token Display Widget
/// Shows a single token card with queue info and check-in action
class TokenDisplay extends StatelessWidget {
  final int tokenNumber;
  final String doctorName;
  final String specialization;
  final String status;
  final int queuePosition;
  final int estimatedWait;
  final VoidCallback? onCheckIn;

  const TokenDisplay({
    super.key,
    required this.tokenNumber,
    required this.doctorName,
    required this.specialization,
    required this.status,
    required this.queuePosition,
    required this.estimatedWait,
    this.onCheckIn,
  });

  Color get _statusColor {
    switch (status) {
      case 'waiting': return AppTheme.warning;
      case 'in_progress': return AppTheme.primaryLight;
      case 'completed': return AppTheme.success;
      case 'emergency': return AppTheme.danger;
      default: return AppTheme.textMuted;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Token number and status
            Row(
              children: [
                Container(
                  width: 60, height: 60,
                  decoration: BoxDecoration(
                    color: AppTheme.primaryLight.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(
                    child: Text(
                      '#$tokenNumber',
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.primaryLight),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(doctorName, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                      Text(specialization, style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: _statusColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    status.toUpperCase(),
                    style: TextStyle(color: _statusColor, fontSize: 11, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
            const Divider(height: 24),

            // Queue info
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildInfoItem('Queue Position', '$queuePosition'),
                _buildInfoItem('Est. Wait', '$estimatedWait min'),
              ],
            ),

            // Check-in button
            if (onCheckIn != null) ...[
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: onCheckIn,
                  icon: const Icon(Icons.location_on, size: 18),
                  label: const Text('Check In (GPS)'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.success,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildInfoItem(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text(label, style: TextStyle(fontSize: 12, color: AppTheme.textMuted)),
      ],
    );
  }
}
