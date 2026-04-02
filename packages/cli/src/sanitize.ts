import { basename, join, resolve } from 'node:path';

/**
 * Sanitize a filename to prevent path traversal.
 * Strips directory components, removes dangerous characters.
 */
export function sanitizeFilename(filename: string): string {
  // Normalize path separators then extract just the filename
  let safe = basename(filename.replace(/\\/g, '/'));

  // Remove null bytes
  safe = safe.replace(/\0/g, '');

  // Remove Windows-reserved characters
  safe = safe.replace(/[<>:"|?*]/g, '_');

  // Collapse multiple dots at start (e.g., "...hidden" → "hidden")
  safe = safe.replace(/^\.+/, '');

  // Fallback for empty filenames
  if (!safe) safe = 'unnamed_file';

  return safe;
}

/**
 * Join a directory and filename safely.
 * Ensures the resulting path is within the target directory.
 */
export function safeJoin(dir: string, filename: string): string {
  const safe = sanitizeFilename(filename);
  const result = join(dir, safe);

  // Verify the resolved path is still under the target directory
  const resolvedDir = resolve(dir);
  const resolvedResult = resolve(result);
  if (!resolvedResult.startsWith(resolvedDir)) {
    throw new Error(`Path traversal detected: ${filename}`);
  }

  return result;
}
