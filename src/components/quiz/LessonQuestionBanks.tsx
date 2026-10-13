"use client";

import React from "react";
import Link from "next/link";
import { ClipboardCheck, Loader2, RotateCcw } from "lucide-react";
import type { Lesson } from "@/types";
import type { OfficialLessonAssessments } from "@/types/assessments";
import type { DeepChallengingQuestion } from "@/types/deep-questions";
import { companionHref, dataUrl } from "@/content/paths";
import { useJson, type JsonState } from "@/lib/fetch-json";
import { LessonOfficialAssessments } from "./LessonOfficialAssessments";
import { DeepComprehensionViewer } from "./DeepComprehensionViewer";

/**
 * Question banks of a lesson are separate JSON files (public/data/<part>/…), fetched only when the
 * learner opens the matching quiz tab — they never ship in the lesson page's JS.
 */

function BankStatus<T>({ state, children }: { state: JsonState<T>; children: (data: T) => React.ReactNode }) {
  if (state.status === "ready") return <>{children(state.data)}</>;
  if (state.status === "error") {
    return (
      <div className="p-6 text-center bg-slate-900 border border-rose-500/30 rounded-3xl space-y-3">
        <p className="text-sm text-rose-300">تعذر تحميل الأسئلة. تأكد من الاتصال بالإنترنت أو من تنزيل حزمة العمل بدون إنترنت.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> إعادة المحاولة
        </button>
      </div>
    );
  }
  return (
    <div className="p-10 flex flex-col items-center gap-3 text-slate-400 bg-slate-900/60 border border-slate-800 rounded-3xl" role="status">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      <span className="text-xs">جاري تحميل الأسئلة...</span>
    </div>
  );
}

export interface CompanionLink {
  slug: string;
  title: string;
  bookletPages?: string;
}

export function OfficialQuestionsTab({ partKey, lesson, companion }: { partKey: string; lesson: Lesson; companion: CompanionLink }) {
  const state = useJson<OfficialLessonAssessments>(dataUrl(partKey, `${companion.slug}/${lesson.id}.json`));
  return (
    <div className="space-y-3">
      <Link
        href={companionHref(partKey, companion.slug, lesson.chapterId, lesson.slug)}
        className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-bold transition-colors"
      >
        <span className="flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-amber-400" />
          افتح في {companion.title}
          {companion.bookletPages ? <span className="text-amber-400/80 font-mono">(ص {companion.bookletPages})</span> : null}
        </span>
        <span aria-hidden>←</span>
      </Link>
      <BankStatus state={state}>{(data) => <LessonOfficialAssessments lesson={lesson} assessments={data} />}</BankStatus>
    </div>
  );
}

export function DeepQuestionsTab({
  partKey,
  lesson,
  targetSectionId,
  onClearTargetSection,
}: {
  partKey: string;
  lesson: Lesson;
  targetSectionId?: string | null;
  onClearTargetSection?: () => void;
}) {
  const state = useJson<DeepChallengingQuestion[]>(dataUrl(partKey, `deep/${lesson.number}.json`));
  return (
    <BankStatus state={state}>
      {(questions) => (
        <DeepComprehensionViewer
          lesson={lesson}
          questions={questions}
          targetSectionId={targetSectionId}
          onClearTargetSection={onClearTargetSection}
        />
      )}
    </BankStatus>
  );
}
