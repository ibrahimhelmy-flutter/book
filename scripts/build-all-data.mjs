import fs from 'fs';
import path from 'path';
import { chapter1 } from './chapters/chapter1.mjs';
import { chapter2 } from './chapters/chapter2.mjs';
import { chapter3 } from './chapters/chapter3.mjs';
import { chapter4 } from './chapters/chapter4.mjs';

const allChapters = [chapter1, chapter2, chapter3, chapter4];

// 1. Generate src/data/curriculum.ts
const curriculumTsContent = `import { Chapter } from "@/types";

export const CURRICULUM_DATA: Chapter[] = ${JSON.stringify(allChapters, null, 2)};
`;

fs.writeFileSync(path.resolve('src/data/curriculum.ts'), curriculumTsContent, 'utf-8');
console.log('Successfully wrote src/data/curriculum.ts');

// 2. Generate clean book.json with all chapters and lessons
const bookData = {
  meta: {
    title: "البرمجة والذكاء الاصطناعي — الصف الثاني الثانوي (بكالوريا مصرية) — الترم الأول",
    academicYear: "2026 - 2027",
    ministry: "جمهورية مصر العربية - وزارة التربية والتعليم والتعليم الفني",
    curriculumDirectorate: "الإدارة المركزية لتطوير المناهج",
    generalSupervisor: "د. جبريل أنور حميدة",
    projectLead: "Masaki Iisaka",
    authors: ["Biichi Nakajima", "Hiromi Fujii"],
    reviewers: [
      "أ.د محمد سيد فرج",
      "أ.د إيمان سراج الدين بكر",
      "د. عبير حامد أحمد",
      "د. طاهر عبد الحميد العدلي",
      "د. منال زيادة عبد الفضيل"
    ],
    totalPages: 95,
    chaptersCount: 4,
    lessonsCount: 14
  },
  chapters: allChapters
};

fs.writeFileSync(path.resolve('book.json'), JSON.stringify(bookData, null, 2), 'utf-8');
console.log('Successfully wrote book.json');

// 3. Extract all glossary items from all keyConcepts
const glossaryItems = [];
const seenTerms = new Set();

for (const chapter of allChapters) {
  for (const lesson of chapter.lessons) {
    for (const concept of lesson.keyConcepts) {
      if (!seenTerms.has(concept.termAr)) {
        seenTerms.add(concept.termAr);
        glossaryItems.push({
          id: `g-${concept.termEn ? concept.termEn.toLowerCase().replace(/[^a-z0-9]+/g, '-') : concept.termAr.replace(/\\s+/g, '-')}`,
          termAr: concept.termAr,
          termEn: concept.termEn || "",
          definitionAr: concept.definition,
          definitionEn: "",
          chapterId: chapter.id,
          lessonNumber: lesson.number,
          category: chapter.number === 1 ? "AI" : chapter.number === 2 ? "Cybersecurity" : chapter.number === 3 ? "WebDev" : "Design"
        });
      }
    }
  }
}

const glossaryTsContent = `import { GlossaryTerm } from "@/types";

export const GLOSSARY_DATA: GlossaryTerm[] = ${JSON.stringify(glossaryItems, null, 2)};
`;

fs.writeFileSync(path.resolve('src/data/glossary.ts'), glossaryTsContent, 'utf-8');
console.log(`Successfully wrote src/data/glossary.ts with ${glossaryItems.length} verified terms.`);

