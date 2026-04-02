import type { Course, CourseSection, CourseUpdateInstance } from './types.js';
import { MoodleClient } from './client.js';

/**
 * Get all courses the user is enrolled in.
 * Uses REST API (token auth).
 */
export async function getUserCourses(client: MoodleClient, userid: number): Promise<Course[]> {
  return client.call<Course[]>('core_enrol_get_users_courses', { userid });
}

/**
 * Get enrolled courses via AJAX-compatible API.
 * Works with session cookie auth (SSO).
 * classification: 'all' | 'inprogress' | 'past' | 'future'
 */
export async function getEnrolledCourses(
  client: MoodleClient,
  classification: string = 'inprogress',
): Promise<{ id: number; fullname: string; shortname: string; viewurl: string; visible: boolean }[]> {
  const result = await client.call<{
    courses: {
      id: number;
      fullname: string;
      shortname: string;
      idnumber: string;
      visible: boolean;
      viewurl: string;
      startdate: number;
      enddate: number;
    }[];
    nextoffset: number;
  }>('core_course_get_enrolled_courses_by_timeline_classification', {
    classification,
    limit: 0,
    offset: 0,
    sort: 'fullname',
  });
  return result.courses;
}

/**
 * Get course content (sections, modules, files).
 * Uses REST API (token auth).
 */
export async function getCourseContents(
  client: MoodleClient,
  courseid: number,
): Promise<CourseSection[]> {
  return client.call<CourseSection[]>('core_course_get_contents', { courseid });
}

/**
 * Get course state via AJAX-compatible API.
 * Returns a JSON string with course structure.
 */
/**
 * Get recent updates for a course since a timestamp.
 */
export async function getCourseUpdates(
  client: MoodleClient,
  courseid: number,
  since: number,
): Promise<{ instances: CourseUpdateInstance[] }> {
  return client.call<{ instances: CourseUpdateInstance[] }>('core_course_get_updates_since', {
    courseid,
    since,
  });
}

