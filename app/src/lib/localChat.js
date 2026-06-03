/**
 * localChat — a small intent-matching responder that runs entirely in the
 * browser. Lets the concierge chatbot feel like it's "actually answering"
 * even before the Cloudflare Worker / Anthropic upgrade is deployed.
 *
 * Once AI_ENDPOINT is configured, the ConciergeChat prefers the real AI
 * and only falls back here on network errors.
 *
 * Detects the user's language from their text (JA characters vs. ASCII),
 * matches against a small set of categories, and returns curated copy in
 * the same brand voice as the rest of the site. Multiline + the room to
 * fail gracefully when no category fits.
 */

const RESPONSES = {
  ja: {
    trial:
      "無料体験では\nあなたのレベルと目標を一緒に確認します\n\n通訳者が同席するので\n英語に不安があっても安心です\n\n下の「無料体験を予約」からそのまま進めます",
    price:
      "1回 ¥1,200 の先払いチケット制です\n\n10回 ¥10,000\n20回 ¥19,000 (人気)\n30回 ¥26,000\n\n月謝ではないので 自分のペースで続けられます",
    lesson:
      "TSC のレッスンは\n海外講師と日本人通訳者がふたりで担当します\n\nオンライン 対面 どちらにも対応\n会話が止まらず 最初から自信を持って話せます",
    beginner:
      "完全初心者の方も歓迎です\n\n通訳者が隣にいるので\n「わからない」がそのまま止まりません\n\n最初の一言から 安心して話せます",
    business:
      "仕事で使う英語に特化したレッスンも可能です\n\n業界 職種 場面に合わせて\n内容をカスタマイズします",
    kids:
      "お子さま向けレッスンにも対応しています\n\n海外講師と通訳者の組み合わせで\n楽しみながら自然に英語に慣れていきます",
    online:
      "オンラインレッスンに対応しています\n\nご自宅から落ち着いた環境で\n海外講師と通訳者と話せます",
    inperson:
      "対面レッスンにも対応しています\n\nスケジュールやご希望に合わせて\nオンラインと自由に切り替えられます",
    interpreter:
      "通訳者は毎回の進め方を一緒に整えます\n\n最初は手厚く\n慣れてきたら英語中心へ\n\nあなたの成長に合わせて調整していきます",
    material:
      "教材は目的に合わせてご提案します\n\n無料体験で詳しくお話しできます",
    schedule:
      "ご都合に合わせて柔軟に組めます\n\n予約変更は無料\n月謝ではないので無理がありません",
    line:
      "公式 LINE は準備中です\n\nお申し込みフォーム または\ntscenglishacademy@gmail.com 宛で\nお問い合わせいただけます",
    contact:
      "お問い合わせは\ntscenglishacademy@gmail.com\nまたは下のお申し込みフォームから",
    test:
      "試験対策にも対応しています\n\n目標の試験と現在のレベルを\n無料体験で一緒に確認します",
    travel:
      "海外旅行で使える英語にも対応します\n\nよく使うフレーズや場面を中心に\n短期間でも組み立てられます",
    level:
      "完全初心者から上級者まで対応しています\n\n無料体験で 目的と今のレベルを\n一緒に確かめませんか",
    greeting:
      "こんにちは\nTSC English Academy です\n\n気になることをお気軽にどうぞ\n無料体験 レッスン内容 料金 \nどれからでも",
    thanks:
      "こちらこそ ありがとうございます\n\nもし無料体験をご検討でしたら\n下のボタンからすぐにお進みいただけます",
    fallback:
      "詳しいことは\n無料体験のときに一緒に確かめませんか\n\nお気軽にお試しください",
  },
  en: {
    trial:
      "At your free trial\nwe check your level and goals together\n\nA Japanese interpreter joins the lesson\nso you can speak freely from the start\n\nThe form below takes you straight there",
    price:
      "Lessons are ¥1,200 each on a prepaid credit system\n\n10 lessons  ¥10,000\n20 lessons  ¥19,000 (popular)\n30 lessons  ¥26,000\n\nNo monthly fee\nyou continue at your own pace",
    lesson:
      "Each TSC lesson is led by\nan overseas teacher\nwith a Japanese interpreter beside you\n\nOnline or in-person\nconversation never stalls",
    beginner:
      "Complete beginners are welcome\n\nWith an interpreter beside you\nthere is no moment of being lost\n\nSpeak up from your very first lesson",
    business:
      "We offer Business English tailored to your work\n\nIndustry  role  setting\nall customized to fit you",
    kids:
      "We offer Kids English too\n\nThe overseas teacher and the interpreter\nhelp children get comfortable\nin a calm warm setting",
    online:
      "Online lessons are available\n\nFrom home in a quiet space\nyou speak with the overseas teacher\nand the interpreter beside you",
    inperson:
      "In-person lessons are available too\n\nSwitch freely between online\nand in-person based on your schedule",
    interpreter:
      "The interpreter joins each lesson\n\nMore support at first\nmore English as you grow\n\nWe adjust to your pace",
    material:
      "Materials are suggested to fit your goal\n\nWe'll share details at your trial",
    schedule:
      "Scheduling is flexible\n\nFree rescheduling\nno monthly tuition\nso it stays easy to continue",
    line:
      "Our LINE channel is being set up\n\nFor now\nplease use the application form or\ntscenglishacademy@gmail.com",
    contact:
      "You can reach us at\ntscenglishacademy@gmail.com\nor through the application form below",
    test:
      "We support test preparation\n\nTell us the target test\nand we'll align the plan at your trial",
    travel:
      "Travel English is welcome\n\nWe focus on the phrases and moments\nyou'll actually use",
    level:
      "We welcome all levels\nfrom first lesson to advanced\n\nThe trial confirms your level\nand the best path forward",
    greeting:
      "Hello\nWelcome to TSC English Academy\n\nFeel free to ask\nabout trials  lessons  pricing\nor anything in between",
    thanks:
      "Thank you\n\nIf you'd like a free trial\nthe button just below will take you there",
    fallback:
      "We can confirm the details\nduring a free trial\n\nFeel free to give it a try",
  },
};

