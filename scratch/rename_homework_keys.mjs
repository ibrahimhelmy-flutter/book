import fs from 'fs';

// Helper to replace sequentially
function replaceSequentially(content, oldKey, newKey1, newKey2) {
  const firstIdx = content.indexOf(oldKey);
  if (firstIdx === -1) throw new Error(`Could not find first occurrence of ${oldKey}`);
  content = content.slice(0, firstIdx) + newKey1 + content.slice(firstIdx + oldKey.length);

  const secondIdx = content.indexOf(oldKey);
  if (secondIdx === -1) throw new Error(`Could not find second occurrence of ${oldKey}`);
  content = content.slice(0, secondIdx) + newKey2 + content.slice(secondIdx + oldKey.length);

  return content;
}

// 1. Update chapter2.mjs
{
  let ch2 = fs.readFileSync('scripts/model-answers/chapter2.mjs', 'utf8');

  // 2-1: HOMEWORK -> HOMEWORK_1 and HOMEWORK_2
  ch2 = replaceSequentially(ch2, "'OFFICIAL-2-1-HOMEWORK-ESSAY-1':", "'OFFICIAL-2-1-HOMEWORK_1-ESSAY-1':", "'OFFICIAL-2-1-HOMEWORK_2-ESSAY-1':");
  ch2 = replaceSequentially(ch2, "'OFFICIAL-2-1-HOMEWORK-ESSAY-2':", "'OFFICIAL-2-1-HOMEWORK_1-ESSAY-2':", "'OFFICIAL-2-1-HOMEWORK_2-ESSAY-2':");
  ch2 = replaceSequentially(ch2, "'OFFICIAL-2-1-HOMEWORK-MCQ-1':", "'OFFICIAL-2-1-HOMEWORK_1-MCQ-1':", "'OFFICIAL-2-1-HOMEWORK_2-MCQ-1':");
  ch2 = replaceSequentially(ch2, "'OFFICIAL-2-1-HOMEWORK-MCQ-2':", "'OFFICIAL-2-1-HOMEWORK_1-MCQ-2':", "'OFFICIAL-2-1-HOMEWORK_2-MCQ-2':");

  // 2-2: First occurrence of PERFORMANCE_TASK_1 is Task 1. Second occurrence is Homework 1!
  ch2 = replaceSequentially(ch2, "'OFFICIAL-2-2-PERFORMANCE_TASK_1-ESSAY-1':", "'OFFICIAL-2-2-PERFORMANCE_TASK_1-ESSAY-1':", "'OFFICIAL-2-2-HOMEWORK_1-ESSAY-1':");
  ch2 = replaceSequentially(ch2, "'OFFICIAL-2-2-PERFORMANCE_TASK_1-ESSAY-2':", "'OFFICIAL-2-2-PERFORMANCE_TASK_1-ESSAY-2':", "'OFFICIAL-2-2-HOMEWORK_1-ESSAY-2':");
  ch2 = replaceSequentially(ch2, "'OFFICIAL-2-2-PERFORMANCE_TASK_1-MCQ-1':", "'OFFICIAL-2-2-PERFORMANCE_TASK_1-MCQ-1':", "'OFFICIAL-2-2-HOMEWORK_1-MCQ-1':");
  ch2 = replaceSequentially(ch2, "'OFFICIAL-2-2-PERFORMANCE_TASK_1-MCQ-2':", "'OFFICIAL-2-2-PERFORMANCE_TASK_1-MCQ-2':", "'OFFICIAL-2-2-HOMEWORK_1-MCQ-2':");
  // 2-2 Homework 2 has single occurrence of HOMEWORK:
  ch2 = ch2.replace("'OFFICIAL-2-2-HOMEWORK-ESSAY-1':", "'OFFICIAL-2-2-HOMEWORK_2-ESSAY-1':");
  ch2 = ch2.replace("'OFFICIAL-2-2-HOMEWORK-ESSAY-2':", "'OFFICIAL-2-2-HOMEWORK_2-ESSAY-2':");
  ch2 = ch2.replace("'OFFICIAL-2-2-HOMEWORK-MCQ-1':", "'OFFICIAL-2-2-HOMEWORK_2-MCQ-1':");
  ch2 = ch2.replace("'OFFICIAL-2-2-HOMEWORK-MCQ-2':", "'OFFICIAL-2-2-HOMEWORK_2-MCQ-2':");

  // 2-3: HOMEWORK -> HOMEWORK_1 and HOMEWORK_2
  ch2 = replaceSequentially(ch2, "'OFFICIAL-2-3-HOMEWORK-ESSAY-1':", "'OFFICIAL-2-3-HOMEWORK_1-ESSAY-1':", "'OFFICIAL-2-3-HOMEWORK_2-ESSAY-1':");
  ch2 = replaceSequentially(ch2, "'OFFICIAL-2-3-HOMEWORK-ESSAY-2':", "'OFFICIAL-2-3-HOMEWORK_1-ESSAY-2':", "'OFFICIAL-2-3-HOMEWORK_2-ESSAY-2':");
  ch2 = replaceSequentially(ch2, "'OFFICIAL-2-3-HOMEWORK-MCQ-1':", "'OFFICIAL-2-3-HOMEWORK_1-MCQ-1':", "'OFFICIAL-2-3-HOMEWORK_2-MCQ-1':");
  ch2 = replaceSequentially(ch2, "'OFFICIAL-2-3-HOMEWORK-MCQ-2':", "'OFFICIAL-2-3-HOMEWORK_1-MCQ-2':", "'OFFICIAL-2-3-HOMEWORK_2-MCQ-2':");

  fs.writeFileSync('scripts/model-answers/chapter2.mjs', ch2, 'utf8');
  console.log('chapter2.mjs updated successfully.');
}

