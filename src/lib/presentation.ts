/**
 * Lesson presentation: plan → audit → deck. Pure functions shared by scripts/data/build-data.ts,
 * scripts/data/draft-presentation-plan.ts, the unit tests and (slideStepCount only) the presentation
 * view. See src/types/presentation.ts.
 *
 * A plan holds no text. Every string in a deck is copied from the lesson, so the audit only has to
 * prove that the plan covers each paragraph, figure, table and "الفكرة الرئيسة" note
 * exactly once and in the book's order.
 */
import type { CalloutBox, Lesson, LessonSection } from "../types";
import type {
  DeckSlide,
  PlanIdeaSlide,
  PlanNoteSlide,
  PlanSlide,
  PresentationDeck,
  PresentationPlan,
} from "../types/presentation";
import { normalizeArabicText } from "./arabic";

/** Paragraphs of a section as the presentation addresses them: non-empty lines, fenced code kept whole. */
export function splitBlocks(content: string): string[] {
  const blocks: string[] = [];
  let fence: string[] | null = null;
  for (const raw of (content || "").split("\n")) {
    const line = raw.trim();
    if (fence) {
      fence.push(raw);
      if (line.startsWith("```")) {
        blocks.push(fence.join("\n"));
        fence = null;
      }
    } else if (line.startsWith("```")) {
      fence = [raw];
    } else if (line) {
      blocks.push(line);
    }
  }
  if (fence) blocks.push(fence.join("\n"));
  return blocks;
}

/** Splits at a full stop followed by whitespace (not after an ellipsis). Joining with " " restores the text. */
export function splitSentences(text: string): string[] {
  return (text || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[^.]\.)\s+/)
    .filter(Boolean);
}

export const isNoteSlide = (s: PlanSlide): s is PlanNoteSlide => "note" in s;

/**
 * Plan value for the book's «الفكرة الرئيسة» box when a lesson stores it only as `coreIdea`
 * (chapter 1 of term 1) instead of as an important_note callout.
 */
export const CORE_IDEA_NOTE = "coreIdea";

/** important_note callouts, minus any whose text is already a paragraph of the lesson (shown once, not twice). */
const presentedCallouts = (lesson: Lesson): CalloutBox[] => {
  const paragraphs = new Set((lesson.sections || []).flatMap((s) => splitBlocks(s.content).map(norm)));
  return (lesson.callouts || []).filter((c) => c.type === "important_note" && !paragraphs.has(norm(c.content)));
};

