import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getPendingAssignmentsViaCalendar } from '@e3/core';
import { printTable, printJson, formatDate, urgencyColor } from '../output.js';
import { createClient } from '../createClient.js';

export function registerAssignmentsCommand(program: Command): void {
  program
    .command('assignments')
    .description('列出未完成作業')
    .option('--days <n>', '查詢未來幾天的作業', '60')
    .option('--json', 'JSON 格式輸出')
    .action(async (opts) => {
      try {
        const client = createClient();

        const spinner = ora('取得作業列表...').start();
        const pending = await getPendingAssignmentsViaCalendar(client, Number(opts.days));
        spinner.stop();

        if (opts.json) {
          printJson(pending);
          return;
        }

        if (pending.length === 0) {
          console.log(chalk.green('🎉 沒有未完成的作業！'));
          return;
        }

        printTable(
          ['ID', '課程', '作業名稱', '截止日期', '狀態'],
          pending.map(a => {
            const color = urgencyColor(a.duedate);
            return [
              String(a.id),
              a.courseShortname,
              a.name,
              color(formatDate(a.duedate)),
              a.isOverdue ? chalk.red('逾期') : chalk.yellow('未繳'),
            ];
          }),
        );
      } catch (err: unknown) {
        console.error(chalk.red(`錯誤: ${err instanceof Error ? err.message : err}`));
        process.exit(1);
      }
    });
}
