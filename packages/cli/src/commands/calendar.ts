import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getUpcomingEvents } from '@e3/core';
import { printTable, printJson, formatDate, urgencyColor } from '../output.js';
import { createClient } from '../createClient.js';

export function registerCalendarCommand(program: Command): void {
  program
    .command('calendar')
    .description('查看行事曆事件')
    .option('--days <n>', '未來幾天', '7')
    .option('--json', 'JSON 格式輸出')
    .action(async (opts) => {
      try {
        const client = createClient();

        const spinner = ora('取得行事曆...').start();
        const result = await getUpcomingEvents(client, Number(opts.days));
        spinner.stop();

        const events = result.events;

        if (opts.json) {
          printJson(events.map(e => ({
            id: e.id,
            name: e.name,
            course: e.course?.fullname,
            timestart: e.timestart,
            eventtype: e.eventtype,
            overdue: e.overdue,
            url: e.url })));
          return;
        }

        if (events.length === 0) {
          console.log(chalk.green(`未來 ${opts.days} 天沒有事件`));
          return;
        }

        printTable(
          ['日期', '課程', '事件', '類型'],
          events.map(e => {
            const color = urgencyColor(e.timestart);
            return [
              color(formatDate(e.timestart)),
              e.course?.shortname ?? '-',
              e.name,
              e.eventtype,
            ];
          }),
        );
      } catch (err: unknown) {
        console.error(chalk.red(`錯誤: ${err instanceof Error ? err.message : err}`));
        process.exit(1);
      }
    });
}
