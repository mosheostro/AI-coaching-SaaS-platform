/**
 * Deterministic coaching engine — no LLM, no API.
 * An 8-state coaching session that adapts by reflecting the visitor's
 * own words (topic, feelings, quotes) back into scripted questions.
 */

export const STAGES = [
  "intake",
  "clarify",
  "explore",
  "patterns",
  "insight",
  "action",
  "closure",
  "conversion",
] as const;

export type Stage = (typeof STAGES)[number];
export type EngineLocale = "en" | "ru" | "he";

export interface EngineSession {
  state: Stage;
  step: number; // step within the current state
  turn: number; // total user turns
  topic: string;
  quotes: string[];
  feelings: string[];
  insights: string[];
  actions: string[];
  completed: boolean;
}

export function newSession(): EngineSession {
  return {
    state: "intake",
    step: 0,
    turn: 0,
    topic: "",
    quotes: [],
    feelings: [],
    insights: [],
    actions: [],
    completed: false,
  };
}

/* ---------------- language packs ---------------- */

interface Pack {
  openers: string[];
  mirror: (q: string) => string;
  feelingAck: (f: string) => string;
  intake: string;
  clarify: [string, string];
  explore: [string, string];
  patterns: string;
  insight: (topic: string, quote: string) => string;
  insightConfirm: string;
  action: [string, string];
  closure: (topic: string, action: string, feeling: string | null) => string;
  conversion: string;
  ui: {
    title: string;
    sub: string;
    start: string;
    resume: string;
    restart: string;
    exportLabel: string;
    typeMessage: string;
    send: string;
    voiceOn: string;
    voiceOff: string;
    ctaContinue: string;
    ctaSave: string;
    ctaFull: string;
    login: string;
    stages: Record<Stage, string>;
  };
}

const FEELING_WORDS: Record<EngineLocale, RegExp> = {
  en: /\b(stress(ed)?|anxious|anxiety|afraid|fear|tired|exhausted|stuck|angry|anger|sad(ness)?|lonely|overwhelmed|guilt(y)?|ashamed|shame|frustrat\w*|burn(ed|t)?[- ]?out|worr\w*)\b/i,
  ru: /(стресс|тревог\w*|страх|боюсь|устал\w*|выгор\w*|застрял\w*|злюсь|злость|груст\w*|одинок\w*|вин[аы]|стыд\w*|раздраж\w*|беспоко\w*|перегруж\w*)/i,
  he: /(לחץ|חרדה|פחד|עייפות|עייף|תקוע|תקועה|כעס|כועס|עצב|עצוב|בדידות|בודד|אשמה|בושה|תסכול|מתוסכל|שחיקה|דאגה)/i,
};

function snippet(text: string, max = 90): string {
  const clean = text.replace(/\s+/g, " ").trim();
  const firstSentence = clean.split(/(?<=[.!?…])\s/)[0] ?? clean;
  const s = firstSentence.length > max ? firstSentence.slice(0, max - 1) + "…" : firstSentence;
  return s;
}

