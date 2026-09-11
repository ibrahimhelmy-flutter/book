export interface NavLessonItem {
  id: string;
  slug: string;
  number: string;
  title: string;
  englishTitle?: string;
  pageRange: string;
}

export interface NavChapterItem {
  id: string;
  number: number;
  title: string;
  englishTitle: string;
  pageStart: number;
  pageEnd: number;
  lessons: NavLessonItem[];
}

export const CURRICULUM_TOC: NavChapterItem[] = [
  {
    id: "chapter-1",
    number: 1,
    title: "تكنولوجيا المعلومات والمجتمع",
    englishTitle: "Information Technology and Society",
    pageStart: 4,
    pageEnd: 30,
    lessons: [
      {
        id: "lesson-1-1",
        slug: "it-evolution-social-transformation",
        number: "1-1",
        title: "تطور تكنولوجيا المعلومات والتحول الاجتماعي",
        pageRange: "4 - 11",
      },
      {
        id: "lesson-1-2",
        slug: "how-ai-works",
        number: "1-2",
        title: "كيف يعمل الذكاء الاصطناعي",
        pageRange: "12 - 19",
      },
      {
        id: "lesson-1-3",
        slug: "ai-daily-life-industry",
        number: "1-3",
        title: "الذكاء الاصطناعي في الحياة اليومية والصناعة",
        pageRange: "20 - 25",
      },
      {
        id: "lesson-1-4",
        slug: "ai-ethics",
        number: "1-4",
        title: "القضايا الأخلاقية المتعلقة بالذكاء الاصطناعي",
        pageRange: "26 - 30",
      },
    ],
  },
  {
    id: "chapter-2",
    number: 2,
    title: "الأمن السيبراني",
    englishTitle: "Cybersecurity",
    pageStart: 31,
    pageEnd: 49,
    lessons: [
      {
        id: "lesson-2-1",
        slug: "encryption-authentication-technologies",
        number: "2-1",
        title: "تقنيات التشفير والمصادقة",
        pageRange: "31 - 37",
      },
      {
        id: "lesson-2-2",
        slug: "network-security-design",
        number: "2-2",
        title: "تصميم أمن الشبكات",
        pageRange: "38 - 43",
      },
      {
        id: "lesson-2-3",
        slug: "incident-response-risk-management",
        number: "2-3",
        title: "الاستجابة للحوادث وإدارة المخاطر",
        pageRange: "44 - 49",
      },
    ],
  },
  {
    id: "chapter-3",
    number: 3,
    title: "تطبيقات الويب",
    englishTitle: "Web Applications",
    pageStart: 50,
    pageEnd: 67,
    lessons: [
      {
        id: "lesson-3-1",
        slug: "web-applications-architecture",
        number: "3-1",
        title: "البنية العامة لتطبيقات الويب",
        pageRange: "50 - 56",
      },
      {
        id: "lesson-3-2",
        slug: "web-communication-methods",
        number: "3-2",
        title: "طرق اتصال تطبيقات الويب",
        pageRange: "57 - 62",
      },
      {
        id: "lesson-3-3",
        slug: "frontend-technology-basics",
        number: "3-3",
        title: "أساسيات تقنية الواجهة الأمامية",
        pageRange: "63 - 67",
      },
    ],
  },
  {
    id: "chapter-4",
    number: 4,
    title: "تصميم الويب والوسائط",
    englishTitle: "Web Design and Media",
    pageStart: 68,
    pageEnd: 94,
    lessons: [
      {
        id: "lesson-4-1",
        slug: "media-types-characteristics",
        number: "4-1",
        title: "أنواع الوسائط وخصائصها",
        pageRange: "68 - 73",
      },
      {
        id: "lesson-4-2",
        slug: "information-design-user-experience",
        number: "4-2",
        title: "تصميم المعلومات وتجربة المستخدم للمواقع الإلكترونية",
        pageRange: "74 - 79",
      },
      {
        id: "lesson-4-3",
        slug: "website-evaluation-methods",
        number: "4-3",
        title: "طرق تقييم المواقع الإلكترونية",
        pageRange: "80 - 87",
      },
      {
        id: "lesson-4-4",
        slug: "iterative-improvement-process",
        number: "4-4",
        title: "عملية التحسين التكراري للمواقع الإلكترونية",
        pageRange: "88 - 94",
      },
    ],
  },
];

export const TOTAL_CURRICULUM_LESSONS = CURRICULUM_TOC.reduce(
  (acc, ch) => acc + ch.lessons.length,
  0
);
