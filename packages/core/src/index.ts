// Core client
export { MoodleClient, MoodleApiError } from './client.js';
export type { MoodleClientOptions } from './client.js';

// Auth
export { getSiteInfo } from './auth.js';

// Courses
export { getUserCourses, getEnrolledCourses, getCourseContents, getCourseState } from './courses.js';

// Assignments
export {
  getAssignments,
  getSubmissionStatus,
  saveSubmission,
  getPendingAssignments,
  getPendingAssignmentsViaCalendar,
} from './assignments.js';

// Files
export { listCourseFiles, uploadFiles } from './files.js';
export type { CourseFile } from './files.js';

// Calendar
export { getUpcomingEvents } from './calendar.js';

// Grades
export { getCourseGrades, getAllGrades } from './grades.js';

// Types
export type * from './types.js';
