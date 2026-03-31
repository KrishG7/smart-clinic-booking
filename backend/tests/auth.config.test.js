/**
 * Auth Config Tests
 * Tests JWT token generation and verification
 */

const { generateToken, verifyToken, ROLES, TOKEN_STATUS, SYNC_STATUS } = require('../config/auth');

// ─────────────────────────────────────────────────────────────────────────────
describe('generateToken', () => {
  test('generates a valid JWT string', () => {
    const token = generateToken({ id: 1, phone: '9876543210', role: 'patient', name: 'Test' });
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
  });

  test('encodes payload correctly', () => {
    const payload = { id: 42, phone: '9876543210', role: 'doctor', name: 'Dr Smith' };
    const token = generateToken(payload);
    const decoded = verifyToken(token);

    expect(decoded.id).toBe(42);
    expect(decoded.phone).toBe('9876543210');
    expect(decoded.role).toBe('doctor');
    expect(decoded.name).toBe('Dr Smith');
  });

  test('generates different tokens for different users', () => {
    const t1 = generateToken({ id: 1, phone: '1111111111', role: 'patient', name: 'A' });
    const t2 = generateToken({ id: 2, phone: '2222222222', role: 'doctor',  name: 'B' });
    expect(t1).not.toBe(t2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('verifyToken', () => {
  test('verifies a valid token', () => {
    const token = generateToken({ id: 1, phone: '9876543210', role: 'patient', name: 'Test' });
    expect(() => verifyToken(token)).not.toThrow();
  });

  test('throws on invalid token', () => {
    expect(() => verifyToken('this.is.invalid')).toThrow('Invalid or expired token');
  });

  test('throws on tampered token', () => {
    const token = generateToken({ id: 1, phone: '9876543210', role: 'patient', name: 'Test' });
    const tampered = token.slice(0, -5) + 'XXXXX';
    expect(() => verifyToken(tampered)).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ROLES', () => {
  test('defines all expected roles', () => {
    expect(ROLES.PATIENT).toBe('patient');
    expect(ROLES.DOCTOR).toBe('doctor');
    expect(ROLES.STAFF).toBe('staff');
    expect(ROLES.ADMIN).toBe('admin');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('TOKEN_STATUS', () => {
  test('defines all queue statuses', () => {
    expect(TOKEN_STATUS.WAITING).toBe('waiting');
    expect(TOKEN_STATUS.IN_PROGRESS).toBe('in_progress');
    expect(TOKEN_STATUS.COMPLETED).toBe('completed');
    expect(TOKEN_STATUS.SKIPPED).toBe('skipped');
    expect(TOKEN_STATUS.CANCELLED).toBe('cancelled');
    expect(TOKEN_STATUS.EMERGENCY).toBe('emergency');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('SYNC_STATUS', () => {
  test('defines all sync status values', () => {
    expect(SYNC_STATUS.SYNCED).toBe('synced');
    expect(SYNC_STATUS.PENDING).toBe('pending');
    expect(SYNC_STATUS.CONFLICT).toBe('conflict');
    expect(SYNC_STATUS.FAILED).toBe('failed');
  });
});
