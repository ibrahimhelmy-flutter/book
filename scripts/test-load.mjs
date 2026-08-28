import { loadCurriculum } from './load-curriculum.mjs';

async function main() {
  const chapters = await loadCurriculum();
  console.log('Successfully loaded curriculum! Total chapters:', chapters.length);
  chapters.forEach(c => {
    console.log(`Chapter ${c.number}: ${c.title} (${c.lessons.length} lessons)`);
  });
}

main().catch(console.error);
