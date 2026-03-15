import 'package:flutter/material.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/home_screen.dart';
import 'screens/booking_screen.dart';
import 'screens/token_status_screen.dart';
import 'screens/prescription_screen.dart';
import 'screens/profile_screen.dart';
import 'utils/theme.dart';

/// Smart Clinic Booking — Patient Mobile App
/// Healthcare Management System with Live Token & Appointment Scheduling
void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const WaitZeroApp());
}

class WaitZeroApp extends StatelessWidget {
  const WaitZeroApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Wait Zero — Smart Clinic',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      initialRoute: '/splash',
      routes: {
        '/splash': (context) => const SplashScreen(),
        '/login': (context) => const LoginScreen(),
        '/register': (context) => const RegisterScreen(),
        '/home': (context) => const HomeScreen(),
        '/booking': (context) => const BookingScreen(),
        '/token-status': (context) => const TokenStatusScreen(),
        '/prescriptions': (context) => const PrescriptionScreen(),
        '/profile': (context) => const ProfileScreen(),
      },
    );
  }
}
