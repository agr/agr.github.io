export const SESSION_LENGTH = 20;

export const kanaRows = [
  ["あ", "い", "う", "え", "お"],
  ["か", "き", "く", "け", "こ"],
  ["さ", "し", "す", "せ", "そ"],
  ["た", "ち", "つ", "て", "と"],
  ["な", "に", "ぬ", "ね", "の"],
  ["は", "ひ", "ふ", "へ", "ほ"],
  ["ま", "み", "む", "め", "も"],
  ["や", "", "ゆ", "", "よ"],
  ["ら", "り", "る", "れ", "ろ"],
  ["わ", "", "ん", "", "を"],
  ["が", "ぎ", "ぐ", "げ", "ご"],
  ["ざ", "じ", "ず", "ぜ", "ぞ"],
  ["だ", "ぢ", "づ", "で", "ど"],
  ["ば", "び", "ぶ", "べ", "ぼ"],
  ["ぱ", "ぴ", "ぷ", "ぺ", "ぽ"],
];

const kana = {
  あ: "a", い: "i", う: "u", え: "e", お: "o",
  か: "ka", き: "ki", く: "ku", け: "ke", こ: "ko",
  さ: "sa", し: "shi", す: "su", せ: "se", そ: "so",
  た: "ta", ち: "chi", つ: "tsu", て: "te", と: "to",
  な: "na", に: "ni", ぬ: "nu", ね: "ne", の: "no",
  は: "ha", ひ: "hi", ふ: "fu", へ: "he", ほ: "ho",
  ま: "ma", み: "mi", む: "mu", め: "me", も: "mo",
  や: "ya", ゆ: "yu", よ: "yo",
  ら: "ra", り: "ri", る: "ru", れ: "re", ろ: "ro",
  わ: "wa", を: "wo", ん: "n",
  が: "ga", ぎ: "gi", ぐ: "gu", げ: "ge", ご: "go",
  ざ: "za", じ: "ji", ず: "zu", ぜ: "ze", ぞ: "zo",
  だ: "da", ぢ: "ji", づ: "zu", で: "de", ど: "do",
  ば: "ba", び: "bi", ぶ: "bu", べ: "be", ぼ: "bo",
  ぱ: "pa", ぴ: "pi", ぷ: "pu", ぺ: "pe", ぽ: "po",
};
const variants = {
  shi: ["shi", "si"], chi: ["chi", "ti"], tsu: ["tsu", "tu"],
  fu: ["fu", "hu"], ji: ["ji", "zi"],
  sha: ["sha", "sya"], shu: ["shu", "syu"], sho: ["sho", "syo"],
  cha: ["cha", "tya", "cya"], chu: ["chu", "tyu", "cyu"], cho: ["cho", "tyo", "cyo"],
  ja: ["ja", "jya", "zya"], ju: ["ju", "jyu", "zyu"], jo: ["jo", "jyo", "zyo"],
};

function tokenize(word) {
  const tokens = [];
  for (let i = 0; i < word.length; i++) {
    const character = word[i];
    if (character === "っ") {
      tokens.push("っ");
      continue;
    }
    let syllable = kana[character];
    if (!syllable) throw new Error(`Unsupported kana: ${character} in ${word}`);
    const small = { ゃ: "a", ゅ: "u", ょ: "o" }[word[i + 1]];
    if (small) {
      if (!["き", "し", "ち", "に", "ひ", "み", "り", "ぎ", "じ", "ぢ", "び", "ぴ"].includes(character)) {
        throw new Error(`Invalid kana combination in ${word}`);
      }
      const stem = { shi: "sh", chi: "ch", ji: "j" }[syllable] ?? `${syllable.slice(0, -1)}y`;
      syllable = stem + small;
      i++;
    }
    tokens.push(syllable);
  }
  return tokens;
}

export function romanize(word) {
  const tokens = tokenize(word);
  return tokens.map((token, i) => {
    const next = tokens[i + 1] ?? "";
    if (token === "っ") {
      if (!/^[bcdfghjklmpqrstvwxyz]/.test(next)) throw new Error(`Invalid small tsu in ${word}`);
      return next.startsWith("ch") ? "t" : next[0];
    }
    if (token === "n" && /^[aiueoy]/.test(next)) return "n'";
    return token;
  }).join("");
}

export function normalizeAnswer(answer) {
  return answer.normalize("NFKC").toLowerCase().trim().replace(/[’‘]/g, "'").replace(/[\s-]/g, "");
}

export function isCorrect(word, answer) {
  const tokens = tokenize(word);
  const pattern = tokens.map((token, i) => {
    const next = tokens[i + 1] ?? "";
    if (token === "っ") return "";
    if (token === "n") {
      if (/^[aiueoy]/.test(next)) return "(?:n'|nn)";
      return /^[bmp]/.test(next) ? "(?:n'|nn|n|m)" : "(?:n'|nn|n)";
    }
    let options = variants[token] ?? [token];
    if (word.includes("ぢ") && token === "ji") options = [...options, "di"];
    if (word.includes("づ") && token === "zu") options = [...options, "du"];
    if (tokens[i - 1] === "っ") {
      options = options.flatMap(option => option.startsWith("ch") ? [`t${option}`, `c${option}`] : [option[0] + option]);
    }
    return `(?:${options.join("|")})`;
  }).join("");
  return new RegExp(`^${pattern}$`).test(normalizeAnswer(answer));
}

export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const OVERLAP_WEIGHTS = { easy: 20, medium: 1.5, hard: 0 };
export const OVERLAP_WINDOW = 3;

export function kanaSet(word) {
  return new Set([...word].filter(character => kana[character]));
}

// Each kana shared with the last few picks adds `overlapWeight` to a candidate's base weight of 1.
function pickWithOverlap(pool, count, overlapWeight, random) {
  const remaining = [...pool];
  const picked = [];
  while (picked.length < count) {
    const window = new Set(picked.slice(-OVERLAP_WINDOW).flatMap(word => [...kanaSet(word.kana)]));
    const weights = remaining.map(word => {
      let shared = 0;
      for (const character of kanaSet(word.kana)) if (window.has(character)) shared++;
      return 1 + overlapWeight * shared;
    });
    let target = random() * weights.reduce((sum, weight) => sum + weight, 0);
    let index = 0;
    while (index < remaining.length - 1 && (target -= weights[index]) >= 0) index++;
    picked.push(remaining.splice(index, 1)[0]);
  }
  return picked;
}

// Keep a rolling history instead of emptying a bag at its boundary.
export function selectSession(dictionary, recent = [], sessionLength = SESSION_LENGTH, { overlapWeight = 0, random = Math.random } = {}) {
  if (!Number.isInteger(sessionLength) || sessionLength < 1) throw new Error("Session length must be a positive integer");
  if (dictionary.length < sessionLength) throw new Error("Not enough words for a session");
  const available = new Set(dictionary.map(word => word.kana));
  const history = [...new Set(recent.filter(word => available.has(word)))];
  const remembered = history.slice(-Math.max(0, dictionary.length - sessionLength));
  const excluded = new Set(remembered);
  const pool = shuffle(dictionary.filter(word => !excluded.has(word.kana)), random);
  const words = overlapWeight > 0 ? pickWithOverlap(pool, sessionLength, overlapWeight, random) : pool.slice(0, sessionLength);
  return { words, recent: [...remembered, ...words.map(word => word.kana)] };
}
