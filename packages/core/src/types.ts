// ===== Moodle API Response Types =====

export interface MoodleToken {
  token: string;
  privatetoken?: string;
}

export interface MoodleError {
  exception: string;
  errorcode: string;
  message: string;
}

export interface SiteInfo {
  sitename: string;
  username: string;
  firstname: string;
  lastname: string;
  fullname: string;
  lang: string;
  userid: number;
  siteurl: string;
  userpictureurl: string;
  functions?: { name: string; version: string }[];
}

// ===== Course =====

export interface Course {
  id: number;
  shortname: string;
  fullname: string;
  displayname: string;
  enrolledusercount: number;
  idnumber: string;
  visible: number;
  summary: string;
  summaryformat: number;
  format: string;
  showgrades: boolean;
  lang: string;
  enablecompletion: boolean;
  completionhascriteria: boolean;
  completionusertracked: boolean;
  category: number;
  progress: number | null;
  completed: boolean;
  startdate: number;
  enddate: number;
  marker: number;
  lastaccess: number;
  isfavourite: boolean;
  hidden: boolean;
  overviewfiles: FileInfo[];
}

// ===== Course Content =====

export interface CourseSection {
  id: number;
  name: string;
  visible: number;
  summary: string;
  summaryformat: number;
  section: number;
  hiddenbynumsections: number;
  uservisible: boolean;
  modules: CourseModule[];
}

export interface CourseModule {
  id: number;
  url?: string;
  name: string;
  instance: number;
  contextid: number;
  description?: string;
  visible: number;
  uservisible: boolean;
  visibleoncoursepage: number;
  modicon: string;
  modname: string;
  modplural: string;
  indent: number;
  onclick: string;
  afterlink: string | null;
  customdata: string;
  noviewlink: boolean;
  completion: number;
  completiondata?: {
    state: number;
    timecompleted: number;
    overrideby: number | null;
    valueused: boolean;
  };
  contents?: FileInfo[];
}

export interface FileInfo {
  type: string;
  filename: string;
  filepath: string;
  filesize: number;
  fileurl: string;
  timecreated: number;
  timemodified: number;
  sortorder: number;
  mimetype?: string;
  isexternalfile: boolean;
  userid: number | null;
  author: string | null;
  license: string | null;
}

// ===== Assignments =====

export interface AssignmentCourse {
  id: number;
  fullname: string;
  shortname: string;
  timemodified: number;
  assignments: Assignment[];
}

export interface Assignment {
  id: number;
  cmid: number;
  course: number;
  name: string;
  nosubmissions: number;
  submissiondrafts: number;
  sendnotifications: number;
  sendlatenotifications: number;
  sendstudentnotifications: number;
  duedate: number;
  allowsubmissionsfromdate: number;
  grade: number;
  timemodified: number;
  completionsubmit: number;
  cutoffdate: number;
  gradingduedate: number;
  teamsubmission: number;
  requireallteammemberssubmit: number;
  teamsubmissiongroupingid: number;
  blindmarking: number;
  hidegrader: number;
  revealidentities: number;
  attemptreopenmethod: string;
  maxattempts: number;
  markingworkflow: number;
  markingallocation: number;
  requiresubmissionstatement: number;
  preventsubmissionnotingroup: number;
  configs: { plugin: string; subtype: string; name: string; value: string }[];
  intro: string;
  introformat: number;
  introfiles: FileInfo[];
  introattachments: FileInfo[];
}

export interface SubmissionStatus {
  lastattempt?: {
    submission?: Submission;
    teamsubmission?: Submission | null;
    submissiongroupmemberswhoneedtosubmit?: unknown[];
    submissionsenabled: boolean;
    locked: boolean;
    graded: boolean;
    canedit: boolean;
    caneditowner: boolean;
    cansubmit: boolean;
    extensionduedate: number;
    blindmarking: boolean;
    gradingstatus: string;
    usergroups: unknown[];
  };
  feedback?: {
    grade?: {
      userid: number;
      grade: string;
      grader: number;
      timemodified: number;
    };
    gradefordisplay: string;
    gradeddate: number;
  };
}

