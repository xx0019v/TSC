/**
 * Bilingual conversation tree for the TSC Concierge chatbot.
 *
 * Each NODE has:
 *   botText  { ja, en }   message the bot delivers when entering this node
 *   chips    [chip]       quick-reply chips offered after the bot text
 *
 * Each CHIP has:
 *   id       string                   stable react key
 *   label    { ja, en }               the chip's button text
 *   next?    nodeKey                  advance to this node on click
 *   action?  'apply' | 'line'         take a side-effect instead of advancing
 *   confirm? { ja, en }               bot response shown for action chips
 *
 * Copy follows the site's "less punctuation, more rhythm" rule: short
 * lines, breaks instead of commas, warm-but-professional voice in both
 * languages. Never machine-translated — JA and EN are written separately
 * to feel natural in each.
 */

// Placeholder — replace with the real LINE URL once it exists. While empty
// the chatbot routes the LINE chip through a friendly fallback.
export const LINE_URL = "";

// Cloudflare Worker that proxies free-text questions to Anthropic Claude.
// While empty the free-text input is hidden and only the curated chip flow
// is shown. See /worker/README.md for deploy instructions.
export const AI_ENDPOINT = "";

const TRIAL_CONFIRM = {
  ja: "申し込みフォームへご案内しました\n\nまずはお気軽に\nレベルや目的を教えてください",
  en: "Taking you to the application form\n\nShare your level and goals there\nand we'll take it from there",
};

const LINE_FALLBACK = {
  ja: "公式 LINE は準備中です\n\nお問い合わせフォームからご連絡いただければ\n担当者よりお返事いたします",
  en: "Our LINE channel is being set up\n\nPlease use the contact form for now\nand we'll get back to you soon",
};

const BACK_TO_INTRO = {
  id: "back",
  label: { ja: "ほかの話題", en: "Another topic" },
  next: "intro",
};
const BOOK_TRIAL = {
  id: "book",
  label: { ja: "無料体験を予約", en: "Book a free trial" },
  action: "apply",
  confirm: TRIAL_CONFIRM,
};
const LINE_CHIP = {
  id: "line",
  label: { ja: "LINE で相談", en: "Contact on LINE" },
  action: "line",
  confirm: LINE_FALLBACK,
};