const norm = (s: string) => normalizeArabicText(s).replace(/[()«»"'،,.:؛;!?؟…-]/g, " ").replace(/\s+/g, " ").trim();

const PARAGRAPH_MARKER = /^\(\d+\)\s/;
const LIST_ITEM = /^([①-⑳]|[-•▪*]\s)/;
const POINTS_FORWARD = /التالي|التالية|التاليين|التاليتان|الآتي|الآتية|ما يلي|أدناه|الجدول/;
const MENTIONS_FIGURE = /(^|[\s(])(ال|وال|بال|لل)?شكل([\s.،:)]|$)/;
const SHORT_LIST_ITEM = 140;
const LONG_SLIDE = 320;

/** A short paragraph without closing punctuation, e.g. "(4) معايير الحكم" — a lead-in to a table. */
const isHeadingLike = (b: string) => !LIST_ITEM.test(b) && b.length < 60 && !/[.:؛؟!]$/.test(b);

function tokens(text: string): Set<string> {
  return new Set(norm(text).split(" ").filter((w) => w.length >= 3 && !/^\d+$/.test(w)));
}

function overlap(a: string, b: string): number {
  const tb = tokens(b);
  let n = 0;
  for (const w of tokens(a)) if (tb.has(w)) n++;
  return n;
}

/**
 * Mechanical first draft: one slide per numbered paragraph "(n)", short list items stay with their
 * lead-in, figures/tables go to the paragraph that points at them. Used for lessons without a
 * reviewed plan and as the starting point for one.
 */
export function draftPresentationPlan(lesson: Lesson): PresentationPlan {
  const bySection: PlanIdeaSlide[][] = [];
  const slideText = new Map<PlanIdeaSlide, string>();

  for (const sec of lesson.sections || []) {
    const blocks = splitBlocks(sec.content);
    const slides: PlanIdeaSlide[] = [];
    let current: PlanIdeaSlide | null = null;
    let currentLen = 0;
    blocks.forEach((block, i) => {
      const joinsCurrent =
        current !== null &&
        !PARAGRAPH_MARKER.test(block) &&
        ((LIST_ITEM.test(block) && block.length <= SHORT_LIST_ITEM) || (!LIST_ITEM.test(block) && currentLen < LONG_SLIDE));
      if (joinsCurrent && current) {
        current.blocks.push(i);
        currentLen += block.length;
      } else {
        current = { section: sec.id, blocks: [i] };
        currentLen = block.length;
        slides.push(current);
      }
    });
    if (slides.length === 0 && (sec.image || sec.table)) slides.push({ section: sec.id, blocks: [] });
    for (const s of slides) slideText.set(s, s.blocks.map((i) => blocks[i]).join(" "));

    // A lead-in only points at the table when it closes its slide; otherwise it introduces a list.
    const lastBlock = (s: PlanIdeaSlide) => (s.blocks.length ? blocks[s.blocks[s.blocks.length - 1]] : "");
    if (sec.table && slides.length) {
      const target =
        slides.find((s) => POINTS_FORWARD.test(lastBlock(s)) && !LIST_ITEM.test(lastBlock(s))) ||
        slides.find((s) => isHeadingLike(lastBlock(s))) ||
        bestMatch(slides, slideText, [...sec.table.headers, ...sec.table.rows.map((r) => r[0] || "")].join(" ")) ||
        slides[slides.length - 1];
      target.table = true;
    }
    if (sec.image && slides.length) {
      const target =
        slides.find((s) => MENTIONS_FIGURE.test(slideText.get(s)!)) ||
        bestMatch(slides, slideText, sec.image.caption) ||
        slides[0];
      target.figure = true;
    }
    bySection.push(slides);
  }

  const slides: PlanSlide[] = [];
  const notes = presentedCallouts(lesson);
  (lesson.sections || []).forEach((sec, i) => {
    slides.push(...bySection[i]);
    for (const c of notes.filter((n) => n.sectionId === sec.id)) slides.push({ note: c.id });
  });
  for (const c of notes.filter((n) => !lesson.sections.some((s) => s.id === n.sectionId))) slides.push({ note: c.id });
  return { lessonId: lesson.id, slides };
}

function bestMatch(slides: PlanIdeaSlide[], text: Map<PlanIdeaSlide, string>, probe: string): PlanIdeaSlide | null {
  let best: PlanIdeaSlide | null = null;
  let bestScore = 0;
  for (const s of slides) {
    const score = overlap(probe, text.get(s)!);
    if (score > bestScore) {
      best = s;
      bestScore = score;
    }
  }
  return best;
}

const IDEA_KEYS = new Set(["section", "blocks", "figure", "table"]);

/**
 * Returns every reason the plan is not a faithful, complete, in-order presentation of the lesson.
 * An empty array means the plan is valid.
 */
export function auditPresentationPlan(lesson: Lesson, plan: PresentationPlan): string[] {
  const errors: string[] = [];
  if (!plan || !Array.isArray(plan.slides)) return ["plan has no slides array"];
  if (plan.lessonId !== lesson.id) errors.push(`lessonId "${plan.lessonId}" does not match ${lesson.id}`);
  const extraTop = Object.keys(plan).filter((k) => k !== "lessonId" && k !== "slides");
  if (extraTop.length) errors.push(`unexpected plan fields: ${extraTop.join(", ")} (a plan holds no text)`);

  const sections = new Map<string, LessonSection>((lesson.sections || []).map((s) => [s.id, s]));
  const blocksOf = new Map<string, string[]>([...sections].map(([id, s]) => [id, splitBlocks(s.content)]));
  const expected = (lesson.sections || []).flatMap((s) => blocksOf.get(s.id)!.map((_, i) => `${s.id}#${i}`));
  const covered: string[] = [];
  const figures = new Map<string, number>();
  const tables = new Map<string, number>();
  const notes = new Map<string, number>();
  const noteIds = new Set(presentedCallouts(lesson).map((c) => c.id));
  const bump = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) || 0) + 1);

  plan.slides.forEach((slide, n) => {
    const at = `slide ${n + 1}`;
    if (isNoteSlide(slide)) {
      const extra = Object.keys(slide).filter((k) => k !== "note");
      if (extra.length) errors.push(`${at}: unexpected fields on a note slide: ${extra.join(", ")}`);
      if (slide.note === CORE_IDEA_NOTE) {
        if (!lesson.coreIdea) errors.push(`${at}: the lesson has no coreIdea`);
        if (notes.has(CORE_IDEA_NOTE)) errors.push(`${at}: coreIdea note appears more than once`);
      } else if (!noteIds.has(slide.note)) {
        errors.push(`${at}: "${slide.note}" is not a presentable important_note callout of this lesson (unknown, another type, or a repeat of a paragraph)`);
      }
      bump(notes, slide.note);
      return;
    }
    const extra = Object.keys(slide).filter((k) => !IDEA_KEYS.has(k));
    if (extra.length) errors.push(`${at}: unexpected fields: ${extra.join(", ")} (a plan holds no text)`);
    const sec = sections.get(slide.section);
    if (!sec) {
      errors.push(`${at}: unknown section "${slide.section}"`);
      return;
    }
    const blocks = blocksOf.get(sec.id)!;
    if (!Array.isArray(slide.blocks)) {
      errors.push(`${at}: blocks must be an array`);
      return;
    }
    slide.blocks.forEach((b, i) => {
      if (!Number.isInteger(b) || b < 0 || b >= blocks.length) errors.push(`${at}: ${sec.id} has no paragraph ${b}`);
      else if (i > 0 && b !== slide.blocks[i - 1] + 1) errors.push(`${at}: paragraphs ${slide.blocks.join(",")} are not consecutive`);
      covered.push(`${sec.id}#${b}`);
    });
    if (slide.blocks.length === 0 && !slide.figure && !slide.table) errors.push(`${at}: empty slide`);
    if (slide.figure) {
      if (!sec.image) errors.push(`${at}: ${sec.id} has no figure`);
      bump(figures, sec.id);
    }
    if (slide.table) {
      if (!sec.table) errors.push(`${at}: ${sec.id} has no table`);
      bump(tables, sec.id);
    }
  });

  // Coverage + order: the covered paragraphs must be exactly the book's paragraphs, in order.
  const seen = new Set<string>();
  for (const c of covered) {
    if (seen.has(c)) errors.push(`paragraph ${c} appears more than once`);
    seen.add(c);
  }
  const missing = expected.filter((e) => !seen.has(e));
  if (missing.length) errors.push(`paragraphs not presented: ${missing.join(", ")}`);
  const order = covered.filter((c) => expected.includes(c));
  const sorted = [...order].sort((a, b) => expected.indexOf(a) - expected.indexOf(b));
  if (order.join("|") !== sorted.join("|")) errors.push("paragraphs are not in the book's order");

  for (const sec of lesson.sections || []) {
    if (sec.image && figures.get(sec.id) !== 1) errors.push(`figure of ${sec.id} must appear exactly once (found ${figures.get(sec.id) || 0})`);
    if (sec.table && tables.get(sec.id) !== 1) errors.push(`table of ${sec.id} must appear exactly once (found ${tables.get(sec.id) || 0})`);
  }
  for (const id of noteIds) if (notes.get(id) !== 1) errors.push(`note ${id} must appear exactly once (found ${notes.get(id) || 0})`);
  return errors;
}

