import type { MoodleMessage } from './types.js';
import { MoodleClient } from './client.js';

/**
 * Get notifications for a user.
 */
export async function getNotifications(
  client: MoodleClient,
  userid: number,
  limit: number = 20,
): Promise<{ messages: MoodleMessage[] }> {
  return client.call<{ messages: MoodleMessage[] }>('core_message_get_messages', {
    useridto: userid,
    type: 'notifications',
    newestfirst: 1,
    limitnum: limit,
  });
}
