import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/constants.dart';
import 'api_service.dart';

/// Authentication Service
/// Manages user login, registration, token storage, and session
class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  /// Login with phone and password
  Future<Map<String, dynamic>> login(String phone, String password) async {
    final result = await ApiService().post('/auth/login', {
      'phone': phone,
      'password': password,
    });

    if (result['success'] == true) {
      await _saveSession(result['token'], result['user']);
    }
    return result;
  }

  /// Register a new user
  Future<Map<String, dynamic>> register(Map<String, dynamic> userData) async {
    final result = await ApiService().post('/auth/register', userData);
    if (result['success'] == true) {
      await _saveSession(result['token'], result['user']);
    }
    return result;
  }

  /// Send OTP
  Future<Map<String, dynamic>> sendOTP(String phone) async {
    return await ApiService().post('/auth/send-otp', {
      'phone': phone,
      'purpose': 'login',
    });
  }

  /// Verify OTP and login
  Future<Map<String, dynamic>> verifyOTP(String phone, String otp) async {
    final result = await ApiService().post('/auth/verify-otp', {
      'phone': phone,
      'otp': otp,
    });

    if (result['success'] == true) {
      await _saveSession(result['token'], result['user']);
    }
    return result;
  }

  /// Get stored auth token
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(AppConstants.tokenKey);
  }

  /// Get stored user data
  Future<Map<String, dynamic>?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString(AppConstants.userKey);
    if (userData != null) {
      return jsonDecode(userData);
    }
    return null;
  }

  /// Check if user is logged in
  Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  /// Logout
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.tokenKey);
    await prefs.remove(AppConstants.userKey);
  }

  /// Save session after login/register
  Future<void> _saveSession(String token, Map<String, dynamic> user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.tokenKey, token);
    await prefs.setString(AppConstants.userKey, jsonEncode(user));
  }
}
