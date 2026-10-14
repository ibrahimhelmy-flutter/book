import { breadcrumbJsonLd, lessonJsonLd, pageMetadata, partTrail } from "../../src/lib/seo";
import { SITE_NAME, SITE_URL, absoluteUrl } from "../../src/lib/site";
import type { PartManifest } from "../../src/types/catalog";

function runSeoTests() {
  console.log("=================================================");
  console.log("🧪 RUNNING SEO METADATA & JSON-LD TESTS");
  console.log("=================================================");

  let passCount = 0;
  let failCount = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passCount++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failCount++;
    }
  }

  // 1. Site URL
  assert(!SITE_URL.endsWith("/"), "SITE_URL has no trailing slash");
  assert(absoluteUrl("/g/x/") === `${SITE_URL}/g/x/` && absoluteUrl("g/x/") === `${SITE_URL}/g/x/`, "absoluteUrl joins with exactly one slash");

  // 2. Page metadata repeats the shared Open Graph fields (Next replaces, not merges, the layout's)
  const meta = pageMetadata({ title: "درس", description: "وصف", path: "/g/a/b/c/", keywords: ["x", ""] });
  const og = meta.openGraph as Record<string, unknown>;
  assert((meta.alternates as { canonical: string }).canonical === "/g/a/b/c/", "Canonical is the route path");
  assert(og.siteName === SITE_NAME && og.url === "/g/a/b/c/" && og.title === "درس", "Open Graph carries site name, url and title");
  assert(Array.isArray(og.images) && (og.images as unknown[]).length === 1, "Open Graph has the share image");
  assert(JSON.stringify(meta.keywords) === JSON.stringify(["x"]), "Empty keywords are dropped");
  assert(!("title" in pageMetadata({ path: "/" })), "No title key when none is given (layout default applies)");

  // 3. Breadcrumbs
  const part = {
    key: "secondary-2/programming-ai/term-1",
    ref: { gradeId: "secondary-2", bookSlug: "programming-ai", partId: "term-1" },
    gradeTitle: "الصف الثاني الثانوي",
    bookTitle: "البرمجة والذكاء الاصطناعي",
    partShortTitle: "الترم الأول",
  } as PartManifest;
  const trail = partTrail(part);
  assert(trail.map((c) => c.path).join(" ") === "/ /g/secondary-2/ /g/secondary-2/programming-ai/ /g/secondary-2/programming-ai/term-1/", "Part trail walks catalog → grade → book → part");
  const crumbs = breadcrumbJsonLd(trail);
  assert(crumbs.itemListElement.every((item, i) => item.position === i + 1), "Breadcrumb positions start at 1");
  assert(crumbs.itemListElement.every((item) => item.item.startsWith(`${SITE_URL}/`)), "Breadcrumb items are absolute URLs");

  // 4. Lesson resource
  const lesson = lessonJsonLd({ part, path: "/g/x/", title: "درس", objectives: [], keywords: ["أ", "", "ب"] });
  assert(lesson["@type"] === "LearningResource" && lesson.url === `${SITE_URL}/g/x/`, "Lesson is a LearningResource with an absolute url");
  assert(!("teaches" in lesson) && lesson.keywords === "أ، ب", "Empty objectives omitted; keywords joined without blanks");

  console.log("\n=================================================");
  console.log(`🏁 SEO TESTS: ${passCount} PASSED, ${failCount} FAILED`);
  console.log("=================================================");

  if (failCount > 0) {
    process.exit(1);
  }
}

runSeoTests();
