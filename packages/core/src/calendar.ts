import type { CalendarEventsResponse } from './types.js';
import { MoodleClient } from './client.js';

/**
 * Get upcoming calendar events sorted by time.
 */
export async function getUpcomingEvents(
  client: MoodleClient,
  days: number = 7,
): Promise<CalendarEventsResponse> {
  const now = Math.floor(Date.now() / 1000);
  const until = now + days * 24 * 60 * 60;

  return client.call<CalendarEventsResponse>(
    'core_calendar_get_action_events_by_timesort',
    {
      timesortfrom: now,
      timesortto: until,
    },
  );
}
