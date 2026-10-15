"use client";

import React, { useState } from "react";
import type { DeckFigure, DeckSlide, DeckTable, DeckTerm } from "@/types/presentation";
import { formatInlineText } from "../common/EyeComfortText";
import { getAssetPath } from "@/lib/utils";
import { classifyImage, imageToneClass, type ImageTone } from "@/lib/image-tone";
import { ArrowLeft, BookOpen, HelpCircle, History, Lightbulb, ListChecks, MapPin, Tags, Target, ZoomIn } from "lucide-react";

export type PresentationTheme = "dark" | "light";

const PALETTE = {
  dark: {
    muted: "text-slate-400",
    soft: "text-slate-300",
    card: "bg-slate-900/70 border-slate-700/70",
    focus: "border-sky-400 bg-sky-400/10",
    rest: "border-transparent",
    badge: "bg-sky-500/15 text-sky-300 border-sky-400/30",
    question: "bg-sky-500/10 border-sky-400/40 text-sky-50",
    note: "bg-amber-400/10 border-amber-300/40",
    noteTitle: "text-amber-300",
    term: "text-teal-300",
    tableHead: "bg-slate-800 text-sky-200",
    tableRow: "border-slate-700/70",
    tableFocus: "bg-sky-400/15",
  },
  light: {
    muted: "text-slate-500",
    soft: "text-slate-600",
    card: "bg-white border-slate-200 shadow-sm",
    focus: "border-sky-600 bg-sky-50",
    rest: "border-transparent",
    badge: "bg-sky-50 text-sky-800 border-sky-200",
    question: "bg-sky-50 border-sky-300 text-sky-950",
    note: "bg-amber-50 border-amber-300",
    noteTitle: "text-amber-700",
    term: "text-teal-700",
    tableHead: "bg-sky-50 text-sky-900",
    tableRow: "border-slate-200",
    tableFocus: "bg-sky-100",
  },
};

interface SlideProps {
  slide: DeckSlide;
  /** Number of revealed steps (the first shows on arrival). */
  step: number;
  /** Highlight the most recently revealed step (off when everything is revealed at once). */
  focus: boolean;
  theme: PresentationTheme;
  onZoom: (figure: DeckFigure) => void;
}

/** Step `i` (0-based) is shown once `step` > i; it is the current one when it was revealed last. */
function reveal(i: number, step: number, focus: boolean) {
  return { shown: i < step, current: focus && i === step - 1 };
}

const LIST_ITEM = /^([①-⑳]|[-•▪*]\s)/;

/** The book's label for its key-idea box, used when the note comes from the lesson's coreIdea. */
const KEY_IDEA_LABEL = "الفكرة الرئيسة";

/** Section title without the book's "2. " numbering (the slide shows "القسم 2 من 6" instead). */
export const sectionHeading = (title: string) => title.replace(/^\d+\.\s*/, "");

/** Keeps "1-2" and "12 - 17" in reading order inside RTL text. */
export const Ltr = ({ children }: { children: React.ReactNode }) => (
  <span dir="ltr" className="inline-block">
    {children}
  </span>
);

/** Body text size: projector-sized, smaller when a slide carries a lot of text. */
function textSize(chars: number, withVisual: boolean) {
  const budget = withVisual ? 0.7 : 1;
  if (chars > 900 * budget) return "text-lg xl:text-xl leading-[2]";
  if (chars > 500 * budget) return "text-xl xl:text-2xl leading-[2]";
  return "text-2xl xl:text-[1.75rem] leading-[2.05]";
}

export function PresentationSlide(props: SlideProps) {
  switch (props.slide.kind) {
    case "cover":
      return <CoverSlide {...props} slide={props.slide} />;
    case "objectives":
      return <ListSlide {...props} items={props.slide.items} title="أهداف التعلم" icon={<Target className="w-7 h-7" />} />;
    case "path":
      return <PathSlide {...props} slide={props.slide} />;
    case "introduction":
      return <IntroductionSlide {...props} slide={props.slide} />;
    case "idea":
      return <IdeaSlide {...props} slide={props.slide} />;
    case "note":
      return <NoteSlide {...props} slide={props.slide} />;
    case "summary":
      return <ListSlide {...props} items={props.slide.items} title="الخلاصة" icon={<ListChecks className="w-7 h-7" />} />;
    case "answer":
      return <AnswerSlide {...props} slide={props.slide} />;
  }
}

