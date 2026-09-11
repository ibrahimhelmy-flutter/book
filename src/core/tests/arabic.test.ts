import { normalizeArabicText, matchesSearch } from "../../lib/arabic";

function runArabicTests() {
  console.log("=================================================");
  console.log("🧪 RUNNING ARABIC NORMALIZATION & SEARCH TESTS");
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

  // 1. Tashkeel stripping
  const withTashkeel = "الذَّكَاءُ الاِصْطِنَاعِيُّ";
  assert(normalizeArabicText(withTashkeel) === "الذكاء الاصطناعي", "Strips complex Tashkeel (harakat & shadda)");

  // 2. Alif normalization
  const alifs = "إنسان أمن آلة استشعار";
  assert(normalizeArabicText(alifs) === "انسان امن اله استشعار", "Normalizes all Alif forms (إ, أ, آ) to ا and ة to ه");

  // 3. Taa Marbuta normalization
  const taaMarbuta = "شبكة برمجة أتمتة";
  assert(normalizeArabicText(taaMarbuta) === "شبكه برمجه اتمته", "Normalizes Taa Marbuta (ة) to Haa (ه)");

  // 4. Alif Maqsura normalization
  const alifMaqsura = "مستودع البيانات على مستوى";
  assert(normalizeArabicText(alifMaqsura) === "مستودع البيانات علي مستوي", "Normalizes Alif Maqsura (ى) to Yaa (ي)");

  // 5. Tatweel / Kashida removal
  const tatweel = "خـــــوارزمـــــيـة";
  assert(normalizeArabicText(tatweel) === "خوارزميه", "Removes Tatweel / Kashida characters");

  // 6. Search matching: variations
  assert(matchesSearch("الذكاء الاصطناعي", "ذكاء"), "Matches substring without definitive article issue");
  assert(matchesSearch("خوارزميات التعلم العميق", "التعلم"), "Matches normalized query in text");
  assert(matchesSearch("الأمن السيبراني", "الامن"), "Matches Alif variations (الأمن vs الامن)");
  assert(matchesSearch("أتمتة العمليات", "اتمته"), "Matches Taa Marbuta vs Haa (أتمتة vs اتمته)");
  assert(matchesSearch("Artificial Intelligence (AI)", "ai"), "Matches case-insensitive English terms");
  assert(matchesSearch("الذكاء الاصطناعي", ""), "Empty query matches everything safely");
  assert(!matchesSearch("", "ذكاء"), "Empty target returns false safely");

  console.log("\n=================================================");
  console.log(`🏁 ARABIC TESTS: ${passCount} PASSED, ${failCount} FAILED`);
  console.log("=================================================");

  if (failCount > 0) {
    process.exit(1);
  }
}

runArabicTests();
