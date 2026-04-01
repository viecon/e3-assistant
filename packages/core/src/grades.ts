import type { UserGradeReport } from './types.js';
import { MoodleClient } from './client.js';

/**
 * Get grade items for a specific course.
 */
export async function getCourseGrades(
  client: MoodleClient,
  courseid: number,
  userid: number,
): Promise<UserGradeReport> {
  const result = await client.call<{ usergrades: UserGradeReport[] }>(
    'gradereport_user_get_grade_items',
    { courseid, userid },
  );
  return result.usergrades[0];
}

/**
 * Get grade overview for all courses.
 */
export async function getAllGrades(
  client: MoodleClient,
  userid: number,
): Promise<{ grades: { courseid: number; grade: string; rawgrade: string }[] }> {
  return client.call('gradereport_overview_get_course_grades', { userid });
}
