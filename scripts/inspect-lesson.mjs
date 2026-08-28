import { loadCurriculum } from './load-curriculum.mjs';

const lessonNumber = process.argv[2] || '1-1';

async function main() {
  const chapters = await loadCurriculum();
  let found = null;
  for (const c of chapters) {
    for (const l of c.lessons) {
      if (l.number === lessonNumber) {
        found = l;
        break;
      }
    }
  }

  if (!found) {
    console.log(`Lesson ${lessonNumber} not found.`);
    return;
  }

  console.log(JSON.stringify(found, null, 2));
}

main().catch(console.error);