// 2. Update chapter3.mjs
{
  let ch3 = fs.readFileSync('scripts/model-answers/chapter3.mjs', 'utf8');

  // 3-1: HOMEWORK -> HOMEWORK_1 and HOMEWORK_2
  ch3 = replaceSequentially(ch3, "'OFFICIAL-3-1-HOMEWORK-ESSAY-1':", "'OFFICIAL-3-1-HOMEWORK_1-ESSAY-1':", "'OFFICIAL-3-1-HOMEWORK_2-ESSAY-1':");
  ch3 = replaceSequentially(ch3, "'OFFICIAL-3-1-HOMEWORK-ESSAY-2':", "'OFFICIAL-3-1-HOMEWORK_1-ESSAY-2':", "'OFFICIAL-3-1-HOMEWORK_2-ESSAY-2':");
  ch3 = replaceSequentially(ch3, "'OFFICIAL-3-1-HOMEWORK-MCQ-1':", "'OFFICIAL-3-1-HOMEWORK_1-MCQ-1':", "'OFFICIAL-3-1-HOMEWORK_2-MCQ-1':");
  ch3 = replaceSequentially(ch3, "'OFFICIAL-3-1-HOMEWORK-MCQ-2':", "'OFFICIAL-3-1-HOMEWORK_1-MCQ-2':", "'OFFICIAL-3-1-HOMEWORK_2-MCQ-2':");

  // 3-2: HOMEWORK -> HOMEWORK_1 and HOMEWORK_2
  ch3 = replaceSequentially(ch3, "'OFFICIAL-3-2-HOMEWORK-ESSAY-1':", "'OFFICIAL-3-2-HOMEWORK_1-ESSAY-1':", "'OFFICIAL-3-2-HOMEWORK_2-ESSAY-1':");
  ch3 = replaceSequentially(ch3, "'OFFICIAL-3-2-HOMEWORK-ESSAY-2':", "'OFFICIAL-3-2-HOMEWORK_1-ESSAY-2':", "'OFFICIAL-3-2-HOMEWORK_2-ESSAY-2':");
  ch3 = replaceSequentially(ch3, "'OFFICIAL-3-2-HOMEWORK-MCQ-1':", "'OFFICIAL-3-2-HOMEWORK_1-MCQ-1':", "'OFFICIAL-3-2-HOMEWORK_2-MCQ-1':");
  ch3 = replaceSequentially(ch3, "'OFFICIAL-3-2-HOMEWORK-MCQ-2':", "'OFFICIAL-3-2-HOMEWORK_1-MCQ-2':", "'OFFICIAL-3-2-HOMEWORK_2-MCQ-2':");

  // 3-3: HOMEWORK -> HOMEWORK_1 and HOMEWORK_2
  ch3 = replaceSequentially(ch3, "'OFFICIAL-3-3-HOMEWORK-ESSAY-1':", "'OFFICIAL-3-3-HOMEWORK_1-ESSAY-1':", "'OFFICIAL-3-3-HOMEWORK_2-ESSAY-1':");
  ch3 = replaceSequentially(ch3, "'OFFICIAL-3-3-HOMEWORK-ESSAY-2':", "'OFFICIAL-3-3-HOMEWORK_1-ESSAY-2':", "'OFFICIAL-3-3-HOMEWORK_2-ESSAY-2':");
  ch3 = replaceSequentially(ch3, "'OFFICIAL-3-3-HOMEWORK-MCQ-1':", "'OFFICIAL-3-3-HOMEWORK_1-MCQ-1':", "'OFFICIAL-3-3-HOMEWORK_2-MCQ-1':");
  ch3 = replaceSequentially(ch3, "'OFFICIAL-3-3-HOMEWORK-MCQ-2':", "'OFFICIAL-3-3-HOMEWORK_1-MCQ-2':", "'OFFICIAL-3-3-HOMEWORK_2-MCQ-2':");

  fs.writeFileSync('scripts/model-answers/chapter3.mjs', ch3, 'utf8');
  console.log('chapter3.mjs updated successfully.');
}

