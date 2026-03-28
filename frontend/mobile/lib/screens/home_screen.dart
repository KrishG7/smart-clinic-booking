import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';
import '../utils/theme.dart';

/// Home Screen
/// Main patient dashboard with bottom navigation
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  Map<String, dynamic>? _user;
  List<dynamic> _todayTokens = [];
  List<dynamic> _upcomingAppointments = [];

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    final user = await AuthService().getUser();
    setState(() { _user = user; });
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    try {
      final tokensResult = await ApiService().get('/tokens/my');
      final aptsResult = await ApiService().get('/appointments/my');

      if (mounted) {
        setState(() {
          _todayTokens = tokensResult['tokens'] ?? [];
          _upcomingAppointments = aptsResult['appointments'] ?? [];
        });
      }
    } catch (e) {
      // Offline mode — data will load from local DB
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Wait Zero'),
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () => Navigator.pushNamed(context, '/profile'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadDashboardData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Greeting
              Text(
                'Hello, ${_user?['name'] ?? 'Patient'} 👋',
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text('How are you feeling today?', style: TextStyle(color: AppTheme.textSecondary)),
              const SizedBox(height: 24),

              // Quick Actions
              Row(
                children: [
                  _buildQuickAction(Icons.calendar_today, 'Book\nAppointment', AppTheme.primaryLight, () {
                    Navigator.pushNamed(context, '/booking');
                  }),
                  const SizedBox(width: 12),
                  _buildQuickAction(Icons.confirmation_number, 'My\nTokens', AppTheme.success, () {
                    Navigator.pushNamed(context, '/token-status');
                  }),
                  const SizedBox(width: 12),
                  _buildQuickAction(Icons.medical_services, 'My\nPrescriptions', AppTheme.secondary, () {
                    Navigator.pushNamed(context, '/prescriptions');
                  }),
                ],
              ),
              const SizedBox(height: 32),

              // Today's Tokens
              const Text('Today\'s Tokens', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
              const SizedBox(height: 12),
              if (_todayTokens.isEmpty)
                _buildEmptyCard('No tokens for today')
              else
                ..._todayTokens.map((token) => _buildTokenCard(token)),

              const SizedBox(height: 24),

              // Upcoming Appointments
              const Text('Recent Appointments', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
              const SizedBox(height: 12),
              if (_upcomingAppointments.isEmpty)
                _buildEmptyCard('No appointments yet')
              else
                ..._upcomingAppointments.take(5).map((apt) => _buildAppointmentCard(apt)),
            ],
          ),
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() { _selectedIndex = index; });
          switch (index) {
            case 0: break; // Already on home
            case 1: Navigator.pushNamed(context, '/booking'); break;
            case 2: Navigator.pushNamed(context, '/token-status'); break;
            case 3: Navigator.pushNamed(context, '/profile'); break;
          }
        },
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.calendar_today), label: 'Book'),
          BottomNavigationBarItem(icon: Icon(Icons.confirmation_number), label: 'Tokens'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }

  Widget _buildQuickAction(IconData icon, String label, Color color, VoidCallback onTap) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: color.withOpacity(0.3)),
          ),
          child: Column(
            children: [
              Icon(icon, color: color, size: 32),
              const SizedBox(height: 8),
              Text(label, textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTokenCard(dynamic token) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: AppTheme.primaryLight,
          child: Text('#${token['token_number'] ?? ''}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        ),
        title: Text(token['doctor_name'] ?? 'Doctor'),
        subtitle: Text('Status: ${token['status'] ?? 'waiting'} • Wait: ~${token['estimated_wait_minutes'] ?? 0} min'),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: () => Navigator.pushNamed(context, '/token-status'),
      ),
    );
  }

  Widget _buildAppointmentCard(dynamic apt) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: const CircleAvatar(backgroundColor: AppTheme.secondary, child: Icon(Icons.event, color: Colors.white)),
        title: Text(apt['doctor_name'] ?? 'Doctor'),
        subtitle: Text('${apt['appointment_date']} at ${apt['appointment_time']}'),
        trailing: Chip(
          label: Text(apt['status'] ?? 'booked', style: const TextStyle(fontSize: 11)),
          backgroundColor: AppTheme.bgSecondary,
        ),
      ),
    );
  }

  Widget _buildEmptyCard(String message) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: AppTheme.bgSecondary,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.border),
      ),
      child: Text(message, textAlign: TextAlign.center, style: TextStyle(color: AppTheme.textMuted)),
    );
  }
}
