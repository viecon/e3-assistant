import type { CourseSection } from './types.js';
import { MoodleClient } from './client.js';
import { getCourseContents } from './courses.js';

export interface CourseFile {
  sectionName: string;
  moduleName: string;
  filename: string;
  fileurl: string;
  filesize: number;
  mimetype?: string;
  timemodified: number;
}

/**
 * List all downloadable files in a course.
 * Tries REST API first (core_course_get_contents), falls back to page scraping.
 */
export async function listCourseFiles(
  client: MoodleClient,
  courseid: number,
  typeFilter?: string[],
): Promise<CourseFile[]> {
  try {
    const sections = await getCourseContents(client, courseid);
    return extractFiles(sections, typeFilter);
  } catch {
    // REST API not available (SSO session mode) - scrape course page
    return scrapeCourseFiles(client, courseid, typeFilter);
  }
}

/**
 * Extract file info from course sections (REST API response).
 */
function extractFiles(
  sections: CourseSection[],
  typeFilter?: string[],
): CourseFile[] {
  const files: CourseFile[] = [];

  for (const section of sections) {
    for (const mod of section.modules) {
      if (!mod.contents) continue;

      for (const content of mod.contents) {
        if (content.type !== 'file') continue;

        if (typeFilter && typeFilter.length > 0) {
          const ext = content.filename.split('.').pop()?.toLowerCase() ?? '';
          if (!typeFilter.includes(ext)) continue;
        }

        files.push({
          sectionName: section.name,
          moduleName: mod.name,
          filename: content.filename,
          fileurl: content.fileurl,
          filesize: content.filesize,
          mimetype: content.mimetype,
          timemodified: content.timemodified,
        });
      }
    }
  }

  return files;
}

/**
 * Scrape course page + expand mod/folder pages to find all downloadable files.
 * Used when REST API is not available (SSO session auth).
 */
async function scrapeCourseFiles(
  client: MoodleClient,
  courseid: number,
  typeFilter?: string[],
): Promise<CourseFile[]> {
  const baseUrl = client.siteUrl;
  const courseHtml = await fetchPage(client, `${baseUrl}/course/view.php?id=${courseid}`);
  if (!courseHtml) return [];

  const files: CourseFile[] = [];
  const seen = new Set<string>();

  function addFile(filename: string, fileurl: string, moduleName: string) {
    if (!filename || filename.endsWith('.ico') || seen.has(fileurl)) return;

    if (typeFilter?.length) {
      const ext = filename.split('.').pop()?.toLowerCase() ?? '';
      if (!typeFilter.includes(ext)) return;
    }

    seen.add(fileurl);
    files.push({
      sectionName: '',
      moduleName,
      filename,
      fileurl,
      filesize: 0,
      mimetype: undefined,
      timemodified: 0,
    });
  }

  // 1. Direct pluginfile links on the course page
  for (const { url, filename } of extractPluginFileLinks(courseHtml)) {
    addFile(filename, url, '');
  }

  // 2. Expand all mod/folder pages
  const folderIds = extractModuleIds(courseHtml, 'folder');
  for (const fid of folderIds) {
    const folderHtml = await fetchPage(client, `${baseUrl}/mod/folder/view.php?id=${fid}`);
    if (!folderHtml) continue;

    const nameMatch = folderHtml.match(/<h2[^>]*>([^<]+)<\/h2>/);
    const folderName = nameMatch?.[1]?.trim() ?? '';

    for (const { url, filename } of extractPluginFileLinks(folderHtml)) {
      addFile(filename, url, folderName);
    }
  }

  // 3. Expand mod/resource pages
  const resourceIds = extractModuleIds(courseHtml, 'resource');
  for (const rid of resourceIds) {
    const resHtml = await fetchPage(client, `${baseUrl}/mod/resource/view.php?id=${rid}`);
    if (!resHtml) continue;

    for (const { url, filename } of extractPluginFileLinks(resHtml)) {
      addFile(filename, url, '');
    }
  }

  return files;
}

function extractPluginFileLinks(html: string): { url: string; filename: string }[] {
  const results: { url: string; filename: string }[] = [];
  const regex = /href="(https?:\/\/[^"]*pluginfile\.php\/[^"]+)"/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const url = match[1];
    const filename = decodeURIComponent(url.split('/').pop()?.split('?')[0] ?? '');
    if (filename) results.push({ url, filename });
  }
  return results;
}

function extractModuleIds(html: string, modtype: string): string[] {
  const regex = new RegExp(`mod/${modtype}/view\\.php\\?id=(\\d+)`, 'g');
  const ids = new Set<string>();
  let match;
  while ((match = regex.exec(html)) !== null) {
    ids.add(match[1]);
  }
  return [...ids];
}

async function fetchPage(client: MoodleClient, url: string): Promise<string | null> {
  try {
    // Use client.downloadFile which handles auth headers
    const buffer = await client.downloadFile(url);
    return buffer.toString('utf-8');
  } catch {
    return null;
  }
}

/**
 * Upload multiple files to a single draft area for assignment submission.
 * Returns the shared itemid.
 */
export async function uploadFiles(
  client: MoodleClient,
  files: { blob: Blob; filename: string }[],
  onProgress?: (uploaded: number, total: number, filename: string) => void,
): Promise<number> {
  if (files.length === 0) throw new Error('No files to upload');

  let itemid = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(i, files.length, file.filename);

    const result = await client.uploadFile(file.blob, file.filename, itemid);
    if (i === 0) {
      itemid = result.itemid;
    }
  }

  onProgress?.(files.length, files.length, 'done');
  return itemid;
}
