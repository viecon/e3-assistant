import Table from 'cli-table3';
import chalk from 'chalk';

export function formatDate(timestamp: number): string {
  if (timestamp === 0) return '無期限';
  return new Date(timestamp * 1000).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function urgencyColor(duedate: number): (text: string) => string {
  if (duedate === 0) return chalk.gray;
  const now = Date.now() / 1000;
  const hoursLeft = (duedate - now) / 3600;
  if (hoursLeft < 0) return chalk.red;
  if (hoursLeft < 24) return chalk.red;
  if (hoursLeft < 72) return chalk.yellow;
  return chalk.green;
}

export function printTable(headers: string[], rows: string[][]): void {
  const table = new Table({
    head: headers.map(h => chalk.bold.cyan(h)),
    style: { head: [], border: [] },
  });
  rows.forEach(row => table.push(row));
  console.log(table.toString());
}

export function printJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}
