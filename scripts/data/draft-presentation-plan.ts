/**
 * Review or start a lesson presentation plan (src/types/presentation.ts).
 *
 *   npm run presentation:plan -- lesson-1-2            # print the current plan (reviewed or draft) with its text
 *   npm run presentation:plan -- lesson-1-2 --write    # save the mechanical draft as the lesson's plan to edit
 *   npm run presentation:plan -- --all                 # print the status of every lesson
 *
 * Plans live in book-sources/<part>/05-canonical-data/authored/presentations/<lessonId>.json.
 * --write refuses to overwrite an existing plan unless --force is given.
 */
import fs from "fs";
import path from "path";
import { listParts, getSources } from "../sources-config.mjs";
import type { Chapter, Lesson } from "../../src/types";
import type { PresentationPlan } from "../../src/types/presentation";
import { auditPresentationPlan, CORE_IDEA_NOTE, draftPresentationPlan, isNoteSlide, splitBlocks } from "../../src/lib/presentation";

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const ids = args.filter((a) => !a.startsWith("--"));

interface Found {
  lesson: Lesson;
  dir: string;
}

function allLessons(): Found[] {
  const found: Found[] = [];
  for (const { key } of listParts({ status: "available" })) {
    const sources = getSources(key);
    const book = JSON.parse(fs.readFileSync(sources.canonicalBookFile, "utf8")) as { chapters: Chapter[] };
    for (const lesson of book.chapters.flatMap((c) => c.lessons)) found.push({ lesson, dir: sources.presentationsDir });
  }
  return found;
}

function currentPlan({ lesson, dir }: Found): { plan: PresentationPlan; reviewed: boolean } {
  const file = path.join(dir, `${lesson.id}.json`);
  if (fs.existsSync(file)) return { plan: JSON.parse(fs.readFileSync(file, "utf8")), reviewed: true };
  return { plan: draftPresentationPlan(lesson), reviewed: false };
}

function printPlan(found: Found) {
  const { lesson } = found;
  const { plan, reviewed } = currentPlan(found);
  console.log(`\n# ${lesson.id} ${lesson.title} — ${reviewed ? "reviewed plan" : "mechanical draft"}`);
  plan.slides.forEach((s, n) => {
    if (isNoteSlide(s)) {
      const c = lesson.callouts.find((x) => x.id === s.note);
      console.log(`\n[${n + 1}] NOTE ${s.note}: ${s.note === CORE_IDEA_NOTE ? lesson.coreIdea : c?.title ?? "?"}`);
      return;
    }
    const sec = lesson.sections.find((x) => x.id === s.section);
    const blocks = splitBlocks(sec?.content || "");
    const extras = [s.figure && "figure", s.table && "table", s.terms?.length && `terms ${s.terms.join(",")}`].filter(Boolean);
    console.log(`\n[${n + 1}] ${s.section} ${sec?.title ?? "?"} ¶${s.blocks.join(",")}${extras.length ? `  (+ ${extras.join("; ")})` : ""}`);
    for (const b of s.blocks) console.log(`     ${b}: ${blocks[b] ?? "?"}`);
    if (s.figure && sec?.image) console.log(`     🖼  ${sec.image.caption}`);
    if (s.table && sec?.table) console.log(`     ▦  ${sec.table.headers.join(" | ")} (${sec.table.rows.length} rows)`);
  });
  const errors = auditPresentationPlan(lesson, plan);
  console.log(errors.length ? `\n❌ ${errors.join("\n❌ ")}` : `\n✅ audit passed (${plan.slides.length} body slides)`);
}

/** One slide per line, so a plan reads (and diffs) like a slide list. */
function formatPlan(plan: PresentationPlan): string {
  const slides = plan.slides.map((s) => `    ${JSON.stringify(s)}`).join(",\n");
  return `{\n  "lessonId": ${JSON.stringify(plan.lessonId)},\n  "slides": [\n${slides}\n  ]\n}\n`;
}

const lessons = allLessons();
if (flags.has("--all")) {
  for (const found of lessons) {
    const { plan, reviewed } = currentPlan(found);
    const errors = auditPresentationPlan(found.lesson, plan);
    console.log(`${found.lesson.id.padEnd(12)} ${reviewed ? "reviewed" : "draft   "} ${String(plan.slides.length).padStart(3)} slides ${errors.length ? `❌ ${errors.length} problems` : "✅"}`);
  }
} else if (ids.length === 0) {
  console.error("Usage: npm run presentation:plan -- <lessonId...> [--write [--force]] | --all");
  process.exit(1);
}

for (const id of ids) {
  const found = lessons.find((f) => f.lesson.id === id);
  if (!found) {
    console.error(`Unknown lesson ${id}`);
    process.exit(1);
  }
  if (flags.has("--write")) {
    const file = path.join(found.dir, `${id}.json`);
    if (fs.existsSync(file) && !flags.has("--force")) {
      console.error(`${path.relative(process.cwd(), file)} already exists (use --force to overwrite)`);
      process.exit(1);
    }
    fs.mkdirSync(found.dir, { recursive: true });
    fs.writeFileSync(file, formatPlan(draftPresentationPlan(found.lesson)), "utf8");
    console.log(`Wrote ${path.relative(process.cwd(), file)}`);
  }
  printPlan(found);
}
