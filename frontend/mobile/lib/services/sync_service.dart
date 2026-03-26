import 'dart:convert';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'api_service.dart';
import 'local_db_service.dart';
import 'auth_service.dart';
import '../utils/constants.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Sync Service (UC-02: Background Data Synchronization)
/// Manages automatic sync between local SQLite and cloud MySQL
class SyncService {
  static final SyncService _instance = SyncService._internal();
  factory SyncService() => _instance;
  SyncService._internal();

  final _localDb = LocalDbService();
  final _api = ApiService();
  bool _isSyncing = false;

  /// Check connectivity and sync if online
  Future<void> syncIfOnline() async {
    final connectivityResult = await Connectivity().checkConnectivity();

    if (connectivityResult != ConnectivityResult.none && !_isSyncing) {
      await pushSync();
      await pullSync();
    }
  }

  /// Push local pending data to server
  Future<Map<String, dynamic>> pushSync() async {
    if (_isSyncing) return {'status': 'already_syncing'};
    _isSyncing = true;

    try {
      // Get pending appointments from local DB
      final pendingRecords = await _localDb.getPendingSync();

      if (pendingRecords.isEmpty) {
        _isSyncing = false;
        return {'status': 'nothing_to_sync', 'count': 0};
      }

      // Convert to sync format
      final appointments = pendingRecords.map((record) => {
        'localId': record['local_id'],
        'patientId': record['patient_id'],
        'doctorId': record['doctor_id'],
        'appointmentDate': record['appointment_date'],
        'appointmentTime': record['appointment_time'],
        'type': record['type'],
        'reason': record['reason'],
        'status': record['status'],
        'updatedAt': record['created_at'],
      }).toList();

      // Push to server
      final result = await _api.post('/sync/push', {
        'appointments': appointments,
        'deviceId': 'flutter_mobile_app',
      });

      // Update local sync status
      if (result['success'] == true) {
        final syncedItems = result['results']?['synced'] ?? [];
        for (var item in syncedItems) {
          await _localDb.updateSyncStatus(
            item['localId'],
            'synced',
            serverId: item['serverId'],
          );
        }

        // Save last sync timestamp
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(AppConstants.lastSyncKey, DateTime.now().toIso8601String());
      }

      _isSyncing = false;
      return result;
    } catch (e) {
      _isSyncing = false;
      return {'status': 'error', 'message': e.toString()};
    }
  }

  /// Pull server data to local device
  Future<Map<String, dynamic>> pullSync() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final lastSync = prefs.getString(AppConstants.lastSyncKey);

      String endpoint = '/sync/pull';
      if (lastSync != null) {
        endpoint += '?since=$lastSync';
      }

      final result = await _api.get(endpoint);
      return result;
    } catch (e) {
      return {'status': 'error', 'message': e.toString()};
    }
  }

  /// Start periodic sync (call from app initialization)
  void startPeriodicSync() {
    // Listen for connectivity changes
    Connectivity().onConnectivityChanged.listen((result) {
      if (result != ConnectivityResult.none) {
        syncIfOnline();
      }
    });
  }

  /// Get current sync status
  Future<Map<String, dynamic>> getSyncStatus() async {
    final pending = await _localDb.getPendingSync();
    final prefs = await SharedPreferences.getInstance();
    final lastSync = prefs.getString(AppConstants.lastSyncKey);

    return {
      'pendingCount': pending.length,
      'lastSync': lastSync,
      'isSyncing': _isSyncing,
    };
  }
}