const PACKS: Record<EngineLocale, Pack> = {
  en: {
    openers: [
      "I hear you.",
      "That's an important point.",
      "Thank you for trusting me with that.",
      "Let's stay with this for a moment.",
    ],
    mirror: (q) => `You said: “${q}”.`,
    feelingAck: (f) => `I notice the word “${f}” — that sounds heavy to carry.`,
    intake:
      "Welcome. I'm your coach for the next few minutes — this space is yours.\n\nWhat would you like to work on today?",
    clarify: [
      "Tell me what's happening with this right now. What does it look like in your everyday life?",
      "How long has this been going on — and what part of it feels most difficult?",
    ],
    explore: [
      "When you sit with this, what do you feel? And where does that feeling show up during your day?",
      "What have you already tried? What got in the way?",
    ],
    patterns:
      "If we zoom out: does this remind you of a cycle that repeats — maybe a belief that sounds like “I always…” or “I never…”?",
    insight: (topic, quote) =>
      `Here's what stands out to me.\n\nYou came in with ${topic ? `“${topic}”` : "this situation"}. But listening closely, the center of gravity seems to be here: “${quote}”. Often the real lever isn't the situation itself — it's the pattern wrapped around it. And the fact that you just named it out loud is already the first move.`,
    insightConfirm: "Does that land with you? What do you see now that you didn't see twenty minutes ago?",
    action: [
      "Let's make this concrete. What is one small step — small enough to be done in the next 24–72 hours — that would move this forward?",
      "Good. When exactly will you do it? And what's most likely to get in the way?",
    ],
    closure: (topic, action, feeling) =>
      `Let me reflect this session back to you.\n\nYou came with ${topic ? `“${topic}”` : "something that mattered"}. ${feeling ? `Along the way you touched something real — ${feeling} was part of it. ` : ""}You named the pattern underneath it, and you committed to a concrete step: “${action}”.\n\nThat is a complete piece of work. Be gentle with yourself as you carry it out — change compounds quietly.`,
    conversion:
      "If you'd like, this is exactly what I do over time in the full platform: I remember your goals, track your commitments between sessions, and build a personalized growth plan around them. Would you like to keep this progress?",
    ui: {
      title: "Your AI coaching session",
      sub: "A guided coaching conversation. No account, no waiting — begin where you are.",
      start: "Begin the session",
      resume: "Resume your session",
      restart: "Start over",
      exportLabel: "Download summary",
      typeMessage: "Type your answer…",
      send: "Send",
      voiceOn: "Voice on",
      voiceOff: "Voice off",
      ctaContinue: "Continue exploring",
      ctaSave: "Save my progress",
      ctaFull: "Get my full coaching system",
      login: "Log in",
      stages: {
        intake: "Arriving",
        clarify: "Clarity",
        explore: "Exploring",
        patterns: "Patterns",
        insight: "Insight",
        action: "Action",
        closure: "Integration",
        conversion: "Next step",
      },
    },
  },

  ru: {
    openers: [
      "Я вас слышу.",
      "Это важный момент.",
      "Спасибо, что доверились.",
      "Давайте задержимся здесь на минуту.",
    ],
    mirror: (q) => `Вы сказали: «${q}».`,
    feelingAck: (f) => `Я замечаю слово «${f}» — похоже, это тяжело нести.`,
    intake:
      "Добро пожаловать. Ближайшие несколько минут я — ваш коуч, и это пространство принадлежит вам.\n\nНад чем вы хотели бы поработать сегодня?",
    clarify: [
      "Расскажите, что происходит с этим прямо сейчас. Как это выглядит в вашей повседневной жизни?",
      "Как давно это продолжается — и какая часть ощущается самой трудной?",
    ],
    explore: [
      "Когда вы остаётесь с этим наедине, что вы чувствуете? И где это чувство проявляется в течение дня?",
      "Что вы уже пробовали? Что помешало?",
    ],
    patterns:
      "Если посмотреть со стороны: не напоминает ли это повторяющийся цикл — может быть, убеждение вроде «я всегда…» или «у меня никогда…»?",
    insight: (topic, quote) =>
      `Вот что я замечаю.\n\nВы пришли с ${topic ? `«${topic}»` : "этой ситуацией"}. Но если слушать внимательно, центр тяжести здесь: «${quote}». Часто настоящий рычаг — не сама ситуация, а паттерн вокруг неё. И то, что вы только что назвали его вслух, — уже первый ход.`,
    insightConfirm: "Отзывается? Что вы видите сейчас, чего не видели двадцать минут назад?",
    action: [
      "Давайте сделаем это конкретным. Какой один маленький шаг — настолько маленький, чтобы сделать его в ближайшие 24–72 часа — продвинул бы вас вперёд?",
      "Хорошо. Когда именно вы это сделаете? И что вероятнее всего помешает?",
    ],
    closure: (topic, action, feeling) =>
      `Позвольте отразить эту сессию.\n\nВы пришли с ${topic ? `«${topic}»` : "тем, что для вас важно"}. ${feeling ? `По пути вы прикоснулись к настоящему — там было и «${feeling}». ` : ""}Вы назвали паттерн под поверхностью и взяли конкретное обязательство: «${action}».\n\nЭто завершённая работа. Будьте к себе бережны, выполняя её — перемены накапливаются тихо.`,
    conversion:
      "Если хотите, именно это я делаю в полной версии платформы: помню ваши цели, отслеживаю обязательства между сессиями и строю персональный план роста. Сохранить этот прогресс?",
    ui: {
      title: "Ваша AI-коуч-сессия",
      sub: "Структурированный коучинговый разговор. Без аккаунта и ожидания — начните там, где вы есть.",
      start: "Начать сессию",
      resume: "Продолжить сессию",
      restart: "Начать заново",
      exportLabel: "Скачать резюме",
      typeMessage: "Введите ответ…",
      send: "Отправить",
      voiceOn: "Голос вкл",
      voiceOff: "Голос выкл",
      ctaContinue: "Продолжить исследование",
      ctaSave: "Сохранить прогресс",
      ctaFull: "Получить полную систему коучинга",
      login: "Войти",
      stages: {
        intake: "Начало",
        clarify: "Ясность",
        explore: "Исследование",
        patterns: "Паттерны",
        insight: "Инсайт",
        action: "Действие",
        closure: "Интеграция",
        conversion: "Следующий шаг",
      },
    },
  },

  he: {
    openers: [
      "אני שומע אותך.",
      "זו נקודה חשובה.",
      "תודה על האמון.",
      "בוא/י נישאר כאן לרגע.",
    ],
    mirror: (q) => `אמרת: ״${q}״.`,
    feelingAck: (f) => `אני שם לב למילה ״${f}״ — נשמע שזה כבד לשאת.`,
    intake:
      "ברוכים הבאים. בדקות הקרובות אני המאמן שלך — והמרחב הזה שייך לך.\n\nעל מה תרצה/י לעבוד היום?",
    clarify: [
      "ספר/י לי מה קורה עם זה עכשיו. איך זה נראה בחיי היומיום שלך?",
      "כמה זמן זה נמשך — ואיזה חלק מרגיש הכי קשה?",
    ],
    explore: [
      "כשאת/ה לבד עם זה, מה את/ה מרגיש/ה? ואיפה ההרגשה הזו מופיעה במהלך היום?",
      "מה כבר ניסית? מה עמד בדרך?",
    ],
    patterns:
      "אם מתרחקים לרגע: האם זה מזכיר מעגל שחוזר על עצמו — אולי אמונה שנשמעת כמו ״אני תמיד…״ או ״אני אף פעם…״?",
    insight: (topic, quote) =>
      `הנה מה שבולט לי.\n\nהגעת עם ${topic ? `״${topic}״` : "הסיטואציה הזו"}. אבל בהקשבה קרובה, מרכז הכובד נמצא כאן: ״${quote}״. לעיתים קרובות המנוף האמיתי אינו הסיטואציה עצמה — אלא הדפוס שעוטף אותה. והעובדה שזה עתה קראת לו בשם היא כבר הצעד הראשון.`,
    insightConfirm: "האם זה מתחבר? מה את/ה רואה עכשיו שלא ראית לפני עשרים דקות?",
    action: [
      "בוא/י נהפוך את זה לקונקרטי. מהו צעד אחד קטן — קטן מספיק כדי לבצע אותו ב-24–72 השעות הקרובות — שיקדם את זה?",
      "יפה. מתי בדיוק תעשה/י את זה? ומה הכי סביר שיפריע?",
    ],
    closure: (topic, action, feeling) =>
      `הרשה/י לי לשקף את המפגש.\n\nהגעת עם ${topic ? `״${topic}״` : "משהו שחשוב לך"}. ${feeling ? `בדרך נגעת במשהו אמיתי — גם ״${feeling}״ היה שם. ` : ""}קראת בשם לדפוס שמתחת לפני השטח, והתחייבת לצעד קונקרטי: ״${action}״.\n\nזו עבודה שלמה. היה/י עדין/ה עם עצמך בביצוע — שינוי מצטבר בשקט.`,
    conversion:
      "אם תרצה/י, זה בדיוק מה שאני עושה לאורך זמן בפלטפורמה המלאה: זוכר את המטרות שלך, עוקב אחר התחייבויות בין מפגשים ובונה תוכנית צמיחה אישית. לשמור את ההתקדמות?",
    ui: {
      title: "מפגש האימון שלך עם AI",
      sub: "שיחת אימון מובנית. בלי חשבון ובלי המתנה — מתחילים בדיוק מאיפה שאת/ה נמצא/ת.",
      start: "להתחיל את המפגש",
      resume: "להמשיך את המפגש",
      restart: "להתחיל מחדש",
      exportLabel: "להוריד סיכום",
      typeMessage: "כתבו תשובה…",
      send: "שליחה",
      voiceOn: "קול פועל",
      voiceOff: "קול כבוי",
      ctaContinue: "להמשיך לחקור",
      ctaSave: "לשמור את ההתקדמות",
      ctaFull: "לקבל את מערכת האימון המלאה",
      login: "התחברות",
      stages: {
        intake: "פתיחה",
        clarify: "בהירות",
        explore: "חקירה",
        patterns: "דפוסים",
        insight: "תובנה",
        action: "פעולה",
        closure: "אינטגרציה",
        conversion: "הצעד הבא",
      },
    },
  },
};

