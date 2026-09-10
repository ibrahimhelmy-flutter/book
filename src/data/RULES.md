# 📜 معمارية إثبات الأصل وقواعد حماية المحتوى والبيانات
# 🔒 CONTENT PROVENANCE & STRICT IMMUTABILITY RULES

> **تنبيه حاسم لجميع المطورين ونماذج الذكاء الاصطناعي (Strict Directive for AI Agents & Developers):**
> 1. الملفات الموجودة في هذا المجلد (`src/data/`) هي **بيانات تطبيق مُولّدة برمجياً (AUTO-GENERATED APPLICATION ARTIFACTS)** يتم إنتاجها عبر سكربت البناء:
>    `node scripts/build-all-data.mjs`
> 2. **يُحظر تمامًا تعديل هذه الملفات يدويًا.** أي تعديل يجب أن يتم حصريًا في المصادر المعيارية المنظمة داخل:
>    [`book-sources/term-1/05-canonical-data/`](file:///c:/Users/devib/OneDrive/Desktop/book/book-sources/term-1/05-canonical-data/)
> 3. الكتاب المدرسي لوزارة التربية والتعليم والتعليم الفني المصرية لمادة **«البرمجة والذكاء الاصطناعي — الصف الثاني الثانوي»** هو المرجع الحصري الوحيد.

---

## 🏛️ هرمية حجية المصادر (Source Authority Hierarchy)

عند وجود أي شك أو تعارض أو تدقيق، يتم الاحتكام إلى المصادر وفق الهرمية الصارمة التالية:

```text
1. Official Ministry PDF        (book-sources/term-1/01-pdf-document/)
   └── المرجع القانوني والعلمي الأول الثابت غير القابل للتعديل (Immutable Master Source)
   ↓
2. High-Res Page Scans          (book-sources/term-1/02-page-scans/)
   └── الدليل البصري الحصري لكل صفحة من صفحات الكتاب الـ 95
   ↓
3. Raw Text Extractions (OCR)   (book-sources/term-1/03-raw-extractions/)
   └── التفريغ النصي الخام المباشر لصفحات الكتاب
   ↓
4. Canonical Structured Data    (book-sources/term-1/05-canonical-data/)
   └── السجلات المعيارية المعتمدة والمربوطة بالـ Provenance
   ↓
5. Generated Application Data   (src/data/*, public/*)
   └── مخرجات وسيطة ومولدة لتشغيل الموقع وليست مصدراً علمياً للحقيقة
```

> **ملاحظة محورية:** طبقة `07-validation/` ليست مرحلة في خط الإنتاج بل هي **سلطة رقابية وتدقيقية متعامدة** تفحص كافة المستويات وتمنع تمرير أي بناء في حال وجود خطأ (`FAIL => process.exit(1)`).

---

## 📁 الهيكل المعتمد لمصادر الكتب (`book-sources/`)

المشروع مبني لدعم فصول دراسية متعددة (Multi-Term Scalable):
- كتاب الفصل الدراسي الأول: `book-sources/term-1/`
- كتاب الفصل الدراسي الثاني (مستقبلاً): `book-sources/term-2/` بنفس البنية:

```text
book-sources/term-1/
├── 01-pdf-document/                 # كتاب الوزارة الأصلي (PDF)
├── 02-page-scans/                   # صور الصفحات الـ 95 كاملة (المستودع الوحيد)
├── 03-raw-extractions/              # التفريغ النصي الخام OCR
├── 04-extracted-diagrams/           # الرسوم والمخططات المقتطعة
├── 05-canonical-data/               # البيانات المعيارية (book.json, glossary.json, official-lessons)
├── 06-build-modules/                # وحدات البناء والتحويل البرمجية
└── 07-validation/                   # مانيفست الهاشات المشفرة SHA-256 وتقارير التدقيق
```

---

## 🔒 القواعد الذهبية العشر (10 Golden Rules)

1. **عدم حذف أي مصدر أصلي** قبل التحقق من وجود نسخه الموثقة ومطابقة هاشاتها.
2. **عدم إعادة صياغة أو تلخيص أو تحوير أي نص** من نصوص كتاب الوزارة.
3. **منع سكربتات البناء (`build-all-data`) من تعديل `05-canonical-data`** نهائياً (البناء يقرأ فقط).
4. **عدم اعتبار ملفات `src/data` مصدراً نهائياً للمعلومات**؛ بل هي ملفات مولدة ومشتقة.
5. **عدم إنشاء نسخ مكررة من صور الصفحات**؛ المرجع الحصري الوحيد هو `02-page-scans/`.
6. **كل ملف مولد برمجياً يجب أن يحمل شارة `⚠️ AUTO-GENERATED FILE`**.
7. **كل درس ومفهوم ووحدة تعليمية يجب أن تمتلك كائن `source.pages`** يربطها برقم صفحتها الأصلية في الكتاب.
8. **جميع أدوات التدقيق في `07-validation/` يجب أن تكون قابلة لإعادة التشغيل الآلي** وتخرج بـ `exit 1` عند وجود أي فشل.
9. **أي تعارض بين الملفات يُحسم دائماً بالرجوع إلى صورة صفحة الـ PDF الرسمية**.
10. **إثبات تطابق البيانات وسلامتها المستمرة** عبر منظومة بصمات الـ SHA-256 المستقلة.

---

## 🔍 أوامر التدقيق والتحقق المعتمدة (Audit Commands)

```bash
# 1. التحقق من سلامة المصادر والهاشات وتقارير إثبات الأصل (Orthogonal Validation)
node scripts/generate-source-manifest.mjs

# 2. بناء بيانات التطبيق وتحديث المخرجات المولدة (Build Pipeline)
node scripts/build-all-data.mjs

# 3. التحقق من المطابقة النصية الحرفية مع الدروس الرسمية
node scripts/audit-canonical-fidelity.mjs
```
