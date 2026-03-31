/**
 * Helpers Utility Tests
 * Pure unit tests — no mocking needed
 */

const {
  successResponse,
  errorResponse,
  formatDate,
  formatTime,
  getToday,
  minutesDiff,
  generateRandomString,
  isValidPhone,
  sanitize,
} = require('../utils/helpers');

// ─────────────────────────────────────────────────────────────────────────────
describe('successResponse', () => {
  test('sends JSON with success: true and default 200 status', () => {
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res = { status };

    successResponse(res, { message: 'OK', data: [1, 2, 3] });

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ success: true, message: 'OK', data: [1, 2, 3] });
  });

  test('sends a custom status code', () => {
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res = { status };

    successResponse(res, { id: 42 }, 201);

    expect(status).toHaveBeenCalledWith(201);
    expect(json.mock.calls[0][0].success).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('errorResponse', () => {
  test('sends JSON with success: false and default 500 status', () => {
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res = { status };

    errorResponse(res, 'Something went wrong');

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ success: false, message: 'Something went wrong' });
  });

  test('accepts a custom status code', () => {
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res = { status };

    errorResponse(res, 'Not found', 404);

    expect(status).toHaveBeenCalledWith(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('formatDate', () => {
  test('formats a Date object to YYYY-MM-DD', () => {
    expect(formatDate(new Date('2025-06-15T12:30:00Z'))).toBe('2025-06-15');
  });

  test('handles date strings', () => {
    expect(formatDate('2025-12-31')).toBe('2025-12-31');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('formatTime', () => {
  test('extracts HH:MM from HH:MM:SS', () => {
    expect(formatTime('09:30:00')).toBe('09:30');
  });

  test('handles HH:MM input', () => {
    expect(formatTime('14:00')).toBe('14:00');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('getToday', () => {
  test('returns today as YYYY-MM-DD', () => {
    const today = getToday();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(today).toBe(new Date().toISOString().split('T')[0]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('minutesDiff', () => {
  test('calculates 30 minutes difference correctly', () => {
    const start = new Date('2025-06-15T09:00:00Z');
    const end = new Date('2025-06-15T09:30:00Z');
    expect(minutesDiff(start, end)).toBe(30);
  });

  test('returns 0 for same timestamps', () => {
    const t = new Date();
    expect(minutesDiff(t, t)).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('generateRandomString', () => {
  test('generates a string of correct length (default 32 hex chars)', () => {
    const s = generateRandomString();
    expect(typeof s).toBe('string');
    expect(s).toHaveLength(32); // 16 bytes * 2 hex chars/byte
  });

  test('generates unique values', () => {
    expect(generateRandomString()).not.toBe(generateRandomString());
  });

  test('accepts custom byte length', () => {
    expect(generateRandomString(8)).toHaveLength(16); // 8 * 2
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('isValidPhone', () => {
  test('accepts 10-digit phone numbers', () => {
    expect(isValidPhone('9876543210')).toBe(true);
  });

  test('accepts 15-digit phone numbers', () => {
    expect(isValidPhone('919876543210321')).toBe(true);
  });

  test('rejects 9-digit numbers', () => {
    expect(isValidPhone('123456789')).toBe(false);
  });

  test('rejects numbers with letters', () => {
    expect(isValidPhone('98765abc10')).toBe(false);
  });

  test('rejects empty string', () => {
    expect(isValidPhone('')).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('sanitize', () => {
  test('escapes HTML special characters', () => {
    expect(sanitize('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });

  test('escapes ampersands', () => {
    expect(sanitize('A & B')).toBe('A &amp; B');
  });

  test('escapes single quotes', () => {
    expect(sanitize("it's")).toBe("it&#x27;s");
  });

  test('returns non-strings unchanged', () => {
    expect(sanitize(42)).toBe(42);
    expect(sanitize(null)).toBe(null);
  });
});
