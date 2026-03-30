import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';
import '../utils/theme.dart';

/// Profile Screen
/// Patient profile management with logout
class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? _user;
  Map<String, dynamic>? _patient;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    final user = await AuthService().getUser();
    setState(() {
      _user = user;
    });

    try {
      final result = await ApiService().get('/patients/me');
      if (result['success'] == true) {
        setState(() {
          _patient = result['patient'];
        });
      }
    } catch (e) {
      // Offline — use cached user data
    } finally {
      if (mounted)
        setState(() {
          _loading = false;
        });
    }
  }

  Future<void> _logout() async {
    await AuthService().logout();
    if (mounted) {
      Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Profile')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // Profile Header
                  CircleAvatar(
                    radius: 48,
                    backgroundColor: AppTheme.primaryLight,
                    child: Text(
                      (_user?['name'] ?? 'U')[0].toUpperCase(),
                      style: const TextStyle(
                          fontSize: 36,
                          color: Colors.white,
                          fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(_user?['name'] ?? 'User',
                      style: const TextStyle(
                          fontSize: 22, fontWeight: FontWeight.bold)),
                  Text(_user?['role'] ?? 'patient',
                      style: const TextStyle(color: AppTheme.textSecondary)),
                  const SizedBox(height: 32),

                  // Info Cards
                  _buildInfoTile(Icons.phone, 'Phone', _user?['phone'] ?? '--'),
                  _buildInfoTile(
                      Icons.email, 'Email', _user?['email'] ?? 'Not set'),
                  if (_patient != null) ...[
                    _buildInfoTile(Icons.cake, 'Date of Birth',
                        _patient?['date_of_birth'] ?? 'Not set'),
                    _buildInfoTile(Icons.person, 'Gender',
                        _patient?['gender'] ?? 'Not set'),
                    _buildInfoTile(Icons.water_drop, 'Blood Group',
                        _patient?['blood_group'] ?? 'Not set'),
                    _buildInfoTile(Icons.location_on, 'Address',
                        _patient?['address'] ?? 'Not set'),
                    _buildInfoTile(Icons.emergency, 'Emergency Contact',
                        _patient?['emergency_contact'] ?? 'Not set'),
                  ],
                  const SizedBox(height: 32),

                  // Logout Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _logout,
                      icon: const Icon(Icons.logout),
                      label: const Text('Logout'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.danger,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildInfoTile(IconData icon, String label, String value) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.bgSecondary,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppTheme.primaryLight, size: 20),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label,
                  style:
                      const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
              Text(value, style: const TextStyle(fontSize: 15)),
            ],
          ),
        ],
      ),
    );
  }
}
