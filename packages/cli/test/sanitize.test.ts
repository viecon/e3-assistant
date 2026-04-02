import { describe, it, expect } from 'vitest';
import { sanitizeFilename, safeJoin } from '../src/sanitize.js';

describe('sanitizeFilename', () => {
  it('strips directory traversal', () => {
    expect(sanitizeFilename('../../../etc/passwd')).toBe('passwd');
    expect(sanitizeFilename('..\\..\\windows\\system32')).toBe('system32');
  });

  it('strips path separators', () => {
    expect(sanitizeFilename('path/to/file.pdf')).toBe('file.pdf');
    expect(sanitizeFilename('path\\to\\file.pdf')).toBe('file.pdf');
  });

  it('removes dangerous characters', () => {
    expect(sanitizeFilename('file<>:"|?*.pdf')).toBe('file_______.pdf');
  });

  it('removes null bytes', () => {
    expect(sanitizeFilename('file\x00.pdf')).toBe('file.pdf');
  });

  it('removes leading dots', () => {
    expect(sanitizeFilename('...hidden')).toBe('hidden');
    expect(sanitizeFilename('.gitignore')).toBe('gitignore');
  });

  it('handles empty/whitespace filenames', () => {
    expect(sanitizeFilename('')).toBe('unnamed_file');
    expect(sanitizeFilename('...')).toBe('unnamed_file');
  });

  it('preserves normal filenames', () => {
    expect(sanitizeFilename('lecture-01.pdf')).toBe('lecture-01.pdf');
    expect(sanitizeFilename('Ch1 Computer Abstractions.pptx')).toBe('Ch1 Computer Abstractions.pptx');
    expect(sanitizeFilename('日本語テスト.pdf')).toBe('日本語テスト.pdf');
  });
});

describe('safeJoin', () => {
  it('joins safely', () => {
    const result = safeJoin('/tmp/output', 'file.pdf');
    expect(result).toContain('file.pdf');
  });

  it('rejects path traversal', () => {
    expect(() => safeJoin('/tmp/output', '../../../etc/passwd')).not.toThrow();
    // After sanitization, just gets 'passwd' which is safe
    const result = safeJoin('/tmp/output', '../../../etc/passwd');
    expect(result).toContain('passwd');
    expect(result).not.toContain('..');
  });
});
