// Full bilingual content for TSC English Academy.
// Edit copy here; every section reads content[lang].
export const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdQjY0ErveIKaj6KAnCKTVZhuIsCX-SWcti7doMOWqdwCGPfg/viewform?embedded=true";
export const CONTACT_EMAIL = "tscenglishacademy@gmail.com";
export const BRAND = "TSC English Academy";

export const nav = [
  { href: "#difference", ja: "特長", en: "Difference" },
  { href: "#features", ja: "レッスン", en: "Lessons" },
  { href: "#pricing", ja: "料金", en: "Pricing" },
  { href: "#faq", ja: "FAQ", en: "FAQ" },
];

export const content = {
  ja: {
    cta: { trial: "無料体験を予約する", apply: "お申し込みフォームへ", start: "無料体験" },
    hero: {
      eyebrow: "Online English Academy",
      usp: "海外講師 × 日本人通訳者が同席",
      title: ["いつでも、どこでも。", "確かな", "英語力を。"],
      goldLine: 2,
      sub: "海外講師と日本人通訳者がともに伴走。初心者でも置いていかれない、“話す力”を伸ばすオンライン英語レッスン。",
      primary: "無料体験を予約する",
      secondary: "特長を見る",
    },
    difference: {
      eyebrow: "The TSC Difference",
      versus: ["ネイティブ講師", "通訳者"],
      title: ["“分からない”を、", "その場で安心に。"],
      body: "海外講師の自然な英語に触れながら、つまずいた瞬間は日本人通訳者がすぐにフォロー。だから初心者でも、最初のレッスンから安心して話せます。",
      points: [
        { title: "通訳者がすぐ隣に", body: "分からない時はすぐ日本語で確認。会話が止まらず、置いていかれません。" },
        { title: "ネイティブの自然な英語", body: "教科書では学べない、実際に使われる表現と発音に触れられます。" },
        { title: "アウトプット中心", body: "受講者が主役。話す時間を最大化し、成長を実感できます。" },
      ],
      stats: [
        { num: "2名", label: "講師＋通訳の体制" },
        { num: "50%+", label: "受講者の発話比率" },
      ],
    },
    features: {
      eyebrow: "Why TSC",
      title: "TSC English Academy の特徴",
      sub: "信頼。柔軟性。成果。すべてが、あなたの上達のために。",
      items: [
        { no: "01", tag: "少人数制", title: "発話量を最大化", body: "一人ひとりが話す時間を確保。アウトプット中心で、確実に伸ばします。" },
        { no: "02", tag: "柔軟スケジュール", title: "オンライン / 対面", body: "生活に合わせて学習。いつでも、どこからでも受講できます。" },
        { no: "03", tag: "目的別", title: "カリキュラム設計", body: "留学・受験・ビジネスなど、目的に合わせて最適化します。" },
      ],
    },
    pricing: {
      eyebrow: "Pricing",
      title: ["料金案内"],
      sub: "体系的な学習。確実な成果。",
      standard: { label: "通常レッスン料金", amount: "¥1,200", unit: "／ 1回" },
      plans: [
        { name: "10回コース", price: "¥10,000", unit: "レッスン10回分", save: "2,000円お得", featured: false,
          list: ["先払いチケット制", "予約変更も無料", "気軽に始めたい方へ"] },
        { name: "20回コース", price: "¥19,000", unit: "レッスン20回分", save: "5,000円お得", featured: true, tag: "人気No.1",
          list: ["継続学習に最適なバランス", "予約変更も無料", "習慣化で成果を実感"] },
        { name: "30回集中コース", price: "¥26,000", unit: "レッスン30回分", save: "1万円お得", featured: false,
          list: ["短期間で一気に伸ばす", "最もお得な単価", "留学・試験対策に"] },
      ],
      choose: "申し込む",
      credit: {
        title: "柔軟な先払い・チケット制",
        body: "月謝制とは異なり、受講した分のみご利用いただけます。無理なく、自分のペースで続けられます。",
        items: ["ご利用分のみ消化", "月謝制ではありません", "欠席による追加料金なし", "予約変更も無料"],
      },
      payment: { title: "お支払い方法", items: ["銀行振込", "PayPay", "現金（ご相談可）", "その他電子決済（ご相談ください）"] },
      note: "継続するほど、成果もお得も大きく。※スケジュール枠には限りがあります。お早めにご予約ください。",
    },
    faq: {
      eyebrow: "FAQ",
      title: ["よくある質問"],
      sub: "まずは無料体験で、目的とレベルを確認します。",
      items: [
        { q: "初心者でも大丈夫ですか？", a: "はい。完全初心者から上級者まで対応しています。通訳者が同席するため、英語に不安がある方でも安心です。無料体験で最適な進め方をご提案します。" },
        { q: "オンラインと対面は切り替えできますか？", a: "可能です。スケジュールに合わせて、柔軟に選んでいただけます。" },
        { q: "教材はどうなりますか？", a: "目的に合わせて最適な教材をご提案します。無料体験時に詳しくご案内します。" },
        { q: "通訳者は毎回同席しますか？", a: "レベルやご希望に応じて柔軟に対応します。最初は手厚く、慣れてきたら英語中心へ——あなたの成長に合わせて調整します。" },
      ],
    },
    apply: {
      eyebrow: "Apply",
      title: ["お申し込みフォーム"],
      sub: "必要事項を入力して送信してください。担当者よりご連絡いたします。",
    },
    footer: { tagline: "海外講師 × 通訳者のオンライン英語レッスン", contact: "お問い合わせ" },
  },

  en: {
    cta: { trial: "Book a Free Trial", apply: "Go to Application Form", start: "Free Trial" },
    hero: {
      eyebrow: "Online English Academy",
      usp: "Overseas teacher × Japanese interpreter",
      title: ["Anytime, anywhere.", "English with", "confidence."],
      goldLine: 2,
      sub: "An overseas teacher and a Japanese interpreter guide every lesson — so even beginners are never left behind, and speak with confidence from day one.",
      primary: "Book a Free Trial",
      secondary: "Discover TSC",
    },
    difference: {
      eyebrow: "The TSC Difference",
      versus: ["Native teacher", "Interpreter"],
      title: ["Turn “I don’t get it”", "into instant confidence."],
      body: "You learn from a teacher’s authentic English while a Japanese interpreter is right there the moment you get stuck — so even beginners can speak up from their very first lesson.",
      points: [
        { title: "An interpreter by your side", body: "Check anything in Japanese on the spot — the conversation never stalls." },
        { title: "Authentic native English", body: "Hear the expressions and pronunciation people really use." },
        { title: "Output-focused", body: "You take the lead — maximized speaking time you can feel working." },
      ],
      stats: [
        { num: "2", label: "Teacher + interpreter" },
        { num: "50%+", label: "Your speaking time" },
      ],
    },
    features: {
      eyebrow: "Why TSC",
      title: "Why Choose TSC English Academy",
      sub: "Confidence. Flexibility. Results — all built around your progress.",
      items: [
        { no: "01", tag: "Small Class", title: "More Speaking Time", body: "Small classes mean you speak more — and grow faster through real output." },
        { no: "02", tag: "Flexible", title: "Online & In-Person", body: "Learn anywhere, anytime — lessons that fit into your life." },
        { no: "03", tag: "Goal-Oriented", title: "Tailored Curriculum", body: "Study plans optimized for study abroad, exams, or business." },
      ],
    },
    pricing: {
      eyebrow: "Pricing",
      title: ["Pricing & Plans"],
      sub: "Structured learning. Measurable results.",
      standard: { label: "Standard Lesson Rate", amount: "¥1,200", unit: "/ session" },
      plans: [
        { name: "10-Lesson", price: "¥10,000", unit: "10 lessons", save: "Save ¥2,000", featured: false,
          list: ["Prepaid credit system", "Free rescheduling", "Great for getting started"] },
        { name: "20-Lesson", price: "¥19,000", unit: "20 lessons", save: "Save ¥5,000", featured: true, tag: "Most Popular",
          list: ["Best balance for steady progress", "Free rescheduling", "Build a habit, see results"] },
        { name: "30-Lesson Intensive", price: "¥26,000", unit: "30 lessons", save: "Save ¥10,000", featured: false,
          list: ["Accelerate in a short time", "Best per-lesson value", "Ideal for exams & study abroad"] },
      ],
      choose: "Choose",
      credit: {
        title: "Flexible Prepaid Credit System",
        body: "Unlike monthly tuition, you only use the lessons you take — continue at your own pace.",
        items: ["Only pay for lessons you use", "No fixed monthly tuition", "No charge for absences", "Free rescheduling"],
      },
      payment: { title: "Payment Methods", items: ["Bank Transfer", "PayPay", "Cash (by arrangement)", "Other digital payments (by request)"] },
      note: "The more you learn, the greater your progress and savings. ※ Schedule slots are limited — please book early.",
    },
    faq: {
      eyebrow: "FAQ",
      title: ["Frequently Asked Questions"],
      sub: "Start with a free trial to check your goals and level.",
      items: [
        { q: "Can complete beginners join?", a: "Yes. We welcome all levels. With an interpreter present, even nervous beginners feel at ease. We’ll propose the best plan after your free trial." },
        { q: "Can I switch between online and in-person?", a: "Yes. Choose flexibly based on your schedule." },
        { q: "What about learning materials?", a: "We recommend materials tailored to your goals. We’ll share details at your trial." },
        { q: "Is the interpreter present every lesson?", a: "We adjust to your level and preference — more support at first, then increasingly English-only as you grow in confidence." },
      ],
    },
    apply: {
      eyebrow: "Apply",
      title: ["Application Form"],
      sub: "Fill out the form below and we’ll be in touch shortly.",
    },
    footer: { tagline: "Online English lessons — overseas teacher × interpreter", contact: "Contact" },
  },
};
