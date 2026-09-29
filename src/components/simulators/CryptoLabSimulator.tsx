"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  MessageSquare,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Unlock,
  UserRound,
  Wifi,
  XCircle,
} from "lucide-react";

/**
 * Educational simulator only.
 *
 * IMPORTANT:
 * The transformations below are deliberately visual/pedagogical.
 * They are NOT implementations of AES/RSA/TLS and must not be presented
 * as production cryptography.
 */
export function CryptoLabSimulator() {
  const [mode, setMode] = useState<"symmetric" | "asymmetric">("symmetric");

  // ---------------- Symmetric ----------------
  const [symPlaintext, setSymPlaintext] = useState("درجات الطلاب سرية");
  const [symKey, setSymKey] = useState("K3y99");
  const [symDecKey, setSymDecKey] = useState("K3y99");
  const [showLeak, setShowLeak] = useState(false);

  const symmetricCipher = useMemo(
    () => demoEncrypt(symPlaintext, symKey),
    [symPlaintext, symKey],
  );

  const symmetricDecrypted = useMemo(
    () => demoDecrypt(symmetricCipher, symDecKey),
    [symmetricCipher, symDecKey],
  );

  const symmetricSuccess =
    Boolean(symKey) &&
    Boolean(symDecKey) &&
    symKey === symDecKey &&
    symmetricDecrypted === symPlaintext;

  // ---------------- Asymmetric ----------------
  const [asymPlaintext, setAsymPlaintext] = useState(
    "أريد إرسال رسالة سرية إلى الخادم",
  );
  const [asymKeyChoice, setAsymKeyChoice] = useState<
    "private" | "public" | "wrong"
  >("private");

  const publicKey = "PUB-BOB-9871";
  const privateKey = "PRIV-BOB-SECRET";

  const asymCiphertext = useMemo(
    () => `🔒 ${demoEncrypt(asymPlaintext, publicKey)}`,
    [asymPlaintext],
  );

  const asymSuccess = asymKeyChoice === "private";

  return (
    <section
      dir="rtl"
      className="mx-auto w-full max-w-6xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-xl"

    >
      {/* Hero */}
      <div className="relative border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-3 sm:p-4">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/70 to-transparent" />

        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-[10px] font-bold text-indigo-300">
              <ShieldCheck className="h-4 w-4" />
              مختبر تفاعلي لفهم الفكرة
            </div>

            <h2 className="text-xl font-black tracking-tight sm:text-2xl">
              افهم التشفير كأنك تراه أمامك
            </h2>

            <p className="mt-1 max-w-2xl text-[11px] leading-6 text-slate-400">
              الفكرة ببساطة: لدينا رسالة سرية، ونريد أن تمر عبر الإنترنت
              دون أن يستطيع المتنصت قراءة محتواها. جرّب بنفسك ماذا يحدث
              للمفتاح والرسالة في كل نوع من أنواع التشفير.
            </p>
          </div>

          <div className="flex rounded-xl border border-slate-800 bg-slate-950 p-1">
            <ModeButton
              active={mode === "symmetric"}
              onClick={() => setMode("symmetric")}
            >
              <KeyRound className="h-4 w-4" />
              مفتاح واحد
            </ModeButton>

            <ModeButton
              active={mode === "asymmetric"}
              onClick={() => setMode("asymmetric")}
            >
              <KeyRound className="h-4 w-4" />
              مفتاحان
            </ModeButton>
          </div>
        </div>
      </div>

      {mode === "symmetric" ? (
        <SymmetricView
          plaintext={symPlaintext}
          setPlaintext={setSymPlaintext}
          keyValue={symKey}
          setKeyValue={setSymKey}
          decryptKey={symDecKey}
          setDecryptKey={setSymDecKey}
          cipher={symmetricCipher}
          decrypted={symmetricDecrypted}
          success={symmetricSuccess}
          showLeak={showLeak}
          setShowLeak={setShowLeak}
          onGenerate={() => {
            const next = `Key${Math.floor(100 + Math.random() * 900)}`;
            setSymKey(next);
            setSymDecKey(next);
            setShowLeak(false);
          }}
        />
      ) : (
        <AsymmetricView
          plaintext={asymPlaintext}
          setPlaintext={setAsymPlaintext}
          publicKey={publicKey}
          privateKey={privateKey}
          cipher={asymCiphertext}
          keyChoice={asymKeyChoice}
          setKeyChoice={setAsymKeyChoice}
          success={asymSuccess}
        />
      )}

      <ComparisonFooter mode={mode} />
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Symmetric                                                                    */
/* -------------------------------------------------------------------------- */

function SymmetricView(props: {
  plaintext: string;
  setPlaintext: (v: string) => void;
  keyValue: string;
  setKeyValue: (v: string) => void;
  decryptKey: string;
  setDecryptKey: (v: string) => void;
  cipher: string;
  decrypted: string;
  success: boolean;
  showLeak: boolean;
  setShowLeak: (v: boolean) => void;
  onGenerate: () => void;
}) {
  const {
    plaintext,
    setPlaintext,
    keyValue,
    setKeyValue,
    decryptKey,
    setDecryptKey,
    cipher,
    decrypted,
    success,
    showLeak,
    setShowLeak,
    onGenerate,
  } = props;

  return (
    <div className="space-y-6 p-3 sm:p-5">
      <ConceptBanner
        tone="indigo"
        number="01"
        title="التشفير المتناظر"
        text="نفس المفتاح يُستخدم في الطرفين: به نغلق الرسالة، وبه نفتحها."
      />

      {/* Big idea */}
      <div className="rounded-3xl border border-indigo-500/20 bg-indigo-500/[0.04] p-3 sm:p-5">
        <div className="mb-2 flex items-center gap-2">
          <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-300">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-black">الفكرة في سطر واحد</h3>
            <p className="text-[11px] text-slate-400">
              أنا وأنت نملك <b className="text-indigo-300">نفس المفتاح السري</b>.
            </p>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <MiniPerson
            icon={<UserRound className="h-4 w-4" />}
            title="المرسل"
            subtitle="يملك الرسالة + المفتاح"
            tone="indigo"
          />

          <ArrowFlow label="نفس المفتاح" />

          <MiniPerson
            icon={<Unlock className="h-4 w-4" />}
            title="المستلم"
            subtitle="يملك نفس المفتاح"
            tone="emerald"
          />
        </div>
      </div>

      {/* Three-stage flow */}
      <div className="grid gap-2 xl:grid-cols-3">
        <StageCard
          number="1"
          title="نُغلق الرسالة"
          subtitle="التشفير"
          icon={<Lock className="h-4 w-4" />}
          tone="indigo"
        >
          <label className="field-label">الرسالة الأصلية</label>
          <textarea
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            className="field-input h-16 resize-none sm:h-20"
            placeholder="اكتب رسالة سرية..."
          />

          <label className="field-label mt-2">المفتاح السري المشترك</label>
          <div className="flex gap-2">
            <input
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              className="field-input font-mono"
              placeholder="Secret Key"
            />
            <button
              onClick={onGenerate}
              className="action-button shrink-0"
              title="توليد مفتاح جديد"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <InfoStrip>
            🔑 المفتاح هنا هو السر المشترك بين الطرفين.
          </InfoStrip>
        </StageCard>

        <StageCard
          number="2"
          title="تمر عبر الإنترنت"
          subtitle="النص أصبح غير مقروء"
          icon={<Wifi className="h-4 w-4" />}
          tone="amber"
        >
          <label className="field-label">ما يراه المتنصت</label>

          <div className="flex min-h-16 items-center rounded-2xl border border-amber-500/20 bg-slate-900 p-3 font-mono text-[11px] leading-6 text-amber-300">
            {cipher || "لا توجد بيانات"}
          </div>

          <div
            className={`mt-2 rounded-2xl border p-3 transition-all ${showLeak
              ? "border-red-500/40 bg-red-500/[0.07]"
              : "border-slate-800 bg-slate-900/70"
              }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-black">
                  ماذا لو حاولنا إرسال المفتاح أيضًا؟
                </div>
                <div className="mt-1 text-[10px] leading-5 text-slate-500">
                  هنا تظهر مشكلة التشفير المتناظر.
                </div>
              </div>

              <button
                onClick={() => setShowLeak(!showLeak)}
                className={`rounded-xl px-3 py-2 text-[10px] font-black transition ${showLeak
                  ? "bg-red-500 text-white"
                  : "border border-slate-700 bg-slate-800 text-slate-300"
                  }`}
              >
                {showLeak ? "أوقف التسريب" : "جرّب تسريب المفتاح"}
              </button>
            </div>

            {showLeak && (
              <div className="mt-2 flex items-start gap-2 rounded-xl bg-red-950/50 p-3 text-[10px] font-bold leading-5 text-red-300">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                إذا اعترض شخص المفتاح السري، يستطيع استخدامه لفك الرسالة.
                إذن المشكلة ليست في التشفير نفسه، بل في إيصال المفتاح بأمان.
              </div>
            )}
          </div>
        </StageCard>

        <StageCard
          number="3"
          title="نفتح الرسالة"
          subtitle="فك التشفير"
          icon={<Unlock className="h-4 w-4" />}
          tone={success ? "emerald" : "red"}
        >
          <label className="field-label">المفتاح عند المستلم</label>
          <input
            value={decryptKey}
            onChange={(e) => setDecryptKey(e.target.value)}
            className={`field-input font-mono ${success ? "border-emerald-500/50" : "border-red-500/50"
              }`}
            placeholder="أدخل المفتاح..."
          />

          <label className="field-label mt-2">الرسالة بعد فك التشفير</label>
          <div
            className={`flex min-h-16 items-center rounded-2xl border p-3 text-sm leading-7 ${success
              ? "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-200"
              : "border-red-500/30 bg-red-500/[0.06] font-mono text-red-300"
              }`}
          >
            {decrypted}
          </div>

          <Status success={success}>
            {success
              ? "نفس المفتاح ← استرجعنا الرسالة الأصلية."
              : "المفتاح مختلف ← لا يمكن استرجاع الرسالة بشكل صحيح."}
          </Status>
        </StageCard>
      </div>

      <KeyProblem />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Asymmetric                                                                  */
/* -------------------------------------------------------------------------- */

function AsymmetricView(props: {
  plaintext: string;
  setPlaintext: (v: string) => void;
  publicKey: string;
  privateKey: string;
  cipher: string;
  keyChoice: "private" | "public" | "wrong";
  setKeyChoice: (v: "private" | "public" | "wrong") => void;
  success: boolean;
}) {
  const {
    plaintext,
    setPlaintext,
    publicKey,
    privateKey,
    cipher,
    keyChoice,
    setKeyChoice,
    success,
  } = props;

  return (
    <div className="space-y-6 p-3 sm:p-5">
      <ConceptBanner
        tone="purple"
        number="02"
        title="التشفير غير المتناظر"
        text="هنا لا نحتاج إلى إرسال مفتاح سري. يوجد مفتاح عام يمكن للجميع معرفته، ومفتاح خاص يبقى مع صاحبه."
      />

      {/* The key insight */}
      <div className="rounded-3xl border border-purple-500/20 bg-purple-500/[0.04] p-3 sm:p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <KeyBox
            title="المفتاح العام"
            value={publicKey}
            icon={<Eye className="h-4 w-4" />}
            tone="purple"
            note="يمكن نشره للجميع"
          />

          <div className="hidden items-center justify-center md:flex">
            <div className="text-center">
              <ArrowLeft className="mx-auto h-6 w-6 text-slate-600" />
              <div className="mt-1 text-[10px] font-bold text-slate-500">
                يشفّر
              </div>
            </div>
          </div>

          <KeyBox
            title="المفتاح الخاص"
            value={privateKey}
            icon={<EyeOff className="h-4 w-4" />}
            tone="emerald"
            note="يبقى سريًا لدى المستلم"
            secret
          />
        </div>
      </div>

      <div className="grid gap-2 xl:grid-cols-3">
        <StageCard
          number="1"
          title="أغلق الرسالة"
          subtitle="باستخدام المفتاح العام للمستلم"
          icon={<Lock className="h-4 w-4" />}
          tone="purple"
        >
          <label className="field-label">رسالة المرسل</label>
          <textarea
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            className="field-input h-16 resize-none sm:h-20"
          />

          <div className="mt-2 rounded-2xl border border-purple-500/20 bg-purple-500/[0.06] p-3">
            <div className="flex items-center gap-2 text-[11px] font-black text-purple-300">
              <KeyRound className="h-4 w-4" />
              نستخدم المفتاح العام للمستلم
            </div>
            <div className="mt-2 font-mono text-[10px] text-slate-500">
              {publicKey}
            </div>
          </div>

          <InfoStrip>
            🌐 المفتاح العام ليس سرًا؛ يمكن للمرسل الحصول عليه من المستلم.
          </InfoStrip>
        </StageCard>

        <StageCard
          number="2"
          title="مرّرها في الطريق"
          subtitle="حتى لو رآها المتنصت..."
          icon={<EyeOff className="h-4 w-4" />}
          tone="amber"
        >
          <label className="field-label">ما يمر عبر الإنترنت</label>

          <div className="flex min-h-16 items-center rounded-2xl border border-amber-500/20 bg-slate-900 p-3 font-mono text-[11px] leading-6 text-amber-300">
            {cipher}
          </div>

          <div className="mt-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-3">
            <div className="flex items-center gap-2 text-[11px] font-black text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              المتنصت يعرف المفتاح العام
            </div>
            <p className="mt-2 text-[10px] leading-5 text-slate-500">
              لكنه لا يملك المفتاح الخاص المطلوب لاسترجاع الرسالة في هذا
              النموذج التعليمي.
            </p>
          </div>
        </StageCard>

        <StageCard
          number="3"
          title="افتح الرسالة"
          subtitle="باستخدام المفتاح الخاص"
          icon={<Unlock className="h-4 w-4" />}
          tone={success ? "emerald" : "red"}
        >
          <label className="field-label">اختر المفتاح الذي سيحاول فكها</label>

          <div className="space-y-2">
            <KeyChoice
              active={keyChoice === "private"}
              tone="emerald"
              onClick={() => setKeyChoice("private")}
              title="المفتاح الخاص"
              subtitle="المفتاح الصحيح"
              icon={<KeyRound className="h-4 w-4" />}
            />

            <KeyChoice
              active={keyChoice === "public"}
              tone="red"
              onClick={() => setKeyChoice("public")}
              title="المفتاح العام"
              subtitle="جرّب بنفسك"
              icon={<Eye className="h-4 w-4" />}
            />

            <KeyChoice
              active={keyChoice === "wrong"}
              tone="red"
              onClick={() => setKeyChoice("wrong")}
              title="مفتاح آخر"
              subtitle="مفتاح لا علاقة له"
              icon={<XCircle className="h-4 w-4" />}
            />
          </div>

          <div
            className={`mt-2 flex min-h-16 items-center rounded-2xl border p-3 text-sm leading-7 ${success
              ? "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-200"
              : "border-red-500/30 bg-red-500/[0.06] text-red-300"
              }`}
          >
            {success
              ? plaintext
              : "❌ فشل فك التشفير في هذا النموذج: المفتاح المختار ليس المفتاح الخاص الصحيح."}
          </div>

          <Status success={success}>
            {success
              ? "المفتاح الخاص هو الذي يحتفظ به المستلم سرًا."
              : "المفتاح المختار لا يستطيع استرجاع الرسالة."}
          </Status>
        </StageCard>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-purple-500/10 p-2 text-purple-300">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-black">إذن أين اختفت مشكلة تبادل المفتاح؟</h3>
            <p className="mt-2 text-[11px] leading-6 text-slate-400">
              في النموذج المتناظر، كان علينا إيجاد طريقة آمنة لإيصال السر
              المشترك. هنا يستطيع المرسل استخدام <b className="text-purple-300">المفتاح العام</b>
              المعلن للمستلم دون أن يرسل معه سرًا مشتركًا.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared UI                                                                   */
/* -------------------------------------------------------------------------- */

function ConceptBanner(props: {
  tone: "indigo" | "purple";
  number: string;
  title: string;
  text: string;
}) {
  const purple = props.tone === "purple";

  return (
    <div
      className={`rounded-3xl border p-5 ${purple
        ? "border-purple-500/20 bg-purple-500/[0.05]"
        : "border-indigo-500/20 bg-indigo-500/[0.05]"
        }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-black ${purple
            ? "bg-purple-500/10 text-purple-300"
            : "bg-indigo-500/10 text-indigo-300"
            }`}
        >
          {props.number}
        </div>

        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            الفكرة الأساسية
          </div>
          <h3 className="mt-1 text-base font-black">{props.title}</h3>
          <p className="mt-1 text-[11px] leading-6 text-slate-400">
            {props.text}
          </p>
        </div>
      </div>
    </div>
  );
}

function StageCard(props: {
  number: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tone: "indigo" | "purple" | "amber" | "emerald" | "red";
  children: React.ReactNode;
}) {
  const toneMap = {
    indigo: "text-indigo-300 border-indigo-500/20",
    purple: "text-purple-300 border-purple-500/20",
    amber: "text-amber-300 border-amber-500/20",
    emerald: "text-emerald-300 border-emerald-500/20",
    red: "text-red-300 border-red-500/20",
  };

  return (
    <article className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/55 p-3 shadow-md">
      <div className="mb-5 flex items-start gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border bg-slate-950 ${toneMap[props.tone]}`}
        >
          {props.icon}
        </div>

        <div>
          <div className="text-[10px] font-black text-slate-600">
            الخطوة {props.number}
          </div>
          <h3 className="font-black">{props.title}</h3>
          <p className="mt-0.5 text-[10px] text-slate-500">
            {props.subtitle}
          </p>
        </div>
      </div>

      <div className="flex-1">{props.children}</div>
    </article>
  );
}

function MiniPerson(props: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tone: "indigo" | "emerald";
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
      <div
        className={`mb-2 flex items-center gap-2 text-[11px] font-black ${props.tone === "indigo" ? "text-indigo-300" : "text-emerald-300"
          }`}
      >
        {props.icon}
        {props.title}
      </div>
      <p className="text-[10px] text-slate-500">{props.subtitle}</p>
    </div>
  );
}

function ArrowFlow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 text-slate-600">
      <div className="h-px flex-1 bg-slate-800" />
      <span className="rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-[10px] font-bold text-slate-500">
        {label}
      </span>
      <div className="h-px flex-1 bg-slate-800" />
    </div>
  );
}

