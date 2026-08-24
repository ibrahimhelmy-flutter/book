"use client";

import React, { useState } from "react";
import { Globe, Server, Database, Send, CheckCircle2, XCircle, AlertCircle, ArrowLeft, ArrowRight, Code } from "lucide-react";

export function WebRequestFlowSimulator() {
  const [httpMethod, setHttpMethod] = useState<"GET" | "POST">("GET");
  const [searchQuery, setSearchQuery] = useState<string>("ذكاء اصطناعي");
  const [newBookTitle, setNewBookTitle] = useState<string>("مفاهيم الأمن السيبراني المتقدمة");
  const [statusCode, setStatusCode] = useState<200 | 404 | 500>(200);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const triggerRequest = () => {
    setIsProcessing(true);
    setCurrentStep(1);
    setTimeout(() => {
      setCurrentStep(2);
      setTimeout(() => {
        setCurrentStep(3);
        setTimeout(() => {
          setCurrentStep(4);
          setIsProcessing(false);
        }, 600);
      }, 600);
    }, 600);
  };

  const getJsonResponse = () => {
    if (statusCode === 404) {
      return JSON.stringify(
        {
          status: 404,
          error: "Not Found",
          message: "المورد أو الكتاب المطلوب غير موجود في خوادم المكتبة."
        },
        null,
        2
      );
    }
    if (statusCode === 500) {
      return JSON.stringify(
        {
          status: 500,
          error: "Internal Server Error",
          message: "فشل الاتصال بقاعدة البيانات بسبب انقطاع الخادم."
        },
        null,
        2
      );
    }
    if (httpMethod === "GET") {
      return JSON.stringify(
        {
          status: 200,
          query: searchQuery,
          resultsCount: 2,
          books: [
            { id: "b-101", title: "البرمجة والذكاء الاصطناعي - الجزء الأول", grade: "2nd Secondary", year: 2026 },
            { id: "b-102", title: "مبادئ التعلم الآلي والشبكات العصبية", author: "د. أحمد صبري", year: 2025 }
          ]
        },
        null,
        2
      );
    }
    return JSON.stringify(
      {
        status: 200,
        action: "Create Book",
        success: true,
        createdRecord: { id: "b-999", title: newBookTitle, createdAt: new Date().toISOString() }
      },
      null,
      2
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-600/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">محاكي تدفق طلبات الويب والـ API</h3>
            <p className="text-sm text-slate-400">تتبع مسار الطلب عبر الطبقات الثلاث وصيغة JSON ورموز حالة HTTP</p>
          </div>
        </div>

        {/* Method Toggle */}
        <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setHttpMethod("GET");
              setCurrentStep(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
              httpMethod === "GET" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            GET (جلب وقراءة)
          </button>
          <button
            onClick={() => {
              setHttpMethod("POST");
              setCurrentStep(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
              httpMethod === "POST" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            POST (إرسال وتخزين)
          </button>
        </div>
      </div>

      {/* Input controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <label className="text-xs text-slate-400 block mb-1.5 font-semibold">
            {httpMethod === "GET" ? "المدخلات في الواجهة الأمامية (معاملات البحث Query):" : "البيانات المرسلة في جسم الطلب (Request Body):"}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={httpMethod === "GET" ? searchQuery : newBookTitle}
              onChange={(e) => (httpMethod === "GET" ? setSearchQuery(e.target.value) : setNewBookTitle(e.target.value))}
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              placeholder="اكتب هنا..."
            />
            <button
              disabled={isProcessing}
              onClick={triggerRequest}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" /> إرسال الطلب
            </button>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <label className="text-xs text-slate-400 block mb-1.5 font-semibold">محاكاة رد الخادم (HTTP Status):</label>
          <select
            value={statusCode}
            onChange={(e) => {
              setStatusCode(parseInt(e.target.value, 10) as 200 | 404 | 500);
              setCurrentStep(0);
            }}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value={200}>200 OK (نجاح تام)</option>
            <option value={404}>404 Not Found (غير موجود)</option>
            <option value={500}>500 Internal Server Error (خطأ خادم)</option>
          </select>
        </div>
      </div>

      {/* 3-Tier Visual Flow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Tier 1: Frontend */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            currentStep === 1 || currentStep === 4
              ? "bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30"
              : "bg-slate-950 border-slate-800"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold text-white">1. الواجهة الأمامية (Frontend)</span>
          </div>
          <div className="text-[11px] text-slate-400 leading-relaxed">
            {currentStep === 0 && "في انتظار إدخال المستخدم ونقر الزر..."}
            {currentStep === 1 && "استقبلت الواجهة المدخلات وتنشئ طلب HTTP عبر الشبكة."}
            {currentStep === 4 && "استقبلت الرد من الخادم وترسم النتيجة بصرياً على الشاشة!"}
          </div>
        </div>

        {/* Tier 2: Backend */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            currentStep === 2
              ? "bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30"
              : "bg-slate-950 border-slate-800"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Server className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-bold text-white">2. الواجهة الخلفية (Backend API)</span>
          </div>
          <div className="text-[11px] text-slate-400 leading-relaxed">
            {currentStep < 2 && "في انتظار وصول طلب العميل عبر المسار..."}
            {currentStep === 2 && "تحليل طريقة الطلب، والتحقق الأمني، وتوليد استعلام قاعدة البيانات."}
            {currentStep > 2 && "تم تجهيز البيانات وصياغة كائن JSON وإرجاع رمز الحالة."}
          </div>
        </div>

        {/* Tier 3: Database */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            currentStep === 3
              ? "bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/30"
              : "bg-slate-950 border-slate-800"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-bold text-white">3. قاعدة البيانات (Database)</span>
          </div>
          <div className="text-[11px] text-slate-400 leading-relaxed">
            {currentStep < 3 && "خادم قواعد البيانات في وضع الاستعداد."}
            {currentStep === 3 &&
              (httpMethod === "GET"
                ? "تنفيذ استعلام البحث في جداول الكتب واستخراج الصفوف المطابقة."
                : "حفظ السجل الجديد في جدول الكتب وتحديث الفهارس.")}
            {currentStep > 3 && "أُغلقت المعاملة بنجاح."}
          </div>
        </div>
      </div>

      {/* Live JSON Payload Inspector */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Code className="w-4 h-4 text-emerald-400" />
            <span>معاينة حمولة البيانات بصيغة JSON العائدة من الـ API:</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
              statusCode === 200
                ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                : statusCode === 404
                ? "bg-amber-950 text-amber-400 border border-amber-500/30"
                : "bg-red-950 text-red-400 border border-red-500/30"
            }`}
          >
            HTTP {statusCode}
          </span>
        </div>
        <pre className="p-3 bg-slate-900 rounded-lg text-emerald-300 font-mono text-xs overflow-x-auto text-left dir-ltr">
          {getJsonResponse()}
        </pre>
      </div>
    </div>
  );
}
