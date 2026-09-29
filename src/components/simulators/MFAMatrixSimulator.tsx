"use client";

import React, { useState } from "react";
import { UserCheck, ShieldCheck, ShieldAlert, KeyRound, Smartphone, Fingerprint, Lock, Shield, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";

export function MFAMatrixSimulator() {
  const [activeTab, setActiveTab] = useState<"factors_lab" | "matrix_calculator">("factors_lab");

  // Factors Lab State
  const [enablePassword, setEnablePassword] = useState<boolean>(true);
  const [enablePhoneOTP, setEnablePhoneOTP] = useState<boolean>(false);
  const [enableBiometric, setEnableBiometric] = useState<boolean>(false);
  const [simulatedAttack, setSimulatedAttack] = useState<"none" | "stolen_password" | "phishing_otp" | "full_compromise">("none");

  // Table 3 Security Combinations State
  const [combo, setCombo] = useState<"sym_only" | "sym_pub" | "asym_2fa" | "full_stack">("sym_only");

  // Evaluation of defense in Factors Lab
  const activeFactorsCount = (enablePassword ? 1 : 0) + (enablePhoneOTP ? 1 : 0) + (enableBiometric ? 1 : 0);

  const testLogin = (attack: "stolen_password" | "phishing_otp" | "full_compromise") => {
    setSimulatedAttack(attack);
  };

  const resetAttack = () => {
    setSimulatedAttack("none");
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black">مختبر المصادقة متعددة العوامل (MFA) ومصفوفة الأمان</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              استكشاف عوامل المصادقة الثلاثة واختبار مناعة الحسابات ضد الاختراق وفق مصفوفة الكتاب المدرسي (جدول 3)
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("factors_lab")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "factors_lab" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            }`}
          >
            مختبر العوامل الثلاثة 🔐
          </button>
          <button
            onClick={() => setActiveTab("matrix_calculator")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "matrix_calculator" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            }`}
          >
            مصفوفة تقنيات الأمان (جدول 3) 📊
          </button>
        </div>
      </div>

      {activeTab === "factors_lab" ? (
        <div className="space-y-6">
          {/* Explanation Banner */}
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 text-xs sm:text-sm text-emerald-200 leading-relaxed flex items-start gap-3">
            <span className="p-1 bg-emerald-500/20 rounded text-emerald-300 font-bold shrink-0">المفهوم الوزاري (ص 33-34):</span>
            <div>
              <strong>المصادقة (Authentication):</strong> التحقق من هوية المستخدم عبر فئات ثلاث:
              <strong> 1. شيء تعرفه (Knowledge)</strong> ككلمة المرور،
              <strong> 2. شيء تمتلكه (Possession)</strong> كالهاتف والبطاقة الذكية،
              <strong> 3. شيء فيك (Inherence)</strong> كبصمة الإصبع والوجه. الجمع بين عاملين أو أكثر يسمى <strong>المصادقة متعددة العوامل (MFA)</strong>.
            </div>
          </div>

          {/* Factor Controls */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-3 uppercase tracking-wider font-mono">
              تفعيل عوامل الأمان لحساب المستخدم:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Factor 1 */}
              <div
                onClick={() => setEnablePassword(!enablePassword)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                  enablePassword
                    ? "bg-slate-950 border-emerald-500 ring-2 ring-emerald-500/20"
                    : "bg-slate-950/50 border-slate-800 opacity-60 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${enablePassword ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                    {enablePassword ? "مفعّل" : "معطّل"}
                  </span>
                </div>
                <h5 className="font-bold text-sm text-white">العامل الأول: شيء تعرفه</h5>
                <p className="text-xs text-slate-400 mt-1">كلمة المرور السرية (Password) أو رمز PIN.</p>
              </div>

              {/* Factor 2 */}
              <div
                onClick={() => setEnablePhoneOTP(!enablePhoneOTP)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                  enablePhoneOTP
                    ? "bg-slate-950 border-emerald-500 ring-2 ring-emerald-500/20"
                    : "bg-slate-950/50 border-slate-800 opacity-60 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${enablePhoneOTP ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                    {enablePhoneOTP ? "مفعّل" : "معطّل"}
                  </span>
                </div>
                <h5 className="font-bold text-sm text-white">العامل الثاني: شيء تمتلكه</h5>
                <p className="text-xs text-slate-400 mt-1">رمز OTP يرسل لهاتف المستخدم أو تطبيق Authenticator.</p>
              </div>

              {/* Factor 3 */}
              <div
                onClick={() => setEnableBiometric(!enableBiometric)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                  enableBiometric
                    ? "bg-slate-950 border-emerald-500 ring-2 ring-emerald-500/20"
                    : "bg-slate-950/50 border-slate-800 opacity-60 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${enableBiometric ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                    {enableBiometric ? "مفعّل" : "معطّل"}
                  </span>
                </div>
                <h5 className="font-bold text-sm text-white">العامل الثالث: شيء فيك</h5>
                <p className="text-xs text-slate-400 mt-1">المصادقة الحيوية: بصمة الإصبع أو التعرف على الوجه.</p>
              </div>
            </div>
          </div>

          {/* Status summary */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">حالة التحقق الحالية للحساب:</span>
                <span className="text-sm font-bold text-white">
                  {activeFactorsCount === 0 && "🚨 بدون أي مصادقة (حساب مكشوف تماماً)"}
                  {activeFactorsCount === 1 && "⚠️ مصادقة أحادية العامل (1FA) - عرضة لسرقة بيانات الاعتماد"}
                  {activeFactorsCount === 2 && "🛡️ مصادقة ثنائية قوية (2FA) - مستوى أمان قياسي"}
                  {activeFactorsCount === 3 && "🌟 مصادقة ثلاثية متعددة العوامل (3FA/MFA) - أقصى حماية متقدمة"}
                </span>
              </div>
            </div>
            <div className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-300">
              عدد العوامل النشطة: {activeFactorsCount} من 3
            </div>
          </div>

          {/* Attack Simulator Launchpad */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>اختبار اختراق الحساب وسيناريوهات الهجوم السيبراني:</span>
              </h4>
              {simulatedAttack !== "none" && (
                <button
                  onClick={resetAttack}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> إعادة الضبط
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <button
                onClick={() => testLogin("stolen_password")}
                className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-right transition-all cursor-pointer"
              >
                <div className="text-xs font-bold text-amber-400">هجوم 1: تسريب كلمة المرور 🔓</div>
                <div className="text-[11px] text-slate-400 mt-1">المخترق اشترى كلمة مرور الحساب من تسريب بيانات دارج.</div>
              </button>

              <button
                onClick={() => testLogin("phishing_otp")}
                className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-right transition-all cursor-pointer"
              >
                <div className="text-xs font-bold text-red-400">هجوم 2: تصيد احتيالي لكلمة المرور 🎣</div>
                <div className="text-[11px] text-slate-400 mt-1">المستخدم أدخل كلمة المرور في موقع زائف، لكن جهازه وبصمته بحوزته.</div>
              </button>

              <button
                onClick={() => testLogin("full_compromise")}
                className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-right transition-all cursor-pointer"
              >
                <div className="text-xs font-bold text-purple-400">هجوم 3: سرقة الهاتف المحمول 📱</div>
                <div className="text-[11px] text-slate-400 mt-1">سارق تمكن من الحصول على هاتف المستخدم الفيزيائي.</div>
              </button>
            </div>

            {/* Attack Outcome Panel */}
            {simulatedAttack !== "none" && (
              <div className="p-4 rounded-xl border animate-fadeIn transition-all">
                {simulatedAttack === "stolen_password" && (
                  <div>
                    {!enablePassword ? (
                      <div className="bg-red-950/40 border border-red-500/50 p-3 rounded-lg text-red-300 text-xs">
                        ❌ الحساب لا يمتلك أي ضوابط وصول أصلاً! تم الاختراق الفوري.
                      </div>
                    ) : enablePhoneOTP || enableBiometric ? (
                      <div className="bg-emerald-950/40 border border-emerald-500/50 p-3 rounded-lg text-emerald-300 text-xs flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                        <div>
                          <strong>نجاح صد الهجوم بفضل المصادقة متعددة العوامل (MFA)!</strong>
                          <p className="mt-1 text-slate-300">
                            رغم امتلاك المخترق لكلمة المرور الصحيحة، إلا أن النظام طالبه برمز OTP أو البصمة الحيوية التي لا يملكها. تم حظر الدخول وتنبيه المستخدم.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-red-950/40 border border-red-500/50 p-3 rounded-lg text-red-300 text-xs flex items-start gap-2">
                        <XCircle className="w-4 h-4 mt-0.5 text-red-400 shrink-0" />
                        <div>
                          <strong>اختراق ناجح وكارثة أمنية!</strong>
                          <p className="mt-1 text-slate-300">
                            المستخدم يعتمد فقط على كلمة المرور (عامل واحد). بمجرد تسريبها، دخل المخترق وسيطر على الحساب بالكامل دون أي عائق.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {simulatedAttack === "phishing_otp" && (
                  <div>
                    {enableBiometric ? (
                      <div className="bg-emerald-950/40 border border-emerald-500/50 p-3 rounded-lg text-emerald-300 text-xs flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                        <div>
                          <strong>البصمة الحيوية (Inherence) أنقذت الموقف!</strong>
                          <p className="mt-1 text-slate-300">
                            حتى لو تم خداع المستخدم في صفحة تصيد، فإن السمات البيومترية الحيوية لا يمكن إرسالها أو تزييفها عبر الإنترنت بسهولة.
                          </p>
                        </div>
                      </div>
                    ) : enablePhoneOTP ? (
                      <div className="bg-amber-950/40 border border-amber-500/50 p-3 rounded-lg text-amber-300 text-xs flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 text-amber-400 shrink-0" />
                        <div>
                          <strong>حماية جزئية: خطر التصيد الآني لرمز الـ OTP!</strong>
                          <p className="mt-1 text-slate-300">
                            إذا قام الموقع المزيف بإعادة طلب رمز OTP فورياً، فقد يقوم المستخدم بإدخاله بالخطأ. إضافة البصمة الحيوية ترفع المناعة إلى 100%.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-red-950/40 border border-red-500/50 p-3 rounded-lg text-red-300 text-xs">
                        ❌ لا توجد حماية ثانوية! الحساب سقط تماماً في فخ التصيد.
                      </div>
                    )}
                  </div>
                )}

                {simulatedAttack === "full_compromise" && (
                  <div>
                    {enableBiometric && enablePassword ? (
                      <div className="bg-emerald-950/40 border border-emerald-500/50 p-3 rounded-lg text-emerald-300 text-xs flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                        <div>
                          <strong>سارق الهاتف عاجز تماماً!</strong>
                          <p className="mt-1 text-slate-300">
                            امتلاك الهاتف (شيء تمتلكه) وحده غير كافٍ، لأن النظام يشترط بصمة وجه المستخدم وكلمة المرور لفك القفل والوصول للخدمات.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-red-950/40 border border-red-500/50 p-3 rounded-lg text-red-300 text-xs">
                        ❌ بما أن المصادقة الحيوية معطلة، يستطيع حامل الهاتف قراءة الإشعارات ورموز الـ SMS واستعادة كلمات المرور واختراق المنظومة!
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* MATRIX CALCULATOR SECTION (TABLE 3 FROM BOOK) */
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-slate-200 mb-2">
              جدول 3 من كتاب الوزارة (ص 34): تكامل تقنيات الأمان وتأثيرها على المناعة
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              اختر إحدى تركيبات تقنيات الأمان المقررة في المنهج ولاحظ كيف تتكامل آليات التشفير والشهادات الرقمية والمصادقة لحماية البيانات وهوية المستخدم:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <button
                onClick={() => setCombo("sym_only")}
                className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
                  combo === "sym_only"
                    ? "bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30 text-white"
                    : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="text-xs font-mono text-indigo-400 mb-1">التركيبة 1</div>
                <div className="text-xs font-bold">فقط تشفير متناظر</div>
                <div className="text-[10px] text-slate-500 mt-1">مفتاح مشترك واحد</div>
              </button>

              <button
                onClick={() => setCombo("sym_pub")}
                className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
                  combo === "sym_pub"
                    ? "bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30 text-white"
                    : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="text-xs font-mono text-indigo-400 mb-1">التركيبة 2</div>
                <div className="text-xs font-bold">تشفير متناظر + مفتاح عام</div>
                <div className="text-[10px] text-slate-500 mt-1">تأمين تبادل المفاتيح</div>
              </button>

              <button
                onClick={() => setCombo("asym_2fa")}
                className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
                  combo === "asym_2fa"
                    ? "bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30 text-white"
                    : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="text-xs font-mono text-indigo-400 mb-1">التركيبة 3</div>
                <div className="text-xs font-bold">مفتاح عام + مصادقة ثنائية</div>
                <div className="text-[10px] text-slate-500 mt-1">أمان نقل + تحقق هوية</div>
              </button>

              <button
                onClick={() => setCombo("full_stack")}
                className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
                  combo === "full_stack"
                    ? "bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/30 text-emerald-300"
                    : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="text-xs font-mono text-emerald-400 mb-1">التركيبة 4 (الكاملة)</div>
                <div className="text-xs font-bold">الحزمة الشاملة (MFA + TLS + CA)</div>
                <div className="text-[10px] text-emerald-500 mt-1">أقصى مناعة سيبرانية</div>
              </button>
            </div>

            {/* Matrix Result Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              {combo === "sym_only" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="font-bold text-sm text-indigo-400">فقط تشفير متناظر (Symmetric Only)</span>
                    <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full">
                      مستوى المناعة: 25% (حماية محدودة)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-emerald-400 font-bold block mb-1">✅ الحماية المحققة:</span>
                      <p className="text-slate-300 leading-relaxed">
                        تأمين سرية البيانات المنقولة طالما بقي المفتاح المشترك سرياً ولم يتم اعتراضه.
                      </p>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-red-400 font-bold block mb-1">❌ الثغرات المتبقية:</span>
                      <p className="text-slate-300 leading-relaxed">
                        معضلة نقل المفتاح المشترك عبر الإنترنت بدون تشفير، وانعدام أي مصادقة لهوية المستخدم أو هوية الخادم.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {combo === "sym_pub" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="font-bold text-sm text-indigo-400">تشفير متناظر + مفتاح عام (Symmetric + Public Key)</span>
                    <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-full">
                      مستوى المناعة: 50% (حماية نقل متقدمة)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-emerald-400 font-bold block mb-1">✅ الحماية المحققة:</span>
                      <p className="text-slate-300 leading-relaxed">
                        حل معضلة تبادل المفاتيح عبر استخدام المفتاح العام لاشتقاق مفتاح جلسة سري وتشفير البيانات بسرعة فائقة.
                      </p>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-red-400 font-bold block mb-1">❌ الثغرات المتبقية:</span>
                      <p className="text-slate-300 leading-relaxed">
                        عدم وجود شهادة رقمية موثوقة (CA) يتيح هجمات الوسيط (Man-in-the-Middle)، وحسابات المستخدمين معرضة للاختراق لعدم وجود مصادقة ثنائية.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {combo === "asym_2fa" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="font-bold text-sm text-indigo-400">تشفير غير متناظر + مصادقة ثنائية (Asymmetric + 2FA)</span>
                    <span className="px-2.5 py-1 bg-teal-500/20 text-teal-300 text-xs font-bold rounded-full">
                      مستوى المناعة: 75% (حماية قوية للبيانات والمستخدم)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-emerald-400 font-bold block mb-1">✅ الحماية المحققة:</span>
                      <p className="text-slate-300 leading-relaxed">
                        حماية كاملة لجلسة المستخدم من سرقة كلمات المرور والتصيد، مع تبادل آمن للبيانات الحساسة.
                      </p>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-red-400 font-bold block mb-1">❌ الثغرات المتبقية:</span>
                      <p className="text-slate-300 leading-relaxed">
                        بدون شهادات رقمية صادرة من جهة معتمدة (CA)، لا يمكن للعميل التأكد من أنه يتصل فعلاً بالخادم الحقيقي للمؤسسة وليس خادماً منتحلاً.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {combo === "full_stack" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="font-bold text-sm text-emerald-400">
                      تشفير متناظر + مفتاح عام + شهادات رقمية + مصادقة متعددة العوامل (MFA)
                    </span>
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full">
                      مستوى المناعة: 100% (أقصى درجات الأمان المعياري)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-emerald-400 font-bold block mb-1">✅ الحماية المحققة الكاملة:</span>
                      <p className="text-slate-300 leading-relaxed">
                        سلسلة حماية لا ثغرة فيها: تأمين البيانات المنقولة، منع اعتراض المفاتيح، التثبت الجازم من هوية الخادم عبر CA، ومنع اختراق حسابات المستخدمين حتى لو سُرقت كلمات المرور!
                      </p>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-indigo-400 font-bold block mb-1">📌 تطبيق عملي في الواقع:</span>
                      <p className="text-slate-300 leading-relaxed">
                        المعايير المطبقة في البنوك المركزية، بوابات الامتحانات الوزارية الرسمية، والأنظمة الحكومية السحابية المشفرة.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