// 3. Update chapter4.mjs
{
  let ch4 = fs.readFileSync('scripts/model-answers/chapter4.mjs', 'utf8');

  // 4-1: HOMEWORK -> HOMEWORK_1 and HOMEWORK_2
  ch4 = replaceSequentially(ch4, "'OFFICIAL-4-1-HOMEWORK-ESSAY-1':", "'OFFICIAL-4-1-HOMEWORK_1-ESSAY-1':", "'OFFICIAL-4-1-HOMEWORK_2-ESSAY-1':");
  ch4 = replaceSequentially(ch4, "'OFFICIAL-4-1-HOMEWORK-ESSAY-2':", "'OFFICIAL-4-1-HOMEWORK_1-ESSAY-2':", "'OFFICIAL-4-1-HOMEWORK_2-ESSAY-2':");
  ch4 = replaceSequentially(ch4, "'OFFICIAL-4-1-HOMEWORK-MCQ-1':", "'OFFICIAL-4-1-HOMEWORK_1-MCQ-1':", "'OFFICIAL-4-1-HOMEWORK_2-MCQ-1':");
  ch4 = replaceSequentially(ch4, "'OFFICIAL-4-1-HOMEWORK-MCQ-2':", "'OFFICIAL-4-1-HOMEWORK_1-MCQ-2':", "'OFFICIAL-4-1-HOMEWORK_2-MCQ-2':");

  // 4-2: HOMEWORK -> HOMEWORK_1 and HOMEWORK_2
  ch4 = replaceSequentially(ch4, "'OFFICIAL-4-2-HOMEWORK-ESSAY-1':", "'OFFICIAL-4-2-HOMEWORK_1-ESSAY-1':", "'OFFICIAL-4-2-HOMEWORK_2-ESSAY-1':");
  ch4 = replaceSequentially(ch4, "'OFFICIAL-4-2-HOMEWORK-ESSAY-2':", "'OFFICIAL-4-2-HOMEWORK_1-ESSAY-2':", "'OFFICIAL-4-2-HOMEWORK_2-ESSAY-2':");
  ch4 = replaceSequentially(ch4, "'OFFICIAL-4-2-HOMEWORK-MCQ-1':", "'OFFICIAL-4-2-HOMEWORK_1-MCQ-1':", "'OFFICIAL-4-2-HOMEWORK_2-MCQ-1':");
  ch4 = replaceSequentially(ch4, "'OFFICIAL-4-2-HOMEWORK-MCQ-2':", "'OFFICIAL-4-2-HOMEWORK_1-MCQ-2':", "'OFFICIAL-4-2-HOMEWORK_2-MCQ-2':");

  // 4-3: First occurrence of PERFORMANCE_TASK_1 is Task 1. Second occurrence is Homework 1!
  ch4 = replaceSequentially(ch4, "'OFFICIAL-4-3-PERFORMANCE_TASK_1-ESSAY-1':", "'OFFICIAL-4-3-PERFORMANCE_TASK_1-ESSAY-1':", "'OFFICIAL-4-3-HOMEWORK_1-ESSAY-1':");
  ch4 = replaceSequentially(ch4, "'OFFICIAL-4-3-PERFORMANCE_TASK_1-ESSAY-2':", "'OFFICIAL-4-3-PERFORMANCE_TASK_1-ESSAY-2':", "'OFFICIAL-4-3-HOMEWORK_1-ESSAY-2':");
  ch4 = replaceSequentially(ch4, "'OFFICIAL-4-3-PERFORMANCE_TASK_1-MCQ-1':", "'OFFICIAL-4-3-PERFORMANCE_TASK_1-MCQ-1':", "'OFFICIAL-4-3-HOMEWORK_1-MCQ-1':");
  ch4 = replaceSequentially(ch4, "'OFFICIAL-4-3-PERFORMANCE_TASK_1-MCQ-2':", "'OFFICIAL-4-3-PERFORMANCE_TASK_1-MCQ-2':", "'OFFICIAL-4-3-HOMEWORK_1-MCQ-2':");
  // 4-3 Homework 2 has single occurrence of HOMEWORK:
  ch4 = ch4.replace("'OFFICIAL-4-3-HOMEWORK-ESSAY-1':", "'OFFICIAL-4-3-HOMEWORK_2-ESSAY-1':");
  ch4 = ch4.replace("'OFFICIAL-4-3-HOMEWORK-ESSAY-2':", "'OFFICIAL-4-3-HOMEWORK_2-ESSAY-2':");
  ch4 = ch4.replace("'OFFICIAL-4-3-HOMEWORK-MCQ-1':", "'OFFICIAL-4-3-HOMEWORK_2-MCQ-1':");
  ch4 = ch4.replace("'OFFICIAL-4-3-HOMEWORK-MCQ-2':", "'OFFICIAL-4-3-HOMEWORK_2-MCQ-2':");

  // 4-4: HOMEWORK -> HOMEWORK_1 and HOMEWORK_2
  ch4 = replaceSequentially(ch4, "'OFFICIAL-4-4-HOMEWORK-ESSAY-1':", "'OFFICIAL-4-4-HOMEWORK_1-ESSAY-1':", "'OFFICIAL-4-4-HOMEWORK_2-ESSAY-1':");
  ch4 = replaceSequentially(ch4, "'OFFICIAL-4-4-HOMEWORK-ESSAY-2':", "'OFFICIAL-4-4-HOMEWORK_1-ESSAY-2':", "'OFFICIAL-4-4-HOMEWORK_2-ESSAY-2':");
  ch4 = replaceSequentially(ch4, "'OFFICIAL-4-4-HOMEWORK-MCQ-1':", "'OFFICIAL-4-4-HOMEWORK_1-MCQ-1':", "'OFFICIAL-4-4-HOMEWORK_2-MCQ-1':");
  ch4 = replaceSequentially(ch4, "'OFFICIAL-4-4-HOMEWORK-MCQ-2':", "'OFFICIAL-4-4-HOMEWORK_1-MCQ-2':", "'OFFICIAL-4-4-HOMEWORK_2-MCQ-2':");

  fs.writeFileSync('scripts/model-answers/chapter4.mjs', ch4, 'utf8');
  console.log('chapter4.mjs updated successfully.');
}
