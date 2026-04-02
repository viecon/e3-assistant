// Find notes that need AI-generated or updated content.
// Criteria:
//   1. Stub: .md < 300 bytes with matching slide (needs full generation)
//   2. Outdated: slide modified after note was last modified (needs update)
const fs = require('fs');
const path = require('path');

function getVaultPath() {
  // Check ~/.e3rc.json first
  try {
    const config = JSON.parse(fs.readFileSync(path.join(require('os').homedir(), '.e3rc.json'), 'utf-8'));
    if (config.vaultPath) return config.vaultPath;
  } catch {}
  // Fallback to ~/.e3.env
  try {
    const raw = fs.readFileSync(path.join(require('os').homedir(), '.e3.env'), 'utf-8');
    const match = raw.match(/^VAULT_PATH=(.+)$/m);
    if (match) return match[1].trim();
  } catch {}
  console.error('Error: vault path not set. Run: e3 config set vaultPath "..."');
  process.exit(1);
}

const vault = process.argv[2] || getVaultPath();
const STUB_THRESHOLD = 300; // bytes
const excludeDirs = ['Calendar', 'assets', 'daily', '.obsidian', '.git', '留學'];
const slideExts = ['.pdf', '.pptx', '.ppt', '.docx', '.doc'];

const results = [];

for (const dir of fs.readdirSync(vault)) {
  if (excludeDirs.includes(dir)) continue;
  const courseDir = path.join(vault, dir);
  if (!fs.statSync(courseDir).isDirectory()) continue;
  const slidesDir = path.join(courseDir, 'slides');
  if (!fs.existsSync(slidesDir)) continue;

  for (const file of fs.readdirSync(courseDir)) {
    if (!file.endsWith('.md')) continue;
    const filePath = path.join(courseDir, file);
    const noteStat = fs.statSync(filePath);

    const baseName = file.replace(/\.md$/, '');
    const slides = fs.readdirSync(slidesDir).filter(s => {
      const sBase = s.replace(/\.[^.]+$/, '');
      return sBase === baseName || sBase.startsWith(baseName);
    });

    const matchedSlides = slides.filter(s => slideExts.some(ext => s.toLowerCase().endsWith(ext)));
    if (matchedSlides.length === 0) continue;

    // Check reason: stub or outdated
    let reason = null;

    if (noteStat.size < STUB_THRESHOLD) {
      reason = 'stub';
    } else {
      // Check if any slide was modified after the note
      const latestSlideTime = Math.max(
        ...matchedSlides.map(s => fs.statSync(path.join(slidesDir, s)).mtimeMs)
      );
      if (latestSlideTime > noteStat.mtimeMs) {
        reason = 'outdated';
      }
    }

    if (reason) {
      results.push({
        course: dir,
        chapter: baseName,
        notePath: filePath,
        noteSize: noteStat.size,
        reason,
        pdfFiles: matchedSlides.map(s => path.join(slidesDir, s)),
      });
    }
  }
}

console.log(JSON.stringify(results, null, 2));
if (results.length > 0) process.exit(0);
else process.exit(1);
