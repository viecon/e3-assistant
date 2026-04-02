import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getEnrolledCourses,
  getPendingAssignmentsViaCalendar,
  getNotifications } from '@e3/core';
import { getUserId } from '../config.js';
import { formatDate, urgencyColor } from '../output.js';
import { createClient } from '../createClient.js';

export function registerStatusCommand(program: Command): void {
  program
    .command('status')
    .description('E3 總覽：未繳作業 + 未讀通知 + 課程數')
    .action(async () => {
      try {
        const client = createClient();

        const spinner = ora('取得總覽...').start();

        const [courses, assignments, notifResult] = await Promise.all([
          getEnrolledCourses(client, 'inprogress'),
          getPendingAssignmentsViaCalendar(client, 30),
          (async () => {
            try {
              const uid = getUserId();
              return await getNotifications(client, uid, 10);
            } catch {
              return { messages: [] };
            }
          })(),
        ]);

        spinner.stop();

        const unreadNotifs = notifResult.messages.filter(m => m.timeread === 0);

        // Header
        console.log(chalk.bold(`\n  E3 總覽\n`));

        // Assignments
        if (assignments.length === 0) {
          console.log(chalk.green('  沒有未繳作業\n'));
        } else {
          console.log(chalk.bold(`  未繳作業 (${assignments.length})`));
          for (const a of assignments) {
            const color = urgencyColor(a.duedate);
            const dueStr = formatDate(a.duedate);
            console.log(`    ${color(dueStr)}  ${a.name}`);
            console.log(`    ${chalk.gray(a.courseShortname)}`);
          }
          console.log('');
        }

        // Notifications
        if (unreadNotifs.length > 0) {
          console.log(chalk.bold(`  未讀通知 (${unreadNotifs.length})`));
          for (const n of unreadNotifs.slice(0, 5)) {
            console.log(`    ${chalk.gray(formatDate(n.timecreated))}  ${n.subject}`);
          }
          if (unreadNotifs.length > 5) {
            console.log(chalk.gray(`    ... 還有 ${unreadNotifs.length - 5} 則`));
          }
          console.log('');
        }

        // Summary line
        console.log(chalk.gray(`  ${courses.length} 門課程 | ${assignments.length} 未繳作業 | ${unreadNotifs.length} 未讀通知\n`));

      } catch (err: unknown) {
        console.error(chalk.red(`錯誤: ${err instanceof Error ? err.message : err}`));
        process.exit(1);
      }
    });
}