export const FLOW = {
  // ────────────────────────────────────────────────────────────────────
  intro: {
    botText: {
      ja:
        "こんにちは\nTSC English Academy です\n\n気になることをお選びください\n自由な入力にも対応していきます",
      en:
        "Hi there\nWelcome to TSC English Academy\n\nPick a topic below\nor tell us what you'd like to know",
    },
    chips: [
      { id: "trial",    label: { ja: "無料体験について",       en: "Trial lesson" },    next: "trial" },
      { id: "lessons",  label: { ja: "レッスン内容",           en: "Lesson details" },  next: "lessons" },
      { id: "pricing",  label: { ja: "料金",                   en: "Pricing" },         next: "pricing" },
      { id: "kids",     label: { ja: "子ども向け",             en: "Kids English" },    next: "kids" },
      { id: "adult",    label: { ja: "大人の英会話",           en: "Adult lessons" },   next: "adult" },
      { id: "business", label: { ja: "ビジネス英語",           en: "Business English" }, next: "business" },
      { id: "find",     label: { ja: "おすすめを知りたい",     en: "Find my lesson" },  next: "diag_goal" },
      LINE_CHIP,
    ],
  },

  // ────────────────────────────────────────────────────────────────────
  trial: {
    botText: {
      ja:
        "無料体験では\nあなたのレベルと目標を一緒に確認します\n\n通訳者が同席するので\n英語に不安があっても安心です\n\n体験のあと\n最適な進め方をご提案します",
      en:
        "Your free trial begins by checking your level and goals together\n\nA Japanese interpreter joins the lesson\nso you can speak freely from the start\n\nAfterwards we share a learning plan that fits you",
    },
    chips: [BOOK_TRIAL, BACK_TO_INTRO, LINE_CHIP],
  },

  lessons: {
    botText: {
      ja:
        "TSC のレッスンは\n海外講師と日本人通訳者がふたりで担当します\n\n会話が止まらず\n最初のレッスンから自信を持って話せます\n\nオンライン 対面 どちらにも対応しています",
      en:
        "Each TSC lesson is led by an overseas teacher\nwith a Japanese interpreter beside you\n\nConversation never stalls\nso you speak with confidence from day one\n\nWe offer both online and in-person formats",
    },
    chips: [
      { id: "go_pricing", label: { ja: "料金を見る",   en: "See pricing" }, next: "pricing" },
      { id: "go_kids",    label: { ja: "子ども向けは",  en: "What about kids" }, next: "kids" },
      { id: "go_biz",     label: { ja: "ビジネス英語は", en: "Business English" }, next: "business" },
      BOOK_TRIAL,
    ],
  },

  pricing: {
    botText: {
      ja:
        "1回 ¥1,200 の先払いチケット制です\n\n10回  ¥10,000\n20回  ¥19,000  (人気)\n30回  ¥26,000\n\n月謝ではないので\n無理なく自分のペースで続けられます",
      en:
        "Lessons are ¥1,200 each on a prepaid credit system\n\n10 lessons  ¥10,000\n20 lessons  ¥19,000  (popular)\n30 lessons  ¥26,000\n\nNo fixed monthly fee\nso you continue at your own pace",
    },
    chips: [BOOK_TRIAL, BACK_TO_INTRO, LINE_CHIP],
  },

  kids: {
    botText: {
      ja:
        "お子さま向けレッスンにも対応しています\n\n海外講師と通訳者の組み合わせで\n楽しみながら自然に英語に慣れていきます\n\n年齢や目的に合わせて進め方をご提案します",
      en:
        "We offer Kids English too\n\nWith an overseas teacher and a Japanese interpreter\nchildren get comfortable with English in a calm warm setting\n\nWe tailor the approach to age and goal",
    },
    chips: [BOOK_TRIAL, BACK_TO_INTRO, LINE_CHIP],
  },

  adult: {
    botText: {
      ja:
        "日常会話から仕事まで\n大人の方の英語学習に幅広く対応しています\n\n通訳者が同席することで\n英語が久しぶりの方でも安心して話せます",
      en:
        "From daily conversation to work\nwe support adult learners at every stage\n\nWith an interpreter beside you\neven rusty English feels safe again",
    },
    chips: [
      { id: "go_biz", label: { ja: "ビジネス英語は", en: "Business English" }, next: "business" },
      BOOK_TRIAL,
      LINE_CHIP,
    ],
  },

  business: {
    botText: {
      ja:
        "仕事で使う英語に特化したレッスンも可能です\n\n業界  職種  場面\nそれぞれに合わせて内容をカスタマイズします",
      en:
        "We offer Business English tailored to your work\n\nIndustry  role  setting\nall customized to fit you",
    },
    chips: [BOOK_TRIAL, BACK_TO_INTRO, LINE_CHIP],
  },

  // ── Diagnose flow ────────────────────────────────────────────────
  diag_goal: {
    botText: {
      ja: "英語で\n一番伸ばしたいのはどれですか",
      en: "What would you most like to improve",
    },
    chips: [
      { id: "g1", label: { ja: "日常会話",      en: "Daily conversation" }, next: "diag_level" },
      { id: "g2", label: { ja: "仕事で使いたい", en: "Business English" },   next: "diag_level" },
      { id: "g3", label: { ja: "子どもの英語",   en: "Kids English" },       next: "diag_level" },
      { id: "g4", label: { ja: "試験対策",       en: "Test preparation" },   next: "diag_level" },
      { id: "g5", label: { ja: "海外旅行",       en: "Travel English" },     next: "diag_level" },
      { id: "g6", label: { ja: "まだ決まっていない", en: "Not sure yet" },   next: "diag_level" },
    ],
  },
  diag_level: {
    botText: {
      ja: "今の英語の感じに近いのは",
      en: "How would you describe your current English",
    },
    chips: [
      { id: "l1", label: { ja: "ほぼ初めて",         en: "Just starting" },     next: "diag_format" },
      { id: "l2", label: { ja: "中学英語ぐらい",     en: "Some basics" },       next: "diag_format" },
      { id: "l3", label: { ja: "ある程度話せる",     en: "Conversational" },    next: "diag_format" },
      { id: "l4", label: { ja: "自信あり",           en: "Confident" },         next: "diag_format" },
      { id: "l5", label: { ja: "自分でも分からない", en: "Not sure" },          next: "diag_format" },
    ],
  },
  diag_format: {
    botText: {
      ja: "受講スタイルはどちらが希望ですか",
      en: "Which format would you prefer",
    },
    chips: [
      { id: "f1", label: { ja: "オンライン",       en: "Online" },        next: "diag_result" },
      { id: "f2", label: { ja: "対面",             en: "In-person" },     next: "diag_result" },
      { id: "f3", label: { ja: "どちらでも",       en: "Either is fine" }, next: "diag_result" },
    ],
  },
  diag_result: {
    botText: {
      ja:
        "ありがとうございます\n\nお話を伺ったかぎりでは\nまず無料体験で\nレベルと進め方を一緒に確認するのが\n一番しっくりきそうです\n\n通訳者が同席するので\n話しやすいところから始められます",
      en:
        "Thank you\n\nFrom what you've shared\nthe easiest first step is a free trial\nso we can confirm your level\nand the right pace together\n\nThe interpreter will be there\nso you can start from where you're comfortable",
    },
    chips: [BOOK_TRIAL, LINE_CHIP, BACK_TO_INTRO],
  },
};
