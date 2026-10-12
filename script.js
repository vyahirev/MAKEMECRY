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

// About transitions: fade to black, then reveal actual visual lines.
const ABOUT_CONFIG = { pageFade: 500, blackPause: 100, lineDuration: 500, lineStagger: 70 };
const aboutPage = document.getElementById("about-page");
const aboutHome = document.querySelector(".home");
const aboutOpen = document.getElementById("open-about");
const aboutBack = document.getElementById("close-about");
const aboutTitle = document.getElementById("about-title");
const aboutBackWrap = document.querySelector(".about-back-wrap");
const aboutParagraphs = [...document.querySelectorAll(".about-text p")];
const aboutCopy = aboutParagraphs.map(p => p.textContent);
let aboutState = "home";
let aboutAnimations = [];
let aboutScroll = 0;
const aboutMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const aboutWait = ms => new Promise(resolve => setTimeout(resolve, ms));

function splitAboutLines() {
  aboutParagraphs.forEach((paragraph, index) => {
    paragraph.setAttribute("aria-label", aboutCopy[index]);
    paragraph.replaceChildren();
    const words = aboutCopy[index].split(" ").map((word, i) => {
      const span = document.createElement("span");
      span.textContent = (i ? " " : "") + word;
      paragraph.append(span);
      return span;
    });
    const lines = [];
    let lastTop;
    words.forEach(word => {
      const range = document.createRange();
      range.selectNodeContents(word);
      const rects = [...range.getClientRects()];
      const top = rects[rects.length - 1]?.top;
      if (lastTop === undefined || Math.abs(top - lastTop) > 2) lines.push([]);
      lines[lines.length - 1].push(word.textContent.trim());
      lastTop = top;
    });
    paragraph.replaceChildren(...lines.map(words => {
      const line = document.createElement("span");
      line.className = "about-line";
      line.setAttribute("aria-hidden", "true");
      line.textContent = words.join(" ");
      return line;
    }));
  });
}

// Sample Figma's spring (mass 1, stiffness 80, damping 20).
function aboutSpringFrames() {
  const r1 = (-20 + Math.sqrt(80)) / 2;
  const r2 = (-20 - Math.sqrt(80)) / 2;
  const progress = t => 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1);
  const end = progress(0.5);
  return Array.from({ length: 41 }, (_, i) => {
    const value = progress(i / 40 * 0.5) / end;
    return { offset: i / 40, opacity: value, transform: `translateY(${-16 * (1 - value)}px)` };
  });
}

async function animateAbout(entering) {
  aboutAnimations.forEach(animation => animation.cancel());
  const lines = [...aboutPage.querySelectorAll(".about-line")];
  const items = [aboutTitle, ...lines, aboutBackWrap];
  const frames = aboutSpringFrames();
  aboutAnimations = items.map((element, index) => {
    let delay = index === 0 ? 201 : index === items.length - 1
      ? Math.max(1000, 300 + lines.length * ABOUT_CONFIG.lineStagger)
      : 300 + (index - 1) * ABOUT_CONFIG.lineStagger;
    if (!entering) delay = (items.length - 1 - index) * 40;
    return element.animate(entering ? frames : frames.slice().reverse().map((frame, i) => ({ ...frame, offset: i / 40 })), {
      duration: aboutMotion.matches ? 0 : index === 0 ? 750 : ABOUT_CONFIG.lineDuration,
      delay: aboutMotion.matches ? 0 : delay,
      fill: "both",
    });
  });
  await Promise.all(aboutAnimations.map(animation => animation.finished));
}

async function showAbout() {
  if (aboutState !== "home" || document.documentElement.classList.contains("intro-active")) return;
  aboutState = "opening";
  aboutScroll = window.scrollY;
  aboutHome.inert = true;
  document.documentElement.classList.add("about-active");
  const fade = aboutHome.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: aboutMotion.matches ? 0 : ABOUT_CONFIG.pageFade, easing: "ease-out", fill: "forwards",
  });
  await fade.finished;
  aboutHome.style.opacity = "0";
  fade.cancel();
  aboutHome.style.visibility = "hidden";
  if (!aboutMotion.matches) await aboutWait(ABOUT_CONFIG.blackPause);
  aboutPage.hidden = false;
  splitAboutLines();
  await animateAbout(true);
  aboutPage.inert = false;
  aboutState = "about";
  aboutBack.focus({ preventScroll: true });
}

async function hideAbout() {
  if (aboutState !== "about") return;
  aboutState = "closing";
  aboutPage.inert = true;
  await animateAbout(false);
  aboutPage.hidden = true;
  aboutAnimations.forEach(animation => animation.cancel());
  aboutAnimations = [];
  aboutPage.scrollTop = 0;
  if (!aboutMotion.matches) await aboutWait(ABOUT_CONFIG.blackPause);
  aboutHome.style.visibility = "";
  const fade = aboutHome.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: aboutMotion.matches ? 0 : ABOUT_CONFIG.pageFade, easing: "ease-out", fill: "forwards",
  });
  await fade.finished;
  aboutHome.style.opacity = "";
  fade.cancel();
  aboutHome.inert = false;
  document.documentElement.classList.remove("about-active");
  window.scrollTo(0, aboutScroll);
  aboutState = "home";
  aboutOpen.focus({ preventScroll: true });
}

aboutOpen.addEventListener("click", showAbout);
aboutBack.addEventListener("click", hideAbout);
aboutPage.addEventListener("keydown", event => {
  if (event.key === "Escape") { event.preventDefault(); hideAbout(); }
  // The dialog has one interactive element: keep keyboard focus on Back.
  if (event.key === "Tab") { event.preventDefault(); aboutBack.focus(); }
});
let aboutResize;
window.addEventListener("resize", () => {
  clearTimeout(aboutResize);
  aboutResize = setTimeout(() => {
    if (aboutState !== "about") return;
    splitAboutLines();
    aboutPage.querySelectorAll(".about-line").forEach(line => { line.style.opacity = "1"; });
  }, 100);
});
