import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const pagesDir = path.resolve('public', 'images', 'pages');
const extractedDir = path.resolve('public', 'images', 'extracted');

if (!fs.existsSync(extractedDir)) {
  fs.mkdirSync(extractedDir, { recursive: true });
}

// Map the exact diagrams to crop from rendered pages
// Each rendered page is roughly ~890 x 1260 at scale 1.5
async function cropDiagrams() {
  console.log('Cropping and optimizing educational diagrams...');

  const crops = [
    {
      page: 'page_07.png',
      output: 'moores-law-curve.png',
      // Moore's law chart in the middle of page 7
      extract: { left: 80, top: 440, width: 730, height: 350 },
      caption: 'الشكل 1.1.1 — منحنى قانون مور: عدد الترانزستورات عبر الزمن'
    },
    {
      page: 'page_08.png',
      output: 'edge-computing-car.png',
      // Edge computing self driving car on page 8
      extract: { left: 80, top: 250, width: 730, height: 260 },
      caption: 'الحوسبة الطرفية في القيادة الذاتية لاتخاذ القرارات اللحظية دون انتظار السحابة'
    },
    {
      page: 'page_15.png',
      output: 'ai-hierarchy.png',
      // AI hierarchy nested boxes on page 15
      extract: { left: 80, top: 120, width: 730, height: 280 },
      caption: 'الشكل 1.2.1 — علاقة مبسطة بين الذكاء الاصطناعي والتعلم الآلي والتعلم العميق والذكاء التوليدي'
    },
    {
      page: 'page_15.png',
      output: 'neural-network-layers.png',
      // Artificial Neural network layers on page 15
      extract: { left: 80, top: 540, width: 730, height: 200 },
      caption: 'بنية الشبكة العصبية الاصطناعية (ANN): طبقة المدخلات، الطبقات الخفية، وطبقة المخرجات'
    },
    {
      page: 'page_21.png',
      output: 'ai-daily-services.png',
      // 4 services icons on page 21
      extract: { left: 80, top: 200, width: 730, height: 220 },
      caption: 'أربع خدمات رئيسية للذكاء الاصطناعي في الحياة اليومية'
    },
    {
      page: 'page_28.png',
      output: 'ai-ethics-principles.png',
      // 4 ethics icons on page 28
      extract: { left: 80, top: 320, width: 730, height: 240 },
      caption: 'المبادئ الأربعة الأساسية لأخلاقيات الذكاء الاصطناعي (العدالة، الشفافية، حماية الخصوصية، المساءلة)'
    },
    {
      page: 'page_34.png',
      output: 'tls-handshake-flow.png',
      // HTTPS TLS handshake flow diagram on page 34
      extract: { left: 80, top: 60, width: 730, height: 350 },
      caption: 'الشكل 2.1.1 — تدفق اتصال HTTPS ومراحل مصافحة TLS والشهادات الرقمية'
    },
    {
      page: 'page_41.png',
      output: 'dmz-network-topology.png',
      // DMZ network diagram on page 41
      extract: { left: 80, top: 60, width: 730, height: 350 },
      caption: 'الشكل 2.2.1 — تكوين شبكة المنطقة المعزولة (DMZ) وعزل الخوادم العامة عن الشبكة الداخلية'
    },
    {
      page: 'page_42.png',
      output: 'zero-trust-comparison.png',
      // Zero trust vs Perimeter security on page 42
      extract: { left: 80, top: 120, width: 730, height: 300 },
      caption: 'الشكل 2.2.2 — الأمان المحيطي التقليدي مقابل نهج انعدام الثقة (Zero Trust)'
    },
    {
      page: 'page_47.png',
      output: 'incident-response-6-steps.png',
      // 6 stages on page 47
      extract: { left: 80, top: 240, width: 730, height: 180 },
      caption: 'الشكل 2.3.1 — نموذج تعليمي مبسط للاستجابة للحوادث الأمنية من ست مراحل'
    },
    {
      page: 'page_48.png',
      output: 'risk-matrix.png',
      // Risk matrix table on page 48
      extract: { left: 80, top: 60, width: 730, height: 280 },
      caption: 'الشكل 2.3.2 — مصفوفة تقييم وتحديد أولويات المخاطر (درجة الخطر = التأثير × الاحتمالية)'
    },
    {
      page: 'page_53.png',
      output: 'three-tier-architecture.png',
      // 3-tier diagram on page 53
      extract: { left: 80, top: 60, width: 730, height: 280 },
      caption: 'الشكل 3.1.1 — نموذج تعليمي مبسط لطبقات تطبيق الويب الثلاث (الواجهة الأمامية، الخلفية، قاعدة البيانات)'
    },
    {
      page: 'page_58.png',
      output: 'client-server-flow.png',
      // Client-Server flow on page 58
      extract: { left: 80, top: 670, width: 730, height: 200 },
      caption: 'الشكل 3.2.1 — اتصال العميل بالخادم وتبادل الطلب والاستجابة'
    },
    {
      page: 'page_65.png',
      output: 'html-css-js-layers.png',
      // HTML, CSS, JS comparison on page 65
      extract: { left: 80, top: 60, width: 730, height: 270 },
      caption: 'الشكل 3.3.1 — أدوار HTML (الهيكل) و CSS (التنسيق) و JavaScript (السلوك)'
    },
    {
      page: 'page_77.png',
      output: 'wireframe-example.png',
      // Wireframe layout on page 77
      extract: { left: 80, top: 60, width: 730, height: 270 },
      caption: 'الشكل 4.2.1 — مثال على مخطط هيكلي سلكي (Wireframe) لتنظيم بنية الصفحة'
    },
    {
      page: 'page_77.png',
      output: 'crap-principles-comparison.png',
      // CRAP table comparison on page 77
      extract: { left: 80, top: 600, width: 730, height: 320 },
      caption: 'الشكل 4.2.2 — مبادئ التصميم البصري الأربعة (CRAP: التباين، التكرار، المحاذاة، التقارب)'
    },
    {
      page: 'page_90.png',
      output: 'pdca-cycle-loop.png',
      // PDCA cycle diagram on page 90
      extract: { left: 80, top: 60, width: 730, height: 280 },
      caption: 'الشكل 4.4.1 — دورة PDCA كحلقة تحسين مستمر (خطط ← نفذ ← تحقق ← تصرف)'
    }
  ];

  for (const item of crops) {
    const pagePath = path.join(pagesDir, item.page);
    if (!fs.existsSync(pagePath)) {
      console.warn(`Page not found: ${item.page}`);
      continue;
    }

    const meta = await sharp(pagePath).metadata();
    // compute clamped box
    const left = Math.min(item.extract.left, meta.width - 50);
    const top = Math.min(item.extract.top, meta.height - 50);
    const width = Math.min(item.extract.width, meta.width - left);
    const height = Math.min(item.extract.height, meta.height - top);

    const outPath = path.join(extractedDir, item.output);
    await sharp(pagePath)
      .extract({ left, top, width, height })
      .png({ quality: 95 })
      .toFile(outPath);

    console.log(`✓ Cropped: ${item.output} (${width}x${height} px)`);
  }

  console.log('All educational diagrams cropped and mapped successfully!');
}

cropDiagrams().catch(console.error);
