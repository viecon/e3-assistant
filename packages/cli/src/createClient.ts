import { MoodleClient } from '@e3/core';
import { loadConfig, getBaseUrl, requireAuth } from './config.js';

/**
 * Create an authenticated MoodleClient.
 * Replaces the repeated boilerplate in every CLI command.
 */
export function createClient(): MoodleClient {
  requireAuth();
  const config = loadConfig();
  return new MoodleClient({
    token: config.token,
    sessionCookie: config.session,
    baseUrl: getBaseUrl(),
  });
}
