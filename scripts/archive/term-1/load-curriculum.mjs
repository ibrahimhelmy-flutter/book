import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

export function loadCurriculum() {
  let code = fs.readFileSync('src/data/curriculum.ts', 'utf8');
  // Strip import
  code = code.replace(/import\s+{[^}]+}\s+from\s+['"]@\/types['"];?/, '');
  // Strip TypeScript type annotations
  code = code.replace(/:\s*Chapter\[\]/g, '');
  // Save to a temporary js file
  const tmpPath = path.resolve('scripts/_temp_curriculum.mjs');
  fs.writeFileSync(tmpPath, code);
  return import(pathToFileURL(tmpPath).href).then(m => {
    try { fs.unlinkSync(tmpPath); } catch(e) {}
    return m.CURRICULUM_DATA;
  });
}
