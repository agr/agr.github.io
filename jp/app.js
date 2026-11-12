import { dictionaries } from "./dictionary.js";
import { OVERLAP_WEIGHTS, SESSION_LENGTH, kanaRows, romanize, isCorrect, normalizeAnswer, selectSession } from "./engine.js";

const main = document.querySelector("#main");
const chart = document.querySelector("#chart-dialog");
const chartButton = document.querySelector("#chart-open");
const storageKey = "kana-daily-history-v1";
const fontStorageKey = "kana-daily-font-v1";
const typefaces = [
  { id: "klee", name: "Klee One", style: "Handwriting", family: '"Klee One", "Yu Kyokasho", "UD Digi Kyokasho N-R", serif' },
  { id: "sans", name: "Noto Sans JP", style: "Modern print", family: '"Noto Sans JP", sans-serif' },
  { id: "serif", name: "Noto Serif JP", style: "Traditional print", family: '"Noto Serif JP", serif' },
  { id: "rounded", name: "Zen Maru Gothic", style: "Rounded print", family: '"Zen Maru Gothic", sans-serif' },
  { id: "yomogi", name: "Yomogi", style: "Casual handwriting", family: '"Yomogi", "Yu Kyokasho", cursive' },
];
const levels = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};
let level = "easy";
let sessionLength = SESSION_LENGTH;
let session = null;
let definitionVisible = false;
let history = loadHistory();
let fontPreference = loadFontPreference();
let currentFont = typefaces[0];

function loadFontPreference() {
  try {
    const stored = localStorage.getItem(fontStorageKey) ?? "klee";
    if (stored !== "random" && !typefaces.some(font => font.id === stored)) throw new Error("Invalid font preference");
    return stored;
  } catch (error) {
    console.warn("Could not load Kana Daily font preference:", error);
    notify("Your font preference couldn't be loaded. Using Klee One for now.");
    return "klee";
  }
}

function applyFont() {
  if (fontPreference === "random") {
    const choices = typefaces.filter(font => font.id !== currentFont.id);
    currentFont = choices[Math.floor(Math.random() * choices.length)];
  } else {
    currentFont = typefaces.find(font => font.id === fontPreference);
  }
  document.documentElement.style.setProperty("--font-japanese", currentFont.family);
}

function notify(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.hidden = false;
  window.setTimeout(() => { toast.hidden = true; }, 6500);
}

function loadHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    if (!stored || typeof stored !== "object" || Array.isArray(stored)) throw new Error("Invalid history");
    for (const value of Object.values(stored)) {
      if (!Array.isArray(value) || !value.every(word => typeof word === "string")) throw new Error("Invalid history");
    }
    return stored;
  } catch (error) {
    console.warn("Could not load Kana Daily word history:", error);
    notify("Word history is unavailable. Practice still works, but words may repeat between visits.");
    return {};
  }
}

function saveHistory() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(history));
  } catch (error) {
    console.warn("Could not save Kana Daily word history:", error);
    notify("Your browser couldn't save word history. Words may repeat on your next visit.");
  }
}