export interface Submission {
  id: number;
  userid: number;
  attemptnumber: number;
  timecreated: number;
  timemodified: number;
  status: 'new' | 'draft' | 'submitted';
  groupid: number;
  assignment: number;
  latest: number;
  plugins: SubmissionPlugin[];
}

export interface SubmissionPlugin {
  type: string;
  name: string;
  fileareas?: { area: string; files: FileInfo[] }[];
  editorfields?: { name: string; description: string; text: string; format: number }[];
}

// ===== Upload =====

export interface UploadResult {
  component: string;
  contextid: number;
  userid: number;
  filearea: string;
  filename: string;
  filepath: string;
  itemid: number;
  license: string;
  author: string;
  source: string;
}

// ===== Calendar =====

export interface CalendarEvent {
  id: number;
  name: string;
  description: string;
  descriptionformat: number;
  location: string;
  categoryid: number | null;
  groupid: number | null;
  userid: number;
  repeatid: number | null;
  eventcount: number | null;
  component: string;
  modulename: string;
  activityname: string;
  activitystr: string;
  instance: number;
  eventtype: string;
  timestart: number;
  timeduration: number;
  timesort: number;
  timeusermidnight: number;
  visible: number;
  timemodified: number;
  overdue: boolean;
  icon: { key: string; component: string; alttext: string; iconurl: string; iconclass: string };
  course?: { id: number; fullname: string; shortname: string };
  url: string;
  action?: { name: string; url: string; itemcount: number; actionable: boolean; showitemcount: boolean };
}

export interface CalendarEventsResponse {
  events: CalendarEvent[];
  firstid: number;
  lastid: number;
}

// ===== Grades =====

export interface GradeItem {
  id: number;
  itemname: string;
  itemtype: string;
  itemmodule: string;
  iteminstance: number;
  itemnumber: number | null;
  idnumber: string;
  categoryid: number;
  outcomeid: number | null;
  scaleid: number | null;
  locked: boolean;
  cmid: number;
  weightraw: number | null;
  weightformatted: string;
  graderaw: number | null;
  gradedatesubmitted: number;
  gradedategraded: number;
  gradehiddenbydate: boolean;
  gradeneedsupdate: boolean;
  gradeishidden: boolean;
  gradeisoverridden: boolean;
  gradeformatted: string;
  grademin: number;
  grademax: number;
  rangeformatted: string;
  percentageformatted: string;
  feedback: string;
  feedbackformat: number;
}

export interface UserGradeReport {
  courseid: number;
  courseidnumber: string;
  userid: number;
  userfullname: string;
  useridnumber: string;
  maxdepth: number;
  gradeitems: GradeItem[];
}

// ===== Enriched types (for UI) =====

export interface PendingAssignment {
  id: number;
  cmid: number;
  courseId: number;
  courseName: string;
  courseShortname: string;
  name: string;
  duedate: number;
  intro: string;
  submissionStatus: 'new' | 'draft' | 'submitted' | 'unknown';
  isOverdue: boolean;
}

// ===== Forums =====

export interface Forum {
  id: number;
  course: number;
  type: string; // 'news' | 'general' | 'qanda' | etc.
  name: string;
  intro: string;
  introformat: number;
}

export interface ForumDiscussion {
  id: number;
  name: string;
  groupid: number;
  timemodified: number;
  usermodified: number;
  timestart: number;
  timeend: number;
  discussion: number;
  parent: number;
  userid: number;
  created: number;
  modified: number;
  mailed: number;
  subject: string;
  message: string;
  messageformat: number;
  messagetrust: number;
  attachment: boolean;
  totalscore: number;
  userfullname: string;
  userpictureurl: string;
  numreplies: number;
  pinned: boolean;
}

// ===== Notifications =====

export interface MoodleMessage {
  id: number;
  useridfrom: number;
  useridto: number;
  subject: string;
  text: string;
  fullmessage: string;
  fullmessageformat: number;
  fullmessagehtml: string;
  smallmessage: string;
  notification: number;
  contexturl: string;
  contexturlname: string;
  timecreated: number;
  timeread: number;
  usertofullname: string;
  userfromfullname: string;
}

// ===== Course Updates =====

export interface CourseUpdateInstance {
  contextlevel: string;
  id: number;
  updates: { name: string; timeupdated?: number; itemids?: number[] }[];
}