function SlideHeading({ icon, title, theme }: { icon: React.ReactNode; title: string; theme: PresentationTheme }) {
  return (
    <div className={`flex items-center gap-3 mb-8 ${PALETTE[theme].muted}`}>
      {icon}
      <h2 className="text-2xl xl:text-3xl font-black">{title}</h2>
    </div>
  );
}

function CoverSlide({ slide, step, theme }: SlideProps & { slide: Extract<DeckSlide, { kind: "cover" }> }) {
  const p = PALETTE[theme];
  return (
    <div className="text-center space-y-10 max-w-5xl mx-auto">
      <div className="space-y-4">
        <p className={`text-xl font-bold ${p.muted}`}>
          الفصل {slide.chapterNumber} · الدرس <Ltr>{slide.number}</Ltr> · الصفحات <Ltr>{slide.pageRange}</Ltr>
        </p>
        <h1 className="text-5xl xl:text-6xl font-black leading-tight">{slide.title}</h1>
        {slide.englishTitle && (
          <p className={`text-2xl font-medium ${p.muted}`} dir="ltr">
            {slide.englishTitle}
          </p>
        )}
      </div>
      <div className={`transition-opacity duration-300 ${step >= 2 ? "opacity-100" : "opacity-0"}`}>
        <div className={`inline-block text-right rounded-3xl border-2 px-8 py-6 ${p.question}`}>
          <p className="flex items-center gap-2 text-lg font-black mb-3 opacity-80">
            <HelpCircle className="w-6 h-6" />
            السؤال الرئيسي
          </p>
          <p className="text-3xl xl:text-4xl font-bold leading-relaxed">{slide.keyQuestion}</p>
        </div>
      </div>
    </div>
  );
}

