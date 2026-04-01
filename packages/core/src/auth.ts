import type { SiteInfo } from './types.js';
import { MoodleClient } from './client.js';

/**
 * Validate connection and get site/user info.
 * Works with both token and session auth.
 */
export async function getSiteInfo(client: MoodleClient): Promise<SiteInfo> {
  return client.call<SiteInfo>('core_webservice_get_site_info');
}
