"use client";

import React from "react";
import {
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  Server,
  Laptop,
  FileCheck2,
  Fingerprint,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Zap,
  Layers,
  AlertTriangle,
  FileKey,
  BadgeCheck,
  ShoppingCart,
  UserCheck,
  Network,
  Globe,
  Database,
  Activity,
  RefreshCw,
  AlertOctagon,
  Ban,
  Wifi,
  HardDrive,
} from "lucide-react";

interface Props {
  type: string;
  caption?: string;
}

export function StorylineDiagram({ type, caption }: Props) {
  const renderDiagram = () => {
    switch (type) {
      case "open-channel":
        return (
          <div className="space-y-4">
            {/* Danger: Plaintext HTTP */}
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-right">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  بروتوكول HTTP المكشوف (غير الآمن)
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">Plaintext</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-center">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center gap-2">
                  <Laptop className="w-4 h-4 text-slate-300" />
                  <span className="text-xs text-slate-200">المتصفح</span>
                </div>
                <div className="relative py-2">
                  <div className="h-0.5 bg-rose-500/50 w-full relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-rose-900/90 text-rose-200 text-[10px] px-2 py-0.5 rounded-full border border-rose-500/50 font-mono">
                      <span>كلمة_المرور: 123456</span>
                      <Eye className="w-3 h-3 text-rose-400 animate-pulse" />
                    </div>
                  </div>
                  <span className="text-[10px] text-rose-400 block mt-3 font-semibold">قناة مفتوحة: المتنصت يقرأ كل شيء!</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center gap-2">
                  <Server className="w-4 h-4 text-slate-300" />
                  <span className="text-xs text-slate-200">الخادم</span>
                </div>
              </div>
            </div>

            {/* Solution: Encrypted Wire */}
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-right">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  بروتوكول مشفر (حماية السرية)
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">Ciphertext</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-center">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center gap-2">
                  <Laptop className="w-4 h-4 text-emerald-300" />
                  <span className="text-xs text-slate-200">المتصفح</span>
                </div>
                <div className="relative py-2">
                  <div className="h-0.5 bg-emerald-500/50 w-full relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-emerald-900/90 text-emerald-200 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/50 font-mono">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      <span>x#9!kL$7@zQ</span>
                      <EyeOff className="w-3 h-3 text-emerald-400" />
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 block mt-3 font-semibold">بيانات مشفرة: يستحيل على المتنصت قراءتها</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center gap-2">
                  <Server className="w-4 h-4 text-emerald-300" />
                  <span className="text-xs text-slate-200">الخادم</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "symmetric-crisis":
        return (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4 text-right">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Sender */}
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <Laptop className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white">المرسل (المتصفح)</div>
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-500/20 text-amber-300 text-[11px] border border-amber-500/30">
                  <Key className="w-3 h-3 text-amber-400" />
                  <span>المفتاح السري (K)</span>
                </div>
                <div className="text-[11px] text-slate-400">يقفل الرسالة بـ K</div>
              </div>

              {/* The Danger Corridor */}
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-center space-y-2">
                <div className="flex items-center justify-center gap-1 text-rose-400 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 animate-bounce" />
                  <span>معضلة مشاركة المفتاح</span>
                </div>
                <div className="p-2 rounded bg-slate-950/80 border border-rose-500/30 text-[11px] text-rose-200 font-mono leading-relaxed">
                  كيف نرسل هذا المفتاح السري إلى الطرف الآخر لأول مرة دون أن يراه أحد في الطريق؟
                </div>
                <div className="text-[10px] text-slate-400">أي طرف وسيط يلتقط المفتاح سيتحكم في كل الاتصال</div>
              </div>

              {/* Receiver */}
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <Server className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-white">المستقبل (الخادم)</div>
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-500/20 text-amber-300 text-[11px] border border-amber-500/30">
                  <Key className="w-3 h-3 text-amber-400" />
                  <span>المفتاح السري (K)</span>
                </div>
                <div className="text-[11px] text-slate-400">يفك الرسالة بنفس المفتاح K</div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center text-xs text-emerald-300 flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>ميزة التشفير المتماثل: فائق السرعة وخفيف جداً، لكن عيبه الأكبر هو معضلة توزيع المفاتيح.</span>
            </div>
          </div>
        );

      case "asymmetric-keys":
        return (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4 text-right">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Public Key */}
              <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                    <Unlock className="w-4 h-4 text-blue-400" />
                    المفتاح العام (Public Key)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">منشور ومتاح للجميع</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  يوزعه الخادم علناً على كل المتصفحات في العالم. وظيفته الوحيدة هي <strong>التشفير (إغلاق الصندوق)</strong> فقط.
                </p>
                <div className="p-2 rounded bg-slate-950/70 border border-blue-500/20 text-[11px] text-blue-200">
                  🔒 أي شخص يستطيع إقفال الرسالة بهذا المفتاح.
                </div>
              </div>

              {/* Private Key */}
              <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-purple-400" />
                    المفتاح الخاص (Private Key)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">سري ومحفوظ بالخادم</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  يبقى في أمان تام داخل الخادم ولا يغادره أبداً. وظيفته الحصرية هي <strong>فك التشفير (فتح الصندوق)</strong>.
                </p>
                <div className="p-2 rounded bg-slate-950/70 border border-purple-500/20 text-[11px] text-purple-200">
                  🔑 صاحب الخادم وحده هو من يستطيع فك القفل وقراءة الرسالة.
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-center text-xs text-indigo-300">
              💡 <strong>النتيجة العبقرية:</strong> انتهت مشكلة مشاركة الأسرار، لأن المفتاح الذي يغلق ليس هو المفتاح الذي يفتح!
            </div>
          </div>
        );

      case "digital-certificate-signature":
        return (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4 text-right">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Digital Certificate */}
              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <BadgeCheck className="w-4 h-4 text-cyan-400" />
                    الشهادة الرقمية (بطاقة الهوية)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">إثبات النطاق</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  وثيقة رسمية صادرة من جهة موثوقة (CA) تثبت أن هذا المفتاح العام يعود بالفعل لاسم الموقع المعني (مثلاً البنك أو المدرسة).
                </p>
                <div className="p-2 rounded bg-slate-950/80 border border-cyan-500/20 text-[11px] text-cyan-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>تحمي المتصفح من الوقوع في فخ <strong>انتحال الهوية (Spoofing)</strong>.</span>
                </div>
              </div>

              {/* Digital Signature */}
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-amber-400" />
                    التوقيع الرقمي (الختم الذي لا يُزوّر)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">سلامة وعدم تنصل</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  بصمة رقمية مشفرة بالمفتاح الخاص؛ تثبت أن الرسالة لم تتغير في الطريق (سلامة البيانات)، وتمنع المرسل من إنكار إرسالها.
                </p>
                <div className="p-2 rounded bg-slate-950/80 border border-amber-500/20 text-[11px] text-amber-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>توفر مبدأ <strong>عدم التنصل (Non-Repudiation)</strong> واكتشاف التلاعب.</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "tls-handshake":
        return (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3.5 text-right">
            <div className="text-xs font-bold text-indigo-300 flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-400" />
                سير مصافحة TLS داخل HTTPS: الهجين المثالي
              </span>
              <span className="text-[10px] text-slate-400 font-mono">في أجزاء من الثانية</span>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Step 1 */}
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <span className="font-bold text-white">التحقق من الشهادة والمفتاح العام:</span>
                    <span className="text-slate-400 mr-1.5">الخادم يرسل شهادته الرقمية ومفتاحه العام؛ المتصفح يتأكد من الهوية.</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 shrink-0">بالمفتاح العام</span>
              </div>

              {/* Step 2 */}
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <span className="font-bold text-white">اشتقاق مفتاح الجلسة المشترك:</span>
                    <span className="text-slate-400 mr-1.5">يتم الاتفاق بأمان تام على مفتاح سري عشوائي مؤقت لهذه الجلسة.</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 shrink-0">اتفاق آمن</span>
              </div>

              {/* Step 3 */}
              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <span className="font-bold text-emerald-300">التحول للتشفير المتماثل فائق السرعة:</span>
                    <span className="text-slate-300 mr-1.5">تُشفر كل صفحات وبيانات الجلسة بسرعة البرق وكفاءة قصوى!</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 shrink-0 font-bold">متماثل وسريع</span>
              </div>
            </div>
          </div>
        );

      case "mfa-factors":
        return (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4 text-right">
            <div className="text-xs font-bold text-white flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                فئات عوامل المصادقة الثلاث (MFA Categories)
              </span>
              <span className="text-[10px] text-slate-400">يجب اختيار عاملين من فئتين مختلفتين</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Factor 1: Knowledge */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-indigo-500/20 text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <Key className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-indigo-300">1. المعرفة (Knowledge)</div>
                <div className="text-[11px] font-semibold text-white">"شيء تعرفه"</div>
                <p className="text-[10px] text-slate-400">كلمة المرور، رمز PIN، الإجابة عن سؤال أمان.</p>
              </div>

              {/* Factor 2: Possession */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/20 text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-emerald-300">2. الحيازة (Possession)</div>
                <div className="text-[11px] font-semibold text-white">"شيء تملكه"</div>
                <p className="text-[10px] text-slate-400">هاتفك لتلقي رمز، تطبيق مصادقة، بطاقة ذكية.</p>
              </div>

              {/* Factor 3: Inherence */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/20 text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                  <Fingerprint className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-purple-300">3. السمات الحيوية (Inherence)</div>
                <div className="text-[11px] font-semibold text-white">"شيء أنت عليه"</div>
                <p className="text-[10px] text-slate-400">بصمة الإصبع، التعرف على الوجه، بصمة العين.</p>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>لماذا تحميك؟</strong> لو سرق المهاجم كلمة مرورك (المعرفة)، سيفشل فوراً لأنه لا يملك هاتفك في يده (الحيازة) ولا بصمتك (السمة الحيوية)!
              </span>
            </div>
          </div>
        );

      case "firewall-gate":
        return (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4 text-right">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-center">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <Globe className="w-6 h-6 text-blue-400 mx-auto" />
                <div className="text-xs font-bold text-white">الإنترنت الخارجي</div>
                <div className="text-[10px] text-slate-400">حركة مرور متنوعة</div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>جدار الحماية (Firewall)</span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="p-1 rounded bg-emerald-950/50 border border-emerald-500/30 text-emerald-300">
                    ✓ حركة الويب (Web): مسموح
                  </div>
                  <div className="p-1 rounded bg-rose-950/50 border border-rose-500/30 text-rose-300">
                    ✕ الوصول لقواعد البيانات: ممنوع
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <Server className="w-6 h-6 text-indigo-400 mx-auto" />
                <div className="text-xs font-bold text-white">الشبكة الداخلية</div>
                <div className="text-[10px] text-emerald-400 font-semibold">محمية من الاتصالات المباشرة</div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-center text-xs text-indigo-300">
              🛡️ يراقب حركة مرور الشبكة ويسمح بها أو يمنعها عند نقطة الدخول/الخروج استناداً لقواعد محددة مسبقاً.
            </div>
          </div>
        );

      case "vpn-tunnel":
        return (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4 text-right">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-center">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <Laptop className="w-6 h-6 text-indigo-400 mx-auto" />
                <div className="text-xs font-bold text-white">الموظف عن بُعد</div>
                <div className="text-[10px] text-amber-400 flex items-center justify-center gap-1">
                  <Wifi className="w-3 h-3" />
                  <span>Wi-Fi عام (مقهى / فندق)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-1">
                <div className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>نفق VPN مشفر</span>
                </div>
                <div className="p-1.5 rounded bg-slate-950 border border-emerald-500/30 text-[10px] text-emerald-200 font-mono">
                  == نفق اتصال مشفر ==
                </div>
                <div className="text-[10px] text-slate-400">حماية تامة من التنصت الخارجي</div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-1">
                <Network className="w-6 h-6 text-indigo-400 mx-auto" />
                <div className="text-xs font-bold text-white">شبكة المؤسسة الخاصة</div>
                <div className="text-[10px] text-emerald-300">وصول آمن للملفات والسيرفرات</div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center text-xs text-emerald-300">
              🔒 شبكة افتراضية خاصة تحفر نفقاً منطقياً مشفراً عبر الإنترنت العام؛ فتمنع التنصت حتى على شبكات Wi-Fi العامة.
            </div>
          </div>
        );

      case "dmz-architecture":
        return (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3.5 text-right">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Zone 1: Internet */}
              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-center space-y-1.5">
                <Globe className="w-5 h-5 text-rose-400 mx-auto" />
                <div className="text-xs font-bold text-rose-300">1. الإنترنت العام</div>
                <p className="text-[10px] text-slate-400">منطقة غير موثوقة تماماً ومصدر التهديدات.</p>
              </div>

              {/* Zone 2: DMZ */}
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-center space-y-1.5 relative">
                <div className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>2. المنطقة المعزولة (DMZ)</span>
                </div>
                <div className="p-1.5 rounded bg-slate-950/80 border border-amber-500/30 text-[10px] text-white">
                  خوادم الويب + خوادم البريد
                </div>
                <p className="text-[10px] text-amber-200/80">خوادم مواجهة للجمهور، منفصلة تماماً عن الداخل.</p>
              </div>

              {/* Zone 3: Internal Net */}
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-1.5">
                <Database className="w-5 h-5 text-emerald-400 mx-auto" />
                <div className="text-xs font-bold text-emerald-300">3. الشبكة الداخلية</div>
                <div className="p-1.5 rounded bg-slate-950/80 border border-emerald-500/30 text-[10px] text-white">
                  قواعد البيانات + ملفات العملاء
                </div>
                <p className="text-[10px] text-emerald-200/80">معزولة تماماً ولا تتصل بالإنترنت مباشرة.</p>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center text-xs text-amber-300">
              💡 <strong>الفائدة القصوى:</strong> لو تعرّض خادم الويب العام لاختراق، يظل المهاجم محاصراً داخل DMZ ولا يصل للشبكة الداخلية.
            </div>
          </div>
        );

      case "defense-in-depth-layers":
        return (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 text-right">
            <div className="text-xs font-bold text-indigo-300 flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                طبقات الدفاع في العمق (Defense in Depth)
              </span>
              <span className="text-[10px] text-slate-400">إذا سقطت طبقة... حمى النظامَ الطبقاتُ الأخرى</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-indigo-500/30 flex items-center justify-between">
                <span className="font-bold text-white">الطبقة 1: جدار الحماية (Firewall)</span>
                <span className="text-[10px] text-indigo-300">صد الهجمات عند المحيط الخارجي</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-amber-500/30 flex items-center justify-between">
                <span className="font-bold text-white">الطبقة 2: المنطقة المعزولة (DMZ)</span>
                <span className="text-[10px] text-amber-300">عزل الخوادم العامة عن البيانات السرية</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-cyan-500/30 flex items-center justify-between">
                <span className="font-bold text-white">الطبقة 3: VPN وتأمين الأجهزة الطرفية</span>
                <span className="text-[10px] text-cyan-300">حماية اتصالات العاملين عن بُعد وحواسيبهم</span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                <span className="font-bold text-emerald-300">الطبقة 4: تشفير البيانات وضوابط الوصول الداخلي</span>
                <span className="text-[10px] text-emerald-300 font-bold">الحصن الأخير حتى لو اختُرق المحيط</span>
              </div>
            </div>
          </div>
        );

      case "zero-trust-principle":
        return (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4 text-right">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Old Model */}
              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <Ban className="w-4 h-4 text-rose-400" />
                  النهج التقليدي (المحيط الأمني)
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  يفترض أن <strong>"الداخل آمن والخارج خطر"</strong>. إذا استطاع المهاجم اختراق جهاز واحد بالداخل، يتنقل بحرية بين كل الملفات!
                </p>
                <div className="p-1.5 rounded bg-slate-950 text-[10px] text-rose-300 border border-rose-500/20">
                  ⚠️ غير مناسب في عصر السحابة والعمل عن بُعد.
                </div>
              </div>

              {/* Zero Trust */}
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-2">
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  نهج انعدام الثقة (Zero Trust)
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  قاعدة: <strong>"لا تثق تلقائياً بأي مستخدم أو جهاز لمجرد وجوده داخل الشبكة"</strong>. يتم فحص الهوية والصلاحيات والسياق عند كل طلب.
                </p>
                <div className="p-1.5 rounded bg-slate-950 text-[10px] text-emerald-300 border border-emerald-500/20">
                  ✓ تحقق مستمر ودائم من كل عملية وصول.
                </div>
              </div>
            </div>
          </div>
        );

      case "incident-definition":
        return (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3.5 text-right">
            <div className="text-xs font-bold text-white flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                أركان الحادث الأمني (تهديد أمان المعلومات الثلاثي)
              </span>
              <span className="text-[10px] text-rose-300 font-mono">CIA Triad Impact</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-indigo-500/20 text-center space-y-1">
                <Eye className="w-5 h-5 text-indigo-400 mx-auto" />
                <div className="text-xs font-bold text-white">السرية (Confidentiality)</div>
                <div className="text-[10px] text-rose-300">تسريب بيانات الطلاب أو العملاء</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/20 text-center space-y-1">
                <Activity className="w-5 h-5 text-amber-400 mx-auto" />
                <div className="text-xs font-bold text-white">السلامة (Integrity)</div>
                <div className="text-[10px] text-amber-300">تعديل غير مصرح به في الدرجات</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/20 text-center space-y-1">
                <RefreshCw className="w-5 h-5 text-emerald-400 mx-auto" />
                <div className="text-xs font-bold text-white">التوافر (Availability)</div>
                <div className="text-[10px] text-emerald-300">تشفير الأنظمة ببرمجيات الفدية</div>
              </div>
            </div>
          </div>
        );

      case "six-stages-flow":
        return (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3.5 text-right">
            <div className="text-xs font-bold text-indigo-300 flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-400" />
                المراحل الست للاستجابة للحوادث
              </span>
              <span className="text-[10px] text-slate-400">تسلسل منظم مع إمكانية التداخل والعودة</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-0.5">
                <span className="text-[10px] font-bold text-indigo-400">1. التحضير</span>
                <div className="text-[10px] text-slate-300">خطط وتدريب ونُسخ احتياطية</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-0.5">
                <span className="text-[10px] font-bold text-blue-400">2. الاكتشاف</span>
                <div className="text-[10px] text-slate-300">رصد الإنذار وتحليل الحادث</div>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/40 text-center space-y-0.5">
                <span className="text-[10px] font-bold text-amber-300">3. الاحتواء</span>
                <div className="text-[10px] text-amber-200">عزل الجزء المتأثر لوقف النزيف</div>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/40 text-center space-y-0.5">
                <span className="text-[10px] font-bold text-rose-300">4. الاستئصال</span>
                <div className="text-[10px] text-rose-200">إزالة السبب الجذري وسد الثغرة</div>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-center space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-300">5. الاستعادة</span>
                <div className="text-[10px] text-emerald-200">إعادة التشغيل من النسخ السليمة</div>
              </div>
              <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-500/40 text-center space-y-0.5">
                <span className="text-[10px] font-bold text-purple-300">6. الدروس المستفادة</span>
                <div className="text-[10px] text-purple-200">التحسين وتحديث إجراءات الوقاية</div>
              </div>
            </div>

            <div className="p-2 rounded bg-indigo-500/10 border border-indigo-500/20 text-center text-[11px] text-indigo-300">
              🔄 <strong>ملاحظة المنهج:</strong> قد يكشف الاسترداد عن بقايا للتهديد تستلزم العودة فوراً إلى مرحلتي الاحتواء أو الاستئصال!
            </div>
          </div>
        );

      case "containment-vs-eradication":
        return (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3.5 text-right">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-2">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  أولاً: الاحتواء (وقف انتشار الحريق)
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  فصل الجهاز المصاب عن الشبكة فوراً. الهدف ليس معاقبة الفيروس الآن، بل <strong>منعه من الانتشار</strong> وتشفير باقي خوادم المؤسسة!
                </p>
                <div className="p-1.5 rounded bg-slate-950 text-[10px] text-amber-300 border border-amber-500/30">
                  🔌 فصل كابل الشبكة أو عزل النطاق المنطقي.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-2">
                <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <Ban className="w-4 h-4 text-rose-400" />
                  ثانياً: الاستئصال (اقتلاع الجذور بهدوء)
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  بعد أن تم احتواء الخطر وتأمينه، يبدأ الفريق في فحص البرمجية الخبيثة، حذف ملفاتها، وسد الثغرة البرمجية التي استغلها المهاجم.
                </p>
                <div className="p-1.5 rounded bg-slate-950 text-[10px] text-rose-300 border border-rose-500/30">
                  🧹 تنظيف النظام بالكامل قبل التفكير في استعادته.
                </div>
              </div>
            </div>
          </div>
        );

      case "risk-matrix-formula":
        return (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3.5 text-right">
            <div className="p-3 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-center">
              <span className="text-xs font-bold text-indigo-300">
                قانون تقييم المخاطر المبسط بالمنهج:
              </span>
              <div className="text-sm font-black text-white mt-1">
                درجة الخطر = درجة التأثير × درجة الاحتمالية
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-[11px] space-y-1">
                <span className="font-bold text-emerald-300">تأثير منخفض × احتمالية منخفضة</span>
                <p className="text-[10px] text-slate-400">خطر منخفض: يُراقب دورياً</p>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-[11px] space-y-1">
                <span className="font-bold text-amber-300">تأثير متوسط / احتمالية متوسطة</span>
                <p className="text-[10px] text-slate-400">خطر متوسط: تُوضع له ضوابط وقائية</p>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-[11px] space-y-1">
                <span className="font-bold text-rose-300">تأثير عالي × احتمالية عالية</span>
                <p className="text-[10px] text-rose-200 font-bold">أولوية قصوى: معالجة فورية طارئة!</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="my-5 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/60 p-4 shadow-inner">
      {renderDiagram()}
      {caption && (
        <div className="mt-3 text-center text-[11px] text-slate-400 font-medium">
          📐 {caption}
        </div>
      )}
    </div>
  );
}
