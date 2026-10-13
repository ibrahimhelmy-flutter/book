"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  DownloadCloud,
  CheckCircle2,
  X,
  FileText,
  Image as ImageIcon,
  Database,
  RefreshCw,
  HardDrive,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  Smartphone,
  Download,
} from "lucide-react";
import type { PartManifest } from "@/types/catalog";
import {
  deletePack,
  getPackStatus,
  offlineListPath,
  packCacheName,
  savePack,
  type OfflinePackList,
  type OfflinePackRecord,
} from "@/lib/offline-db";
import { getAssetPath } from "@/lib/utils";
import { usePWA } from "@/context/PWAContext";

type PackStatus = "idle" | "downloading" | "verifying" | "ready" | "stale" | "partial_error" | "quota_error";

interface Props {
  part: PartManifest;
  isOpen: boolean;
  onClose: () => void;
}

/** Inactivity timeout while waiting for service-worker progress messages. */
const WATCHDOG_MS = 35000;

const formatMB = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 2 : 1)} MB`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Lookup keys a cached url may be stored under (the SW also stores directory pages without the slash). */
function cacheKeysFor(url: string): string[] {
  const full = new URL(url, window.location.href).href;
  if (full.endsWith("/") && new URL(full).pathname !== "/") return [full, full.slice(0, -1)];
  return [full];
}

async function responseSize(resp: Response): Promise<number> {
  const len = Number(resp.headers.get("content-length"));
  if (Number.isFinite(len) && len > 0) return len;
  try {
    return (await resp.blob()).size;
  } catch {
    return 0;
  }
}

export function OfflinePackModal({ part, isOpen, onClose }: Props) {
  const { isInstalled, promptInstall, refreshOfflinePackStatus } = usePWA();
  const [status, setStatus] = useState<PackStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [record, setRecord] = useState<OfflinePackRecord | null>(null);
  const [packList, setPackList] = useState<OfflinePackList | null>(null);
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const busyRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const packTitle = `${part.bookTitle} — ${part.partShortTitle}`;

  const loadList = useCallback(async (): Promise<OfflinePackList | null> => {
    try {
      const res = await fetch(getAssetPath(offlineListPath(part.key)), { cache: "no-store" });
      if (!res.ok) return null;
      const list: OfflinePackList = await res.json();
      if (!Array.isArray(list.urls) || list.urls.length === 0) return null;
      setPackList(list);
      return list;
    } catch {
      // Offline, or `next dev` (the list is written by scripts/build.mjs after the export)
      return null;
    }
  }, [part.key]);

  const checkStatus = useCallback(async () => {
    const { state, record: rec } = await getPackStatus(part);
    setRecord(rec);
    setStatus(state === "ready" ? "ready" : state === "stale" ? "stale" : "idle");
    await refreshOfflinePackStatus();
  }, [part, refreshOfflinePackStatus]);

  useEffect(() => {
    if (!isOpen || busyRef.current) return;
    setPackList(null);
    setFailedUrls([]);
    setErrorMessage("");
    checkStatus();
    loadList();
  }, [isOpen, checkStatus, loadList]);

  // Detach service-worker listeners / timers if the modal unmounts mid-download
  useEffect(() => () => cleanupRef.current?.(), []);

  // Physical integrity audit: every listed url must be in this part's pack cache
  const performIntegrityAudit = async (requiredUrls: string[]) => {
    const missingUrls: string[] = [];
    let sizeBytes = 0;
    try {
      const cache = await caches.open(packCacheName(part.key));
      for (const url of requiredUrls) {
        let match: Response | undefined;
        for (const key of cacheKeysFor(url)) {
          match = await cache.match(key, { ignoreSearch: true });
          if (match) break;
        }
        if (match && match.status === 200) {
          sizeBytes += await responseSize(match);
        } else {
          missingUrls.push(url);
        }
      }
    } catch (e) {
      console.warn("CacheStorage verification error:", e);
      return { ok: false, missingUrls: requiredUrls, sizeBytes: 0 };
    }
    return { ok: missingUrls.length === 0, missingUrls, sizeBytes };
  };

  // Audit and finalize: ONLY save the pack record if every listed file is physically present
  const runFinalVerification = async (list: OfflinePackList, allRequiredUrls: string[], reportedFailed: string[] = []) => {
    setStatus("verifying");
    setCurrentStep("🔍 جاري التحقق النهائي من سلامة واكتمال كافة الملفات محلياً...");
    setProgress(95);

    const audit = await performIntegrityAudit(allRequiredUrls);
    busyRef.current = false;

    if (audit.ok && reportedFailed.length === 0) {
      const rec: OfflinePackRecord = {
        partKey: part.key,
        contentHash: part.contentHash,
        downloadedAt: new Date().toISOString(),
        fileCount: allRequiredUrls.length,
        counts: list.counts,
        sizeBytes: audit.sizeBytes || list.bytes,
      };
      await savePack(rec);
      setRecord(rec);
      setProgress(100);
      setCurrentStep("اكتمل التحقق بنجاح! كافة ملفات هذا الجزء جاهزة للعمل بدون إنترنت 🚀");
      setTimeout(() => {
        checkStatus();
      }, 800);
    } else {
      const missing = Array.from(new Set([...reportedFailed, ...audit.missingUrls]));
      setFailedUrls(missing);
      setStatus("partial_error");
      setErrorMessage(
        missing.length > 0
          ? `لم يكتمل التحميل: فشل تنزيل ${missing.length} مورد من أصل ${allRequiredUrls.length}.`
          : "لم يكتمل التحميل: تعذر التحقق من اكتمال بعض الملفات محلياً."
      );
    }
  };

  const handleStartDownload = async (urlsToRetry?: string[]) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setStatus("downloading");
    setProgress(0);
    setFailedUrls([]);
    setErrorMessage("");
    setCurrentStep("جاري تجهيز قائمة ملفات الحزمة...");

    const list = (await loadList()) ?? packList;
    if (!list) {
      busyRef.current = false;
      setStatus("partial_error");
      setErrorMessage("تعذّر تحميل قائمة ملفات الحزمة. تأكد من اتصالك بالإنترنت ثم أعد المحاولة.");
      return;
    }

    const fullList = list.urls.map((url) => getAssetPath(url));
    const isRetry = !!urlsToRetry && urlsToRetry.length > 0;
    const targetUrls = isRetry ? urlsToRetry : fullList;
    const total = targetUrls.length;
    const stepText = (done: number, ok?: number) =>
      `تنزيل الصفحات والبيانات والرسوم: ${done} من ${total} مورد${ok !== undefined ? ` (${ok} مكتمل)` : ""}...`;

    try {
      const controller = typeof navigator !== "undefined" ? navigator.serviceWorker?.controller : null;

      if (controller) {
        setCurrentStep(stepText(0, 0));
        let watchdogTimer: ReturnType<typeof setTimeout> | null = null;

        const cleanup = () => {
          if (watchdogTimer) clearTimeout(watchdogTimer);
          navigator.serviceWorker.removeEventListener("message", messageHandler);
          cleanupRef.current = null;
        };

        const resetWatchdog = () => {
          if (watchdogTimer) clearTimeout(watchdogTimer);
          watchdogTimer = setTimeout(async () => {
            cleanup();
            await runFinalVerification(list, fullList);
          }, WATCHDOG_MS);
        };

        const messageHandler = async (event: MessageEvent) => {
          if (event.data?.partKey !== part.key) return;
          if (event.data.type === "OFFLINE_PACK_PROGRESS") {
            resetWatchdog();
            const done = event.data.completed || 0;
            setProgress(Math.min(94, Math.round((done / Math.max(total, 1)) * 94)));
            setCurrentStep(stepText(done, event.data.successful || 0));
          } else if (event.data.type === "OFFLINE_PACK_COMPLETE") {
            cleanup();
            await runFinalVerification(list, fullList, event.data.failedUrls || []);
          }
        };

        cleanupRef.current?.();
        cleanupRef.current = cleanup;
        navigator.serviceWorker.addEventListener("message", messageHandler);
        resetWatchdog();
        controller.postMessage({ type: "CACHE_OFFLINE_PACK", partKey: part.key, urls: targetUrls, prune: !isRetry });
      } else if (typeof window !== "undefined" && "caches" in window) {
        // Direct CacheStorage fallback (no controlling service worker yet)
        const cache = await caches.open(packCacheName(part.key));
        const directFailed: string[] = [];
        let completed = 0;

        for (const url of targetUrls) {
          try {
            const resp = await fetch(url, { cache: "no-cache" });
            if (resp && resp.status === 200) {
              const [fullKey, noSlashKey] = cacheKeysFor(url);
              await cache.put(fullKey, resp.clone());
              if (noSlashKey) await cache.put(noSlashKey, resp.clone());
            } else {
              directFailed.push(url);
            }
          } catch (e: any) {
            if (e?.name === "QuotaExceededError") throw e;
            directFailed.push(url);
          }
          completed++;
          setProgress(Math.min(94, Math.round((completed / Math.max(total, 1)) * 94)));
          setCurrentStep(stepText(completed));
        }

        await runFinalVerification(list, fullList, directFailed);
      } else {
        await runFinalVerification(list, fullList);
      }
    } catch (error: any) {
      console.error("Failed to download offline pack:", error);
      busyRef.current = false;
      if (error?.name === "QuotaExceededError") {
        setStatus("quota_error");
        setErrorMessage("مساحة التخزين في جهازك ممتلئة. يرجى تحرير مساحة على القرص والمحاولة ثانية.");
      } else {
        setStatus("partial_error");
        setErrorMessage("حدث انقطاع في الشبكة أثناء تنزيل بعض الملفات. يمكنك إعادة المحاولة.");
      }
    }
  };

  const handleClearCache = async () => {
    if (!confirm(`هل تريد حذف حزمة «${packTitle}» المحلية وإخلاء مساحة التخزين؟`)) return;
    try {
      navigator.serviceWorker?.controller?.postMessage({ type: "DELETE_OFFLINE_PACK", partKey: part.key });
    } catch {
      /* no service worker */
    }
    if (typeof window !== "undefined" && "caches" in window) {
      await caches.delete(packCacheName(part.key)).catch(() => false);
    }
    await deletePack(part.key).catch(() => {});
    setRecord(null);
    setFailedUrls([]);
    setStatus("idle");
    await refreshOfflinePackStatus();
  };

  if (!isOpen) return null;

  const counts = packList?.counts ?? record?.counts ?? null;
  const sizeBytes = packList?.bytes ?? record?.sizeBytes ?? null;
  const downloadedDate = record?.downloadedAt ? formatDate(record.downloadedAt) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <DownloadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">{packTitle}</h3>
              <p className="text-xs text-slate-400">
                حزمة العمل بدون إنترنت (Offline Pack) — تنزيل هذا الجزء كاملاً للتصفح والحل دون اتصال
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PWA App Install Action Card */}
        <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">الخطوة ١: تثبيت المنصة كتطبيق (PWA)</span>
                <span className="px-1.5 py-0.2 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold">
                  تطبيق مستقل
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isInstalled
                  ? "المنصة مثبتة وتعمل كنافذة تطبيق مستقلة بدون شريط متصفح."
                  : "شغّل المنصة كبرنامج مستقل وسريع على سطح المكتب أو هاتفك."}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto shrink-0">
            {isInstalled ? (
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>مثبت بالفعل ✓</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  await promptInstall();
                }}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تثبيت التطبيق الآن</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Breakdown Header */}
        <div className="text-right">
          <span className="text-xs font-bold text-slate-300">الخطوة ٢: محتويات حزمة {part.partShortTitle} بدون إنترنت:</span>
        </div>

        {/* Content Breakdown */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-center space-y-1">
            <FileText className="w-4 h-4 text-indigo-400 mx-auto" />
            <div className="text-lg font-black font-mono text-white">{part.stats.totalLessons}</div>
            <div className="text-[10px] text-slate-400">
              درساً {counts ? `• ${counts.pages} صفحة` : ""}
            </div>
          </div>
          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-center space-y-1">
            <Database className="w-4 h-4 text-purple-400 mx-auto" />
            <div className="text-lg font-black font-mono text-white">{counts ? counts.data : "—"}</div>
            <div className="text-[10px] text-slate-400">ملف بيانات وأسئلة</div>
          </div>
          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-center space-y-1">
            <ImageIcon className="w-4 h-4 text-emerald-400 mx-auto" />
            <div className="text-lg font-black font-mono text-white">{counts ? counts.images : "—"}</div>
            <div className="text-[10px] text-slate-400">مخططاً ورسماً</div>
          </div>
        </div>

        {/* Measured Size & Architectural Guarantee */}
        <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl space-y-2 text-xs">
          {sizeBytes ? (
            <div className="flex items-center justify-between font-semibold text-indigo-300">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-indigo-400" />
                الحجم التقريبي للحزمة:
              </span>
              <span className="font-mono bg-indigo-900/60 px-2 py-0.5 rounded-md border border-indigo-500/40 text-emerald-400 font-bold">
                ~{formatMB(sizeBytes)}
              </span>
            </div>
          ) : null}
          <p className="text-slate-300 leading-relaxed text-[11px]">
            كل محتوى التعلم والتدريب لهذا الجزء متاح محليًا بعد اكتمال تنزيل Offline Pack والتحقق من سلامته، ولا يعتمد على Backend أو حسابات مستخدمين، مع خضوع التخزين لسياسات المتصفح والجهاز.
          </p>
        </div>

        {/* State 1: Downloading or Verifying */}
        {(status === "downloading" || status === "verifying") && (
          <div className="space-y-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 animate-fadeIn">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                {status === "verifying" ? "جاري الفحص والتحقق..." : "جاري التنزيل..."}
              </span>
              <span className="font-mono text-indigo-400">{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 truncate">{currentStep}</p>
          </div>
        )}

        {/* State 2: Partial Error (explicit failure state) */}
        {status === "partial_error" && (
          <div className="p-4 bg-amber-950/40 border border-amber-500/50 rounded-2xl space-y-3 animate-fadeIn">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold text-amber-300">⚠️ لم يكتمل التحميل</div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {errorMessage || `فشل تنزيل ${failedUrls.length} مورد بسبب بطء أو انقطاع اتصال الإنترنت.`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleStartDownload(failedUrls)}
              className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>
                {failedUrls.length > 0
                  ? `إعادة محاولة الموارد المتبقية (${failedUrls.length})`
                  : "إعادة المحاولة"}
              </span>
            </button>
          </div>
        )}

        {/* State 3: Quota Exceeded Error */}
        {status === "quota_error" && (
          <div className="p-4 bg-red-950/40 border border-red-500/50 rounded-2xl space-y-2 animate-fadeIn text-xs">
            <div className="flex items-center gap-2 font-bold text-red-400">
              <HardDrive className="w-4 h-4" />
              <span>مساحة التخزين ممتلئة</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              لا توجد مساحة كافية على جهازك أو في المتصفح لتخزين الحزمة كاملة. يرجى إخلاء بعض المساحة وإعادة المحاولة.
            </p>
          </div>
        )}

        {/* State 4: Update available (downloaded pack is older than the current content) */}
        {status === "stale" && (
          <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-300">تحديث متاح</div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  تغيّر محتوى هذا الجزء منذ آخر تنزيل. حدّث الحزمة لتحصل على أحدث نسخة بدون إنترنت.
                </p>
                {downloadedDate && <div className="text-[10px] text-slate-400">آخر تنزيل: {downloadedDate}</div>}
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearCache}
              title="حذف الحزمة وإخلاء المساحة"
              aria-label="حذف الحزمة"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* State 5: Verified Ready (only when every listed file is physically present) */}
        {status === "ready" && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  هذا الجزء جاهز ومفحوص تماماً للعمل بدون إنترنت
                </div>
                {record && (
                  <div className="text-[10px] text-slate-300 font-mono mt-0.5">
                    {record.counts.pages} صفحة • {record.counts.data} ملف بيانات • {record.counts.images} رسماً
                    {record.sizeBytes ? ` • ${formatMB(record.sizeBytes)}` : ""}
                  </div>
                )}
                {downloadedDate && <div className="text-[10px] text-slate-400">آخر تحديث: {downloadedDate}</div>}
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearCache}
              title="حذف الحزمة وإخلاء المساحة"
              aria-label="حذف الحزمة"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div>
          {status === "idle" && (
            <button
              type="button"
              onClick={() => handleStartDownload()}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <DownloadCloud className="w-5 h-5" />
              <span>
                تحميل {part.partShortTitle} كاملاً للعمل بدون إنترنت{sizeBytes ? ` (~${formatMB(sizeBytes)})` : ""}
              </span>
            </button>
          )}

          {status === "stale" && (
            <button
              type="button"
              onClick={() => handleStartDownload()}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xl shadow-amber-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCw className="w-5 h-5" />
              <span>تحديث الحزمة الآن{sizeBytes ? ` (~${formatMB(sizeBytes)})` : ""}</span>
            </button>
          )}

          {status === "ready" && (
            <button
              type="button"
              onClick={() => handleStartDownload()}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>إعادة التنزيل والتحقق من سلامة الملفات</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
