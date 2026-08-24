import { GlossaryTerm } from "@/types";

export const GLOSSARY_DATA: GlossaryTerm[] = [
  {
    id: "g-moores-law",
    termAr: "قانون مور",
    termEn: "Moore's Law",
    definitionAr: "الملاحظة التجريبية القائلة إن عدد الترانزستورات في الشريحة يتضاعف تقريباً كل عامين، وهو اتجاه تاريخي قاد تطور المعالجات لعقود.",
    definitionEn: "The observation that the number of transistors in an integrated circuit doubles approximately every two years.",
    chapterId: "chapter-1",
    lessonNumber: "1-1",
    category: "General"
  },
  {
    id: "g-edge-computing",
    termAr: "الحوسبة الطرفية",
    termEn: "Edge Computing",
    definitionAr: "معالجة البيانات على الجهاز نفسه فوراً بالقرب من مصدر البيانات بدلاً من إرسالها إلى السحابة، لتقليل زمن الاستجابة والحفاظ على السلامة.",
    definitionEn: "Processing data near the edge of the network where data is being generated, instead of in a centralized data-processing warehouse.",
    chapterId: "chapter-1",
    lessonNumber: "1-1",
    category: "General"
  },
  {
    id: "g-quantum-computing",
    termAr: "الحوسبة الكمومية",
    termEn: "Quantum Computing",
    definitionAr: "حوسبة تستخدم خصائص ميكانيكا الكم ومبدأ التراكب الكمومي والكيوبت لمعالجة فئات محددة من المسائل المعقدة بسرعة تفوق الحواسيب التقليدية.",
    definitionEn: "A computational paradigm utilizing the phenomena of quantum mechanics, such as superposition and entanglement, using qubits.",
    chapterId: "chapter-1",
    lessonNumber: "1-1",
    category: "General"
  },
  {
    id: "g-ai",
    termAr: "الذكاء الاصطناعي",
    termEn: "Artificial Intelligence (AI)",
    definitionAr: "مجال حوسبي يضم أنظمة تستطيع تنفيذ مهام تحاكي الذكاء البشري مثل التعلم من البيانات والتنبؤ والتعرف واتخاذ القرارات.",
    definitionEn: "Computer systems capable of performing tasks that typically require human intelligence, such as learning, reasoning, and perception.",
    chapterId: "chapter-1",
    lessonNumber: "1-2",
    category: "AI"
  },
  {
    id: "g-machine-learning",
    termAr: "التعلم الآلي",
    termEn: "Machine Learning (ML)",
    definitionAr: "فرع من الذكاء الاصطناعي تتعلم فيه النماذج أنماطاً من البيانات لإجراء تنبؤات أو تصنيفات بدلاً من برمجة كل قاعدة صراحة.",
    definitionEn: "A branch of AI where algorithms learn patterns from data to make predictions or decisions without explicit rule programming.",
    chapterId: "chapter-1",
    lessonNumber: "1-2",
    category: "AI"
  },
  {
    id: "g-deep-learning",
    termAr: "التعلم العميق",
    termEn: "Deep Learning (DL)",
    definitionAr: "أسلوب من أساليب التعلم الآلي يعتمد على شبكات عصبية اصطناعية متعددة الطبقات، ويمكنه تعلم تمثيلات وأنماط معقدة من البيانات غير المهيكلة.",
    definitionEn: "A subset of ML based on artificial neural networks with multiple layers, capable of learning high-level features from data.",
    chapterId: "chapter-1",
    lessonNumber: "1-2",
    category: "AI"
  },
  {
    id: "g-generative-ai",
    termAr: "الذكاء الاصطناعي التوليدي",
    termEn: "Generative AI (GenAI)",
    definitionAr: "أنظمة تنشئ محتوى جديداً مثل النصوص والصور والصوت والبرمجيات اعتماداً على الأنماط التي تعلمتها من بيانات التدريب الضخمة.",
    definitionEn: "AI models that can generate new content, such as text, images, or audio, based on patterns learned from training data.",
    chapterId: "chapter-1",
    lessonNumber: "1-2",
    category: "AI"
  },
  {
    id: "g-hallucination",
    termAr: "الهلوسة في الذكاء الاصطناعي",
    termEn: "AI Hallucination",
    definitionAr: "ظاهرة يقوم فيها نموذج الذكاء الاصطناعي التوليدي بإنتاج معلومات تبدو مقنعة ومصاغة بثقة لكنها خاطئة واقعياً أو غير مسندة لمصدر.",
    definitionEn: "When a generative AI model creates plausible-sounding but factually incorrect or unsupported output.",
    chapterId: "chapter-1",
    lessonNumber: "1-2",
    category: "AI"
  },
  {
    id: "g-recommendation-system",
    termAr: "نظام التوصية",
    termEn: "Recommendation System",
    definitionAr: "نظام يتنبأ بتفضيلات المستخدم من خلال تحليل بيانات سلوكه السابق ويعرض توصيات مخصصة له.",
    definitionEn: "An information filtering system that predicts user preferences based on past behavior and serves personalized suggestions.",
    chapterId: "chapter-1",
    lessonNumber: "1-3",
    category: "AI"
  },
  {
    id: "g-predictive-maintenance",
    termAr: "الصيانة التنبؤية",
    termEn: "Predictive Maintenance",
    definitionAr: "استخدام البيانات والمستشعرات والذكاء الاصطناعي للتنبؤ بأعطال الآلات والمعدات قبل وقوعها لتجنب التوقف المفاجئ.",
    definitionEn: "Techniques designed to help determine the condition of in-service equipment in order to predict when maintenance should be performed.",
    chapterId: "chapter-1",
    lessonNumber: "1-3",
    category: "AI"
  },
  {
    id: "g-black-box",
    termAr: "مشكلة الصندوق الأسود",
    termEn: "Black Box Problem",
    definitionAr: "صعوبة فهم وتفسير الكيفية التي توصل بها نموذج الذكاء الاصطناعي المعقد إلى قراره أو حكمه النهائي.",
    definitionEn: "The difficulty in understanding how a complex AI model reached its specific decision or output.",
    chapterId: "chapter-1",
    lessonNumber: "1-3",
    category: "AI"
  },
  {
    id: "g-algorithmic-bias",
    termAr: "التحيز الخوارزمي",
    termEn: "Algorithmic Bias",
    definitionAr: "انحراف أو نمط في مخرجات الذكاء الاصطناعي يؤدي إلى نتائج غير عادلة أو تمييزية ينشأ من بيانات التدريب غير المتوازنة أو تصميم النموذج.",
    definitionEn: "Systematic and repeatable errors in a computer system that create unfair outcomes, such as privileging one arbitrary group over another.",
    chapterId: "chapter-1",
    lessonNumber: "1-4",
    category: "AI"
  },
  {
    id: "g-xai",
    termAr: "الذكاء الاصطناعي القابل للتفسير",
    termEn: "Explainable AI (XAI)",
    definitionAr: "أساليب وتقنيات تساعد البشر على فهم العوامل التي أسهمت في وصول نظام الذكاء الاصطناعي إلى قرار أو مخرج معين.",
    definitionEn: "Methods and techniques in the application of AI such that the results of the solution can be understood by humans.",
    chapterId: "chapter-1",
    lessonNumber: "1-4",
    category: "AI"
  },
  {
    id: "g-accountability",
    termAr: "المساءلة",
    termEn: "Accountability",
    definitionAr: "تحديد الجهات المسؤولة عن النظام وقراراته وآثاره، وإمكانية محاسبتها قانونياً وأخلاقياً وفق أدوارها المحددة.",
    definitionEn: "The obligation of an individual or organization to account for its activities, accept responsibility for them, and disclose the results.",
    chapterId: "chapter-1",
    lessonNumber: "1-4",
    category: "AI"
  },
  {
    id: "g-https",
    termAr: "بروتوكول HTTPS",
    termEn: "HTTPS",
    definitionAr: "بروتوكول نقل النص التشعبي عبر اتصال TLS مؤمن يوفر سرية البيانات وسلامتها ومصادقة خادم الويب.",
    definitionEn: "An extension of HTTP used for secure communication over a computer network via TLS encryption.",
    chapterId: "chapter-2",
    lessonNumber: "2-1",
    category: "Cybersecurity"
  },
  {
    id: "g-2fa",
    termAr: "المصادقة الثنائية (2FA)",
    termEn: "Two-Factor Authentication (2FA)",
    definitionAr: "استخدام عاملين مستقلين من فئتين مختلفتين (المعرفة، الحيازة، السمات الحيوية) لإثبات هوية المستخدم قبل منحه حق الوصول.",
    definitionEn: "An identity verification method requiring two independent authentication factors from different categories.",
    chapterId: "chapter-2",
    lessonNumber: "2-1",
    category: "Cybersecurity"
  },
  {
    id: "g-firewall",
    termAr: "جدار الحماية",
    termEn: "Firewall",
    definitionAr: "نظام أو برنامج يراقب حركة مرور الشبكة ويسمح بها أو يمنعها استناداً إلى قواعد أمنية محددة مسبقاً.",
    definitionEn: "A network security system that monitors and controls incoming and outgoing network traffic based on predetermined security rules.",
    chapterId: "chapter-2",
    lessonNumber: "2-2",
    category: "Cybersecurity"
  },
  {
    id: "g-vpn",
    termAr: "الشبكة الافتراضية الخاصة",
    termEn: "Virtual Private Network (VPN)",
    definitionAr: "اتصال أو شبكة منطقية خاصة عبر شبكة عامة كالإنترنت، تستخدم التشفير وتقنيات النفق لحماية البيانات بين الطرفين.",
    definitionEn: "An encrypted connection over the Internet from a device to a network ensuring sensitive data is securely transmitted.",
    chapterId: "chapter-2",
    lessonNumber: "2-2",
    category: "Cybersecurity"
  },
  {
    id: "g-dmz",
    termAr: "المنطقة المعزولة",
    termEn: "DMZ (Demilitarized Zone)",
    definitionAr: "منطقة فرعية في الشبكة تُوضع فيها الخوادم المعرضة للإنترنت بشكل منفصل عن الشبكة الداخلية لحمايتها من الاختراق المباشر.",
    definitionEn: "A physical or logical subnetwork that contains and exposes an organization's external-facing services to an untrusted network.",
    chapterId: "chapter-2",
    lessonNumber: "2-2",
    category: "Cybersecurity"
  },
  {
    id: "g-zero-trust",
    termAr: "نهج انعدام الثقة",
    termEn: "Zero Trust Architecture",
    definitionAr: "نهج أمني لا يمنح الثقة تلقائياً لأي مستخدم أو جهاز داخل الشبكة، ويطلب فحص الهوية والصلاحيات والسياق عند كل طلب وصول.",
    definitionEn: "A strategic cybersecurity initiative that eliminates implicit trust and continuously validates every stage of digital interaction.",
    chapterId: "chapter-2",
    lessonNumber: "2-2",
    category: "Cybersecurity"
  },
  {
    id: "g-incident-response",
    termAr: "الاستجابة للحوادث الأمنية",
    termEn: "Incident Response",
    definitionAr: "خطة منظمة من 6 مراحل (تحضير، اكتشاف، احتواء، استئصال، استعادة، دروس مستفادة) للتعامل مع الخروقات الأمنية والحد من أثرها.",
    definitionEn: "An organized approach to addressing and managing the aftermath of a security breach or cyberattack.",
    chapterId: "chapter-2",
    lessonNumber: "2-3",
    category: "Cybersecurity"
  },
  {
    id: "g-json",
    termAr: "صيغة JSON",
    termEn: "JSON (JavaScript Object Notation)",
    definitionAr: "صيغة نصية خفيفة وقابلة للقراءة لتمثيل وتبادل البيانات المهيكلة بين الخادم والمتصفح باستخدام كائنات ومصفوفات.",
    definitionEn: "A standard text-based format for representing structured data based on JavaScript object syntax.",
    chapterId: "chapter-3",
    lessonNumber: "3-2",
    category: "WebDev"
  },
  {
    id: "g-semantic-html",
    termAr: "HTML الدلالية",
    termEn: "Semantic HTML",
    definitionAr: "استخدام عناصر HTML ذات معنى وظيفي صريح مثل `<header>` و `<main>` و `<nav>` مما يحسن الوصول لذوي الإعاقة ومحركات البحث.",
    definitionEn: "HTML that introduces meaning to the web page rather than just presentation (e.g. `<header>`, `<article>`).",
    chapterId: "chapter-3",
    lessonNumber: "3-3",
    category: "WebDev"
  },
  {
    id: "g-crap",
    termAr: "مبادئ CRAP للتصميم",
    termEn: "CRAP Design Principles",
    definitionAr: "المبادئ الأربعة لتنظيم واجهة المستخدم: Contrast (التباين)، Repetition (التكرار)، Alignment (المحاذاة)، و Proximity (التقارب).",
    definitionEn: "Four fundamental visual design principles: Contrast, Repetition, Alignment, and Proximity.",
    chapterId: "chapter-4",
    lessonNumber: "4-2",
    category: "Design"
  },
  {
    id: "g-pdca",
    termAr: "دورة PDCA",
    termEn: "PDCA Cycle",
    definitionAr: "حلقة تحسين مستمر متكررة تدفع التطوير قدماً عبر أربع خطوات: خّطط (Plan)، نفّذ (Do)، تحقّق (Check)، وتصرّف (Act).",
    definitionEn: "An iterative four-step management method used for the continuous improvement of processes and products.",
    chapterId: "chapter-4",
    lessonNumber: "4-4",
    category: "Design"
  },
  {
    id: "g-ab-testing",
    termAr: "اختبار A/B",
    termEn: "A/B Testing",
    definitionAr: "تجربة علمية تقارن بين نسختين من الصفحة مع عزل متغير واحد وتوزيع الزوار عشوائياً لمعرفة أيهما يحقق نتائج أفضل بالبيانات.",
    definitionEn: "A randomized experimentation process wherein two versions of a webpage are shown to users to determine which performs better.",
    chapterId: "chapter-4",
    lessonNumber: "4-4",
    category: "Design"
  }
];
