const fs = require('fs');
const path = process.argv[2];
if (!path) { process.exit(1); }
try {
  const r = JSON.parse(fs.readFileSync(path, 'utf-8'));
  process.exit(r.newSlides.length > 0 ? 0 : 1);
} catch {
  process.exit(1);
}
