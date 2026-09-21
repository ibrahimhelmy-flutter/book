import fs from 'fs';
import path from 'path';
import { fixExtractedArabicText } from '../scripts/arabic-cleaner.mjs';

const CANONICAL_DIR = path.resolve('book-sources/term-1/05-canonical-data/official/official-assessments');
const lessonFiles = fs.readdirSync(CANONICAL_DIR).filter(f => /^lesson-\d+-\d+\.json$/.test(f)).sort();

// Explicit manual overrides for all questions where automated heuristic could be ambiguous
const VERIFIED_MCQ_ANSWERS = {
  // Lesson 1-1
  'OFFICIAL-1-1-PERFORMANCE_TASK_1-MCQ-1': 1, // انتشار الحواسيب الشخصية (PCs)
  'OFFICIAL-1-1-PERFORMANCE_TASK_1-MCQ-2': 1, // قانون مور
  'OFFICIAL-1-1-HOMEWORK-MCQ-1': 2, // العمل عن بعد (Remote Work)
  'OFFICIAL-1-1-HOMEWORK-MCQ-2': 0, // منصات تتيح للمستخدمين التواصل ونشر المحتوى
  'OFFICIAL-1-1-PERFORMANCE_TASK_2-MCQ-1': 2, // الحوسبة الطرفية
  'OFFICIAL-1-1-PERFORMANCE_TASK_2-MCQ-2': 1, // تقنية تضيف عناصر أو معلومات رقمية إلى مشهد من العالم الحقيقي
  'OFFICIAL-1-1-HOMEWORK-MCQ-1_P2': 1, // يستخدم مبدأ التراكب الكمي
  'OFFICIAL-1-1-HOMEWORK-MCQ-2_P2': 1, // دفع قيمة السلع أو الخدمات بوسائل غير نقدية
  'OFFICIAL-1-1-WEEKLY_MODEL_A-MCQ-1': 1, // التسعينيات
  'OFFICIAL-1-1-WEEKLY_MODEL_A-MCQ-2': 1, // القيادة الذاتية
  'OFFICIAL-1-1-WEEKLY_MODEL_A-MCQ-3': 0, // الحوسبة السحابية
  'OFFICIAL-1-1-WEEKLY_MODEL_A-MCQ-4': 1, // تقنية تضع المستخدم داخل بيئة افتراضية مولدة حاسوبياً
  'OFFICIAL-1-1-WEEKLY_MODEL_B-MCQ-1': 1, // العقد الأول من الألفية
  'OFFICIAL-1-1-WEEKLY_MODEL_B-MCQ-2': 2, // الواقع المعزز (AR)
  'OFFICIAL-1-1-WEEKLY_MODEL_B-MCQ-3': 0, // تضاعف عدد الترانزستورات تقريبا كل عامين
  'OFFICIAL-1-1-WEEKLY_MODEL_B-MCQ-4': 2, // التعلم عبر الإنترنت
  'OFFICIAL-1-1-WEEKLY_MODEL_C-MCQ-1': 0, // الأربعينيات
  'OFFICIAL-1-1-WEEKLY_MODEL_C-MCQ-2': 1, // الحوسبة الكمومية
  'OFFICIAL-1-1-WEEKLY_MODEL_C-MCQ-3': 0, // شبكات التواصل الاجتماعي (SNS)
  'OFFICIAL-1-1-WEEKLY_MODEL_C-MCQ-4': 1, // العمل عن بعد

  // Lesson 1-2
  'OFFICIAL-1-2-PERFORMANCE_TASK_1-MCQ-1': 1, // الذكاء الاصطناعي
  'OFFICIAL-1-2-PERFORMANCE_TASK_1-MCQ-2': 0, // فرع من الذكاء الاصطناعي تتعلم فيه النماذج أنماطاً
  'OFFICIAL-1-2-HOMEWORK-MCQ-1': 2, // التعلم العميق
  'OFFICIAL-1-2-HOMEWORK-MCQ-2': 1, // إنشاء محتوى جديد مثل النصوص والصور
  'OFFICIAL-1-2-PERFORMANCE_TASK_2-MCQ-1': 1, // نماذج التعلم العميق والشبكات العصبية
  'OFFICIAL-1-2-PERFORMANCE_TASK_2-MCQ-2': 0, // إنتاج نص يبدو معقولاً ومنطقياً لكنه غير صحيح واقعياً
  'OFFICIAL-1-2-HOMEWORK-MCQ-1_P2': 2, // مرشح الرسائل المزعجة (Spam Filter) - لا يعد مثالاً
  'OFFICIAL-1-2-HOMEWORK-MCQ-2_P2': 0, // طبقات متصلة تضم وحدات عصبونية تتغير أوزانها
  'OFFICIAL-1-2-WEEKLY_MODEL_A-MCQ-1': 2, // التعلم الآلي
  'OFFICIAL-1-2-WEEKLY_MODEL_A-MCQ-2': 0, // التعلم العميق
  'OFFICIAL-1-2-WEEKLY_MODEL_A-MCQ-3': 1, // الشبكة العصبية الاصطناعية
  'OFFICIAL-1-2-WEEKLY_MODEL_A-MCQ-4': 0, // الهلوسة
  'OFFICIAL-1-2-WEEKLY_MODEL_B-MCQ-1': 0, // مرشحات الرسائل المزعجة وتوصيات المنتجات
  'OFFICIAL-1-2-WEEKLY_MODEL_B-MCQ-2': 1, // ذكاء اصطناعي يستخدم التعلم العميق لتوليد بيانات جديدة
  'OFFICIAL-1-2-WEEKLY_MODEL_B-MCQ-3': 0, // الطبقات المخفية
  'OFFICIAL-1-2-WEEKLY_MODEL_B-MCQ-4': 1, // التحقق من المخرجات ومصادرها ومقارنتها بالحقائق الموثوقة
  'OFFICIAL-1-2-WEEKLY_MODEL_C-MCQ-1': 0, // مهمة محددة أو مجموعة محدودة من المهام (ضيق النطاق)
  'OFFICIAL-1-2-WEEKLY_MODEL_C-MCQ-2': 0, // التعلم العميق المعتمد على شبكات عصبية متعددة الطبقات
  'OFFICIAL-1-2-WEEKLY_MODEL_C-MCQ-3': 0, // المساعدة في إنجاز المهام سريعاً مع ضرورة الانتباه لمخاطر عدم الصحة
  'OFFICIAL-1-2-WEEKLY_MODEL_C-MCQ-4': 0, // التحقق الدائم من صحة المعلومات ومراجعة المصادر الأصلية

  // Lesson 1-3
  'OFFICIAL-1-3-PERFORMANCE_TASK_1-MCQ-1': 0, // تحسين رعاية المرضى ودعم اتخاذ القرار الطبي
  'OFFICIAL-1-3-PERFORMANCE_TASK_1-MCQ-2': 1, // الزراعة الذكية
  'OFFICIAL-1-3-HOMEWORK-MCQ-1': 0, // الصيانة التنبؤية ومراقبة الجودة آلياً
  'OFFICIAL-1-3-HOMEWORK-MCQ-2': 1, // تحسين جودة المحاصيل وتقليل الهدر في الموارد
  'OFFICIAL-1-3-PERFORMANCE_TASK_2-MCQ-1': 0, // تحليل صور الأشعة السينية والرنين المغناطيسي لاكتشاف الأورام
  'OFFICIAL-1-3-PERFORMANCE_TASK_2-MCQ-2': 1, // اكتشاف المعاملات المالية المشبوهة والاحتيال في الوقت الفعلي
  'OFFICIAL-1-3-HOMEWORK-MCQ-1_P2': 0, // التنبؤ بالأعطال قبل وقوعها وجدولة الصيانة الوقائية
  'OFFICIAL-1-3-HOMEWORK-MCQ-2_P2': 1, // مراقبة صحة النباتات وتوزيع المياه والأسمدة بدقة
  'OFFICIAL-1-3-WEEKLY_MODEL_A-MCQ-1': 0, // التشخيص الطبي المبكر وتحليل الصور الإشعاعية
  'OFFICIAL-1-3-WEEKLY_MODEL_A-MCQ-2': 1, // كشف الاحتيال المالي وإدارة المخاطر
  'OFFICIAL-1-3-WEEKLY_MODEL_A-MCQ-3': 0, // تحسين خطوط الإنتاج وتقليل التوقف غير المخطط له
  'OFFICIAL-1-3-WEEKLY_MODEL_A-MCQ-4': 1, // أنظمة الري الذكي ومراقبة التربة بالمستشعرات
  'OFFICIAL-1-3-WEEKLY_MODEL_B-MCQ-1': 0, // المساعدات الطبية الذكية وتحليل البيانات السريرية
  'OFFICIAL-1-3-WEEKLY_MODEL_B-MCQ-2': 1, // التداول الآلي وتقييم الجدارة الائتمانية
  'OFFICIAL-1-3-WEEKLY_MODEL_B-MCQ-3': 0, // الصيانة التنبؤية (Predictive Maintenance)
  'OFFICIAL-1-3-WEEKLY_MODEL_B-MCQ-4': 1, // التنبؤ بإنتاجية المحاصيل ومكافحة الآفات
  'OFFICIAL-1-3-WEEKLY_MODEL_C-MCQ-1': 0, // المراقبة الصحية عن بعد والأجهزة القابلة للارتداء
  'OFFICIAL-1-3-WEEKLY_MODEL_C-MCQ-2': 1, // كشف التزوير وغسيل الأموال
  'OFFICIAL-1-3-WEEKLY_MODEL_C-MCQ-3': 0, // الروبوتات الصناعية ومراقبة الجودة بالرؤية الحاسوبية
  'OFFICIAL-1-3-WEEKLY_MODEL_C-MCQ-4': 1, // الزراعة الدقيقة والمستدامة

  // Lesson 1-4
  'OFFICIAL-1-4-PERFORMANCE_TASK_1-MCQ-1': 1, // التحيز الخوارزمي
  'OFFICIAL-1-4-PERFORMANCE_TASK_1-MCQ-2': 0, // نمط في مخرجات الذكاء الاصطناعي قد يؤدي إلى نتائج غير عادلة
  'OFFICIAL-1-4-HOMEWORK-MCQ-1': 0, // الأمثلة التي يتعلم منها نظام الذكاء الاصطناعي
  'OFFICIAL-1-4-HOMEWORK-MCQ-2': 2, // التعرف على الأفراد وتتبعهم من خلال تقنية التعرف على الوجه
  'OFFICIAL-1-4-PERFORMANCE_TASK_2-MCQ-1': 1, // الذكاء الاصطناعي القابل للتفسير (XAI)
  'OFFICIAL-1-4-PERFORMANCE_TASK_2-MCQ-2': 1, // المسؤولية تتعلق بتحديد أدوار وواجبات الأطراف بينما المساءلة محاسبتها
  'OFFICIAL-1-4-HOMEWORK-MCQ-1_P2': 2, // العدالة
  'OFFICIAL-1-4-HOMEWORK-MCQ-2_P2': 1, // الشفافية
  'OFFICIAL-1-4-WEEKLY_MODEL_A-MCQ-1': 1, // التحيز الخوارزمي
  'OFFICIAL-1-4-WEEKLY_MODEL_A-MCQ-2': 0, // الذكاء الاصطناعي القابل للتفسير (XAI)
  'OFFICIAL-1-4-WEEKLY_MODEL_A-MCQ-3': 2, // حماية الخصوصية
  'OFFICIAL-1-4-WEEKLY_MODEL_A-MCQ-4': 2, // المساءلة
  'OFFICIAL-1-4-WEEKLY_MODEL_B-MCQ-1': 0, // بيانات التدريب
  'OFFICIAL-1-4-WEEKLY_MODEL_B-MCQ-2': 1, // الشفافية
  'OFFICIAL-1-4-WEEKLY_MODEL_B-MCQ-3': 0, // العدالة
  'OFFICIAL-1-4-WEEKLY_MODEL_B-MCQ-4': 1, // الذكاء الاصطناعي القابل للتفسير (XAI)
  'OFFICIAL-1-4-WEEKLY_MODEL_C-MCQ-1': 0, // المسؤولية
  'OFFICIAL-1-4-WEEKLY_MODEL_C-MCQ-2': 1, // حماية الخصوصية
  'OFFICIAL-1-4-WEEKLY_MODEL_C-MCQ-3': 2, // تحديد الجهات المسؤولة عن النظام وقراراته وإمكان محاسبتها
  'OFFICIAL-1-4-WEEKLY_MODEL_C-MCQ-4': 0, // نظام توظيف يفضل فئة بصورة غير عادلة

  // Lesson 2-1
  'OFFICIAL-2-1-PERFORMANCE_TASK_1-MCQ-1': 0, // التشفير المتماثل
  'OFFICIAL-2-1-PERFORMANCE_TASK_1-MCQ-2': 0, // مصافحة TLS
  'OFFICIAL-2-1-HOMEWORK-MCQ-1': 0, // التشفير بالمفتاح المتماثل والمفتاح العام
  'OFFICIAL-2-1-HOMEWORK-MCQ-2': 1, // استخدام عاملين أو أكثر من فئات مختلفة مثل المعرفة والحيازة والسمات الحيوية
  'OFFICIAL-2-1-PERFORMANCE_TASK_2-MCQ-1': 1, // التشفير غير المتماثل (بالمفتاح العام)
  'OFFICIAL-2-1-PERFORMANCE_TASK_2-MCQ-2': 0, // التوقيع الرقمي
  'OFFICIAL-2-1-HOMEWORK-MCQ-1_P2': 0, // مصافحة TLS
  'OFFICIAL-2-1-HOMEWORK-MCQ-2_P2': 1, // كلمة مرور ورسالة SMS قصيرة
  'OFFICIAL-2-1-WEEKLY_MODEL_A-MCQ-1': 0, // بروتوكول HTTPS
  'OFFICIAL-2-1-WEEKLY_MODEL_A-MCQ-2': 1, // المصادقة الثنائية (2FA)
  'OFFICIAL-2-1-WEEKLY_MODEL_A-MCQ-3': 0, // التشفير غير المتماثل
  'OFFICIAL-2-1-WEEKLY_MODEL_A-MCQ-4': 0, // المعرفة والحيازة والسمات الحيوية
  'OFFICIAL-2-1-WEEKLY_MODEL_B-MCQ-1': 0, // التشفير المتماثل يستخدم مفتاحاً واحداً والتشفير غير المتماثل يستخدم زوجاً من المفاتيح
  'OFFICIAL-2-1-WEEKLY_MODEL_B-MCQ-2': 1, // المصادقة الثنائية (2FA)
  'OFFICIAL-2-1-WEEKLY_MODEL_B-MCQ-3': 0, // إثبات صحة ومصدر البيانات وعدم إنكارها
  'OFFICIAL-2-1-WEEKLY_MODEL_B-MCQ-4': 1, // بصمة الإصبع أو الوجه
  'OFFICIAL-2-1-WEEKLY_MODEL_C-MCQ-1': 0, // المفتاح العام لتشفير البيانات والمفتاح الخاص لفك تشفيرها
  'OFFICIAL-2-1-WEEKLY_MODEL_C-MCQ-2': 0, // المصادقة متعددة العوامل (MFA)
  'OFFICIAL-2-1-WEEKLY_MODEL_C-MCQ-3': 0, // التوقيع الرقمي
  'OFFICIAL-2-1-WEEKLY_MODEL_C-MCQ-4': 0, // تشفير الاتصال والتحقق من هوية الخادم

  // Lesson 2-2
  'OFFICIAL-2-2-PERFORMANCE_TASK_1-MCQ-1': 1, // الشبكة الافتراضية الخاصة (VPN)
  'OFFICIAL-2-2-PERFORMANCE_TASK_1-MCQ-2': 1, // المنطقة المعزولة (DMZ)
  'OFFICIAL-2-2-HOMEWORK-MCQ-1': 1, // جدار الحماية (Firewall)
  'OFFICIAL-2-2-HOMEWORK-MCQ-2': 1, // نهج انعدام الثقة (Zero Trust)
  'OFFICIAL-2-2-PERFORMANCE_TASK_2-MCQ-1': 0, // تشفير حركة المرور وإنشاء نفق آمن عبر الإنترنت
  'OFFICIAL-2-2-PERFORMANCE_TASK_2-MCQ-2': 1, // وضع خوادم الويب العامة في شبكة منفصلة لحماية الشبكة الداخلية
  'OFFICIAL-2-2-HOMEWORK-MCQ-1_P2': 0, // تصفية حزم البيانات ومنع الاتصالات غير المصرح بها
  'OFFICIAL-2-2-HOMEWORK-MCQ-2_P2': 1, // التحقق المستمر والصارم من كل مستخدم وجهاز بغض النظر عن موقعه
  'OFFICIAL-2-2-WEEKLY_MODEL_A-MCQ-1': 0, // جدار الحماية (Firewall)
  'OFFICIAL-2-2-WEEKLY_MODEL_A-MCQ-2': 1, // المنطقة المعزولة (DMZ)
  'OFFICIAL-2-2-WEEKLY_MODEL_A-MCQ-3': 1, // نهج انعدام الثقة (Zero Trust)
  'OFFICIAL-2-2-WEEKLY_MODEL_A-MCQ-4': 0, // الشبكة الافتراضية الخاصة (VPN)
  'OFFICIAL-2-2-WEEKLY_MODEL_B-MCQ-1': 1, // الشبكة الافتراضية الخاصة (VPN)
  'OFFICIAL-2-2-WEEKLY_MODEL_B-MCQ-2': 3, // الأجهزة الطرفية
  'OFFICIAL-2-2-WEEKLY_MODEL_B-MCQ-3': 0, // المحيط الأمني
  'OFFICIAL-2-2-WEEKLY_MODEL_B-MCQ-4': 0, // جدار الحماية (Firewall)
  'OFFICIAL-2-2-WEEKLY_MODEL_C-MCQ-1': 1, // المنطقة المعزولة (DMZ)
  'OFFICIAL-2-2-WEEKLY_MODEL_C-MCQ-2': 1, // نهج انعدام الثقة (Zero Trust)
  'OFFICIAL-2-2-WEEKLY_MODEL_C-MCQ-3': 1, // منع الاتصال غير المصرح به باستخدام جدار الحماية
  'OFFICIAL-2-2-WEEKLY_MODEL_C-MCQ-4': 0, // الشبكة الافتراضية الخاصة (VPN)

  // Lesson 2-3
  'OFFICIAL-2-3-PERFORMANCE_TASK_1-MCQ-1': 2, // انقطاع الخدمة بسبب هجمات على الخادم
  'OFFICIAL-2-3-PERFORMANCE_TASK_1-MCQ-2': 1, // التحضير
  'OFFICIAL-2-3-HOMEWORK-MCQ-1': 2, // الاحتواء
  'OFFICIAL-2-3-HOMEWORK-MCQ-2': 1, // التأثير × الاحتمالية
  'OFFICIAL-2-3-PERFORMANCE_TASK_2-MCQ-1': 2, // الاستعادة
  'OFFICIAL-2-3-PERFORMANCE_TASK_2-MCQ-2': 3, // الدروس المستفادة والتحسين
  'OFFICIAL-2-3-HOMEWORK-MCQ-1_P2': 2, // التأثير المرتفع والاحتمالية المرتفعة
  'OFFICIAL-2-3-HOMEWORK-MCQ-2_P2': 1, // مقدار الضرر إذا وقعت المخاطرة
  'OFFICIAL-2-3-WEEKLY_MODEL_A-MCQ-1': 0, // حادثاً أمنياً
  'OFFICIAL-2-3-WEEKLY_MODEL_A-MCQ-2': 1, // الاحتواء
  'OFFICIAL-2-3-WEEKLY_MODEL_A-MCQ-3': 1, // التأثير المرتفع والاحتمالية المرتفعة
  'OFFICIAL-2-3-WEEKLY_MODEL_A-MCQ-4': 1, // إزالة التهديد ومسبباته مثل حذف البرمجيات الخبيثة
  'OFFICIAL-2-3-WEEKLY_MODEL_B-MCQ-1': 2, // التلاعب بالبيانات
  'OFFICIAL-2-3-WEEKLY_MODEL_B-MCQ-2': 0, // الاستعادة
  'OFFICIAL-2-3-WEEKLY_MODEL_B-MCQ-3': 2, // التأثير × الاحتمالية
  'OFFICIAL-2-3-WEEKLY_MODEL_B-MCQ-4': 1, // مدى احتمال وقوع الحدث أو المخاطرة
  'OFFICIAL-2-3-WEEKLY_MODEL_C-MCQ-1': 0, // تسرب المعلومات
  'OFFICIAL-2-3-WEEKLY_MODEL_C-MCQ-2': 3, // الدروس المستفادة والتحسين
  'OFFICIAL-2-3-WEEKLY_MODEL_C-MCQ-3': 1, // متوسطة
  'OFFICIAL-2-3-WEEKLY_MODEL_C-MCQ-4': 1, // الاكتشاف

  // Lesson 3-1
  'OFFICIAL-3-1-PERFORMANCE_TASK_1-MCQ-1': 0, // الواجهة الأمامية
  'OFFICIAL-3-1-PERFORMANCE_TASK_1-MCQ-2': 1, // الواجهة الخلفية
  'OFFICIAL-3-1-HOMEWORK-MCQ-1': 1, // الواجهة الخلفية
  'OFFICIAL-3-1-HOMEWORK-MCQ-2': 1, // قاعدة البيانات
  'OFFICIAL-3-1-PERFORMANCE_TASK_2-MCQ-1': 2, // الواجهة الخلفية
  'OFFICIAL-3-1-PERFORMANCE_TASK_2-MCQ-2': 1, // تخزين البيانات واسترجاعها
  'OFFICIAL-3-1-HOMEWORK-MCQ-1_P2': 3, // طبقة قاعدة البيانات
  'OFFICIAL-3-1-HOMEWORK-MCQ-2_P2': 0, // الواجهة الخلفية
  'OFFICIAL-3-1-WEEKLY_MODEL_A-MCQ-1': 1, // عرض المحتوى واستقبال إدخال المستخدم
  'OFFICIAL-3-1-WEEKLY_MODEL_A-MCQ-2': 1, // الواجهة الخلفية
  'OFFICIAL-3-1-WEEKLY_MODEL_A-MCQ-3': 1, // سجل الطلبات
  'OFFICIAL-3-1-WEEKLY_MODEL_A-MCQ-4': 1, // تعاون ثلاث طبقات: واجهة أمامية، واجهة خلفية، قاعدة بيانات
  'OFFICIAL-3-1-WEEKLY_MODEL_B-MCQ-1': 1, // موقع خرائط على الإنترنت
  'OFFICIAL-3-1-WEEKLY_MODEL_B-MCQ-2': 2, // قاعدة البيانات
  'OFFICIAL-3-1-WEEKLY_MODEL_B-MCQ-3': 2, // التحقق من تسجيل الدخول
  'OFFICIAL-3-1-WEEKLY_MODEL_B-MCQ-4': 0, // أن التطبيق يُبنى من ثلاث طبقات تتعاون معاً
  'OFFICIAL-3-1-WEEKLY_MODEL_C-MCQ-1': 3, // أن التطبيق يُبنى من ثلاث طبقات تتعاون معاً
  'OFFICIAL-3-1-WEEKLY_MODEL_C-MCQ-2': 2, // قاعدة البيانات
  'OFFICIAL-3-1-WEEKLY_MODEL_C-MCQ-3': 1, // موقع خرائط على الإنترنت
  'OFFICIAL-3-1-WEEKLY_MODEL_C-MCQ-4': 3, // التحقق من تسجيل الدخول

  // Lesson 3-2
  'OFFICIAL-3-2-PERFORMANCE_TASK_1-MCQ-1': 1, // البرنامج أو الجهاز الذى يرسل الطلبات
  'OFFICIAL-3-2-PERFORMANCE_TASK_1-MCQ-2': 1, // POST
  'OFFICIAL-3-2-HOMEWORK-MCQ-1': 1, // نجاح الطلب
  'OFFICIAL-3-2-HOMEWORK-MCQ-2': 2, // المورد غير موجود
  'OFFICIAL-3-2-PERFORMANCE_TASK_2-MCQ-1': 0, // HTTPS يستخدم تشفير TLS
  'OFFICIAL-3-2-PERFORMANCE_TASK_2-MCQ-2': 1, // تبادل البيانات المهيكلة
  'OFFICIAL-3-2-HOMEWORK-MCQ-1_P2': 1, // مجموعة قواعد للتواصل بين البرامج
  'OFFICIAL-3-2-HOMEWORK-MCQ-2_P2': 1, // GET
  'OFFICIAL-3-2-WEEKLY_MODEL_A-MCQ-1': 1, // إرسال الطلبات للحصول على البيانات
  'OFFICIAL-3-2-WEEKLY_MODEL_A-MCQ-2': 1, // GET
  'OFFICIAL-3-2-WEEKLY_MODEL_A-MCQ-3': 1, // JSON
  'OFFICIAL-3-2-WEEKLY_MODEL_A-MCQ-4': 2, // المورد المطلوب غير موجود
  'OFFICIAL-3-2-WEEKLY_MODEL_B-MCQ-1': 0, // 200
  'OFFICIAL-3-2-WEEKLY_MODEL_B-MCQ-2': 1, // POST
  'OFFICIAL-3-2-WEEKLY_MODEL_B-MCQ-3': 1, // API
  'OFFICIAL-3-2-WEEKLY_MODEL_B-MCQ-4': 1, // JSON
  'OFFICIAL-3-2-WEEKLY_MODEL_C-MCQ-1': 2, // 500
  'OFFICIAL-3-2-WEEKLY_MODEL_C-MCQ-2': 1, // GET
  'OFFICIAL-3-2-WEEKLY_MODEL_C-MCQ-3': 1, // JSON
  'OFFICIAL-3-2-WEEKLY_MODEL_C-MCQ-4': 1, // HTTPS

  // Lesson 3-3
  'OFFICIAL-3-3-PERFORMANCE_TASK_1-MCQ-1': 0, // HTML
  'OFFICIAL-3-3-PERFORMANCE_TASK_1-MCQ-2': 1, // mail (not semantic HTML)
  'OFFICIAL-3-3-HOMEWORK-MCQ-1': 1, // CSS
  'OFFICIAL-3-3-HOMEWORK-MCQ-2': 2, // السلوك التفاعلي
  'OFFICIAL-3-3-PERFORMANCE_TASK_2-MCQ-1': 0, // React
  'OFFICIAL-3-3-PERFORMANCE_TASK_2-MCQ-2': 0, // Next.js
  'OFFICIAL-3-3-HOMEWORK-MCQ-1_P2': 1, // CSS
  'OFFICIAL-3-3-HOMEWORK-MCQ-2_P2': 2, // السلوك التفاعلي
  'OFFICIAL-3-3-WEEKLY_MODEL_A-MCQ-1': 0, // HTML
  'OFFICIAL-3-3-WEEKLY_MODEL_A-MCQ-2': 2, // main
  'OFFICIAL-3-3-WEEKLY_MODEL_A-MCQ-3': 1, // CSS
  'OFFICIAL-3-3-WEEKLY_MODEL_A-MCQ-4': 2, // JavaScript
  'OFFICIAL-3-3-WEEKLY_MODEL_B-MCQ-1': 0, // HTML
  'OFFICIAL-3-3-WEEKLY_MODEL_B-MCQ-2': 1, // CSS
  'OFFICIAL-3-3-WEEKLY_MODEL_B-MCQ-3': 2, // JavaScript
  'OFFICIAL-3-3-WEEKLY_MODEL_B-MCQ-4': 2, // Next.js
  'OFFICIAL-3-3-WEEKLY_MODEL_C-MCQ-1': 0, // HTML
  'OFFICIAL-3-3-WEEKLY_MODEL_C-MCQ-2': 1, // CSS
  'OFFICIAL-3-3-WEEKLY_MODEL_C-MCQ-3': 2, // JavaScript
  'OFFICIAL-3-3-WEEKLY_MODEL_C-MCQ-4': 1, // Vue

  // Lesson 4-1
  'OFFICIAL-4-1-PERFORMANCE_TASK_1-MCQ-1': 0, // الصور النقطية (Raster) والصور المتجهة (Vector)
  'OFFICIAL-4-1-PERFORMANCE_TASK_1-MCQ-2': 1, // SVG
  'OFFICIAL-4-1-HOMEWORK-MCQ-1': 0, // الصور المتجهة (Vector) تحافظ على دقتها عند التكبير
  'OFFICIAL-4-1-HOMEWORK-MCQ-2': 1, // MP4
  'OFFICIAL-4-1-PERFORMANCE_TASK_2-MCQ-1': 1, // الصور النقطية تتكون من بكسلات وتفقد جودتها عند التكبير
  'OFFICIAL-4-1-PERFORMANCE_TASK_2-MCQ-2': 0, // MP3
  'OFFICIAL-4-1-HOMEWORK-MCQ-1_P2': 0, // الرسوم المتحركة
  'OFFICIAL-4-1-HOMEWORK-MCQ-2_P2': 1, // PNG
  'OFFICIAL-4-1-WEEKLY_MODEL_A-MCQ-1': 1, // الرسوم المتجهة (SVG)
  'OFFICIAL-4-1-WEEKLY_MODEL_A-MCQ-2': 0, // JPEG
  'OFFICIAL-4-1-WEEKLY_MODEL_A-MCQ-3': 1, // MP4
  'OFFICIAL-4-1-WEEKLY_MODEL_A-MCQ-4': 0, // النص والوسائط المتعددة
  'OFFICIAL-4-1-WEEKLY_MODEL_B-MCQ-1': 1, // SVG
  'OFFICIAL-4-1-WEEKLY_MODEL_B-MCQ-2': 0, // الصور النقطية
  'OFFICIAL-4-1-WEEKLY_MODEL_B-MCQ-3': 1, // MP3
  'OFFICIAL-4-1-WEEKLY_MODEL_B-MCQ-4': 0, // نقل المعنى والتفاعل بفاعلية
  'OFFICIAL-4-1-WEEKLY_MODEL_C-MCQ-1': 1, // الصور المتجهة
  'OFFICIAL-4-1-WEEKLY_MODEL_C-MCQ-2': 1, // الفيديو
  'OFFICIAL-4-1-WEEKLY_MODEL_C-MCQ-3': 0, // الرسوم المتحركة
  'OFFICIAL-4-1-WEEKLY_MODEL_C-MCQ-4': 1, // الرسوم المتجهة (SVG)

  // Lesson 4-2
  'OFFICIAL-4-2-PERFORMANCE_TASK_1-MCQ-1': 0, // هيكل الصفحة والتخطيط الهيكلي (Wireframe)
  'OFFICIAL-4-2-PERFORMANCE_TASK_1-MCQ-2': 0, // تجربة المستخدم (UX)
  'OFFICIAL-4-2-HOMEWORK-MCQ-1': 0, // التباين البصري والوضوح
  'OFFICIAL-4-2-HOMEWORK-MCQ-2': 0, // إمكانية الوصول وسهولة الاستخدام لجميع الفئات
  'OFFICIAL-4-2-PERFORMANCE_TASK_2-MCQ-1': 0, // التسلسل الهرمي البصري
  'OFFICIAL-4-2-PERFORMANCE_TASK_2-MCQ-2': 2, // محاذاة العناصر حسب اتجاه اللغة وشبكة التصميم بحيث يكون اتجاه النص الأساسي من اليمين إلى اليسار
  'OFFICIAL-4-2-HOMEWORK-MCQ-1_P2': 0, // التخطيط الشبكي والتجاوب
  'OFFICIAL-4-2-HOMEWORK-MCQ-2_P2': 0, // سهولة القراءة وتناسق الخطوط
  'OFFICIAL-4-2-WEEKLY_MODEL_A-MCQ-1': 0, // التخطيط الهيكلي (Wireframe)
  'OFFICIAL-4-2-WEEKLY_MODEL_A-MCQ-2': 0, // التسلسل الهرمي البصري
  'OFFICIAL-4-2-WEEKLY_MODEL_A-MCQ-3': 0, // التباين الكافي بين لون النص ولون الخلفية
  'OFFICIAL-4-2-WEEKLY_MODEL_A-MCQ-4': 0, // التصميم المتجاوب مع أحجام الشاشات المختلفة
  'OFFICIAL-4-2-WEEKLY_MODEL_B-MCQ-1': 0, // إمكانية الوصول (Accessibility)
  'OFFICIAL-4-2-WEEKLY_MODEL_B-MCQ-2': 0, // التخطيط الهيكلي (Wireframe)
  'OFFICIAL-4-2-WEEKLY_MODEL_B-MCQ-3': 0, // التباين البصري الواضح
  'OFFICIAL-4-2-WEEKLY_MODEL_B-MCQ-4': 0, // اتساق الخطوط والمسافات
  'OFFICIAL-4-2-WEEKLY_MODEL_C-MCQ-1': 0, // هيكلية المعلومات وتجربة المستخدم
  'OFFICIAL-4-2-WEEKLY_MODEL_C-MCQ-2': 0, // التخطيط الهيكلي
  'OFFICIAL-4-2-WEEKLY_MODEL_C-MCQ-3': 0, // إمكانية الوصول وتوفير نصوص بديلة للصور
  'OFFICIAL-4-2-WEEKLY_MODEL_C-MCQ-4': 0, // جعل اتجاه النص الأساسي من اليمين إلى اليسار وفق قواعد متسقة

  // Lesson 4-3
  'OFFICIAL-4-3-PERFORMANCE_TASK_1-MCQ-1': 0, // التقييم الإرشادي (Heuristic Evaluation)
  'OFFICIAL-4-3-PERFORMANCE_TASK_1-MCQ-2': 1, // اختبار قابلية الاستخدام (Usability Testing)
  'OFFICIAL-4-3-HOMEWORK-MCQ-1': 0, // معدل الارتداد (Bounce Rate)
  'OFFICIAL-4-3-HOMEWORK-MCQ-2': 1, // تقييم الخبراء للواجهة بناءً على مبادئ إرشادية محددة
  'OFFICIAL-4-3-PERFORMANCE_TASK_2-MCQ-1': 0, // قياس أداء المستخدمين الفعليين أثناء أداء مهام محددة
  'OFFICIAL-4-3-PERFORMANCE_TASK_2-MCQ-2': 0, // معدل التحويل ومتوسط وقت الجلسة
  'OFFICIAL-4-3-HOMEWORK-MCQ-1_P2': 0, // التقييم الإرشادي
  'OFFICIAL-4-3-HOMEWORK-MCQ-2_P2': 1, // اختبار قابلية الاستخدام
  'OFFICIAL-4-3-WEEKLY_MODEL_A-MCQ-1': 0, // التقييم الإرشادي (Heuristic Evaluation)
  'OFFICIAL-4-3-WEEKLY_MODEL_A-MCQ-2': 1, // اختبار قابلية الاستخدام (Usability Testing)
  'OFFICIAL-4-3-WEEKLY_MODEL_A-MCQ-3': 0, // معدل الارتداد (Bounce Rate)
  'OFFICIAL-4-3-WEEKLY_MODEL_A-MCQ-4': 0, // وضوح الرؤية ومطابقة النظام للعالم الحقيقي
  'OFFICIAL-4-3-WEEKLY_MODEL_B-MCQ-1': 1, // اختبار قابلية الاستخدام
  'OFFICIAL-4-3-WEEKLY_MODEL_B-MCQ-2': 0, // التقييم الإرشادي
  'OFFICIAL-4-3-WEEKLY_MODEL_B-MCQ-3': 0, // تحليلات الويب وسجلات الزوار
  'OFFICIAL-4-3-WEEKLY_MODEL_B-MCQ-4': 0, // معدل الارتداد
  'OFFICIAL-4-3-WEEKLY_MODEL_C-MCQ-1': 0, // التقييم الإرشادي بواسطة الخبراء
  'OFFICIAL-4-3-WEEKLY_MODEL_C-MCQ-2': 1, // اختبار قابلية الاستخدام مع مستخدمين حقيقيين
  'OFFICIAL-4-3-WEEKLY_MODEL_C-MCQ-3': 0, // تحليلات الويب ومؤشرات التفاعل
  'OFFICIAL-4-3-WEEKLY_MODEL_C-MCQ-4': 0, // منع الأخطاء ومساعدة المستخدمين على التعافي منها

  // Lesson 4-4
  'OFFICIAL-4-4-PERFORMANCE_TASK_1-MCQ-1': 0, // دورة PDCA (خطط - نفذ - تحقق - تصرف)
  'OFFICIAL-4-4-PERFORMANCE_TASK_1-MCQ-2': 1, // اختبار أ/ب (A/B Testing)
  'OFFICIAL-4-4-HOMEWORK-MCQ-1': 0, // مرحلة التخطيط (Plan)
  'OFFICIAL-4-4-HOMEWORK-MCQ-2': 0, // التحسين التكراري المستمر في دورات صغيرة
  'OFFICIAL-4-4-PERFORMANCE_TASK_2-MCQ-1': 0, // مرحلة التحقق (Check)
  'OFFICIAL-4-4-PERFORMANCE_TASK_2-MCQ-2': 1, // مقارنة نسختين لتحديد أيهما أفضل أداءً
  'OFFICIAL-4-4-HOMEWORK-MCQ-1_P2': 0, // مرحلة التصرف (Act)
  'OFFICIAL-4-4-HOMEWORK-MCQ-2_P2': 0, // جمع التغذية الراجعة وتحليل النتائج
  'OFFICIAL-4-4-WEEKLY_MODEL_A-MCQ-1': 0, // دورة PDCA
  'OFFICIAL-4-4-WEEKLY_MODEL_A-MCQ-2': 1, // اختبار A/B
  'OFFICIAL-4-4-WEEKLY_MODEL_A-MCQ-3': 0, // التحسين التكراري المستمر
  'OFFICIAL-4-4-WEEKLY_MODEL_A-MCQ-4': 0, // مرحلة التحقق (Check)
  'OFFICIAL-4-4-WEEKLY_MODEL_B-MCQ-1': 0, // دورة PDCA
  'OFFICIAL-4-4-WEEKLY_MODEL_B-MCQ-2': 1, // اختبار A/B المقارن
  'OFFICIAL-4-4-WEEKLY_MODEL_B-MCQ-3': 0, // التحسين التكراري
  'OFFICIAL-4-4-WEEKLY_MODEL_B-MCQ-4': 0, // مرحلة التصرف وتثبيت التحسينات الناجحة
  'OFFICIAL-4-4-WEEKLY_MODEL_C-MCQ-1': 0, // دورة PDCA
  'OFFICIAL-4-4-WEEKLY_MODEL_C-MCQ-2': 1, // اختبار A/B
  'OFFICIAL-4-4-WEEKLY_MODEL_C-MCQ-3': 0, // جمع ملاحظات المستخدمين وتحليل بيانات التفاعل
  'OFFICIAL-4-4-WEEKLY_MODEL_C-MCQ-4': 0  // التحسين التكراري المستمر لضمان تطور الموقع وتلبية احتياجات المستخدمين
};

console.log(`Explicit verified answers compiled for ${Object.keys(VERIFIED_MCQ_ANSWERS).length} questions.`);
