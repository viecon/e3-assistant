import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';

interface E3Config {
  /** Moodle web service token (from /user/managetoken.php) */
  token?: string;
  /** MoodleSession cookie value (from browser) */
  session?: string;
  /** Auth mode */
  authMode?: 'token' | 'session';
  userid?: number;
  fullname?: string;
  sesskey?: string;
  baseUrl?: string;
}

const CONFIG_PATH = join(homedir(), '.e3rc.json');

export function loadConfig(): E3Config {
  try {
    const raw = readFileSync(CONFIG_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveConfig(config: E3Config): void {
  mkdirSync(dirname(CONFIG_PATH), { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

export function clearConfig(): void {
  saveConfig({});
}

export function getAuthHeaders(): Record<string, string> {
  const config = loadConfig();

  if (config.authMode === 'session' && config.session) {
    return { Cookie: `MoodleSession=${config.session}` };
  }

  return {};
}

export function getToken(): string | null {
  const config = loadConfig();
  return config.token ?? null;
}

export function getSession(): string | null {
  const config = loadConfig();
  return config.session ?? null;
}

export function getSesskey(): string | null {
  const config = loadConfig();
  return config.sesskey ?? null;
}

export function getUserId(): number {
  const config = loadConfig();
  if (!config.userid) {
    throw new Error('尚未登入。請先執行 `e3 login`');
  }
  return config.userid;
}

export function getBaseUrl(): string {
  const config = loadConfig();
  return config.baseUrl ?? 'https://e3p.nycu.edu.tw';
}

export function requireAuth(): void {
  const config = loadConfig();
  if (!config.token && !config.session) {
    throw new Error(
      '尚未登入。請使用以下方式登入：\n' +
      '  e3 login --session <MoodleSession cookie>  (從瀏覽器複製)\n' +
      '  e3 login --token <token>                    (從 E3 安全金鑰頁面取得)',
    );
  }
}
