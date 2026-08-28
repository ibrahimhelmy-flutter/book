import { SimulatorMeta } from "@/types";

export const SIMULATORS_DATA: SimulatorMeta[] = [
  {
    id: "moores-law-sim",
    title: "1. محاكي قانون مور والنفق الكمومي",
    category: "الفصل 1 (الدرس 1-1)",
    iconName: "Cpu",
    color: "border-blue-500 text-blue-400",
    description: "تحليل وتتبع عدد الترانزستورات من Intel 4004 إلى Apple M1 Ultra واكتشاف معضلة النفق الكمومي.",
    lessonNumber: "1-1",
    chapterNumber: 1
  },
  {
    id: "ai-hierarchy-sim",
    title: "2. هرمية الذكاء الاصطناعي ومختبر الهلوسة",
    category: "الفصل 1 (الدرس 1-2)",
    iconName: "Brain",
    color: "border-purple-500 text-purple-400",
    description: "استكشاف تداخل AI ⊃ ML ⊃ DL ⊃ GenAI وتجربة رصد هلوسة النماذج اللغوية والتحقق البشري.",
    lessonNumber: "1-2",
    chapterNumber: 1
  },
  {
    id: "tls-handshake-sim",
    title: "3. محاكي مصافحة TLS وتشفير HTTPS",
    category: "الفصل 2 (الدرس 2-1)",
    iconName: "Lock",
    color: "border-emerald-500 text-emerald-400",
    description: "تتبع مراحل الاتصال الآمن بالمفتاح العام واشتقاق مفاتيح الجلسة وحماية البيانات من المتنصت.",
    lessonNumber: "2-1",
    chapterNumber: 2
  },
  {
    id: "network-defense-sim",
    title: "4. مختبر الدفاع في العمق والـ DMZ و Zero Trust",
    category: "الفصل 2 (الدرس 2-2)",
    iconName: "Shield",
    color: "border-teal-500 text-teal-400",
    description: "بناء وتعديل دفاعات الشبكة واختبار صمود خوادم المؤسسة وقواعد البيانات ضد هجمات الويب والتصيد.",
    lessonNumber: "2-2",
    chapterNumber: 2
  },
  {
    id: "incident-response-sim",
    title: "5. قائد الاستجابة للحوادث ومصفوفة المخاطر",
    category: "الفصل 2 (الدرس 2-3)",
    iconName: "ShieldAlert",
    color: "border-red-500 text-red-400",
    description: "إدارة سيناريو هجوم الفدية عبر 6 خطوات (الاحتواء أولاً) وحساب درجة الخطر (التأثير × الاحتمالية).",
    lessonNumber: "2-3",
    chapterNumber: 2
  },
  {
    id: "web-request-flow-sim",
    title: "6. مفتش طلبات الويب الثلاثية وصيغة JSON",
    category: "الفصل 3 (الدرس 3-1 و 3-2)",
    iconName: "Globe",
    color: "border-amber-500 text-amber-400",
    description: "تتبع طلب GET/POST عبر العميل والخادم وقاعدة البيانات وفحص كائنات JSON ورموز 200/404/500.",
    lessonNumber: "3-1",
    chapterNumber: 3
  },
  {
    id: "crap-design-studio-sim",
    title: "7. استوديو مبادئ التصميم البصري (CRAP)",
    category: "الفصل 4 (الدرس 4-2)",
    iconName: "Layout",
    color: "border-pink-500 text-pink-400",
    description: "تطبيق التباين، التكرار، المحاذاة، والتقارب لمشاهدة تحول الواجهات السيئة إلى تصميمات معيارية.",
    lessonNumber: "4-2",
    chapterNumber: 4
  },
  {
    id: "ab-test-lab-sim",
    title: "8. مختبر اختبارات A/B وحلقة PDCA",
    category: "الفصل 4 (الدرس 4-4)",
    iconName: "BarChart3",
    color: "border-indigo-500 text-indigo-400",
    description: "إجراء تجربة علمية تعزل متغيراً واحداً ومحاكاة 2,000 زائر لحساب CVR ومعدل الارتداد واعتماد القرار.",
    lessonNumber: "4-4",
    chapterNumber: 4
  }
];
