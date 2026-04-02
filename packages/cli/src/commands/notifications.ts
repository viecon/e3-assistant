import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getNotifications } from '@e3/core';
import { getUserId } from '../config.js';
import { printJson, formatDate } from '../output.js';
import { stripHtml } from '../html.js';
import { createClient } from '../createClient.js';


export function registerNotificationsCommand(program: Command): void {
  program
    .command('notifications')
    .description('查看 E3 系統通知')
    .option('--limit <n>', '顯示幾則', '20')
    .option('--json', 'JSON 格式輸出')
    .action(async (opts) => {
      try {
        const client = createClient();
        const userid = getUserId();

        const spinner = ora('取得通知...').start();
        const result = await getNotifications(client, userid, Number(opts.limit));
        spinner.stop();

        const messages = result.messages;

        if (opts.json) {
          printJson(messages.map(m => ({
            id: m.id,
            subject: m.subject,
            message: stripHtml(m.smallmessage || m.fullmessagehtml || m.text),
            from: m.userfromfullname,
            time: m.timecreated,
            read: m.timeread > 0,
            url: m.contexturl })));
          return;
        }

        if (messages.length === 0) {
          console.log(chalk.gray('沒有通知'));
          return;
        }

        for (const m of messages) {
          const read = m.timeread > 0;
          const prefix = read ? chalk.gray('  ') : chalk.blue('* ');
          const subject = read ? chalk.gray(m.subject) : chalk.bold(m.subject);
          const time = chalk.gray(formatDate(m.timecreated));

          console.log(`${prefix}${time} ${subject}`);

          const body = stripHtml(m.smallmessage || m.fullmessagehtml || m.text);
          if (body) {
            const firstLine = body.split('\n')[0].slice(0, 80);
            console.log(`   ${chalk.gray(firstLine)}`);
          }
        }
      } catch (err: unknown) {
        console.error(chalk.red(`錯誤: ${err instanceof Error ? err.message : err}`));
        process.exit(1);
      }
    });
}
