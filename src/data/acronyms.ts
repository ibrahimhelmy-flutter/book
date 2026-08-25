import { AcronymTerm } from "@/types";

export const ACRONYMS_DATA: AcronymTerm[] = [
  // 1. Hardware & Computer History (Includes ENIAC)
  {
    short: "ENIAC",
    fullEn: "Electronic Numerical Integrator and Computer",
    fullAr: "الحاسوب والمكامل الرقمي الإلكتروني",
    descriptionAr: "أول حاسوب رقمي إلكتروني للأغراض العامة (بُني عام 1945)، اعتمد على الصمامات المفرغة وشغل مساحة غرفة كاملة.",
    category: "Hardware",
    lessonRef: "1-1"
  },
  {
    short: "CPU",
    fullEn: "Central Processing Unit",
    fullAr: "وحدة المعالجة المركزية",
    descriptionAr: "المعالج الرئيسي وعقل الحاسوب الذي ينفذ التعليمات البرمجية والعمليات الحسابية والمنطقية.",
    category: "Hardware",
    lessonRef: "1-1"
  },
  {
    short: "GPU",
    fullEn: "Graphics Processing Unit",
    fullAr: "وحدة معالجة الرسوميات",
    descriptionAr: "معالج موازي عالي السرعة مصمم لمعالجة الصور والرسوميات وتدريب مصفوفات نماذج الذكاء الاصطناعي.",
    category: "Hardware",
    lessonRef: "1-1"
  },
  {
    short: "TPU",
    fullEn: "Tensor Processing Unit",
    fullAr: "وحدة معالجة الموترات",
    descriptionAr: "شريحة تسريع مخصصة طورتها جوجل لتسريع حسابات التعلم العميق والمصفوفات الرياضية للذكاء الاصطناعي.",
    category: "Hardware",
    lessonRef: "1-2"
  },
  {
    short: "NPU",
    fullEn: "Neural Processing Unit",
    fullAr: "وحدة المعالجة العصبية",
    descriptionAr: "معالج مخصص مدمج في الأجهزة والهواتف الذكية لتشغيل مهام الذكاء الاصطناعي على الحافة (Edge AI).",
    category: "Hardware",
    lessonRef: "1-1"
  },
  {
    short: "RAM",
    fullEn: "Random Access Memory",
    fullAr: "ذاكرة الوصول العشوائي",
    descriptionAr: "الذاكرة المؤقتة السريعة التي تخزن البيانات والبرامج قيد التشغيل وتفقد محتوياتها عند انقطاع التيار.",
    category: "Hardware",
    lessonRef: "1-1"
  },
  {
    short: "ROM",
    fullEn: "Read-Only Memory",
    fullAr: "ذاكرة القراءة فقط",
    descriptionAr: "ذاكرة غير متطايرة تحتفظ بالتعليمات الأساسية للإقلاع (Firmware / BIOS) ولا تفقد بياناتها بانقطاع الكهرباء.",
    category: "Hardware",
    lessonRef: "1-1"
  },
  {
    short: "SSD",
    fullEn: "Solid State Drive",
    fullAr: "محرك الأقراص ذو الحالة الصلبة",
    descriptionAr: "وحدة تخزين بيانات إلكترونية تعتمد على رقائق الذاكرة الوميضية بدون أجزاء متحركة، وتتميز بالسرعة العالية.",
    category: "Hardware",
    lessonRef: "1-1"
  },
  {
    short: "HDD",
    fullEn: "Hard Disk Drive",
    fullAr: "محرك الأقراص الصلبة الميكانيكي",
    descriptionAr: "وحدة تخزين كهرومغناطيسية تقليدية تحتوي على أقراص دوارة لتخزين السعات الكبيرة من البيانات.",
    category: "Hardware",
    lessonRef: "1-1"
  },
  {
    short: "ALU",
    fullEn: "Arithmetic Logic Unit",
    fullAr: "وحدة الحساب والمنطق",
    descriptionAr: "جزء أساسي داخل وحدة المعالجة المركزية ينفذ كافة العمليات الحسابية الأساسية والمقارنات المنطقية.",
    category: "Hardware",
    lessonRef: "1-1"
  },
  {
    short: "CU",
    fullEn: "Control Unit",
    fullAr: "وحدة التحكم",
    descriptionAr: "مكون داخل المعالج يوجه تدفق التعليمات والبيانات بين الذاكرة ووحدة الحساب ووحدات الإدخال والإخراج.",
    category: "Hardware",
    lessonRef: "1-1"
  },
  {
    short: "BIOS",
    fullEn: "Basic Input/Output System",
    fullAr: "نظام الإدخال والإخراج الأساسي",
    descriptionAr: "برنامج ثابت في اللوحة الأم يقوم بفحص العتاد وتهيئة بيئة إقلاع نظام التشغيل.",
    category: "Hardware",
    lessonRef: "1-1"
  },

  // 2. Artificial Intelligence & Data
  {
    short: "AI",
    fullEn: "Artificial Intelligence",
    fullAr: "الذكاء الاصطناعي",
    descriptionAr: "المجال العام في علوم الحاسوب لتطوير أنظمة تحاكي القدرات والذكاء البشري مثل التعلم والاستنتاج والتحليل.",
    category: "AI",
    lessonRef: "1-2"
  },
  {
    short: "ML",
    fullEn: "Machine Learning",
    fullAr: "التعلم الآلي",
    descriptionAr: "فرع من الذكاء الاصطناعي يمكن الأنظمة من التعلم واكتشاف الأنماط من البيانات دون برمجة كل قاعدة يدوياً.",
    category: "AI",
    lessonRef: "1-2"
  },
  {
    short: "DL",
    fullEn: "Deep Learning",
    fullAr: "التعلم العميق",
    descriptionAr: "مجموعة فرعية من التعلم الآلي تعتمد على شبكات عصبية اصطناعية متعددة الطبقات لمعالجة البيانات المعقدة.",
    category: "AI",
    lessonRef: "1-2"
  },
  {
    short: "GenAI",
    fullEn: "Generative Artificial Intelligence",
    fullAr: "الذكاء الاصطناعي التوليدي",
    descriptionAr: "أنظمة قادرة على إنشاء محتوى أصيل جديد كالنصوص والصور والأصوات والبرمجيات بناءً على نماذج مدربة.",
    category: "AI",
    lessonRef: "1-2"
  },
  {
    short: "AGI",
    fullEn: "Artificial General Intelligence",
    fullAr: "الذكاء الاصطناعي العام",
    descriptionAr: "مستوى نظري متقدم من الذكاء الاصطناعي يمتلك قدرات إدراكية شاملة تضاهي أو تفوق الإنسان في جميع المجالات.",
    category: "AI",
    lessonRef: "1-2"
  },
  {
    short: "ANN",
    fullEn: "Artificial Neural Network",
    fullAr: "الشبكة العصبية الاصطناعية",
    descriptionAr: "نموذج رياضي مستوحى من بنية العصبونات البيولوجية في الدماغ لمعالجة الإشارات واستخراج الأنماط.",
    category: "AI",
    lessonRef: "1-2"
  },
  {
    short: "CNN",
    fullEn: "Convolutional Neural Network",
    fullAr: "الشبكة العصبية الالتفافية",
    descriptionAr: "نوع متخصص من الشبكات العصبية العميقة فائق الفعالية في معالجة الصور والفيديوهات والتعرف على الأشكال.",
    category: "AI",
    lessonRef: "1-2"
  },
  {
    short: "RNN",
    fullEn: "Recurrent Neural Network",
    fullAr: "الشبكة العصبية المتكررة",
    descriptionAr: "شبكة عصبية مصممة للتعامل مع البيانات المتسلسلة والزمنية مثل النصوص والأصوات عبر الاحتفاظ بذاكرة للسياق.",
    category: "AI",
    lessonRef: "1-2"
  },
  {
    short: "GAN",
    fullEn: "Generative Adversarial Network",
    fullAr: "الشبكة التوليدية التنافسية",
    descriptionAr: "بنية تعلم عميق تتكون من شبكتين متنافستين (المولّد والمميّز) لإنتاج مخرجات فائقة الواقعية.",
    category: "AI",
    lessonRef: "1-2"
  },
  {
    short: "LLM",
    fullEn: "Large Language Model",
    fullAr: "النموذج اللغوي الكبير",
    descriptionAr: "نموذج ذكاء اصطناعي مدرب على مليارات الكلمات لفهم وتوليد اللغة البشرية والإجابة عن الاستفسارات.",
    category: "AI",
    lessonRef: "1-2"
  },
  {
    short: "LLMs",
    fullEn: "Large Language Models",
    fullAr: "النماذج اللغوية الكبيرة",
    descriptionAr: "نماذج الذكاء الاصطناعي التوليدية المتقدمة المتخصصة في معالجة وفهم وتوليد النصوص مثل GPT.",
    category: "AI",
    lessonRef: "1-2"
  },
  {
    short: "NLP",
    fullEn: "Natural Language Processing",
    fullAr: "معالجة اللغات الطبيعية",
    descriptionAr: "مجال حوسبي يركز على تمكين الحواسيب من فهم النصوص والأحاديث البشرية والتفاعل معها.",
    category: "AI",
    lessonRef: "1-2"
  },
  {
    short: "CV",
    fullEn: "Computer Vision",
    fullAr: "الرؤية الحاسوبية",
    descriptionAr: "علم استخراج وفهم المعلومات ذات المغزى من الصور الرقمية والفيديوهات والبيانات المرئية.",
    category: "AI",
    lessonRef: "1-2"
  },
  {
    short: "XAI",
    fullEn: "Explainable Artificial Intelligence",
    fullAr: "الذكاء الاصطناعي القابل للتفسير",
    descriptionAr: "أساليب وتقنيات تجعل قرارات ونماذج الذكاء الاصطناعي واضحة ومفهومة ومفسرة للبشر لكشف التحيز وبناء الثقة.",
    category: "AI",
    lessonRef: "1-4"
  },

  // 3. Cybersecurity & Networking
  {
    short: "HTTPS",
    fullEn: "Hypertext Transfer Protocol Secure",
    fullAr: "بروتوكول نقل النص التشعبي الآمن",
    descriptionAr: "بروتوكول تصفح الويب المشفر عبر طبقة أمان النقل (TLS) لضمان سرية البيانات وسلامتها ومصادقة الموقع.",
    category: "Cybersecurity",
    lessonRef: "2-1"
  },
  {
    short: "HTTP",
    fullEn: "Hypertext Transfer Protocol",
    fullAr: "بروتوكول نقل النص التشعبي",
    descriptionAr: "البروتوكول الأساسي لنقل صفحات ومحتويات الويب بين الخادم والمتصفح (غير مشفر).",
    category: "Networking",
    lessonRef: "2-1"
  },
  {
    short: "TLS",
    fullEn: "Transport Layer Security",
    fullAr: "بروتوكول أمان طبقة النقل",
    descriptionAr: "بروتوكول تشفير يوفر اتصالات آمنة عبر الشبكة من خلال مصافحة تشفير بالمفتاح العام ثم تشفير متماثل.",
    category: "Cybersecurity",
    lessonRef: "2-1"
  },
  {
    short: "SSL",
    fullEn: "Secure Sockets Layer",
    fullAr: "طبقة المنافذ الآمنة",
    descriptionAr: "البروتوكول الأمني القديم لسلف TLS الذي كان يُستخدم لتشفير اتصالات الويب وحمايتها.",
    category: "Cybersecurity",
    lessonRef: "2-1"
  },
  {
    short: "2FA",
    fullEn: "Two-Factor Authentication",
    fullAr: "المصادقة الثنائية",
    descriptionAr: "إجراء أمني يتطلب تقديم دليلين مستقلين للهوية من فئتين مختلفتين (ككلمة المرور + رمز الهاتف).",
    category: "Cybersecurity",
    lessonRef: "2-1"
  },
  {
    short: "MFA",
    fullEn: "Multi-Factor Authentication",
    fullAr: "المصادقة متعددة العوامل",
    descriptionAr: "نظام تحقق يطلب أكثر من عاملين من عوامل التحقق (المعرفة، الحيازة، السمات الحيوية) لمنح الوصول.",
    category: "Cybersecurity",
    lessonRef: "2-1"
  },
  {
    short: "VPN",
    fullEn: "Virtual Private Network",
    fullAr: "الشبكة الافتراضية الخاصة",
    descriptionAr: "نفق اتصال مشفر يربط جهاز المستخدم بالشبكة عن بعد عبر الإنترنت بأمان وخصوصية تامة.",
    category: "Cybersecurity",
    lessonRef: "2-2"
  },
  {
    short: "DMZ",
    fullEn: "Demilitarized Zone",
    fullAr: "المنطقة المعزولة / منزوعة السلاح",
    descriptionAr: "شبكة فرعية معزولة توضع فيها الخوادم العامة (كالويب والإيميل) لحماية الشبكة الداخلية من الاختراق المباشر.",
    category: "Cybersecurity",
    lessonRef: "2-2"
  },
  {
    short: "DoS",
    fullEn: "Denial of Service",
    fullAr: "هجوم حجب الخدمة",
    descriptionAr: "هجوم سيبراني يهدف إلى إغراق خادم أو شبكة بفيض من الطلبات لتعطيلها ومنع المستخدمين الشرعيين من الوصول.",
    category: "Cybersecurity",
    lessonRef: "2-3"
  },
  {
    short: "DDoS",
    fullEn: "Distributed Denial of Service",
    fullAr: "هجوم حجب الخدمة الموزع",
    descriptionAr: "هجوم حجب خدمة منسق ينطلق من آلاف الأجهزة المصابة (Botnet) في وقت واحد لإسقاط الخوادم المستهدفة.",
    category: "Cybersecurity",
    lessonRef: "2-3"
  },
  {
    short: "CIA",
    fullEn: "Confidentiality, Integrity, Availability",
    fullAr: "ثالوث أمن المعلومات (السرية، السلامة، التوافر)",
    descriptionAr: "النموذج الأمني الأساسي الذي يقيس حماية البيانات: سرية المحتوى، سلامته من التعديل، وتوافره عند الحاجة.",
    category: "Cybersecurity",
    lessonRef: "2-1"
  },
  {
    short: "GDPR",
    fullEn: "General Data Protection Regulation",
    fullAr: "اللائحة العامة لحماية البيانات",
    descriptionAr: "النظام الأوروبي الشامل لحماية خصوصية البيانات الشخصية للمستخدمين وتنظيم جمعها ومعالجتها.",
    category: "Cybersecurity",
    lessonRef: "1-4"
  },
  {
    short: "XSS",
    fullEn: "Cross-Site Scripting",
    fullAr: "البرمجة النصية عبر المواقع",
    descriptionAr: "ثغرة أمنية تسمح للمهاجم بحقن شفرات جافاسكريبت خبيثة في صفحات يراها مستخدمون آخرون لسرقة الجلسات.",
    category: "Cybersecurity",
    lessonRef: "2-3"
  },
  {
    short: "CSRF",
    fullEn: "Cross-Site Request Forgery",
    fullAr: "تزوير الطلب عبر المواقع",
    descriptionAr: "هجوم يجبر متصفح الضحية الموثق على تنفيذ إجراءات غير مرغوب فيها على تطبيق ويب دون علمه.",
    category: "Cybersecurity",
    lessonRef: "2-3"
  },
  {
    short: "SQLi",
    fullEn: "SQL Injection",
    fullAr: "حقن لغة الاستعلام البنيوية",
    descriptionAr: "ثغرة برمجية تتيح للمهاجم إدخال أوامر SQL خبيثة للتلاعب بقاعدة البيانات وسرقة أو تدمير محتوياتها.",
    category: "Cybersecurity",
    lessonRef: "2-3"
  },
  {
    short: "IP",
    fullEn: "Internet Protocol",
    fullAr: "بروتوكول الإنترنت",
    descriptionAr: "البروتوكول المسؤول عن عنونة وتوجيه حزم البيانات عبر شبكات الإنترنت.",
    category: "Networking",
    lessonRef: "2-1"
  },
  {
    short: "TCP",
    fullEn: "Transmission Control Protocol",
    fullAr: "بروتوكول التحكم في الإرسال",
    descriptionAr: "بروتوكول نقل موثوق يضمن وصول جميع حزم البيانات مرتبة وبدون فقدان أو تلف.",
    category: "Networking",
    lessonRef: "2-1"
  },
  {
    short: "TCP/IP",
    fullEn: "Transmission Control Protocol / Internet Protocol",
    fullAr: "حزمة بروتوكولات التحكم في الإرسال والإنترنت",
    descriptionAr: "مجموعة البروتوكولات القياسية الحاكمة لكافة اتصالات ونقل البيانات عبر شبكة الإنترنت العالمية.",
    category: "Networking",
    lessonRef: "2-1"
  },
  {
    short: "UDP",
    fullEn: "User Datagram Protocol",
    fullAr: "بروتوكول حزم بيانات المستخدم",
    descriptionAr: "بروتوكول نقل سريع دون تأكيد استلام، يُستخدم في البث الحي والألعاب ومكالمات الصوت.",
    category: "Networking",
    lessonRef: "2-1"
  },
  {
    short: "DNS",
    fullEn: "Domain Name System",
    fullAr: "نظام أسماء النطاقات",
    descriptionAr: "دليل الإنترنت الذي يترجم أسماء المواقع المقروءة بشرياً (مثل google.com) إلى عناوين IP رقمية.",
    category: "Networking",
    lessonRef: "2-1"
  },
  {
    short: "URL",
    fullEn: "Uniform Resource Locator",
    fullAr: "محدد موقع الموارد الموحد",
    descriptionAr: "العنوان الرقمي الكامل المستخدم للوصول إلى صفحات وملفات الإنترنت عبر المتصفح.",
    category: "WebDev",
    lessonRef: "3-1"
  },
  {
    short: "LAN",
    fullEn: "Local Area Network",
    fullAr: "شبكة المنطقة المحلية",
    descriptionAr: "شبكة حاسوبية تغطي منطقة جغرافية محدودة كمبنى مدرسي أو منزل أو مكتب.",
    category: "Networking",
    lessonRef: "2-2"
  },
  {
    short: "WAN",
    fullEn: "Wide Area Network",
    fullAr: "شبكة المنطقة الواسعة",
    descriptionAr: "شبكة اتصالات تمتد عبر مساحات جغرافية شاسعة تربط مدناً أو دولاً ببعضها كالإنترنت.",
    category: "Networking",
    lessonRef: "2-2"
  },
  {
    short: "MAC",
    fullEn: "Media Access Control",
    fullAr: "التحكم في الوصول للوسائط (العنوان الفيزيائي للبطاقة)",
    descriptionAr: "المعرف الفريد الدائم المخصص لبطاقة الشبكة (NIC) على مستوى العتاد لتمييز الأجهزة.",
    category: "Networking",
    lessonRef: "2-2"
  },

  // 4. Web Development & Software Engineering
  {
    short: "HTML",
    fullEn: "HyperText Markup Language",
    fullAr: "لغة توصيف النص الفائق",
    descriptionAr: "اللغة القياسية لبناء الهيكل الإنشائي والعناصر الأساسية لصفحات ومواقع الويب.",
    category: "WebDev",
    lessonRef: "3-1"
  },
  {
    short: "CSS",
    fullEn: "Cascading Style Sheets",
    fullAr: "صفحات الأنماط الانسيابية",
    descriptionAr: "لغة تنسيق وتصميم مظهر وموقع وخطوط وألوان صفحات الويب لتناسب جميع الشاشات.",
    category: "WebDev",
    lessonRef: "3-1"
  },
  {
    short: "JS",
    fullEn: "JavaScript",
    fullAr: "لغة جافاسكريبت",
    descriptionAr: "لغة البرمجة الأساسية لتطوير الويب التفاعلي والمنطق البرمجي داخل المتصفح والخوادم.",
    category: "WebDev",
    lessonRef: "3-2"
  },
  {
    short: "JSON",
    fullEn: "JavaScript Object Notation",
    fullAr: "تدوين كائنات جافاسكريبت للبيانات",
    descriptionAr: "صيغة نصية خفيفة وسهلة القراءة لتبادل وهيكلة البيانات بين واجهات الويب والخوادم وقواعد البيانات.",
    category: "WebDev",
    lessonRef: "3-2"
  },
  {
    short: "DOM",
    fullEn: "Document Object Model",
    fullAr: "نموذج كائن المستند",
    descriptionAr: "التمثيل الشجري البرمجي لعناصر صفحة الويب الذي يمكن كود جافاسكريبت من تعديل الصفحة حياً.",
    category: "WebDev",
    lessonRef: "3-2"
  },
  {
    short: "API",
    fullEn: "Application Programming Interface",
    fullAr: "واجهة برمجة التطبيقات",
    descriptionAr: "مجموعة من البروتوكولات والوظائف التي تتيح للبرامج المختلفة التواصل وتبادل البيانات والخدمات بسلاسة.",
    category: "WebDev",
    lessonRef: "3-4"
  },
  {
    short: "REST",
    fullEn: "Representational State Transfer",
    fullAr: "نقل الحالة التمثيلية (معمارية REST)",
    descriptionAr: "نمط معماري قياسي لتصميم واجهات برمجة التطبيقات (APIs) عبر بروتوكول HTTP بعمليات واضحة.",
    category: "WebDev",
    lessonRef: "3-4"
  },
  {
    short: "SQL",
    fullEn: "Structured Query Language",
    fullAr: "لغة الاستعلام البنيوية",
    descriptionAr: "اللغة القياسية لإنشاء وإدارة واسترجاع البيانات المخزنة في قواعد البيانات العلائقية (Relational Databases).",
    category: "WebDev",
    lessonRef: "3-3"
  },
  {
    short: "NoSQL",
    fullEn: "Not Only SQL",
    fullAr: "قواعد البيانات غير العلائقية",
    descriptionAr: "فئة من أنظمة قواعد البيانات المرنة المصممة للتعامل مع البيانات الضخمة غير المهيكلة كالمستندات والمفاتيح.",
    category: "WebDev",
    lessonRef: "3-3"
  },
  {
    short: "DBMS",
    fullEn: "Database Management System",
    fullAr: "نظام إدارة قواعد البيانات",
    descriptionAr: "البرمجيات المسؤولة عن تخزين وتنظيم واسترجاع وحماية قواعد البيانات بكفاءة وأمان.",
    category: "WebDev",
    lessonRef: "3-3"
  },
  {
    short: "CRUD",
    fullEn: "Create, Read, Update, Delete",
    fullAr: "العمليات الأربع الأساسية للبيانات (إنشاء، قراءة، تعديل، حذف)",
    descriptionAr: "العمليات الجوهرية الأربع التي تنفذها التطبيقات للتعامل مع السجلات في قواعد البيانات.",
    category: "WebDev",
    lessonRef: "3-3"
  },
  {
    short: "CLI",
    fullEn: "Command Line Interface",
    fullAr: "واجهة سطر الأوامر",
    descriptionAr: "واجهة نصية لإدخال الأوامر المباشرة للنظام والحاسوب بدلاً من الأزرار والفأرة.",
    category: "General",
    lessonRef: "1-1"
  },
  {
    short: "GUI",
    fullEn: "Graphical User Interface",
    fullAr: "واجهة المستخدم الرسومية",
    descriptionAr: "واجهة بصرية تفاعلية تعتمد على النوافذ والأيقونات والقوائم لتسهيل الاستخدام للمستخدم العادي.",
    category: "General",
    lessonRef: "1-1"
  },
  {
    short: "IDE",
    fullEn: "Integrated Development Environment",
    fullAr: "بيئة التطوير المتكاملة",
    descriptionAr: "برنامج شامل للمبرمجين يجمع محرر الكود والمترجم وأدوات تتبع الأخطاء في مكان واحد (مثل VS Code).",
    category: "General",
    lessonRef: "3-1"
  },
  {
    short: "SDK",
    fullEn: "Software Development Kit",
    fullAr: "حزمة تطوير البرمجيات",
    descriptionAr: "مجموعة من الأدوات والمكتبات التوثيقية الجاهزة التي تساعد المطور على بناء تطبيقات لمنصة معينة.",
    category: "WebDev",
    lessonRef: "3-4"
  },
  {
    short: "OS",
    fullEn: "Operating System",
    fullAr: "نظام التشغيل",
    descriptionAr: "البرنامج الأساسي الذي يدير عتاد الحاسوب وموارده ويوفر البيئة لتشغيل البرامج والتطبيقات.",
    category: "General",
    lessonRef: "1-1"
  },
  {
    short: "IoT",
    fullEn: "Internet of Things",
    fullAr: "إنترنت الأشياء",
    descriptionAr: "شبكة من الأجهزة والمستشعرات المادية المتصلة بالإنترنت لجمع وتبادل البيانات تلقائياً دون تدخل بشري.",
    category: "General",
    lessonRef: "1-1"
  },

  // 5. UI/UX Design & Quality
  {
    short: "UI",
    fullEn: "User Interface",
    fullAr: "واجهة المستخدم",
    descriptionAr: "المظهر البصري والأزرار والتخطيط الذي يتفاعل معه المستخدم مباشرة على شاشة التطبيق أو الموقع.",
    category: "Design",
    lessonRef: "4-1"
  },
  {
    short: "UX",
    fullEn: "User Experience",
    fullAr: "تجربة المستخدم",
    descriptionAr: "الشعور الإجمالي والسهولة والراحة والانطباع الذي يمر به المستخدم أثناء رحلته داخل المنتج الرقمي.",
    category: "Design",
    lessonRef: "4-1"
  },
  {
    short: "CRAP",
    fullEn: "Contrast, Repetition, Alignment, Proximity",
    fullAr: "مبادئ التصميم الأربعة (التباين، التكرار، المحاذاة، التقارب)",
    descriptionAr: "القواعد البصرية الأربع الذهبية لتنظيم العناصر والشاشات لجعلها مريحة وجذابة وسهلة التصفح.",
    category: "Design",
    lessonRef: "4-2"
  },
  {
    short: "PDCA",
    fullEn: "Plan, Do, Check, Act",
    fullAr: "دورة ديمنج للتحسين المستمر (خطط، نفّذ، تحقّق، تصرّف)",
    descriptionAr: "منهجية إدارية وهندسية تكرارية من 4 مراحل لتحسين جودة الأنظمة والمنتجات بشكل مستمر.",
    category: "Design",
    lessonRef: "4-4"
  },
  {
    short: "WCAG",
    fullEn: "Web Content Accessibility Guidelines",
    fullAr: "إرشادات إمكانية الوصول إلى محتوى الويب",
    descriptionAr: "المعايير الدولية لضمان إتاحة محتوى الويب واستخدامه بسهولة لجميع الأشخاص وخاصة ذوي الإعاقة.",
    category: "Design",
    lessonRef: "4-3"
  },
  {
    short: "SEO",
    fullEn: "Search Engine Optimization",
    fullAr: "تحسين محركات البحث",
    descriptionAr: "مجموعة ممارسات لتحسين بنية ومحتوى صفحات الويب لرفع ترتيبها وظهورها في نتائج محركات البحث.",
    category: "WebDev",
    lessonRef: "3-3"
  }
];

