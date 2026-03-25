/// App Constants
/// API endpoints, configuration values, and string constants

class AppConstants {
  // API Configuration
  static const String apiBaseUrl = 'http://10.0.2.2:3000/api'; // Android emulator
  // static const String apiBaseUrl = 'http://localhost:3000/api'; // iOS simulator

  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';
  static const String lastSyncKey = 'last_sync_timestamp';

  // OTP Settings
  static const int otpLength = 6;
  static const int otpExpirySeconds = 300;

  // GPS Geofencing
  static const double clinicLatitude = 28.6139;
  static const double clinicLongitude = 77.2090;
  static const double geofenceRadiusMeters = 200;

  // Sync Settings
  static const int syncIntervalSeconds = 60;
  static const int syncBatchSize = 50;

  // App Info
  static const String appName = 'Wait Zero';
  static const String appVersion = '1.0.0';
  static const String appDescription = 'Smart Clinic Booking — No more waiting!';
}
