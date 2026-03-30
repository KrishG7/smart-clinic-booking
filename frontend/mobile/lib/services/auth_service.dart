import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../utils/constants.dart';
import 'api_service.dart';

/// Authentication Service
/// Manages user login, registration, token storage, and session
class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  FlutterSecureStorage _storage = const FlutterSecureStorage();

  // Explicit injector for our mock test suite
  void setStorageForTesting(FlutterSecureStorage mockStorage) {
    _storage = mockStorage;
  }

  /// Login with phone and password
  Future<Map<String, dynamic>> login(String phone, String password) async {
    final result = await ApiService().post('/auth/login', {
      'phone': phone,
      'password': password,
    });

    if (result['success'] == true) {
      await saveSessionCache(result['token'], result['user']);
    }
    return result;
  }

  /// Register a new user
  Future<Map<String, dynamic>> register(Map<String, dynamic> userData) async {
    final result = await ApiService().post('/auth/register', userData);
    if (result['success'] == true) {
      await saveSessionCache(result['token'], result['user']);
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
      await saveSessionCache(result['token'], result['user']);
    }
    return result;
  }

  /// Get stored auth token
  Future<String?> getToken() async {
    return await _storage.read(key: AppConstants.tokenKey);
  }

  /// Get stored user data
  Future<Map<String, dynamic>?> getUser() async {
    final userData = await _storage.read(key: AppConstants.userKey);
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
    await _storage.delete(key: AppConstants.tokenKey);
    await _storage.delete(key: AppConstants.userKey);
  }

  /// Save session after login/register
  Future<void> saveSessionCache(String token, Map<String, dynamic> user) async {
    await _storage.write(key: AppConstants.tokenKey, value: token);
    await _storage.write(key: AppConstants.userKey, value: jsonEncode(user));
  }
}