/** Detect whether the user wrote primarily in JA. */
function looksJapanese(text) {
  // Any Hiragana, Katakana, or CJK ideograph counts.
  return /[぀-ヿ㐀-鿿]/.test(text);
}

/** Map intent keys per language. The first matching key wins. */
const PATTERNS_JA = [
  ["greeting",    /^(こんにちは|こんばんは|はじめまして|よろしく|やあ|どうも)/i],
  ["thanks",      /(ありがとう|助かり|感謝)/],
  ["trial",       /(無料体験|体験|お試し|まずは)/],
  ["price",       /(料金|値段|いくら|費用|月謝|プラン|コース|チケット|支払)/],
  ["beginner",    /(初心者|初めて|はじめて|不安|怖い|英語苦手)/],
  ["business",    /(ビジネス|仕事|会議|プレゼン|TOEIC|職場)/],
  ["kids",        /(子ども|こども|子供|キッズ|小学生|未就学|中学生)/],
  ["online",      /(オンライン|リモート|zoom|ZOOM|ZOOM|画面越し)/],
  ["inperson",    /(対面|教室|通う|スクール|オフライン)/],
  ["interpreter", /(通訳|日本人講師|日本語|同席)/],
  ["material",    /(教材|テキスト|本|プリント)/],
  ["schedule",    /(予約|スケジュール|時間|曜日|変更)/],
  ["line",        /(line|ライン|LINE)/i],
  ["contact",     /(連絡|問い合わせ|メール|電話)/],
  ["test",        /(試験|テスト|資格|英検|toefl|TOEFL|IELTS)/i],
  ["travel",      /(旅行|海外|留学)/],
  ["level",       /(レベル|どのくらい|上達|伸ばし|診断)/],
  ["lesson",      /(レッスン|授業|内容|どんな)/],
];

const PATTERNS_EN = [
  ["greeting",    /^(hi|hello|hey|good (morning|afternoon|evening))/i],
  ["thanks",      /(thanks|thank you|appreciate)/i],
  ["trial",       /(trial|free lesson|try|first lesson)/i],
  ["price",       /(price|cost|how much|fee|plan|package|payment|monthly|tuition)/i],
  ["beginner",    /(beginner|just starting|new to|nervous|scared|afraid|rusty)/i],
  ["business",    /(business|work|career|office|presentation|meeting)/i],
  ["kids",        /(kids?|child|children|son|daughter|school age)/i],
  ["online",      /(online|remote|zoom|virtual|from home)/i],
  ["inperson",    /(in[- ]person|in person|on[- ]?site|offline|classroom|come in)/i],
  ["interpreter", /(interpreter|japanese teacher|translator)/i],
  ["material",    /(material|textbook|book|content)/i],
  ["schedule",    /(schedule|book|reschedule|time slot|availability)/i],
  ["line",        /\bline\b/i],
  ["contact",     /(contact|reach|email|phone|message)/i],
  ["test",        /(test|exam|toeic|toefl|ielts|cert)/i],
  ["travel",      /(travel|tourist|study abroad|exchange)/i],
  ["level",       /(level|how good|advanced|intermediate|where i stand)/i],
  ["lesson",      /(lesson|class|course|curriculum|what do you teach)/i],
];

function detectIntent(text, lang) {
  const patterns = lang === "ja" ? PATTERNS_JA : PATTERNS_EN;
  for (const [key, pattern] of patterns) {
    if (pattern.test(text)) return key;
  }
  return "fallback";
}

/**
 * @param {string} userText - the user's new message
 * @param {string} pageLang - 'ja' | 'en' (the page-level UI language)
 * @returns {{ reply: string, lang: 'ja'|'en', intent: string }}
 */
export function localChatReply(userText, pageLang = "ja") {
  const text = String(userText || "").trim();
  if (!text) return { reply: RESPONSES[pageLang].fallback, lang: pageLang, intent: "fallback" };

  const lang = looksJapanese(text) ? "ja" : /[a-zA-Z]/.test(text) ? "en" : pageLang;
  const intent = detectIntent(text, lang);
  return { reply: RESPONSES[lang][intent] || RESPONSES[lang].fallback, lang, intent };
}
