"use client";

import React, { useCallback, useMemo, useState } from "react";
import type { ExamsIndex, NavChapter } from "@/types/catalog";
import type { GeneratedExamModel } from "@/lib/exam-generator/types";
import { createExamModelFromQuestions, filterEnrichedQuestions } from "@/lib/practice";
import { ExamInteractiveRunner } from "@/components/exam-generator/ExamInteractiveRunner";
import { ComponentErrorBoundary } from "@/components/common/ComponentErrorBoundary";
import {
  REVIEW_PRESET,
  countLessons,
  difficultyCountsFromIndex,
  difficultyCountsFromQuestions,
  examDurationMinutes,
  filterOfficialQuestions,
  officialExamPool,
  officialExamTitle,
  officialExportFileName,
  officialScope,
  officialScopeSummary,
  officialStatsFromIndex,
  officialStatsFromQuestions,
  practiceExamTitle,
  practiceScope,
  practiceScopeSummary,
  sumBy,
  unitReviewCountInScope,
  unitReviewInfo,
  type ExamsTab,
} from "./exams-logic";
import { useExamsFilters } from "./use-exams-filters";
import { useOfficialBank, usePracticeBank } from "./use-question-banks";
import { downloadJson, useCopyJson, usePracticeSession, usePresetLauncher, useScore } from "./use-exam-session";
import { ExamsHeader } from "./ExamsHeader";
import { ExamsTabs } from "./ExamsTabs";
import { ScopeFilters } from "./ScopeFilters";
import { OfficialFilters } from "./OfficialFilters";
import { PracticeFilters } from "./PracticeFilters";
import { OfficialBankTab } from "./OfficialBankTab";
import { PracticeTab } from "./PracticeTab";
import { PresetsTab } from "./PresetsTab";
import { ExamConfigModal } from "./ExamConfigModal";
import { JsonExportModal } from "./JsonExportModal";

export interface ExamsViewProps {
  partKey: string;
  chapters: NavChapter[];
  examsIndex: ExamsIndex;
  /** Slug of the part's assessments companion (its JSON lives in public/data/<partKey>/<slug>/); null hides the official tab. */
  officialCompanionSlug: string | null;
}

/**
 * Unified questions & exams page for one part. Every count rendered before a fetch comes from
 * `examsIndex`; question files are fetched per lesson, only for the active tab's current scope.
 */
