import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

/// Local Database Service (SQLite)
/// Provides offline data storage for appointments and sync queue
class LocalDbService {
  static final LocalDbService _instance = LocalDbService._internal();
  factory LocalDbService() => _instance;
  LocalDbService._internal();

  Database? _database;

  /// Get database instance (lazy initialization)
  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB();
    return _database!;
  }

  /// Initialize the local SQLite database
  Future<Database> _initDB() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, 'wait_zero_local.db');

    return await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        // Local appointments table
        await db.execute('''
          CREATE TABLE appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            server_id INTEGER,
            patient_id INTEGER,
            doctor_id INTEGER,
            appointment_date TEXT,
            appointment_time TEXT,
            token_no INTEGER,
            status TEXT DEFAULT 'booked',
            type TEXT DEFAULT 'regular',
            reason TEXT,
            sync_status TEXT DEFAULT 'pending',
            local_id TEXT UNIQUE,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        ''');

        // Local tokens table
        await db.execute('''
          CREATE TABLE tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            server_id INTEGER,
            doctor_id INTEGER,
            patient_id INTEGER,
            token_number INTEGER,
            token_date TEXT,
            status TEXT DEFAULT 'waiting',
            type TEXT DEFAULT 'regular',
            estimated_wait_minutes INTEGER DEFAULT 0,
            queue_position INTEGER DEFAULT 0
          )
        ''');

        // Sync queue
        await db.execute('''
          CREATE TABLE sync_queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_name TEXT NOT NULL,
            local_id TEXT NOT NULL,
            operation TEXT NOT NULL,
            data TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        ''');
      },
    );
  }

  /// Save an appointment locally (for offline booking)
  Future<int> saveAppointment(Map<String, dynamic> appointment) async {
    final db = await database;
    return await db.insert('appointments', appointment);
  }

  /// Get all locally stored appointments
  Future<List<Map<String, dynamic>>> getAppointments() async {
    final db = await database;
    return await db.query('appointments', orderBy: 'created_at DESC');
  }

  /// Get pending sync records
  Future<List<Map<String, dynamic>>> getPendingSync() async {
    final db = await database;
    return await db.query(
      'appointments',
      where: 'sync_status = ?',
      whereArgs: ['pending'],
    );
  }

  /// Update sync status after successful sync
  Future<void> updateSyncStatus(String localId, String status, {int? serverId}) async {
    final db = await database;
    final updates = <String, dynamic>{'sync_status': status};
    if (serverId != null) updates['server_id'] = serverId;

    await db.update(
      'appointments',
      updates,
      where: 'local_id = ?',
      whereArgs: [localId],
    );
  }

  /// Add item to sync queue
  Future<void> addToSyncQueue(String tableName, String localId, String operation, String data) async {
    final db = await database;
    await db.insert('sync_queue', {
      'table_name': tableName,
      'local_id': localId,
      'operation': operation,
      'data': data,
      'status': 'pending',
    });
  }

  /// Get pending sync queue items
  Future<List<Map<String, dynamic>>> getSyncQueue() async {
    final db = await database;
    return await db.query('sync_queue', where: 'status = ?', whereArgs: ['pending']);
  }

  /// Clear sync queue after successful sync
  Future<void> clearSyncQueue() async {
    final db = await database;
    await db.delete('sync_queue', where: 'status = ?', whereArgs: ['synced']);
  }

  /// Close database
  Future<void> close() async {
    final db = await database;
    await db.close();
  }
}
