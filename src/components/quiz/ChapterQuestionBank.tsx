"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ClipboardList, ArrowLeft } from "lucide-react";
import type { Lesson } from "@/types";
import type { DeepChallengingQuestion } from "@/types/deep-questions";
import { dataUrl } from "@/content/paths";
import { useJson } from "@/lib/fetch-json";
import { integratedSectionId, tagChapterQuestions } from "@/lib/deep-question-kinds";
import { UNIT_BANK_ANCHOR, UNIT_BANK_OPEN_EVENT, takePendingUnitBank } from "@/components/common/UnitBankLink";
import { BankStatus } from "./LessonQuestionBanks";
import { DeepComprehensionViewer } from "./DeepComprehensionViewer";

export interface ChapterBankLesson {
  id: string;
  number: string;
  title: string;
}

/**
 * The chapter's review bank (deep/<n>-review.json): every question kind, filtered by lesson.
 * Fetched only after the learner opens it, like the lesson question banks.
 */
export function ChapterQuestionBank({
  partKey,
  chapterNumber,
  lessons,
  count,
}: {
  partKey: string;
  chapterNumber: number;
  lessons: ChapterBankLesson[];
  count: number;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  // Scroll only once the questions are in: before that the page is too short to bring the bank to the top.
  const scrollWhenReady = useRef(false);
  const loaded = useRef(false);
  const scrollToBank = useCallback(() => {
    requestAnimationFrame(() => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);
  const handleReady = useCallback(() => {
    loaded.current = true;
    if (!scrollWhenReady.current) return;
    scrollWhenReady.current = false;
    scrollToBank();
  }, [scrollToBank]);

  // Opened from the curriculum index icon: a click that navigated here, #unit-bank on arrival,
  // or the open event on this same page (already loaded → just scroll back to it).
  useEffect(() => {
    const openHere = () => {
      if (loaded.current) return scrollToBank();
      scrollWhenReady.current = true;
      setOpen(true);
    };
    if (takePendingUnitBank(chapterNumber) || window.location.hash === `#${UNIT_BANK_ANCHOR}`) openHere();
    const onOpen = (e: Event) => {
      if ((e as CustomEvent<number>).detail === chapterNumber) openHere();
    };
    window.addEventListener(UNIT_BANK_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(UNIT_BANK_OPEN_EVENT, onOpen);
  }, [chapterNumber, scrollToBank]);

  // The viewer filters by "sections": here one per lesson plus the cross-lesson questions.
  const pseudoLesson = useMemo(
    () =>
      ({
        id: `chapter-${chapterNumber}-review`,
        number: `${chapterNumber}-review`,
        keyConcepts: [],
        sections: [
          // "الدرس " first: the viewer strips a leading number from section titles ("1. …")
          ...lessons.map((l) => ({ id: l.id, title: `الدرس ${l.number}: ${l.title}`, content: "" })),
          { id: integratedSectionId(chapterNumber), title: "أسئلة شاملة تربط دروس الوحدة", content: "" },
        ],
      }) as unknown as Lesson,
    [chapterNumber, lessons]
  );

  return (
    <div id={UNIT_BANK_ANCHOR} ref={rootRef} className="scroll-mt-20">
      {open ? (
        <ChapterBankLoader partKey={partKey} chapterNumber={chapterNumber} lesson={pseudoLesson} onReady={handleReady} />
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-l from-indigo-950/60 to-slate-900 border border-indigo-500/30 hover:border-indigo-400/60 text-right flex items-center justify-between gap-4 transition-all cursor-pointer group shadow-lg"
        >
          <span className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5 text-indigo-300" />
            </span>
            <span>
              <span className="block text-base font-black text-white">بنك أسئلة الوحدة ({count} سؤالًا)</span>
              <span className="block text-xs text-slate-400 mt-1">
                اختيار من متعدد، وصواب وخطأ، وأكمل، ومقالي — أسئلة بمستوى الامتحان على دروس الوحدة كلها
              </span>
            </span>
          </span>
          <ArrowLeft className="w-5 h-5 text-indigo-300 shrink-0 group-hover:-translate-x-1 transition-transform" />
        </button>
      )}
    </div>
  );
}

function ChapterBankLoader({
  partKey,
  chapterNumber,
  lesson,
  onReady,
}: {
  partKey: string;
  chapterNumber: number;
  lesson: Lesson;
  onReady: () => void;
}) {
  const state = useJson<DeepChallengingQuestion[]>(dataUrl(partKey, `deep/${chapterNumber}-review.json`));
  useEffect(() => {
    if (state.status === "ready") onReady();
  }, [state.status, onReady]);
  return (
    <BankStatus state={state}>
      {(questions) => (
        <DeepComprehensionViewer
          lesson={lesson}
          questions={tagChapterQuestions(questions, chapterNumber)}
          heading={`بنك أسئلة الوحدة ${chapterNumber}`}
          sectionFilterLabel="تصفية الأسئلة بحسب الدرس:"
        />
      )}
    </BankStatus>
  );
}
