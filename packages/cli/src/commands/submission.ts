import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getSubmissionStatus } from '@e3/core';
import { printJson, formatDate } from '../output.js';
import { stripHtml } from '../html.js';
import { createClient } from '../createClient.js';


export function registerSubmissionCommand(program: Command): void {
  program
    .command('submission <assignment-id>')
    .description('查看作業提交詳情與回饋')
    .option('--json', 'JSON 格式輸出')
    .action(async (assignmentId: string, opts) => {
      try {
        const client = createClient();

        const spinner = ora('取得提交詳情...').start();
        const status = await getSubmissionStatus(client, Number(assignmentId));
        spinner.stop();

        if (opts.json) {
          printJson(status);
          return;
        }

        const sub = status.lastattempt?.submission ?? status.lastattempt?.teamsubmission;
        const feedback = status.feedback;

        // Submission info
        console.log(chalk.bold('提交狀態'));
        if (sub) {
          const statusMap: Record<string, string> = {
            new: chalk.yellow('未提交'),
            draft: chalk.yellow('草稿'),
            submitted: chalk.green('已提交') };
          console.log(`  狀態: ${statusMap[sub.status] ?? sub.status}`);
          if (sub.timemodified) {
            console.log(`  時間: ${formatDate(sub.timemodified)}`);
          }

          // Files
          const filePlugins = sub.plugins?.filter(p => p.fileareas?.length);
          if (filePlugins?.length) {
            console.log(`  檔案:`);
            for (const plugin of filePlugins) {
              for (const area of plugin.fileareas ?? []) {
                for (const file of area.files ?? []) {
                  console.log(`    - ${chalk.cyan(file.filename)}`);
                }
              }
            }
          }

          // Text submission
          const textPlugins = sub.plugins?.filter(p => p.editorfields?.length);
          if (textPlugins?.length) {
            for (const plugin of textPlugins) {
              for (const field of plugin.editorfields ?? []) {
                if (field.text) {
                  console.log(`  文字提交:`);
                  const text = stripHtml(field.text);
                  const lines = text.split('\n').slice(0, 5);
                  for (const line of lines) {
                    console.log(`    ${line}`);
                  }
                }
              }
            }
          }
        } else {
          console.log(`  狀態: ${chalk.gray('尚未提交')}`);
        }

        // Grading & feedback
        if (feedback) {
          console.log('');
          console.log(chalk.bold('成績與回饋'));
          if (feedback.gradefordisplay) {
            console.log(`  成績: ${chalk.bold(stripHtml(feedback.gradefordisplay))}`);
          }
          if (feedback.gradeddate) {
            console.log(`  評分時間: ${formatDate(feedback.gradeddate)}`);
          }
        }

        // Additional info
        if (status.lastattempt) {
          console.log('');
          console.log(chalk.bold('其他'));
          console.log(`  可編輯: ${status.lastattempt.canedit ? chalk.green('是') : chalk.red('否')}`);
          console.log(`  可提交: ${status.lastattempt.cansubmit ? chalk.green('是') : chalk.red('否')}`);
          if (status.lastattempt.locked) {
            console.log(`  鎖定: ${chalk.red('是')}`);
          }
        }
      } catch (err: unknown) {
        console.error(chalk.red(`錯誤: ${err instanceof Error ? err.message : err}`));
        process.exit(1);
      }
    });
}