function ListSlide({ items, title, icon, step, focus, theme }: SlideProps & { items: string[]; title: string; icon: React.ReactNode }) {
  const p = PALETTE[theme];
  return (
    <div className="max-w-6xl mx-auto">
      <SlideHeading icon={icon} title={title} theme={theme} />
      <ol className="space-y-4">
        {items.map((item, i) => {
          const r = reveal(i, step, focus);
          return (
            <li
              key={i}
              className={`flex items-start gap-5 rounded-2xl border-s-4 px-6 py-4 transition-all duration-300 ${r.shown ? "opacity-100" : "invisible"} ${r.current ? p.focus : p.rest}`}
            >
              <span className={`shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center text-xl font-black ${p.badge}`}>{i + 1}</span>
              <span className={textSize(items.join("").length, false)}>{formatInlineText(item, theme)}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

const PATH_ICONS = { previous: History, current: MapPin, next: ArrowLeft } as const;

function PathSlide({ slide, step, focus, theme }: SlideProps & { slide: Extract<DeckSlide, { kind: "path" }> }) {
  const p = PALETTE[theme];
  return (
    <div className="max-w-6xl mx-auto">
      <SlideHeading icon={<MapPin className="w-7 h-7" />} title="مسار التعلّم" theme={theme} />
      <div className="space-y-4">
        {slide.items.map((item, i) => {
          const r = reveal(i, step, focus);
          const Icon = PATH_ICONS[item.label];
          return (
            <div
              key={item.label}
              className={`flex items-start gap-5 rounded-2xl border-s-4 px-6 py-5 transition-all duration-300 ${r.shown ? "opacity-100" : "invisible"} ${
                r.current ? p.focus : p.rest
              } ${item.label === "current" ? "font-bold" : ""}`}
            >
              <Icon className={`shrink-0 w-8 h-8 mt-2 ${item.label === "current" ? "text-sky-500" : p.muted}`} />
              <p className="text-2xl xl:text-[1.75rem] leading-[2]">{item.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IntroductionSlide({ slide, step, focus, theme }: SlideProps & { slide: Extract<DeckSlide, { kind: "introduction" }> }) {
  return (
    <div className="max-w-6xl mx-auto">
      <SlideHeading icon={<BookOpen className="w-7 h-7" />} title="مقدمة الدرس" theme={theme} />
      <p className={textSize(slide.sentences.join(" ").length, false)}>
        {slide.sentences.map((s, i) => {
          const r = reveal(i, step, focus);
          return (
            <React.Fragment key={i}>
              <span
                className={`transition-all duration-300 rounded-md ${r.shown ? "opacity-100" : "invisible"} ${
                  r.current ? "bg-sky-400/15 underline decoration-sky-500/60 decoration-2 underline-offset-[10px]" : ""
                }`}
              >
                {formatInlineText(s, theme)}
              </span>{" "}
            </React.Fragment>
          );
        })}
      </p>
    </div>
  );
}

function IdeaSlide({ slide, step, focus, theme, onZoom }: SlideProps & { slide: Extract<DeckSlide, { kind: "idea" }> }) {
  const p = PALETTE[theme];
  const termNames = slide.terms.map((t) => t.termAr);
  const chars = slide.blocks.join("").length;
  const size = textSize(chars, Boolean(slide.figure));

  const text = (
    <div className="space-y-3">
      {slide.blocks.map((block, i) => {
        const r = reveal(i, step, focus);
        const isItem = LIST_ITEM.test(block);
        return (
          <div
            key={i}
            className={`rounded-2xl border-s-4 px-5 py-2 transition-all duration-300 ${r.shown ? "opacity-100" : "invisible"} ${r.current ? p.focus : p.rest} ${
              isItem ? "ms-8" : ""
            }`}
          >
            <div className={size}>{formatInlineText(block, theme, termNames)}</div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-3">
        <span className={`px-3 py-1 rounded-xl border text-base font-black ${p.badge}`}>
          القسم {slide.sectionNumber} من {slide.sectionCount}
        </span>
        <h2 className="text-3xl xl:text-4xl font-black">{sectionHeading(slide.sectionTitle)}</h2>
        {slide.partCount > 1 && (
          <span className="flex items-center gap-1.5 ms-auto" aria-label={`الجزء ${slide.part} من ${slide.partCount}`}>
            {Array.from({ length: slide.partCount }, (_, i) => (
              <span key={i} className={`h-2 rounded-full transition-all ${i + 1 === slide.part ? "w-8 bg-sky-500" : "w-2 bg-slate-500/40"}`} />
            ))}
          </span>
        )}
      </header>

      {slide.figure ? (
        <div className="grid grid-cols-12 gap-8 items-start">
          <div className="col-span-7 space-y-6">
            {text}
            {slide.terms.length > 0 && <TermsPanel terms={slide.terms} theme={theme} />}
          </div>
          <div className="col-span-5">
            <Figure figure={slide.figure} theme={theme} onZoom={onZoom} />
          </div>
        </div>
      ) : (
        <>
          {text}
          {slide.terms.length > 0 && <TermsPanel terms={slide.terms} theme={theme} />}
        </>
      )}

      {slide.table && <Table table={slide.table} firstStep={slide.blocks.length} step={step} focus={focus} theme={theme} />}
    </div>
  );
}

function TermsPanel({ terms, theme }: { terms: DeckTerm[]; theme: PresentationTheme }) {
  const p = PALETTE[theme];
  return (
    <aside className={`rounded-2xl border p-5 space-y-3 ${p.card}`}>
      <p className={`flex items-center gap-2 text-base font-black ${p.muted}`}>
        <Tags className="w-5 h-5" />
        مصطلحات أساسية
      </p>
      {terms.map((t) => (
        <div key={t.termAr} className="text-xl leading-relaxed">
          <span className={`font-black ${p.term}`}>{t.termAr}</span>
          {t.termEn && (
            <span className={`ms-2 text-lg font-medium ${p.muted}`} dir="ltr">
              ({t.termEn})
            </span>
          )}
          {t.definition && <span className={p.soft}> — {t.definition}</span>}
        </div>
      ))}
    </aside>
  );
}

function Figure({ figure, theme, onZoom }: { figure: DeckFigure; theme: PresentationTheme; onZoom: (f: DeckFigure) => void }) {
  const p = PALETTE[theme];
  const [tone, setTone] = useState<ImageTone | null>(null);
  return (
    <figure className={`rounded-3xl border p-4 space-y-3 ${p.card}`}>
      <button type="button" onClick={() => onZoom(figure)} className="relative block w-full group cursor-zoom-in" title="تكبير الشكل">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={figure.src}
          src={getAssetPath(figure.src)}
          alt={figure.caption}
          onLoad={(e) => setTone(classifyImage(e.currentTarget))}
          className={`max-h-[52vh] w-auto mx-auto object-contain rounded-xl ${theme === "dark" ? imageToneClass(tone) : ""}`}
        />
        <span className="absolute top-2 left-2 p-2 rounded-xl bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-5 h-5" />
        </span>
      </button>
      <figcaption className={`text-lg font-bold text-center leading-relaxed ${p.soft}`}>{figure.caption}</figcaption>
    </figure>
  );
}

function Table({ table, firstStep, step, focus, theme }: { table: DeckTable; firstStep: number; step: number; focus: boolean; theme: PresentationTheme }) {
  const p = PALETTE[theme];
  return (
    <div className={`rounded-2xl border overflow-hidden ${p.card}`}>
      <table className="w-full text-right text-xl xl:text-2xl leading-relaxed">
        <thead>
          <tr className={p.tableHead}>
            {table.headers.map((h, i) => (
              <th key={i} className="px-5 py-3 font-black">
                {formatInlineText(h, theme)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, r) => {
            const rv = reveal(firstStep + r, step, focus);
            return (
              <tr key={r} className={`border-t transition-all duration-300 ${p.tableRow} ${rv.shown ? "opacity-100" : "invisible"} ${rv.current ? p.tableFocus : ""}`}>
                {row.map((cell, c) => (
                  <td key={c} className={`px-5 py-3 align-top ${c === 0 ? "font-bold" : ""}`}>
                    {formatInlineText(cell, theme)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function NoteSlide({ slide, theme }: SlideProps & { slide: Extract<DeckSlide, { kind: "note" }> }) {
  const p = PALETTE[theme];
  return (
    <div className={`max-w-6xl mx-auto rounded-3xl border-2 px-10 py-9 ${p.note}`}>
      <p className={`flex items-center gap-3 text-2xl font-black mb-5 ${p.noteTitle}`}>
        <Lightbulb className="w-8 h-8" />
        {slide.title ?? KEY_IDEA_LABEL}
      </p>
      <p className={`${textSize(slide.text.length, false)} font-bold`}>{formatInlineText(slide.text, theme)}</p>
    </div>
  );
}

function AnswerSlide({ slide, step, theme }: SlideProps & { slide: Extract<DeckSlide, { kind: "answer" }> }) {
  const p = PALETTE[theme];
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className={`rounded-3xl border-2 px-8 py-6 ${p.question}`}>
        <p className="flex items-center gap-2 text-lg font-black mb-3 opacity-80">
          <HelpCircle className="w-6 h-6" />
          السؤال الرئيسي
        </p>
        <p className="text-3xl font-bold leading-relaxed">{slide.question}</p>
      </div>
      <div className={`transition-opacity duration-300 ${step >= 2 ? "opacity-100" : "opacity-0"}`}>
        <p className={`text-lg font-black mb-3 ${p.muted}`}>الإجابة</p>
        <p className={textSize(slide.answer.length, false)}>{formatInlineText(slide.answer, theme)}</p>
      </div>
    </div>
  );
}

/** Short label for the slide overview. */
export function slideLabel(slide: DeckSlide): string {
  switch (slide.kind) {
    case "cover":
      return "الغلاف والسؤال الرئيسي";
    case "objectives":
      return "أهداف التعلم";
    case "path":
      return "مسار التعلّم";
    case "introduction":
      return "مقدمة الدرس";
    case "idea":
      return `${sectionHeading(slide.sectionTitle)}${slide.partCount > 1 ? ` (${slide.part} من ${slide.partCount})` : ""}`;
    case "note":
      return slide.title ?? KEY_IDEA_LABEL;
    case "summary":
      return "الخلاصة";
    case "answer":
      return "إجابة السؤال الرئيسي";
  }
}
