"use client";

import React, { useState } from "react";
import { getExamEngineContainer } from "@/core/infrastructure/bootstrap";
import { RawBookImportPayload } from "@/core/application/use-cases/ImportBookUseCase";
import { X, Upload, CheckCircle2, AlertCircle, Sparkles, BookOpen } from "lucide-react";
import { fireConfetti } from "@/lib/confetti";

interface ImportBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookImported: (bookId: string) => void;
}

const SAMPLE_IMPORT_TEMPLATE: RawBookImportPayload = {
  id: "data-structures-grade-3",
  title: "هياكل البيانات والخوارزميات المتقدمة — الصف الثالث الثانوي",
  englishTitle: "Advanced Data Structures & Algorithms",
  subjectNameAr: "علوم الحاسب المتقدمة",
  gradeNameAr: "الصف الثالث الثانوي",
  description: "مقرر هياكل البيانات المتقدمة (المصفوفات، القوائم المترابطة، الأشجار) وخوارزميات البحث والترتيب.",
  chapters: [
    {
      id: "ds3-ch1",
      number: 1,
      title: "هياكل البيانات الخطية (Linear Data Structures)",
      description: "المكدسات (Stacks)، الطوابير (Queues)، والقوائم المترابطة (Linked Lists).",
      lessons: [
        {
          id: "ds3-l1-1",
          number: "1-1",
          title: "المكدس (Stack) ومبدأ LIFO",
          pageRange: "10 - 22",
          keyConcepts: [
            {
              termAr: "المكدس",
              termEn: "Stack",
              definition: "هيكل بيانات خطي يعتمد على مبدأ ما يدخل آخراً يخرج أولاً (LIFO - Last In First Out).",
            },
            {
              termAr: "عملية الدفع",
              termEn: "Push",
              definition: "إضافة عنصر جديد إلى قمة المكدس (Top of Stack).",
            },
            {
              termAr: "عملية الحذف",
              termEn: "Pop",
              definition: "إزالة واسترجاع العنصر الموجود في قمة المكدس.",
            },
          ],
          sections: [
            {
              id: "ds3-sec1",
              title: "1. تطبيقات المكدس في أنظمة التشغيل والبرمجة",
              content: "يُستخدم المكدس في إدارة استدعاء الدوال التكرارية (Call Stack)، وعمليات التراجع (Undo) في محررات النصوص، والتحقق من توازن الأقواس في المترجمات.",
            },
          ],
          questions: [
            {
              id: "q-ds3-1",
              type: "mcq",
              question: "يعتمد هيكل بيانات المكدس (Stack) على مبدأ:",
              correctAnswer: "a",
              options: [
                { id: "a", text: "ما يدخل آخراً يخرج أولاً (LIFO)" },
                { id: "b", text: "ما يدخل أولاً يخرج أولاً (FIFO)" },
                { id: "c", text: "الوصول العشوائي المباشر (Direct Access)" },
                { id: "d", text: "الأولوية بحسب الوزن (Priority)" },
              ],
              explanation: "المكدس يعمل بمبدأ LIFO حيث تتم الإضافة والحذف من القمة فقط.",
              marks: 1,
            },
            {
              id: "q-ds3-2",
              type: "definition",
              question: "اكتب المصطلح العلمي: «إضافة عنصر جديد إلى قمة المكدس».",
              correctAnswer: "عملية الدفع (Push)",
              marks: 2,
            },
          ],
        },
      ],
    },
  ],
};

export function ImportBookModal({ isOpen, onClose, onBookImported }: ImportBookModalProps) {
  const [jsonText, setJsonText] = useState(JSON.stringify(SAMPLE_IMPORT_TEMPLATE, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleImport = async () => {
    setError(null);
    setSuccess(null);
    setIsProcessing(true);

    try {
      const parsed = JSON.parse(jsonText);
      const container = getExamEngineContainer();
      const res = await container.importBookUseCase.execute(parsed);

      setSuccess(
        `تم بنجاح استيراد كتاب «${res.book.title}» (${res.totalChapters} فصول، ${res.totalLessons} دروس، و ${res.importedQuestionsCount} أسئلة معتمدة)!`
      );
      fireConfetti({ particleCount: 120, spread: 85, origin: { y: 0.6 } });

      setTimeout(() => {
        onBookImported(res.book.id);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(`خطأ في استيراد الكتاب: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 text-white shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar box-border">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                استيراد كتاب أو مقرر جديد (Data-Driven Book Import)
              </h3>
              <p className="text-xs text-slate-400">
                أضف أي كتاب تعليمي جديد بصيغة JSON ليدخل المنظومة وتوليد الامتحانات فوراً دون أي تعديل كود.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message alerts */}
        {error && (
          <div className="p-3.5 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* JSON Editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>مخطط بيانات الكتاب التعليمي (JSON Schema):</span>
            <button
              type="button"
              onClick={() => setJsonText(JSON.stringify(SAMPLE_IMPORT_TEMPLATE, null, 2))}
              className="text-indigo-400 hover:underline cursor-pointer"
            >
              إعادة ملء النموذج التجريبي
            </button>
          </div>

          <textarea
            rows={12}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-xs font-mono text-indigo-200 focus:outline-none focus:border-indigo-500 resize-y leading-relaxed dir-ltr"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            إلغاء
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleImport}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isProcessing ? "جاري الاستيراد..." : "تأكيد واستيراد الكتاب إلى المنظومة"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