/** Resolves an audited plan into the deck the presentation view renders. All text comes from `lesson`. */
export function buildPresentationDeck(lesson: Lesson, plan: PresentationPlan, reviewed: boolean): PresentationDeck {
  const slides: DeckSlide[] = [];
  slides.push({
    kind: "cover",
    number: lesson.number,
    title: lesson.title,
    englishTitle: lesson.englishTitle || undefined,
    chapterNumber: lesson.chapterNumber,
    pageRange: lesson.pageRange,
    keyQuestion: lesson.keyQuestion,
  });
  const lp = lesson.learningPath;
  if (lp) {
    const items = (["previous", "current", "next"] as const)
      .filter((k) => lp[k])
      .map((label) => ({ label, text: lp[label]! }));
    if (items.length) slides.push({ kind: "path", items });
  }

  const sections = lesson.sections || [];
  const ideaCount = new Map<string, number>();
  for (const s of plan.slides) if (!isNoteSlide(s)) ideaCount.set(s.section, (ideaCount.get(s.section) || 0) + 1);
  const ideaSeen = new Map<string, number>();
  const callouts = new Map((lesson.callouts || []).map((c) => [c.id, c]));

  for (const s of plan.slides) {
    if (isNoteSlide(s)) {
      if (s.note === CORE_IDEA_NOTE) {
        slides.push({ kind: "note", text: lesson.coreIdea });
      } else {
        const c = callouts.get(s.note)!;
        slides.push({ kind: "note", title: c.title, text: c.content });
      }
      continue;
    }
    const secIndex = sections.findIndex((x) => x.id === s.section);
    const sec = sections[secIndex];
    const all = splitBlocks(sec.content);
    const blocks = s.blocks.map((i) => all[i]);
    ideaSeen.set(sec.id, (ideaSeen.get(sec.id) || 0) + 1);
    slides.push({
      kind: "idea",
      sectionId: sec.id,
      sectionTitle: sec.title,
      sectionNumber: secIndex + 1,
      sectionCount: sections.length,
      part: ideaSeen.get(sec.id)!,
      partCount: ideaCount.get(sec.id)!,
      blocks,
      figure: s.figure && sec.image ? { src: sec.image.src, caption: sec.image.caption } : undefined,
      table: s.table && sec.table ? { headers: sec.table.headers, rows: sec.table.rows } : undefined,
    });
  }

  if (lesson.summary?.length) slides.push({ kind: "summary", items: lesson.summary });
  if (lesson.mainQuestionAnswer && lesson.keyQuestion) {
    slides.push({ kind: "answer", question: lesson.keyQuestion, answer: lesson.mainQuestionAnswer });
  }
  return { lessonId: lesson.id, reviewed, slides };
}

/** Number of reveal steps on a slide (the first step shows on arrival). */
export function slideStepCount(slide: DeckSlide): number {
  switch (slide.kind) {
    case "cover":
    case "answer":
      return 2;
    case "summary":
    case "path":
      return slide.items.length;
    case "idea":
      return Math.max(1, slide.blocks.length + (slide.table?.rows.length || 0));
    case "note":
      return 1;
  }
}