/**
 * Fast lookup Map by shortcut (case-sensitive and case-insensitive)
 */
export const ACRONYMS_EXACT_MAP: Map<string, AcronymTerm> = new Map(
  ACRONYMS_DATA.map((item) => [item.short, item])
);

export const ACRONYMS_LOWER_MAP: Map<string, AcronymTerm> = new Map(
  ACRONYMS_DATA.map((item) => [item.short.toLowerCase(), item])
);

/**
 * Lookup helper with casing protection
 */
export function getAcronym(rawTerm: string): AcronymTerm | undefined {
  if (!rawTerm) return undefined;
  
  // Clean surrounding punctuation
  const clean = rawTerm.trim().replace(/^[("'`[\{«]+|[)"'`\]\}.,;:!?»]+$/g, "");
  if (!clean) return undefined;

  // 1. Direct exact match (e.g. "ENIAC", "AI", "2FA", "GenAI", "TCP/IP")
  if (ACRONYMS_EXACT_MAP.has(clean)) {
    return ACRONYMS_EXACT_MAP.get(clean);
  }

  // 2. Case-insensitive match for longer acronyms (3+ characters)
  if (clean.length >= 3) {
    const lowerMatch = ACRONYMS_LOWER_MAP.get(clean.toLowerCase());
    if (lowerMatch) return lowerMatch;
  }

  // 3. For 2-letter acronyms (like AI, ML, DL, UI, UX, IP, OS, JS, CU), match if all uppercase
  if (clean.length === 2 && clean === clean.toUpperCase()) {
    return ACRONYMS_LOWER_MAP.get(clean.toLowerCase());
  }

  return undefined;
}