// 4. Update acronyms.ts with official abbreviations from the book
const acronyms = [
  { short: "IT", fullAr: "تكنولوجيا المعلومات", fullEn: "Information Technology", descriptionAr: "استخدام الحواسيب وشبكات الاتصال لمعالجة وتخزين ونقل البيانات والمعلومات.", category: "General", lessonRef: "1-1" },
  { short: "PCs", fullAr: "الحواسب الشخصية", fullEn: "Personal Computers", descriptionAr: "حواسيب مصممة للاستخدام الفردي المباشر بدأت بالانتشار في السبعينيات والثمانينيات.", category: "Hardware", lessonRef: "1-1" },
  { short: "SNS", fullAr: "خدمات شبكات التواصل الاجتماعي", fullEn: "Social Networking Services", descriptionAr: "منصات إلكترونية تربط المستخدمين لنشر المعلومات والمحتوى ومشاركته بسرعة.", category: "General", lessonRef: "1-1" },
  { short: "AR", fullAr: "الواقع المعزز", fullEn: "Augmented Reality", descriptionAr: "تقنية تضيف عناصر أو معلومات رقمية إلى مشهد من العالم الحقيقي.", category: "General", lessonRef: "1-1" },
  { short: "VR", fullAr: "الواقع الافتراضي", fullEn: "Virtual Reality", descriptionAr: "تقنية تضع المستخدم داخل بيئة افتراضية تفاعلية مولدة حاسوبيًا بالكامل.", category: "General", lessonRef: "1-1" },
  { short: "AI", fullAr: "الذكاء الاصطناعي", fullEn: "Artificial Intelligence", descriptionAr: "مجال يضم أنظمة حاسوبية تستطيع تنفيذ مهام مثل التعلم من البيانات والتنبؤ والتعرف وتوليد المحتوى.", category: "AI", lessonRef: "1-2" },
  { short: "ML", fullAr: "التعلّم الآلي", fullEn: "Machine Learning", descriptionAr: "فرع من الذكاء الاصطناعي تتعلم فيه النماذج أنماطًا من البيانات لإجراء تنبؤات أو تصنيفات.", category: "AI", lessonRef: "1-2" },
  { short: "DL", fullAr: "التعلم العميق", fullEn: "Deep Learning", descriptionAr: "أسلوب من أساليب التعلّم الآلي يعتمد على شبكات عصبية اصطناعية متعددة الطبقات.", category: "AI", lessonRef: "1-2" },
  { short: "ANN", fullAr: "الشبكة العصبية الاصطناعية", fullEn: "Artificial Neural Network", descriptionAr: "نموذج حاسوبي مستوحى من ترابط العصبونات يتكون من طبقات تتغير أوزانها أثناء التدريب.", category: "AI", lessonRef: "1-2" },
  { short: "GenAI", fullAr: "الذكاء الاصطناعي التوليدي", fullEn: "Generative AI", descriptionAr: "أنظمة تُنشئ محتوى جديدًا كالنصوص والصور والصوت والبرمجيات اعتمادًا على بيانات التدريب.", category: "AI", lessonRef: "1-2" },
  { short: "XAI", fullAr: "الذكاء الاصطناعي القابل للتفسير", fullEn: "Explainable AI", descriptionAr: "أساليب وتقنيات تساعد البشر على فهم منطق وأسباب اتخاذ الذكاء الاصطناعي لقرار معين.", category: "AI", lessonRef: "1-4" },
  { short: "TLS", fullAr: "أمان طبقة النقل", fullEn: "Transport Layer Security", descriptionAr: "بروتوكول تشفير يوفر السرية والسلامة والمصادقة للاتصالات المنقولة عبر الإنترنت.", category: "Cybersecurity", lessonRef: "2-1" },
  { short: "HTTPS", fullAr: "بروتوكول نقل النص التشعبي الآمن", fullEn: "Hypertext Transfer Protocol Secure", descriptionAr: "بروتوكول ويب ينقل بيانات HTTP عبر اتصال TLS مشفر وآمن.", category: "Cybersecurity", lessonRef: "2-1" },
  { short: "2FA", fullAr: "المصادقة الثنائية", fullEn: "Two-Factor Authentication", descriptionAr: "طريقة مصادقة تجمع بين عنصرين مختلفين لتأكيد الهوية وحماية الحسابات.", category: "Cybersecurity", lessonRef: "2-1" },
  { short: "MFA", fullAr: "المصادقة متعددة العوامل", fullEn: "Multi-Factor Authentication", descriptionAr: "المصادقة التي تجمع بين عنصرين أو أكثر من فئات المعرفة والحيازة والسمات الحيوية.", category: "Cybersecurity", lessonRef: "2-1" },
  { short: "CA", fullAr: "الجهة المانحة للشهادات الرقمية", fullEn: "Certificate Authority", descriptionAr: "جهة موثوقة تصدر الشهادات الرقمية للتحقق من هوية المواقع وربطها بمفاتيحها العامة.", category: "Cybersecurity", lessonRef: "2-1" },
  { short: "VPN", fullAr: "الشبكة الافتراضية الخاصة", fullEn: "Virtual Private Network", descriptionAr: "اتصال مشفر عبر شبكة عامة ينشئ نفقًا آمنًا لنقل البيانات بين الطرفين.", category: "Networking", lessonRef: "2-2" },
  { short: "DMZ", fullAr: "المنطقة المعزولة (منزوعة السلاح)", fullEn: "Demilitarized Zone", descriptionAr: "منطقة شبكية تعزل الخوادم العامة المعرضة للإنترنت عن الشبكة الداخلية الحساسة.", category: "Networking", lessonRef: "2-2" },
  { short: "HTTP", fullAr: "بروتوكول نقل النص التشعبي", fullEn: "Hypertext Transfer Protocol", descriptionAr: "بروتوكول نقل الرسائل والطلبات والاستجابات بين العميل والخادم على الويب.", category: "WebDev", lessonRef: "3-2" },
  { short: "API", fullAr: "واجهة برمجة التطبيقات", fullEn: "Application Programming Interface", descriptionAr: "مجموعة قواعد تسمح لبرنامج بطلب بيانات أو وظائف من برنامج أو خدمة أخرى.", category: "WebDev", lessonRef: "3-2" },
  { short: "JSON", fullAr: "ترميز كائنات جافا سكريبت", fullEn: "JavaScript Object Notation", descriptionAr: "صيغة نصية قياسية خفيفة وشائعة لتمثيل وتبادل البيانات المهيكلة.", category: "WebDev", lessonRef: "3-2" },
  { short: "HTML", fullAr: "لغة ترميز النص التشعبي", fullEn: "HyperText Markup Language", descriptionAr: "اللغة القياسية لبناء وهيكلة صفحات الويب وتحديد عناصرها.", category: "WebDev", lessonRef: "3-3" },
  { short: "CSS", fullAr: "صفحات الأنماط الانسيابية", fullEn: "Cascading Style Sheets", descriptionAr: "لغة تنسيق تحدد مظهر وألوان وتخطيط صفحة الويب.", category: "WebDev", lessonRef: "3-3" },
  { short: "JS", fullAr: "جافا سكريبت", fullEn: "JavaScript", descriptionAr: "لغة البرمجة التي تضيف التفاعل والسلوك الديناميكي لصفحة الويب.", category: "WebDev", lessonRef: "3-3" },
  { short: "SEO", fullAr: "تحسين محركات البحث", fullEn: "Search Engine Optimization", descriptionAr: "ممارسات تجعل صفحة الويب أيسر في الفهرسة والظهور في نتائج محركات البحث.", category: "WebDev", lessonRef: "3-3" },
  { short: "CRAP", fullAr: "مبادئ التصميم البصري الأربعة", fullEn: "Contrast, Repetition, Alignment, Proximity", descriptionAr: "التباين، التكرار، المحاذاة، والتقارب لتنظيم الشكل البصري للصفحة.", category: "Design", lessonRef: "4-2" },
  { short: "UCD", fullAr: "التصميم المتمحور حول المستخدم", fullEn: "User-Centered Design", descriptionAr: "نهج تصميم يرتكز على فهم المستخدمين واحتياجاتهم وسياق استخدامهم.", category: "Design", lessonRef: "4-2" },
  { short: "PV", fullAr: "مشاهدات الصفحة", fullEn: "Page Views", descriptionAr: "العدد الإجمالي لمرات مشاهدة الصفحة في تحليلات الويب.", category: "Design", lessonRef: "4-3" },
  { short: "CVR", fullAr: "معدل التحويل", fullEn: "Conversion Rate", descriptionAr: "نسبة المستخدمين الذين حققوا الإجراء المستهدف في الموقع الإلكتروني.", category: "Design", lessonRef: "4-3" },
  { short: "PDCA", fullAr: "دورة خطط - نفذ - تحقق - تصرف", fullEn: "Plan-Do-Check-Act", descriptionAr: "دورة التحسين المستمر التكرارية المستخدمة لتطوير المواقع والعمليات.", category: "Design", lessonRef: "4-4" }
];

const acronymsTsContent = `import { AcronymTerm } from "@/types";

export const ACRONYMS_DATA: AcronymTerm[] = ${JSON.stringify(acronyms, null, 2)};

export function getAcronym(term: string): AcronymTerm | undefined {
  const cleanTerm = term.trim().toUpperCase();
  return ACRONYMS_DATA.find((a) => a.short.toUpperCase() === cleanTerm);
}
`;

fs.writeFileSync(path.resolve('src/data/acronyms.ts'), acronymsTsContent, 'utf-8');
console.log(`Successfully wrote src/data/acronyms.ts with ${acronyms.length} acronyms.`);
