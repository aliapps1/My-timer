const translations = {
  en: {
    navApps:"Apps", navAbout:"About", navContact:"Contact",
    eyebrow:"Independent mobile app studio",
    heroTitle:"Useful apps.<br><span>Clear purpose.</span>",
    heroText:"We build practical mobile experiences that help people focus, plan, and get more done—without unnecessary complexity.",
    exploreApps:"Explore our apps", contactUs:"Contact us",
    products:"Products", languages:"Languages", platform:"Primary platform",
    focusHeading:"Stay focused.<br>Build momentum.", startSession:"Start session",
    taskDone:"Task completed", keepGoing:"Keep going", dayStreak:"day streak", consistency:"Consistency wins",
    ourApps:"Our apps", appsTitle:"Built for real daily use",
    appsText:"Each product is designed around one clear problem and a simple, reliable experience.",
    liveGooglePlay:"Live on Google Play", productivity:"Productivity", focusDesc:"A focus timer with sessions, streaks, levels, statistics, premium tools, and a simple path to stronger habits.",
    focusFeature1:"Focus sessions", focusFeature2:"Streaks & progress", focusFeature3:"11 languages",
    viewApp:"View app", privacyPolicy:"Privacy Policy",
    testing:"Testing", planning:"Planning", plannerDesc:"A multilingual task planner with priorities, reminders, search, premium options, and clean day-by-day organization.",
    plannerFeature1:"Tasks & reminders", plannerFeature2:"Premium plans", plannerFeature3:"11 languages",
    comingSoon:"Coming soon", games:"Games", neonDesc:"A colorful sorting puzzle with infinite levels, coins, hints, undo, skip, progression, and multilingual support.",
    neonFeature1:"Infinite levels", neonFeature2:"Coins & rewards", neonFeature3:"Smart progression",
    aboutAliapps1:"About Aliapps1", aboutTitle:"Small studio.<br>Serious standards.",
    aboutText1:"Aliapps1 is an independent app studio based in the UAE. We focus on practical Android products that are straightforward, useful, and built for long-term improvement.",
    aboutText2:"Our approach is simple: solve one real problem well, keep the experience clear, and improve every release through actual testing.",
    contactKicker:"Contact", contactTitle:"Questions, support, or partnerships?", contactText:"Send us a message and we’ll get back to you as soon as possible.",
    footerTag:"Practical apps, built with focus.", terms:"Terms", rights:"All rights reserved."
  },
  ar: {
    navApps:"التطبيقات", navAbout:"من نحن", navContact:"تواصل",
    eyebrow:"استوديو مستقل لتطوير تطبيقات الهاتف",
    heroTitle:"تطبيقات مفيدة.<br><span>هدف واضح.</span>",
    heroText:"نطوّر تجارب عملية تساعد الناس على التركيز والتخطيط وإنجاز المزيد، من دون تعقيد غير ضروري.",
    exploreApps:"استكشف تطبيقاتنا", contactUs:"تواصل معنا",
    products:"منتجات", languages:"لغة", platform:"المنصة الأساسية",
    focusHeading:"ركّز أكثر.<br>واصنع تقدّمك.", startSession:"ابدأ الجلسة",
    taskDone:"تم إنجاز المهمة", keepGoing:"استمر", dayStreak:"أيام متتالية", consistency:"الاستمرارية تصنع الفرق",
    ourApps:"تطبيقاتنا", appsTitle:"مصممة للاستخدام اليومي الحقيقي",
    appsText:"كل منتج يعالج مشكلة واضحة من خلال تجربة بسيطة وموثوقة.",
    liveGooglePlay:"متاح على Google Play", productivity:"إنتاجية", focusDesc:"مؤقت للتركيز مع جلسات وسلاسل إنجاز ومستويات وإحصاءات وأدوات بريميوم تساعد على بناء عادات أقوى.",
    focusFeature1:"جلسات تركيز", focusFeature2:"سلاسل وتقدّم", focusFeature3:"11 لغة",
    viewApp:"عرض التطبيق", privacyPolicy:"سياسة الخصوصية",
    testing:"قيد الاختبار", planning:"تخطيط", plannerDesc:"منظّم مهام متعدد اللغات مع أولويات وتذكيرات وبحث وخيارات بريميوم وتنظيم يومي واضح.",
    plannerFeature1:"مهام وتذكيرات", plannerFeature2:"خطط بريميوم", plannerFeature3:"11 لغة",
    comingSoon:"قريباً", games:"ألعاب", neonDesc:"لعبة فرز ملوّنة بمراحل لا نهائية وعملات وتلميحات وتراجع وتجاوز وتقدّم ذكي ودعم متعدد اللغات.",
    neonFeature1:"مراحل لا نهائية", neonFeature2:"عملات ومكافآت", neonFeature3:"تقدّم ذكي",
    aboutAliapps1:"عن Aliapps1", aboutTitle:"استوديو صغير.<br>معايير جادة.",
    aboutText1:"Aliapps1 استوديو مستقل مقره دولة الإمارات، يركّز على تطبيقات أندرويد عملية وواضحة ومفيدة وقابلة للتطوير على المدى الطويل.",
    aboutText2:"منهجنا بسيط: حل مشكلة حقيقية واحدة بإتقان، الحفاظ على تجربة واضحة، وتحسين كل إصدار من خلال الاختبار الفعلي.",
    contactKicker:"تواصل", contactTitle:"لديك سؤال أو تحتاج دعماً أو شراكة؟", contactText:"راسلنا وسنرد عليك في أقرب وقت ممكن.",
    footerTag:"تطبيقات عملية، تُبنى بتركيز.", terms:"الشروط", rights:"جميع الحقوق محفوظة."
  }
};

const langToggle = document.getElementById("langToggle");
const menuToggle = document.getElementById("menuToggle");
const nav = document.querySelector(".nav");

function applyLanguage(lang) {
  const dict = translations[lang];
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key]) el.innerHTML = dict[key];
  });
  langToggle.textContent = lang === "ar" ? "EN" : "AR";
  localStorage.setItem("aliapps1-lang", lang);
}

langToggle.addEventListener("click", () => {
  applyLanguage(document.documentElement.lang === "ar" ? "en" : "ar");
});

menuToggle.addEventListener("click", () => nav.classList.toggle("open"));
document.querySelectorAll(".nav a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));

document.getElementById("year").textContent = new Date().getFullYear();

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
applyLanguage(localStorage.getItem("aliapps1-lang") || "en");