export function ExamsView({ partKey, chapters, examsIndex, officialCompanionSlug }: ExamsViewProps) {
  const hasOfficial = officialCompanionSlug !== null && examsIndex.official.length > 0;
  const [activeTab, setActiveTab] = useState<ExamsTab>(hasOfficial ? "official" : "practice");
  const [activeExamModel, setActiveExamModel] = useState<GeneratedExamModel | null>(null);
  const [isExamConfigOpen, setIsExamConfigOpen] = useState(false);
  const [isJsonOpen, setIsJsonOpen] = useState(false);

  const { filters, actions } = useExamsFilters();
  const { chapterIds, lessonKeys, unitReviewOnly, difficulty, search, officialSection, officialType } = filters;
  const practiceSession = usePracticeSession();
  const officialScore = useScore();
  const clipboard = useCopyJson();
  const presets = usePresetLauncher(partKey, examsIndex, chapters, setActiveExamModel);
  const isOfficialTab = activeTab === "official";

  // --- Index-derived counts and scope (no fetch needed) ---
  const review = useMemo(() => unitReviewInfo(examsIndex), [examsIndex]);
  const lessonCount = useMemo(() => countLessons(chapters), [chapters]);
  const counts = useMemo(
    () => ({
      practiceByChapter: sumBy(examsIndex.practice, (e) => e.chapterId, (e) => e.count),
      practiceByLesson: sumBy(examsIndex.practice, (e) => e.lessonKey, (e) => e.count),
      officialByChapter: sumBy(examsIndex.official, (e) => e.chapterId, (e) => e.count),
      officialByLesson: sumBy(examsIndex.official, (e) => e.lessonNumber, (e) => e.count),
    }),
    [examsIndex]
  );
  const practiceEntries = useMemo(
    () => practiceScope(examsIndex, { chapterIds, lessonKeys, unitReviewOnly }),
    [examsIndex, chapterIds, lessonKeys, unitReviewOnly]
  );
  const officialEntries = useMemo(() => officialScope(examsIndex, { chapterIds, lessonKeys }), [examsIndex, chapterIds, lessonKeys]);
  const practiceKeys = useMemo(() => practiceEntries.map((e) => e.lessonKey), [practiceEntries]);
  const officialIds = useMemo(() => officialEntries.map((e) => e.lessonId), [officialEntries]);
  const reviewCountInScope = useMemo(() => unitReviewCountInScope(examsIndex, chapterIds), [examsIndex, chapterIds]);

  // --- Question banks: fetched only for the active tab's scope ---
  const practiceBank = usePracticeBank(partKey, isOfficialTab ? null : practiceKeys);
  const officialBank = useOfficialBank(partKey, officialCompanionSlug, isOfficialTab ? officialIds : null);
  const practiceReady = practiceBank.status === "ready";
  const officialReady = officialBank.status === "ready";

  const searchedPractice = useMemo(
    () => filterEnrichedQuestions(practiceBank.questions, { searchQuery: search }),
    [practiceBank.questions, search]
  );
  const filteredPractice = useMemo(() => filterEnrichedQuestions(searchedPractice, { difficulty }), [searchedPractice, difficulty]);
  const difficultyCounts = useMemo(
    () => (practiceReady ? difficultyCountsFromQuestions(searchedPractice) : difficultyCountsFromIndex(practiceEntries)),
    [practiceReady, searchedPractice, practiceEntries]
  );
  const practiceAvailable = practiceReady ? filteredPractice.length : difficultyCounts[difficulty];

  const filteredOfficial = useMemo(
    () => filterOfficialQuestions(officialBank.questions, { section: officialSection, type: officialType, search }),
    [officialBank.questions, officialSection, officialType, search]
  );
  const officialStats = useMemo(
    () => (officialReady ? officialStatsFromQuestions(filteredOfficial) : officialStatsFromIndex(officialEntries, officialType)),
    [officialReady, filteredOfficial, officialEntries, officialType]
  );

  const practiceSummary = useMemo(
    () => practiceScopeSummary(chapters, { chapterIds, lessonKeys, unitReviewOnly }, review),
    [chapters, chapterIds, lessonKeys, unitReviewOnly, review]
  );
  const officialSummary = useMemo(
    () => officialScopeSummary(chapters, { chapterIds, lessonKeys, officialSection, officialType }),
    [chapters, chapterIds, lessonKeys, officialSection, officialType]
  );

  // --- Actions ---
  const toggleUnitReview = useCallback(
    () => actions.toggleUnitReview(review?.chapterIds[0] ?? null),
    [actions, review]
  );

  const startOfficialExam = () => {
    const pool = officialExamPool(filteredOfficial);
    if (pool.length === 0) return;
    const count = Math.min(pool.length, 30);
    setActiveExamModel(
      createExamModelFromQuestions(pool, {
        title: officialExamTitle(chapters, { chapterIds, lessonKeys }),
        durationMinutes: examDurationMinutes(count),
        maxQuestions: count,
        randomize: true,
      })
    );
  };

  const startPracticeExam = (count: number) => {
    if (filteredPractice.length === 0) return;
    setActiveExamModel(
      createExamModelFromQuestions(filteredPractice, {
        title: practiceExamTitle(chapters, { chapterIds, lessonKeys }),
        durationMinutes: examDurationMinutes(count),
        maxQuestions: count,
        randomize: true,
      })
    );
    setIsExamConfigOpen(false);
  };

  const downloadOfficial = () => downloadJson(filteredOfficial, officialExportFileName({ chapterIds, lessonKeys }));
  const exportData = isOfficialTab ? (officialReady ? filteredOfficial : null) : practiceReady ? filteredPractice : null;

  // =========================================================================
  // VIEW: Interactive running exam session
  // =========================================================================
  if (activeExamModel) {
    return (
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-8 min-w-0" dir="rtl">
        <ComponentErrorBoundary fallbackTitle="تعذر تشغيل جلسة الاختبار الإلكتروني">
          <ExamInteractiveRunner model={activeExamModel} onExit={() => setActiveExamModel(null)} />
        </ComponentErrorBoundary>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 sm:py-10 px-3 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        <ExamsHeader
          showOfficial={hasOfficial}
          isOfficialTab={isOfficialTab}
          officialTotal={examsIndex.totals.official}
          practiceTotal={examsIndex.totals.practice}
          lessonCount={lessonCount}
          canExport={exportData !== null}
          isCopied={clipboard.isCopied}
          onDownloadOfficial={downloadOfficial}
          onCopyJson={() => exportData && clipboard.copy(exportData)}
          onPreviewJson={() => setIsJsonOpen(true)}
        />

        <ExamsTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          showOfficial={hasOfficial}
          officialTotal={examsIndex.totals.official}
          practiceTotal={examsIndex.totals.practice}
        />

        <ScopeFilters
          isOfficial={isOfficialTab}
          chapters={chapters}
          scope={{ chapterIds, lessonKeys, unitReviewOnly }}
          actions={actions}
          totalCount={isOfficialTab ? examsIndex.totals.official : examsIndex.totals.practice}
          chapterCounts={isOfficialTab ? counts.officialByChapter : counts.practiceByChapter}
          lessonCounts={isOfficialTab ? counts.officialByLesson : counts.practiceByLesson}
          review={
            activeTab === "practice" && review
              ? {
                  label: review.label,
                  count: reviewCountInScope,
                  showInGrid: chapterIds.length === 0 || review.chapterIds.some((id) => chapterIds.includes(id)),
                  onToggle: toggleUnitReview,
                }
              : null
          }
        >
          {isOfficialTab ? (
            <OfficialFilters
              section={officialSection}
              type={officialType}
              search={search}
              onSectionChange={actions.setOfficialSection}
              onTypeChange={actions.setOfficialType}
              onSearchChange={actions.setSearch}
              scopeSummary={officialSummary}
              stats={officialStats}
              ready={officialReady}
              onStartExam={startOfficialExam}
              onDownload={downloadOfficial}
            />
          ) : (
            <PracticeFilters
              difficulty={difficulty}
              counts={difficultyCounts}
              onDifficultyChange={actions.setDifficulty}
              search={search}
              onSearchChange={actions.setSearch}
              scopeSummary={practiceSummary}
              available={practiceAvailable}
              ready={practiceReady}
              onOpenExamConfig={() => setIsExamConfigOpen(true)}
              isPresetsTab={activeTab === "presets"}
              onShowPresets={() => setActiveTab("presets")}
            />
          )}
        </ScopeFilters>

        {isOfficialTab ? (
          <OfficialBankTab
            bank={officialBank}
            questions={filteredOfficial}
            stats={officialStats}
            scopeSummary={officialSummary}
            page={filters.officialPage}
            onPageChange={actions.setOfficialPage}
            score={officialScore.score}
            onAnswer={officialScore.record}
            onResetScore={officialScore.reset}
            onDownload={downloadOfficial}
            onStartExam={startOfficialExam}
            onResetFilters={actions.reset}
          />
        ) : activeTab === "presets" ? (
          <PresetsTab
            chapters={chapters}
            review={review}
            launchingKey={presets.launchingKey}
            failedKey={presets.failedKey}
            onLaunch={presets.launch}
            onBackToPractice={() => setActiveTab("practice")}
          />
        ) : (
          <PracticeTab
            bank={practiceBank}
            questions={filteredPractice}
            page={filters.practicePage}
            onPageChange={actions.setPracticePage}
            questionIndex={filters.questionIndex}
            onQuestionIndexChange={actions.setQuestionIndex}
            session={practiceSession}
            reviewBanner={
              unitReviewOnly && review
                ? {
                    label: review.label,
                    launching: presets.launchingKey === REVIEW_PRESET,
                    onLaunchExam: () => presets.launch(REVIEW_PRESET),
                    onExit: toggleUnitReview,
                  }
                : null
            }
            onResetFilters={actions.reset}
          />
        )}
      </div>

      {isExamConfigOpen && (
        <ExamConfigModal
          scopeSummary={practiceSummary}
          available={filteredPractice.length}
          onStart={startPracticeExam}
          onClose={() => setIsExamConfigOpen(false)}
        />
      )}

      {isJsonOpen && exportData && (
        <JsonExportModal
          title={isOfficialTab ? "معاينة كود JSON لأسئلة التقييمات الرسمية للوزارة" : "معاينة كود JSON للأسئلة المفلترة"}
          data={exportData}
          isCopied={clipboard.isCopied}
          onCopy={() => clipboard.copy(exportData)}
          onClose={() => setIsJsonOpen(false)}
        />
      )}
    </div>
  );
}
