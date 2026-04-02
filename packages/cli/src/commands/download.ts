import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { MoodleClient, listCourseFiles, getEnrolledCourses } from '@e3/core';
import { loadConfig, getBaseUrl, requireAuth } from '../config.js';
import { formatFileSize, printJson } from '../output.js';
import { safeJoin } from '../sanitize.js';
import { createClient } from '../createClient.js';

export function registerDownloadCommand(program: Command): void {
  program
    .command('download [course-id]')
    .description('下載課程教材')
    .option('--all', '下載所有課程的教材')
    .option('--type <types>', '檔案類型篩選，逗號分隔 (例: pdf,pptx,docx)')
    .option('-o, --output <dir>', '輸出目錄', '.')
    .option('--list', '只列出檔案，不下載')
    .option('--skip-existing', '跳過已存在的檔案')
    .option('--json', 'JSON 格式輸出')
    .action(async (courseId: string | undefined, opts) => {
      try {
        const client = createClient();

        if (!courseId && !opts.all) {
          console.error(chalk.red('請指定課程 ID 或使用 --all 下載全部'));
          process.exit(1);
        }

        const typeFilter = opts.type?.split(',').map((t: string) => t.trim().toLowerCase());

        // Get course list
        const courses = await getEnrolledCourses(client, 'inprogress');
        const targetCourses = opts.all
          ? courses
          : courses.filter(c => c.id === Number(courseId));

        if (targetCourses.length === 0 && courseId) {
          targetCourses.push({ id: Number(courseId), shortname: `course_${courseId}`, fullname: `Course ${courseId}`, viewurl: '', visible: true });
        }

        let totalDownloaded = 0;
        let totalSkipped = 0;
        let totalFailed = 0;

        for (const course of targetCourses) {
          const folderName = course.shortname.replace(/[<>:"/\\|?*]/g, '_');
          const outputDir = join(opts.output, folderName);

          const spinner = ora(`[${course.shortname}] 取得教材列表...`).start();
          let files;
          try {
            files = await listCourseFiles(client, course.id, typeFilter);
          } catch {
            spinner.fail(`[${course.shortname}] 無法取得教材`);
            continue;
          }

          if (files.length === 0) {
            spinner.info(`[${course.shortname}] 沒有教材`);
            continue;
          }

          if (opts.list) {
            spinner.stop();
            console.log(chalk.bold(`\n[${course.shortname}] ${files.length} 個檔案:`));
            for (const f of files) {
              console.log(`  ${chalk.cyan(f.filename)} ${chalk.gray(formatFileSize(f.filesize))}`);
            }
            continue;
          }

          if (opts.json) {
            spinner.stop();
            printJson(files.map(f => ({ ...f, course: course.shortname })));
            continue;
          }

          mkdirSync(outputDir, { recursive: true });
          spinner.succeed(`[${course.shortname}] ${files.length} 個檔案`);

          for (const file of files) {
            const filePath = safeJoin(outputDir, file.filename);

            if (opts.skipExisting && existsSync(filePath)) {
              totalSkipped++;
              continue;
            }

            const dlSpinner = ora(`  ${file.filename}`).start();
            try {
              const buffer = await client.downloadFile(file.fileurl);
              writeFileSync(filePath, buffer);
              totalDownloaded++;
              dlSpinner.succeed(`  ${file.filename} ${chalk.gray(formatFileSize(file.filesize))}`);
            } catch (err: unknown) {
              totalFailed++;
              dlSpinner.fail(`  ${file.filename} ${chalk.red(err instanceof Error ? err.message : 'failed')}`);
            }
          }
        }

        if (!opts.list && !opts.json) {
          const parts = [chalk.green(`${totalDownloaded} 下載成功`)];
          if (totalSkipped > 0) parts.push(`${totalSkipped} 已存在`);
          if (totalFailed > 0) parts.push(chalk.red(`${totalFailed} 失敗`));
          console.log(`\n${parts.join(', ')}`);
        }
      } catch (err: unknown) {
        console.error(chalk.red(`錯誤: ${err instanceof Error ? err.message : err}`));
        process.exit(1);
      }
    });
}
