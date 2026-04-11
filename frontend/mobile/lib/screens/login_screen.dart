import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../utils/theme.dart';
import '../widgets/custom_button.dart';

/// Login Screen
/// OTP-based and password login for patients
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _otpController = TextEditingController();
  bool _loading = false;
  bool _otpMode = false;
  bool _otpSent = false;
  String? _errorMessage;

  Future<void> _handleLogin() async {
    setState(() {
      _loading = true;
      _errorMessage = null;
    });

    try {
      final result = await AuthService().login(
        _phoneController.text.trim(),
        _passwordController.text,
      );

      if (result['success'] == true && mounted) {
        Navigator.pushReplacementNamed(context, '/home');
      } else {
        setState(() {
          _errorMessage = result['message'] ?? 'Login failed';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Connection error. Is the server running?';
      });
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  Future<void> _handleOTP() async {
    setState(() {
      _loading = true;
      _errorMessage = null;
    });

    try {
      if (!_otpSent) {
        final result =
            await AuthService().sendOTP(_phoneController.text.trim());
        if (result['success'] == true) {
          setState(() {
            _otpSent = true;
          });
          _showSnackbar('OTP sent! For demo, use: 123456');
        } else {
          setState(() {
            _errorMessage = result['message'];
          });
        }
      } else {
        final result = await AuthService().verifyOTP(
          _phoneController.text.trim(),
          _otpController.text.trim(),
        );

        if (result['success'] == true && mounted) {
          Navigator.pushReplacementNamed(context, '/home');
        } else {
          setState(() {
            _errorMessage = result['message'] ?? 'Invalid OTP';
          });
        }
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Connection error';
      });
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  void _showSnackbar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: AppTheme.success),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 60),
              const Icon(Icons.local_hospital,
                  size: 64, color: AppTheme.primaryLight),
              const SizedBox(height: 16),
              const Text('Welcome Back',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              const Text('Sign in to your patient account',
                  textAlign: TextAlign.center,
                  style:
                      TextStyle(fontSize: 16, color: AppTheme.textSecondary)),
              const SizedBox(height: 48),

              // Phone field
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'Phone Number',
                  prefixIcon: Icon(Icons.phone),
                  hintText: 'Enter your phone number',
                ),
              ),
              const SizedBox(height: 16),

              // Password field (shown in password mode)
              if (!_otpMode) ...[
                TextField(
                  controller: _passwordController,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'Password',
                    prefixIcon: Icon(Icons.lock),
                    hintText: 'Enter your password',
                  ),
                ),
                const SizedBox(height: 24),
                CustomButton(
                  text: 'Sign In',
                  onPressed: _handleLogin,
                  isLoading: _loading,
                ),
              ],

              // OTP field (shown in OTP mode)
              if (_otpMode) ...[
                if (_otpSent) ...[
                  const SizedBox(height: 16),
                  TextField(
                    controller: _otpController,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    decoration: const InputDecoration(
                      labelText: 'Enter OTP',
                      prefixIcon: Icon(Icons.pin),
                      hintText: '6-digit OTP',
                    ),
                  ),
                ],
                const SizedBox(height: 24),
                CustomButton(
                  text: _otpSent ? 'Verify OTP' : 'Send OTP',
                  onPressed: _handleOTP,
                  isLoading: _loading,
                ),
              ],

              // Error message
              if (_errorMessage != null) ...[
                const SizedBox(height: 16),
                Text(_errorMessage!,
                    style: const TextStyle(color: AppTheme.danger),
                    textAlign: TextAlign.center),
              ],

              const SizedBox(height: 24),

              // Toggle OTP/Password mode
              TextButton(
                onPressed: () => setState(() {
                  _otpMode = !_otpMode;
                  _otpSent = false;
                }),
                child: Text(_otpMode ? 'Use Password Login' : 'Use OTP Login'),
              ),

              // Register link
              TextButton(
                onPressed: () => Navigator.pushNamed(context, '/register'),
                child: const Text("Don't have an account? Register"),
              ),

              // Demo credentials
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.bgSecondary,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppTheme.border),
                ),
                child: const Text(
                    'Demo: Phone 9876543210 | Pass test123\nOTP: 123456',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 12, color: AppTheme.textMuted)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _passwordController.dispose();
    _otpController.dispose();
    super.dispose();
  }
}
