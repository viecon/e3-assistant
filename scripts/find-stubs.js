// Find notes that need AI-generated content.
// Criteria: .md file with a matching slide in slides/, AND content < 300 bytes
// (a real note with tables/bullets is typically 1KB+)
const fs = require('fs');
const path = require('path');

const vault = process.argv[2] || 'C:\\Users\\twsha\\Documents\\GitHub\\note';
const THRESHOLD = 300; // bytes - stubs and near-empty notes
const excludeDirs = ['Calendar', 'assets', 'daily', '.obsidian', '.git', '留學'];

const stubs = [];

for (const dir of fs.readdirSync(vault)) {
  if (excludeDirs.includes(dir)) continue;
  const courseDir = path.join(vault, dir);
  if (!fs.statSync(courseDir).isDirectory()) continue;
  const slidesDir = path.join(courseDir, 'slides');
  if (!fs.existsSync(slidesDir)) continue;

  for (const file of fs.readdirSync(courseDir)) {
    if (!file.endsWith('.md')) continue;
    const filePath = path.join(courseDir, file);
    const stat = fs.statSync(filePath);
    if (stat.size >= THRESHOLD) continue;

    // Check if there's a matching slide
    const baseName = file.replace(/\.md$/, '');
    const slides = fs.readdirSync(slidesDir).filter(s => {
      const sBase = s.replace(/\.[^.]+$/, '');
      return sBase === baseName || sBase.startsWith(baseName);
    });

    if (slides.length > 0) {
      const slideExts = ['.pdf', '.pptx', '.ppt', '.docx', '.doc'];
      stubs.push({
        course: dir,
        chapter: baseName,
        notePath: filePath,
        noteSize: stat.size,
        pdfFiles: slides
          .filter(s => slideExts.some(ext => s.toLowerCase().endsWith(ext)))
          .map(s => path.join(slidesDir, s)),
      });
    }
  }
}

console.log(JSON.stringify(stubs, null, 2));
if (stubs.length > 0) process.exit(0);
else process.exit(1);
