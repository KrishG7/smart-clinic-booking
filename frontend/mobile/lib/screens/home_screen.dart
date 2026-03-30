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
    setState(() {
      _user = user;
    });
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
      backgroundColor: AppTheme.bgPrimary,
      appBar: AppBar(
        title: const Text('Wait Zero', style: TextStyle(fontWeight: FontWeight.w800, letterSpacing: -0.5)),
        automaticallyImplyLeading: false,
        elevation: 0,
        actions: [
          Hero(
            tag: 'profile-avatar',
            child: GestureDetector(
              onTap: () => Navigator.pushNamed(context, '/profile'),
              child: const Padding(
                padding: EdgeInsets.only(right: 16.0),
                child: CircleAvatar(
                  backgroundColor: AppTheme.primaryLight,
                  child: Icon(Icons.person, color: Colors.white),
                ),
              ),
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadDashboardData,
        color: AppTheme.primary,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Greeting Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Hello, ${_user?['name']?.split(' ')[0] ?? 'Patient'} 👋',
                      style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, fontFamily: 'Inter'),
                    ),
                    const SizedBox(height: 8),
                    const Text('Ready to skip the waiting room?',
                        style: TextStyle(color: AppTheme.textSecondary, fontSize: 16)),
                  ],
                ),
              ),

              // Action Carousels
              SizedBox(
                height: 120,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  physics: const BouncingScrollPhysics(),
                  children: [
                    _buildQuickAction(Icons.calendar_today, 'Book', 'Appointment', AppTheme.primaryLight, () => Navigator.pushNamed(context, '/booking')),
                    _buildQuickAction(Icons.confirmation_number, 'Live', 'Tokens', AppTheme.success, () => Navigator.pushNamed(context, '/token-status')),
                    _buildQuickAction(Icons.medical_services, 'My', 'Rx', AppTheme.secondary, () => Navigator.pushNamed(context, '/prescriptions')),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // Horizontal Tokens Carousel
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Active Tokens', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                    TextButton(
                      onPressed: () => Navigator.pushNamed(context, '/token-status'),
                      child: const Text('View All', style: TextStyle(color: AppTheme.primaryLight, fontWeight: FontWeight.bold)),
                    )
                  ],
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                height: 160,
                child: _todayTokens.isEmpty
                    ? Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: _buildEmptyCard('No active tokens today.', Icons.check_circle_outline),
                      )
                    : ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        physics: const BouncingScrollPhysics(),
                        itemCount: _todayTokens.length,
                        itemBuilder: (context, index) => _buildTokenCard(_todayTokens[index]),
                      ),
              ),

              const SizedBox(height: 32),

              // Appointments List
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20),
                child: Text('Upcoming', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
              ),
              const SizedBox(height: 16),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: _upcomingAppointments.isEmpty
                    ? _buildEmptyCard('No upcoming appointments.', Icons.calendar_month)
                    : Column(
                        children: _upcomingAppointments.take(4).map((apt) => _buildAppointmentCard(apt)).toList(),
                      ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, offset: const Offset(0, -10))
          ]
        ),
        child: BottomNavigationBar(
          currentIndex: _selectedIndex,
          onTap: (index) {
            setState(() => _selectedIndex = index);
            if (index == 1) Navigator.pushNamed(context, '/booking');
            if (index == 2) Navigator.pushNamed(context, '/token-status');
            if (index == 3) Navigator.pushNamed(context, '/profile');
          },
          selectedItemColor: AppTheme.primary,
          unselectedItemColor: AppTheme.textMuted,
          showSelectedLabels: true,
          showUnselectedLabels: false,
          elevation: 0,
          backgroundColor: AppTheme.surface,
          type: BottomNavigationBarType.fixed,
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.home_filled), label: 'Home'),
            BottomNavigationBarItem(icon: Icon(Icons.add_box_rounded), label: 'Book'),
            BottomNavigationBarItem(icon: Icon(Icons.dynamic_feed), label: 'Queue'),
            BottomNavigationBarItem(icon: Icon(Icons.person_rounded), label: 'Profile'),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickAction(IconData icon, String title, String subtitle, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Hero(
        tag: 'action-$title',
        child: Container(
          width: 110,
          margin: const EdgeInsets.symmetric(horizontal: 6),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: color.withOpacity(0.12),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: color.withOpacity(0.2)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: color, size: 28),
              const Spacer(),
              Text(title, style: TextStyle(fontSize: 14, color: color, fontWeight: FontWeight.bold)),
              Text(subtitle, style: TextStyle(fontSize: 12, color: color.withOpacity(0.8), fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTokenCard(dynamic token) {
    final tokenNumber = token['token_number'] ?? '';
    return Container(
      width: 280,
      margin: const EdgeInsets.symmetric(horizontal: 8),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: AppTheme.primary.withOpacity(0.08), blurRadius: 24, offset: const Offset(0, 8))
        ],
        border: Border.all(color: AppTheme.border.withOpacity(0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(color: AppTheme.bgSecondary, borderRadius: BorderRadius.circular(12)),
                child: Text('#$tokenNumber', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppTheme.primaryLight)),
              ),
              Container(
                width: 12, height: 12,
                decoration: BoxDecoration(color: AppTheme.success, shape: BoxShape.circle, boxShadow: [BoxShadow(color: AppTheme.success.withOpacity(0.4), blurRadius: 8)]),
              )
            ],
          ),
          const Spacer(),
          Text(token['doctor_name'] ?? 'Doctor', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          Text('\~${token['estimated_wait_minutes'] ?? 0} mins left', style: const TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _buildAppointmentCard(dynamic apt) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border.withOpacity(0.4)),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: AppTheme.secondary.withOpacity(0.1), borderRadius: BorderRadius.circular(14)),
          child: const Icon(Icons.event, color: AppTheme.secondary),
        ),
        title: Text(apt['doctor_name'] ?? 'Doctor', style: const TextStyle(fontWeight: FontWeight.w700)),
        subtitle: Text('${apt['appointment_date']} at ${apt['appointment_time']}', style: const TextStyle(color: AppTheme.textSecondary)),
        trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 16, color: AppTheme.textMuted),
      ),
    );
  }

  Widget _buildEmptyCard(String message, IconData icon) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppTheme.bgSecondary.withOpacity(0.5),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
           Icon(icon, size: 32, color: AppTheme.textMuted),
           const SizedBox(height: 12),
           Text(message, textAlign: TextAlign.center, style: const TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
