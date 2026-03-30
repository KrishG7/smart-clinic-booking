import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:wait_zero_app/services/auth_service.dart';
import 'package:wait_zero_app/utils/constants.dart';

// Manual mock for the secure storage vault to intercept read/write keys
class MockFlutterSecureStorage extends FlutterSecureStorage {
  final Map<String, String> _storage = {};

  @override
  Future<void> write(
      {required String key,
      required String? value,
      AppleOptions? iOptions,
      AndroidOptions? aOptions,
      LinuxOptions? lOptions,
      WebOptions? webOptions,
      AppleOptions? mOptions,
      WindowsOptions? wOptions}) async {
    if (value != null) {
      _storage[key] = value;
    }
  }

  @override
  Future<String?> read(
      {required String key,
      AppleOptions? iOptions,
      AndroidOptions? aOptions,
      LinuxOptions? lOptions,
      WebOptions? webOptions,
      AppleOptions? mOptions,
      WindowsOptions? wOptions}) async {
    return _storage[key];
  }

  @override
  Future<void> delete(
      {required String key,
      AppleOptions? iOptions,
      AndroidOptions? aOptions,
      LinuxOptions? lOptions,
      WebOptions? webOptions,
      AppleOptions? mOptions,
      WindowsOptions? wOptions}) async {
    _storage.remove(key);
  }
}

void main() {
  group('AuthService Secure Storage Vulnerability Patch', () {
    late AuthService authService;
    late MockFlutterSecureStorage mockStorage;

    setUp(() {
      mockStorage = MockFlutterSecureStorage();
      authService = AuthService();
      authService.setStorageForTesting(mockStorage);
    });

    test('1. Validated JWTs securely route entirely to the AES Vault via saveSessionCache', () async {
      // Act
      final dummyUser = {'id': 99, 'name': 'Patient Alpha'};
      final dummyToken = 'eyJhbGciOiJIUzI1NiIsIn...';
      
      await authService.saveSessionCache(dummyToken, dummyUser);

      // Assert
      final tokenStored = await mockStorage.read(key: AppConstants.tokenKey);
      final userStored = await mockStorage.read(key: AppConstants.userKey);

      expect(tokenStored, equals(dummyToken), reason: 'Token must be securely stored');
      expect(userStored != null, true, reason: 'User JSON must be securely stored');
      
      final decodedUser = jsonDecode(userStored!);
      expect(decodedUser['name'], equals('Patient Alpha'));
    });

    test('2. Token retrieval directly abstracts from secure storage correctly', () async {
      await mockStorage.write(key: AppConstants.tokenKey, value: 'test_123_token');
      final fetchedToken = await authService.getToken();
      
      expect(fetchedToken, equals('test_123_token'), reason: 'getToken must proxy the vault');
      expect(await authService.isLoggedIn(), isTrue);
    });

    test('3. Logging out aggressively terminates session vault keys', () async {
      // Prep
      await authService.saveSessionCache('token_xyz', {'id': 1});
      expect(await mockStorage.read(key: AppConstants.tokenKey), equals('token_xyz'));

      // Burn
      await authService.logout();

      // Verify
      expect(await mockStorage.read(key: AppConstants.tokenKey), isNull);
      expect(await mockStorage.read(key: AppConstants.userKey), isNull);
      expect(await authService.isLoggedIn(), isFalse);
    });
  });
}
