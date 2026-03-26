import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/constants.dart';
import 'auth_service.dart';

/// API Service
/// Handles all HTTP communication with the backend server
class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  /// Make GET request
  Future<Map<String, dynamic>> get(String endpoint) async {
    final token = await AuthService().getToken();
    final response = await http.get(
      Uri.parse('${AppConstants.apiBaseUrl}$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
    );
    return _handleResponse(response);
  }

  /// Make POST request
  Future<Map<String, dynamic>> post(String endpoint, Map<String, dynamic> body) async {
    final token = await AuthService().getToken();
    final response = await http.post(
      Uri.parse('${AppConstants.apiBaseUrl}$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(body),
    );
    return _handleResponse(response);
  }

  /// Make PUT request
  Future<Map<String, dynamic>> put(String endpoint, Map<String, dynamic> body) async {
    final token = await AuthService().getToken();
    final response = await http.put(
      Uri.parse('${AppConstants.apiBaseUrl}$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(body),
    );
    return _handleResponse(response);
  }

  /// Make PATCH request
  Future<Map<String, dynamic>> patch(String endpoint, Map<String, dynamic> body) async {
    final token = await AuthService().getToken();
    final response = await http.patch(
      Uri.parse('${AppConstants.apiBaseUrl}$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(body),
    );
    return _handleResponse(response);
  }

  /// Make DELETE request
  Future<Map<String, dynamic>> delete(String endpoint) async {
    final token = await AuthService().getToken();
    final response = await http.delete(
      Uri.parse('${AppConstants.apiBaseUrl}$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
    );
    return _handleResponse(response);
  }

  /// Handle HTTP response
  Map<String, dynamic> _handleResponse(http.Response response) {
    final body = jsonDecode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    } else {
      throw ApiException(body['message'] ?? 'Request failed', response.statusCode);
    }
  }
}

/// Custom API exception
class ApiException implements Exception {
  final String message;
  final int statusCode;

  ApiException(this.message, this.statusCode);

  @override
  String toString() => 'ApiException($statusCode): $message';
}
