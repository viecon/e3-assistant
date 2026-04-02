import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { MoodleClient, getUserCourses, getCourseGrades, getAllGrades } from '@e3/core';
import { loadConfig, getBaseUrl, requireAuth, getUserId } from '../config.js';
import { printTable, printJson } from '../output.js';
import { createClient } from '../createClient.js';

export function registerGradesCommand(program: Command): void {
  program
    .command('grades [course-id]')
    .description('查看成績')
    .option('--json', 'JSON 格式輸出')
    .action(async (courseId: string | undefined, opts) => {
      try {
        const client = createClient();
        const userid = getUserId();

        if (courseId) {
          // Specific course grades
          const spinner = ora('取得成績...').start();
          const report = await getCourseGrades(client, Number(courseId), userid);
          spinner.stop();

          if (opts.json) {
            printJson(report.gradeitems);
            return;
          }

          const items = report.gradeitems.filter(g => g.itemtype !== 'course');
          printTable(
            ['項目', '成績', '範圍', '百分比'],
            items.map(g => [
              g.itemname || '(unnamed)',
              g.gradeformatted || '-',
              g.rangeformatted || '-',
              g.percentageformatted || '-',
            ]),
          );
        } else {
          // All courses overview
          const spinner = ora('取得成績總覽...').start();

          const courses = await getUserCourses(client, userid);
          const visible = courses.filter(c => c.visible && !c.hidden);

          let grades: { courseid: number; grade: string; rawgrade: string }[] = [];
          try {
            const result = await getAllGrades(client, userid);
            grades = result.grades;
          } catch {
            // gradereport_overview might not be available, fall back
          }

          spinner.stop();

          if (opts.json) {
            printJson(grades.map(g => {
              const course = visible.find(c => c.id === g.courseid);
              return { ...g, courseName: course?.fullname };
            }));
            return;
          }

          if (grades.length === 0) {
            console.log(chalk.yellow('無法取得成績總覽。嘗試指定課程 ID: e3 grades <course-id>'));
            return;
          }

          printTable(
            ['課程', '成績'],
            grades.map(g => {
              const course = visible.find(c => c.id === g.courseid);
              return [
                course?.fullname ?? String(g.courseid),
                g.grade || '-',
              ];
            }),
          );
        }
      } catch (err: unknown) {
        console.error(chalk.red(`錯誤: ${err instanceof Error ? err.message : err}`));
        process.exit(1);
      }
    });
}