export function getPack(locale: EngineLocale): Pack {
  return PACKS[locale] ?? PACKS.en;
}

export function getUi(locale: EngineLocale) {
  return getPack(locale).ui;
}

export function openingMessage(locale: EngineLocale): string {
  return getPack(locale).intake;
}

/* ---------------- engine ---------------- */

export function advance(
  session: EngineSession,
  userInput: string,
  locale: EngineLocale
): { reply: string; session: EngineSession } {
  const p = getPack(locale);
  const s: EngineSession = { ...session, turn: session.turn + 1 };
  const input = userInput.trim();
  const quote = snippet(input);
  if (quote) s.quotes = [...s.quotes, quote];

  const feelingMatch = input.match(FEELING_WORDS[locale]);
  if (feelingMatch) s.feelings = [...s.feelings, feelingMatch[0]];

  const opener = p.openers[s.turn % p.openers.length];
  const mirror = quote.length > 12 ? p.mirror(quote) : "";

  let reply = "";

  switch (s.state) {
    case "intake": {
      s.topic = snippet(input, 80);
      s.state = "clarify";
      s.step = 0;
      reply = `${opener} ${p.clarify[0]}`;
      break;
    }
    case "clarify": {
      if (s.step === 0) {
        s.step = 1;
        reply = `${opener}\n\n${p.clarify[1]}`;
      } else {
        s.state = "explore";
        s.step = 0;
        reply = `${mirror}\n\n${p.explore[0]}`.trim();
      }
      break;
    }
    case "explore": {
      if (s.step === 0) {
        s.step = 1;
        const ack = feelingMatch ? `${p.feelingAck(feelingMatch[0])}\n\n` : `${opener}\n\n`;
        reply = `${ack}${p.explore[1]}`;
      } else {
        s.state = "patterns";
        s.step = 0;
        reply = `${opener}\n\n${p.patterns}`;
      }
      break;
    }
    case "patterns": {
      s.state = "insight";
      s.step = 0;
      const keyQuote = s.quotes[s.quotes.length - 1] ?? quote;
      const insightText = p.insight(s.topic, keyQuote);
      s.insights = [...s.insights, keyQuote];
      reply = `${insightText}\n\n${p.insightConfirm}`;
      break;
    }
    case "insight": {
      s.state = "action";
      s.step = 0;
      reply = `${opener}\n\n${p.action[0]}`;
      break;
    }
    case "action": {
      if (s.step === 0) {
        s.step = 1;
        s.actions = [...s.actions, snippet(input, 120)];
        reply = p.action[1];
      } else {
        s.state = "closure";
        s.step = 0;
        const action = s.actions[0] ?? quote;
        const feeling = s.feelings[0] ?? null;
        reply = p.closure(s.topic, action, feeling);
        s.completed = true;
        // queue conversion as the next coach message
        s.state = "conversion";
        reply = `${reply}\n\n${p.conversion}`;
      }
      break;
    }
    case "closure":
    case "conversion": {
      // post-session: any further input gently loops back to exploration
      s.state = "explore";
      s.step = 0;
      s.completed = true;
      reply = `${opener}\n\n${p.explore[0]}`;
      break;
    }
  }

  return { reply, session: s };
}
