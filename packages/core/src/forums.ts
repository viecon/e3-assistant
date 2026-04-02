import type { Forum, ForumDiscussion } from './types.js';
import { MoodleClient } from './client.js';

/**
 * Get all forums in the given courses.
 */
export async function getForums(
  client: MoodleClient,
  courseids: number[],
): Promise<Forum[]> {
  return client.call<Forum[]>('mod_forum_get_forums_by_courses', { courseids });
}

/**
 * Get discussions in a forum.
 */
export async function getForumDiscussions(
  client: MoodleClient,
  forumid: number,
  sortorder: number = -1,
  page: number = 0,
  perpage: number = 10,
): Promise<{ discussions: ForumDiscussion[] }> {
  return client.call<{ discussions: ForumDiscussion[] }>('mod_forum_get_forum_discussions', {
    forumid,
    sortorder,
    page,
    perpage,
  });
}
