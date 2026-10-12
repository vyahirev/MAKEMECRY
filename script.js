// Loading Intro settings (milliseconds).
const LOADING_CONFIG = {
  typingSpeed: 50,
  textPause: 700,
  fadeDuration: 500,
  maxLoadWait: 5000,
};

const loadingMessages = [
  // EXISTENTIAL CRISIS
  "am i alive ?",
  "is this real ?",
  "who am i ?",
  "what am i doing here ?",
  "does it even matter ?",
  "nothing feels real anymore",
  "i think i lost myself",
  "where did i go wrong ?",
  "i don't belong here",
  "i wish i was someone else",

  // LOVE / PAIN
  "would you cry for me ?",
  "i wish you were here",
  "please don't forget me",
  "i miss someone i never met",
  "can you feel me ?",
  "i want to be loved",
  "hold me until i disappear",
  "you feel like home",
  "i think i love you",
  "don't let me go",
  "i hope you're happy",
  "we were almost something",
  "i wish we had more time",

  // SELF-IMAGE
  "i hate my reflection",
  "i'm not who i want to be",
  "i want to start over",
  "i wish i looked different",
  "i'm trying to change",
  "i don't recognize myself",
  "maybe tomorrow i'll be better",
  "i'm still becoming someone",
  "i was never enough",
  "i want to feel beautiful",
  "please let me be someone",

  // DIGITAL DECAY
  "connection lost",
  "feelings not found",
  "404 : happiness not found",
  "waiting for something",
  "still loading myself",
  "no signal from heaven",
  "please wait forever",
  "reality.exe has stopped working",
  "trying to feel something",
  "memory corrupted",
  "are you still there ?",
  "nothing to display",
  "human error",

  // POETIC NONSENSE
  "the sky looks lonely today",
  "heaven smells like cigarettes",
  "i left my heart somewhere",
  "the moon knows everything",
  "everything smells like rain",
  "angels don't sleep",
  "i think the stars are dying",
  "kiss me before the world ends",
  "i was born in the wrong dream",
  "god forgot my name",
  "the world is a beautiful mistake",
  "somewhere, someone is crying",
  "i hope the flowers remember me",

  // MAKE(ME)CRY
  "make me cry",
  "make me feel something",
  "make something beautiful",
  "beautiful things hurt",
  "crying is beautiful",
  "your tears look like heaven",
  "we all hurt someone",
  "love me or ruin me",
  "welcome to my little world",
  "nothing beautiful lasts forever",
  "i hope i make you feel something",
  "this is not a love story",
  "thank you for existing"
];

async function playLoadingIntro() {
  const intro = document.getElementById("loading-intro");
  const text = document.getElementById("loading-message");
  const home = document.querySelector(".home");
  if (!intro || !document.documentElement.classList.contains("intro-active")) return;
  home.inert = true;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  let previous = -1;
  try {
    const saved = sessionStorage.getItem("makemecry:last-loading-message");
    if (saved !== null) previous = Number(saved);
  } catch { /* Storage may be unavailable in private/restricted contexts. */ }
  const hasPrevious = Number.isInteger(previous) && previous >= 0 && previous < loadingMessages.length;
  let index = Math.floor(Math.random() * (loadingMessages.length - (hasPrevious ? 1 : 0)));
  if (hasPrevious && index >= previous) index++;
  try { sessionStorage.setItem("makemecry:last-loading-message", String(index)); } catch {}
  const message = loadingMessages[index];

  // Wait only for the local hero, logo and font, with a bounded deadline.
  const hero = new Image();
  hero.src = "images/img-1.JPG";
  const logo = document.querySelector(".logo");
  const resources = Promise.allSettled([
    hero.decode(),
    logo.decode(),
    document.fonts.load('10px "Fliege Mono"'),
  ]);
  let loadTimeout;
  const deadline = new Promise(resolve => {
    loadTimeout = setTimeout(resolve, Math.max(0, LOADING_CONFIG.maxLoadWait - performance.now()));
  });
  const ready = Promise.race([resources, deadline]).then(() => clearTimeout(loadTimeout));
  try {
    if (reducedMotion) {
      text.textContent = message;
      await wait(200);
    } else {
      for (let count = 0; count <= message.length; count++) {
        text.textContent = message.slice(0, count);
        text.dataset.remaining = message.slice(count);
        if (count < message.length) await wait(LOADING_CONFIG.typingSpeed);
      }
      await wait(LOADING_CONFIG.textPause);
    }
    await ready;
    if (!intro.isConnected) return;
    const fadeDuration = reducedMotion ? 0 : LOADING_CONFIG.fadeDuration;
    intro.style.setProperty("--intro-fade-duration", `${fadeDuration}ms`);
    document.documentElement.classList.add("intro-revealing");
    intro.classList.add("is-leaving");
    await wait(fadeDuration);
  } finally {
    clearTimeout(loadTimeout);
    clearTimeout(window.introWatchdog);
    intro.remove();
    home.inert = false;
    document.documentElement.classList.remove("intro-active", "intro-revealing");
  }
}

playLoadingIntro().catch(console.error);

const dateElement = document.getElementById("date");
const clockElement = document.getElementById("clock");
const yearElement = document.getElementById("year");
const timeZone = "Europe/Moscow";
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone, weekday: "long", month: "long", day: "numeric", year: "numeric",
});
const clockFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
});
const yearFormatter = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric" });

function updateClock() {
  const now = new Date();
  dateElement.textContent = dateFormatter.format(now);
  clockElement.textContent = `MSK ${clockFormatter.format(now)}`;
  dateElement.dateTime = now.toISOString();
  clockElement.dateTime = now.toISOString();
  yearElement.textContent = yearFormatter.format(now);
}

updateClock();
setInterval(updateClock, 1000);
