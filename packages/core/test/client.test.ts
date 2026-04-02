import { describe, it, expect } from 'vitest';
import { MoodleClient, MoodleApiError } from '../src/client.js';

describe('MoodleClient', () => {
  it('requires token or sessionCookie', () => {
    expect(() => new MoodleClient({})).toThrow('需要提供 token 或 sessionCookie');
  });

  it('creates with token', () => {
    const client = new MoodleClient({ token: 'test-token' });
    expect(client.siteUrl).toBe('https://e3p.nycu.edu.tw');
  });

  it('creates with sessionCookie', () => {
    const client = new MoodleClient({ sessionCookie: 'test-session' });
    expect(client.siteUrl).toBe('https://e3p.nycu.edu.tw');
  });

  it('creates with custom baseUrl', () => {
    const client = new MoodleClient({ token: 'test', baseUrl: 'https://example.com' });
    expect(client.siteUrl).toBe('https://example.com');
  });

  it('getFileUrl appends token for token auth', () => {
    const client = new MoodleClient({ token: 'abc123' });
    const url = client.getFileUrl('https://e3p.nycu.edu.tw/pluginfile.php/123/file.pdf');
    expect(url).toContain('token=abc123');
  });

  it('getFileUrl returns original URL for session auth', () => {
    const client = new MoodleClient({ sessionCookie: 'sess' });
    const url = client.getFileUrl('https://e3p.nycu.edu.tw/pluginfile.php/123/file.pdf');
    expect(url).not.toContain('token=');
  });

  it('getFileUrl handles malformed URLs gracefully', () => {
    const client = new MoodleClient({ token: 'abc' });
    const url = client.getFileUrl('not-a-url');
    expect(url).toContain('token=abc');
  });
});

describe('MoodleApiError', () => {
  it('has correct properties', () => {
    const err = new MoodleApiError('test_code', 'test message', 'test_exception');
    expect(err.errorcode).toBe('test_code');
    expect(err.message).toBe('test message');
    expect(err.exception).toBe('test_exception');
    expect(err.name).toBe('MoodleApiError');
  });
});
