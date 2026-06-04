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
    cta: { trial: "無料体験を予約", apply: "お申し込みへ", start: "無料体験" },
    hero: {
      eyebrow: "Online English Academy",
      usp: "海外講師 × 日本人通訳者",
      title: ["いつでも  どこでも", "話す自信を", "あなたのなかへ"],
      goldLine: 2,
      sub: "海外講師と通訳者が\nふたりで隣にいるオンライン英語\n\n初心者でも置いていかれず\n話す力が静かに育つ",
      primary: "無料体験を予約",
      secondary: "特長を見る",
    },
    difference: {
      eyebrow: "The TSC Difference",
      versus: ["ネイティブ講師", "通訳者"],
      title: ["わからないが", "安心に変わる場所"],
      body: "ネイティブの英語に触れながら\nつまずいた瞬間は\n通訳者がすぐ隣に\n\n最初の一言から\n安心して話せる",
      points: [
        { title: "通訳者がすぐ隣に", body: "わからない時は日本語で確認\n会話が途切れません" },
        { title: "ネイティブの自然な英語", body: "教科書にはない\n実際に使われる表現と発音を" },
        { title: "アウトプット中心", body: "受講者が主役\n話す時間が 自然と長くなる" },
      ],
      stats: [
        { num: "2名", label: "講師 + 通訳者の体制" },
        { num: "50%+", label: "受講者の発話比率" },
      ],
    },
    features: {
      eyebrow: "Why TSC",
      title: ["TSC が選ばれる理由"],
      sub: "信頼  柔軟性  成果\n続けたくなる理由が ここに",
      items: [
        { no: "01", tag: "少人数制", title: "発話量を最大化", body: "ひとりひとりに 話す時間を\nアウトプット中心で 確かに伸びる" },
        { no: "02", tag: "柔軟スケジュール", title: "オンライン or 対面", body: "暮らしに合わせて学ぶ\nいつでも どこからでも" },
        { no: "03", tag: "目的別", title: "カリキュラム設計", body: "留学  受験  ビジネス\nそれぞれの目標に合わせて" },
      ],
    },
    showcase: {
      eyebrow: "教室の風景",
      title: ["画面の向こうに", "本物の学びを"],
      body: "自宅から数歩で\n本物のレッスンの場へ\n\n海外講師と通訳者が\nあなたの隣に",
      items: [
        { src: "lesson3.webp", label: "集中できる学習環境" },
        { src: "lesson1.webp", label: "海外講師とのオンラインレッスン" },
        { src: "lesson2.webp", label: "手を動かして 身につける" },
      ],
    },
    pricing: {
      eyebrow: "Pricing",
      title: ["料金とコース"],
      sub: "続けるほど 確かに伸びる学び方",
      standard: { label: "通常レッスン料金", amount: "¥1,200", unit: "／ 1回" },
      plans: [
        { name: "10回コース", price: "¥10,000", unit: "レッスン10回分", save: "2,000円お得", featured: false,
          list: ["先払いチケット制", "予約変更も無料", "気軽にはじめたい方へ"] },
        { name: "20回コース", price: "¥19,000", unit: "レッスン20回分", save: "5,000円お得", featured: true, tag: "人気No.1",
          list: ["続けやすいバランス", "予約変更も無料", "習慣化で成果を実感"] },
        { name: "30回集中コース", price: "¥26,000", unit: "レッスン30回分", save: "1万円お得", featured: false,
          list: ["短期間で一気に伸ばす", "もっともお得な単価", "留学や試験対策に"] },
      ],
      choose: "申し込む",
      credit: {
        title: "柔軟な先払い・チケット制",
        body: "月謝はありません\n受けたぶんだけ\n\n無理なく あなたのペースで",
        items: ["ご利用分のみ消化", "月謝制ではありません", "欠席による追加料金なし", "予約変更も無料"],
      },
      payment: { title: "お支払い方法", items: ["銀行振込", "PayPay", "現金（ご相談可）", "その他電子決済（ご相談ください）"] },
      note: "続けるほど 確かな成長へ\n\n※ スケジュール枠には限りがあります  お早めにご予約ください",
    },
    faq: {
      eyebrow: "FAQ",
      title: ["よくある質問"],
      sub: "まずは無料体験で\n目的とレベルを 一緒に確かめませんか",
      items: [
        { q: "初心者でも大丈夫ですか", a: "完全初心者から上級者まで対応しています\n\n通訳者が隣にいるので\n英語に不安があっても安心\n\n無料体験で 最適な進め方をご提案します" },
        { q: "オンラインと対面は切り替えできますか", a: "はい\nスケジュールに合わせて 自由に選べます" },
        { q: "教材はどうなりますか", a: "目的に合わせて 最適な教材を\n\n無料体験時に詳しくお話しします" },
        { q: "通訳者は毎回同席しますか", a: "レベルやご希望に合わせて\n柔軟に対応します\n\n最初は手厚く\n慣れてきたら英語中心へ" },
      ],
    },
    apply: {
      eyebrow: "Apply",
      title: ["はじめの一歩を"],
      sub: "必要事項をご入力ください\nこちらからご連絡いたします",
    },
    footer: { tagline: "海外講師 × 通訳者の  オンライン英語レッスン", contact: "お問い合わせ" },
  },

  en: {
    cta: { trial: "Book a Free Trial", apply: "Apply now", start: "Free Trial" },
    hero: {
      eyebrow: "Online English Academy",
      usp: "Overseas teacher × Japanese interpreter",
      title: ["Anywhere · Anytime", "Speak English", "with confidence"],
      goldLine: 2,
      sub: "Every lesson is led by\nan overseas teacher\nwith a Japanese interpreter beside you\n\nSpeak from the very first session",
      primary: "Book a Free Trial",
      secondary: "Discover TSC",
    },
    difference: {
      eyebrow: "The TSC Difference",
      versus: ["Native teacher", "Interpreter"],
      title: ["From hesitation", "to a clear voice"],
      body: "Real English from an overseas teacher\nwith a Japanese interpreter beside you\n\nNo moment of being lost\nspeak up from the very first lesson",
      points: [
        { title: "An interpreter by your side", body: "Check anything in Japanese\nthe conversation never stalls" },
        { title: "Authentic native English", body: "Hear the expressions and pronunciation\npeople really use" },
        { title: "Output-focused", body: "You take the lead\nmaximised speaking time" },
      ],
      stats: [
        { num: "2", label: "Teacher + interpreter" },
        { num: "50%+", label: "Your speaking time" },
      ],
    },
    features: {
      eyebrow: "Why TSC",
      title: ["Why learners choose TSC"],
      sub: "Confidence  Flexibility  Results\nshaped around the way you learn",
      items: [
        { no: "01", tag: "Small Class", title: "More Speaking Time", body: "Small classes mean more speaking\nand faster growth through real output" },
        { no: "02", tag: "Flexible", title: "Online & In-Person", body: "Lessons that fit your life\nfrom anywhere at any time" },
        { no: "03", tag: "Goal-Oriented", title: "Tailored Curriculum", body: "Plans built around your goal\nstudy abroad  exams  business" },
      ],
    },
    showcase: {
      eyebrow: "Inside the Lessons",
      title: ["A real lesson", "through the screen"],
      body: "Step into a real lesson\nfrom wherever you are\n\nThe overseas teacher and the interpreter\nare both right beside you",
      items: [
        { src: "lesson3.webp", label: "A space to focus" },
        { src: "lesson1.webp", label: "Online lessons with overseas teachers" },
        { src: "lesson2.webp", label: "Learn by doing" },
      ],
    },
    pricing: {
      eyebrow: "Pricing",
      title: ["Pricing & Plans"],
      sub: "Structured learning  measurable results",
      standard: { label: "Standard Lesson Rate", amount: "¥1,200", unit: "/ session" },
      plans: [
        { name: "10-Lesson", price: "¥10,000", unit: "10 lessons", save: "Save ¥2,000", featured: false,
          list: ["Prepaid credit system", "Free rescheduling", "Great for getting started"] },
        { name: "20-Lesson", price: "¥19,000", unit: "20 lessons", save: "Save ¥5,000", featured: true, tag: "Most Popular",
          list: ["Best balance for steady progress", "Free rescheduling", "Build a habit  see results"] },
        { name: "30-Lesson Intensive", price: "¥26,000", unit: "30 lessons", save: "Save ¥10,000", featured: false,
          list: ["Accelerate in a short time", "Best per-lesson value", "Ideal for exams & study abroad"] },
      ],
      choose: "Choose",
      credit: {
        title: "Flexible Prepaid Credit System",
        body: "No monthly tuition\nYou pay only for the lessons you take\n\nContinue at the pace that fits",
        items: ["Only pay for lessons you use", "No fixed monthly tuition", "No charge for absences", "Free rescheduling"],
      },
      payment: { title: "Payment Methods", items: ["Bank Transfer", "PayPay", "Cash (by arrangement)", "Other digital payments (by request)"] },
      note: "The more you learn\nthe further you go\n\n※ Schedule slots are limited   please book early",
    },
    faq: {
      eyebrow: "FAQ",
      title: ["Frequently Asked Questions"],
      sub: "Begin with a free trial\nto see your goals and level together",
      items: [
        { q: "Can complete beginners join?", a: "Yes\nWe welcome all levels\n\nWith an interpreter beside you\neven nervous beginners feel at ease\n\nWe'll suggest the best path after your trial" },
        { q: "Can I switch between online and in-person?", a: "Yes\nChoose freely based on your schedule" },
        { q: "What about learning materials?", a: "We suggest materials tailored to your goals\n\nDetails come at your trial" },
        { q: "Is the interpreter present every lesson?", a: "We adjust to your level and preference\n\nMore support at first\nmore English as you grow" },
      ],
    },
    apply: {
      eyebrow: "Apply",
      title: ["Take the first step"],
      sub: "Fill in the form below\nWe'll be in touch shortly",
    },
    footer: { tagline: "Online English lessons   overseas teacher × interpreter", contact: "Contact" },
  },
};