function icon(name) {
  const paths = {
    sprout: '<path d="M12 21v-9M12 15C4 15 3 10 3 6c7 0 9 4 9 9Zm0-3c0-6 4-9 9-9 0 5-3 9-9 9Z"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
}

function home() {
  session = null;
  document.body.classList.remove("practicing");
  document.body.classList.add("home-screen");
  chartButton.hidden = false;
  applyFont();
  main.innerHTML = `
    <section class="home-layout">
      <h1 class="visually-hidden">Kana Daily</h1>
      <div class="start-card">
        <fieldset class="difficulty-options"><legend>Difficulty</legend>
          <div class="difficulty-choices">
            ${Object.entries(levels).map(([key, label]) => `
              <label class="difficulty-option">
                <input class="visually-hidden" type="radio" name="difficulty" value="${key}" ${key === level ? "checked" : ""}>
                <span>${label}</span>
              </label>`).join("")}
          </div>
        </fieldset>
        <fieldset class="session-length-options"><legend>Session length</legend>
          <div class="difficulty-choices">
            ${[5, 10, SESSION_LENGTH].map(length => `
              <label class="session-length-option">
                <input class="visually-hidden" type="radio" name="session-length" value="${length}" ${length === sessionLength ? "checked" : ""}>
                <span>${length}</span>
              </label>`).join("")}
          </div>
        </fieldset>
        <div class="font-choice">
          <label for="font-select">Hiragana font</label>
          <select id="font-select">
            ${typefaces.map(font => `<option value="${font.id}" ${fontPreference === font.id ? "selected" : ""}>${font.name} — ${font.style}</option>`).join("")}
            <option value="random" ${fontPreference === "random" ? "selected" : ""}>Random per word</option>
          </select>
          <div class="font-preview" lang="ja" aria-hidden="true">り き さ ふ</div>
        </div>
        <button id="start" class="primary-button">Start</button>
      </div>
    </section>`;
  document.querySelectorAll('input[name="difficulty"]').forEach(input => {
    input.addEventListener("change", () => { level = input.value; });
  });
  document.querySelectorAll('input[name="session-length"]').forEach(input => {
    input.addEventListener("change", () => { sessionLength = Number(input.value); });
  });
  document.querySelector("#font-select").addEventListener("change", event => {
    fontPreference = event.target.value;
    applyFont();
    try {
      localStorage.setItem(fontStorageKey, fontPreference);
    } catch (error) {
      console.warn("Could not save Kana Daily font preference:", error);
      notify("Your font choice works for this visit, but couldn't be saved.");
    }
  });
  document.querySelector("#start").addEventListener("click", startSession);
}

function startSession() {
  const selected = selectSession(dictionaries[level], history[level] ?? [], sessionLength, { overlapWeight: OVERLAP_WEIGHTS[level] });
  history[level] = selected.recent;
  saveHistory();
  session = { words: selected.words, length: sessionLength, index: 0, answers: [], checked: false };
  document.body.classList.remove("home-screen");
  document.body.classList.add("practicing");
  chartButton.hidden = level !== "easy";
  main.innerHTML = `
    <section class="practice" aria-label="Hiragana practice">
      <div class="practice-top"><button id="end-session" class="text-button">← End session</button><span class="level-pill">${levels[level]}</span><span id="question-count"></span></div>
      <div class="progress-track" role="progressbar" aria-label="Session progress" aria-valuemin="0" aria-valuemax="${session.length}" aria-valuenow="0"><div id="progress-fill"></div></div>
      <div class="word-area">
        <p class="eyebrow practice-eyebrow">HOW DO YOU READ THIS WORD?</p>
        <h1 id="practice-word" lang="ja"></h1>
        <div class="definition-area"><button id="definition-toggle" class="definition-button" aria-expanded="false" aria-controls="definition">Show meaning <span aria-hidden="true">+</span></button><p id="definition" hidden></p></div>
      </div>
      <div id="answer-feedback" class="answer-feedback" role="status" aria-live="polite"></div>
      <form id="answer-form" class="answer-form" autocomplete="off">
        <label for="answer">Your answer <span>in Latin letters (romaji)</span></label>
        <div class="answer-controls"><input id="answer" name="answer" type="text" inputmode="text" enterkeyhint="go" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="Type the sounds…" maxlength="120" aria-describedby="typing-tip answer-feedback" required><button id="check-answer" class="primary-button" type="submit">Check ${icon("arrow")}</button></div>
        <p id="typing-tip" class="typing-tip">Write every vowel: こう → kou. <span>Press Enter to check.</span></p>
      </form>
    </section>`;
  document.querySelector("#answer-form").addEventListener("submit", submitAnswer);
  document.querySelector("#definition-toggle").addEventListener("click", toggleDefinition);
  document.querySelector("#end-session").addEventListener("click", () => {
    if (window.confirm("End this session? Your current score will not be saved.")) home();
  });
  showQuestion();
}

function showQuestion() {
  session.checked = false;
  definitionVisible = false;
  applyFont();
  const word = session.words[session.index];
  document.querySelector("#practice-word").textContent = word.kana;
  document.querySelector("#practice-word").classList.toggle("long-word", word.kana.length >= 7);
  document.querySelector("#question-count").textContent = `${session.index + 1} / ${session.length}`;
  document.querySelector("#progress-fill").style.width = `${session.index / session.length * 100}%`;
  document.querySelector(".progress-track").setAttribute("aria-valuenow", session.index);
  document.querySelector("#definition").textContent = word.meaning;
  updateDefinition();
  const feedback = document.querySelector("#answer-feedback");
  feedback.textContent = "";
  feedback.className = "answer-feedback";
  const input = document.querySelector("#answer");
  input.value = "";
  input.readOnly = false;
  input.removeAttribute("aria-invalid");
  input.className = "";
  document.querySelector("#check-answer").innerHTML = `Check ${icon("arrow")}`;
  input.focus({ preventScroll: true });
}

function toggleDefinition() {
  definitionVisible = !definitionVisible;
  updateDefinition();
}

function updateDefinition() {
  const button = document.querySelector("#definition-toggle");
  button.innerHTML = `${definitionVisible ? "Hide" : "Show"} meaning <span aria-hidden="true">${definitionVisible ? "−" : "+"}</span>`;
  button.setAttribute("aria-expanded", String(definitionVisible));
  document.querySelector("#definition").hidden = !definitionVisible;
}

function submitAnswer(event) {
  event.preventDefault();
  if (session.checked) {
    session.index++;
    if (session.index === session.length) showResults();
    else showQuestion();
    return;
  }
  const input = document.querySelector("#answer");
  if (!normalizeAnswer(input.value)) {
    input.setCustomValidity("Type a transcription before checking your answer.");
    input.reportValidity();
    input.addEventListener("input", () => input.setCustomValidity(""), { once: true });
    return;
  }
  const word = session.words[session.index];
  const correct = isCorrect(word.kana, input.value);
  session.answers.push({ ...word, answer: input.value.trim(), correct, romaji: romanize(word.kana), font: currentFont });
  session.checked = true;
  input.readOnly = true;
  input.setAttribute("aria-invalid", String(!correct));
  input.className = correct ? "input-correct" : "input-incorrect";
  const feedback = document.querySelector("#answer-feedback");
  feedback.classList.add(correct ? "correct" : "incorrect");
  feedback.innerHTML = `<span class="feedback-symbol" role="img" aria-label="${correct ? "Correct" : "Incorrect"}">${correct ? "✓" : "↗"}</span><div><span></span></div>`;
  feedback.querySelector(":scope > div > span").textContent = `${romanize(word.kana)} — ${word.meaning}`;
  document.querySelector("#check-answer").innerHTML = `${session.index === session.length - 1 ? "Results" : "Next"} ${icon("arrow")}`;
}

function showResults() {
  document.body.classList.remove("practicing");
  const answers = session.answers;
  const correct = answers.filter(answer => answer.correct).length;
  const incorrect = session.length - correct;
  main.innerHTML = `
    <section class="results">
      <div class="results-badge">${icon("check")}</div>
      <p class="eyebrow">SESSION COMPLETE · ${levels[level].toUpperCase()}</p>
      <div class="score-card"><div class="score-total"><strong>${correct}<span> / ${session.length}</span></strong><span>words read correctly</span></div><div class="score-breakdown"><span><i class="score-dot good"></i><strong>${correct}</strong> correct</span><span><i class="score-dot missed"></i><strong>${incorrect}</strong> incorrect</span></div></div>
      <button id="back-home" class="primary-button">Back to the start ${icon("arrow")}</button>
      <details class="review"><summary>Review your ${incorrect ? `${incorrect} missed ${incorrect === 1 ? "word" : "words"}` : "answers"} <span>+</span></summary><div id="review-list"></div></details>
    </section>`;
  const review = document.querySelector("#review-list");
  for (const answer of incorrect ? answers.filter(answer => !answer.correct) : answers) {
    const row = document.createElement("div");
    row.className = "review-row";
    const japanese = document.createElement("div");
    const kana = document.createElement("strong");
    kana.lang = "ja";
    kana.style.setProperty("--font-japanese", answer.font.family);
    kana.textContent = answer.kana;
    const meaning = document.createElement("span");
    meaning.textContent = answer.meaning;
    japanese.append(kana, meaning);
    const transcription = document.createElement("div");
    const expected = document.createElement("strong");
    expected.textContent = answer.romaji;
    transcription.append(expected);
    if (!answer.correct) {
      const attempt = document.createElement("span");
      attempt.textContent = `You typed: ${answer.answer}`;
      transcription.append(attempt);
    }
    row.append(japanese, transcription);
    review.append(row);
  }
  document.querySelector("#back-home").addEventListener("click", home);
  document.querySelector(".results .eyebrow").setAttribute("tabindex", "-1");
  document.querySelector(".results .eyebrow").focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

document.querySelector("#chart-grid").innerHTML = kanaRows.flat().map(character =>
  character ? `<div><span lang="ja">${character}</span><small>${romanize(character)}</small></div>` : '<div class="empty-kana"></div>',
).join("");
chartButton.addEventListener("click", () => chart.showModal());
document.querySelector("#chart-close").addEventListener("click", () => chart.close());
chart.addEventListener("click", event => { if (event.target === chart) chart.close(); });
document.querySelector(".brand").addEventListener("click", event => {
  event.preventDefault();
  if (!session || session.index === session.length || window.confirm("Leave this session and return to the start?")) home();
});

let lastTouch = null;
document.addEventListener("touchstart", event => {
  lastTouch = event.touches.length === 1 ? event.touches[0] : null;
}, { passive: true });
document.addEventListener("touchend", () => { lastTouch = null; });
document.addEventListener("touchcancel", () => { lastTouch = null; });
document.addEventListener("touchmove", event => {
  const previous = lastTouch;
  lastTouch = event.touches.length === 1 ? event.touches[0] : null;
  if (!previous || !lastTouch || !document.body.classList.contains("practicing") || window.visualViewport?.scale > 1) return;

  const deltaY = previous.clientY - lastTouch.clientY;
  const deltaX = previous.clientX - lastTouch.clientX;
  const target = event.target instanceof Element ? event.target : null;
  if (Math.abs(deltaX) > Math.abs(deltaY) && target?.closest("#answer")) return;

  const scroller = target?.closest("#chart-dialog[open], .practice");
  const maxScroll = scroller ? scroller.scrollHeight - scroller.clientHeight : 0;
  const canScroll = maxScroll > 1 && (
    (deltaY > 0 && scroller.scrollTop < maxScroll - 1) ||
    (deltaY < 0 && scroller.scrollTop > 1)
  );
  // Safari can pan the document behind the keyboard even with overflow hidden.
  if (!canScroll && event.cancelable) event.preventDefault();
}, { passive: false });

let viewportFrame = 0;
function updateViewport() {
  viewportFrame = 0;
  const viewport = window.visualViewport;
  const top = viewport?.pageTop ?? window.scrollY + (viewport?.offsetTop ?? 0);
  document.documentElement.style.setProperty("--viewport-height", `${viewport?.height ?? window.innerHeight}px`);
  document.documentElement.style.setProperty("--viewport-top", `${Math.max(0, top)}px`);
}
function scheduleViewportUpdate() {
  if (!viewportFrame) viewportFrame = requestAnimationFrame(updateViewport);
}
window.visualViewport?.addEventListener("resize", scheduleViewportUpdate);
window.visualViewport?.addEventListener("scroll", scheduleViewportUpdate);
window.addEventListener("resize", scheduleViewportUpdate);
window.addEventListener("scroll", scheduleViewportUpdate, { passive: true });
updateViewport();
home();
