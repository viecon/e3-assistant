import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { MoodleClient, getEnrolledCourses } from '@e3/core';
import { loadConfig, getBaseUrl, requireAuth } from '../config.js';
import { printTable, printJson } from '../output.js';
import { createClient } from '../createClient.js';

export function registerCoursesCommand(program: Command): void {
  program
    .command('courses')
    .description('列出所有選修課程')
    .option('--all', '列出所有課程（含已結束）')
    .option('--json', 'JSON 格式輸出')
    .action(async (opts) => {
      try {
        const client = createClient();

        const spinner = ora('取得課程列表...').start();
        const classification = opts.all ? 'all' : 'inprogress';
        const courses = await getEnrolledCourses(client, classification);
        spinner.stop();

        if (opts.json) {
          printJson(courses.map(c => ({
            id: c.id,
            shortname: c.shortname,
            fullname: c.fullname,
          })));
          return;
        }

        if (courses.length === 0) {
          console.log(chalk.yellow('沒有找到課程'));
          return;
        }

        printTable(
          ['ID', '課程代碼', '課程名稱'],
          courses.map(c => [
            String(c.id),
            c.shortname,
            c.fullname,
          ]),
        );
      } catch (err: unknown) {
        console.error(chalk.red(`錯誤: ${err instanceof Error ? err.message : err}`));
        process.exit(1);
      }
    });
}