function KeyBox(props: {
  title: string;
  value: string;
  icon: React.ReactNode;
  tone: "purple" | "emerald";
  note: string;
  secret?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-3 ${props.tone === "purple"
        ? "border-purple-500/20 bg-purple-500/[0.04]"
        : "border-emerald-500/20 bg-emerald-500/[0.04]"
        }`}
    >
      <div className="flex items-center gap-2 text-[11px] font-black">
        {props.icon}
        {props.title}
      </div>

      <div className="mt-2 rounded-xl bg-slate-950 p-3 font-mono text-[10px] text-slate-400">
        {props.secret ? "••••••••••••••••" : props.value}
      </div>

      <p className="mt-2 text-[10px] text-slate-500">{props.note}</p>
    </div>
  );
}

function KeyChoice(props: {
  active: boolean;
  tone: "emerald" | "red";
  onClick: () => void;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  const good = props.tone === "emerald";

  return (
    <button
      onClick={props.onClick}
      className={`w-full rounded-2xl border p-3 text-right transition ${props.active
        ? good
          ? "border-emerald-500/50 bg-emerald-500/[0.07]"
          : "border-red-500/50 bg-red-500/[0.07]"
        : "border-slate-800 bg-slate-950 hover:border-slate-700"
        }`}
    >
      <div
        className={`flex items-center gap-2 text-[11px] font-black ${good ? "text-emerald-300" : "text-red-300"
          }`}
      >
        {props.icon}
        {props.title}
      </div>
      <div className="mt-1 text-[10px] text-slate-500">{props.subtitle}</div>
    </button>
  );
}

function InfoStrip({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-[10px] leading-5 text-slate-500">
      {children}
    </div>
  );
}

function Status({
  success,
  children,
}: {
  success: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`mt-2 flex items-start gap-2 text-[10px] font-bold ${success ? "text-emerald-400" : "text-red-400"
        }`}
    >
      {success ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <span>{children}</span>
    </div>
  );
}

function KeyProblem() {
  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-3">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-amber-500/10 p-2 text-amber-300">
          <ShieldAlert className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-black">المشكلة التي يجب أن تتذكرها</h3>
          <p className="mt-2 text-[11px] leading-6 text-slate-400">
            التشفير المتناظر سريع جدًا، لكن الطرفين يحتاجان إلى نفس المفتاح.
            لذلك السؤال المهم هو:
          </p>
          <div className="mt-2 rounded-2xl border border-amber-500/20 bg-slate-950 p-3 text-sm font-black text-amber-200">
            «كيف سأوصل المفتاح السري للطرف الآخر بأمان؟»
          </div>
        </div>
      </div>
    </div>
  );
}

function ComparisonFooter({ mode }: { mode: "symmetric" | "asymmetric" }) {
  return (
    <div className="border-t border-slate-800 bg-slate-950/70 p-3 sm:p-5">
      <div className="mb-2 flex items-center gap-2">
        <div className="rounded-xl bg-slate-800 p-2">
          <ArrowRight className="h-4 w-4 text-slate-300" />
        </div>
        <div>
          <h3 className="text-sm font-black">الخلاصة</h3>
          <p className="text-[10px] text-slate-500">
            ركّز على طريقة التعامل مع المفاتيح قبل حفظ الأسماء.
          </p>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <SummaryCard
          active={mode === "symmetric"}
          title="التشفير المتناظر"
          headline="مفتاح واحد"
          points={[
            "نفس المفتاح للتشفير وفك التشفير.",
            "سريع ومناسب للبيانات الكبيرة.",
            "التحدي: مشاركة المفتاح السري بأمان.",
          ]}
          tone="indigo"
        />

        <SummaryCard
          active={mode === "asymmetric"}
          title="التشفير غير المتناظر"
          headline="مفتاح عام + مفتاح خاص"
          points={[
            "المفتاح العام يمكن نشره.",
            "المفتاح الخاص يبقى سريًا لدى صاحبه.",
            "يساعد في حل مشكلة تبادل السر المشترك.",
          ]}
          tone="purple"
        />
      </div>

      <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-center text-[10px] leading-6 text-slate-500">
        ملاحظة تعليمية: التحويلات الرقمية في هذا المختبر محاكاة مبسطة لشرح
        الفكرة، وليست خوارزميات تشفير حقيقية مثل AES أو RSA.
      </div>
    </div>
  );
}

function SummaryCard(props: {
  active: boolean;
  title: string;
  headline: string;
  points: string[];
  tone: "indigo" | "purple";
}) {
  return (
    <div
      className={`rounded-2xl border p-3 transition ${props.active
        ? props.tone === "indigo"
          ? "border-indigo-500/30 bg-indigo-500/[0.05]"
          : "border-purple-500/30 bg-purple-500/[0.05]"
        : "border-slate-800 bg-slate-900/40"
        }`}
    >
      <div
        className={`text-[11px] font-black ${props.tone === "indigo" ? "text-indigo-300" : "text-purple-300"
          }`}
      >
        {props.title}
      </div>
      <div className="mt-1 text-base font-black">{props.headline}</div>

      <ul className="mt-2 space-y-2 text-[10px] leading-5 text-slate-500">
        {props.points.map((point) => (
          <li key={point} className="flex gap-2">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ModeButton(props: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={props.onClick}
      className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-[11px] font-black transition sm:px-3 ${props.active
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/40"
        : "text-slate-500 hover:text-slate-200"
        }`}
    >
      {props.children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Demo-only crypto helpers                                                    */
/* -------------------------------------------------------------------------- */

function demoEncrypt(text: string, key: string): string {
  if (!key) return "";

  let result = "";

  for (let i = 0; i < text.length; i++) {
    const textCode = text.charCodeAt(i);
    const keyCode = key.charCodeAt(i % key.length);
    result += (textCode ^ keyCode).toString(16).padStart(4, "0");
  }

  return result.toUpperCase();
}

function demoDecrypt(cipherHex: string, key: string): string {
  if (!key) return "⚠️ أدخل المفتاح أولًا.";

  try {
    let result = "";

    for (let i = 0; i < cipherHex.length; i += 4) {
      const chunk = cipherHex.substring(i, i + 4);
      const cipherCode = parseInt(chunk, 16);

      if (Number.isNaN(cipherCode)) {
        return "⚠️ البيانات المشفرة غير صالحة.";
      }

      const keyCode = key.charCodeAt((i / 4) % key.length);
      result += String.fromCharCode(cipherCode ^ keyCode);
    }

    return result || "لا توجد رسالة.";
  } catch {
    return "⚠️ تعذر فك البيانات.";
  }
}
