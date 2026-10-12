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

// Shared About, Gallery and Socials transitions.
const ABOUT_CONFIG = { pageFade: 500, blackPause: 100, lineDuration: 500, lineStagger: 70 };
const pageHome = document.querySelector(".home");
const pageMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const pageWait = ms => new Promise(resolve => setTimeout(resolve, ms));
const pages = Object.fromEntries(["about", "gallery", "socials"].map(key => {
  const element = document.getElementById(`${key}-page`);
  const paragraphs = [...element.querySelectorAll(".about-text p")];
  return [key, { key, element, paragraphs, copy: paragraphs.map(p => p.textContent),
    title: element.querySelector(".about-title"), backWrap: element.querySelector(".about-back-wrap"),
    back: document.getElementById(`close-${key}`), open: document.getElementById(`open-${key}`), animations: [] }];
}));
let pageState = "home";
let activePage = null;
let pageScroll = 0;

function splitPageLines(view) {
  view.paragraphs.forEach((paragraph, index) => {
    paragraph.setAttribute("aria-label", view.copy[index]);
    paragraph.replaceChildren();
    const words = view.copy[index].split(" ").map((word, i) => {
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

function pageSpringFrames() {
  const r1 = (-20 + Math.sqrt(80)) / 2;
  const r2 = (-20 - Math.sqrt(80)) / 2;
  const progress = t => 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1);
  const end = progress(0.5);
  return Array.from({ length: 41 }, (_, i) => {
    const value = progress(i / 40 * 0.5) / end;
    return { offset: i / 40, opacity: value, transform: `translateY(${-16 * (1 - value)}px)` };
  });
}


async function animatePage(view, entering) {
  view.animations.forEach(animation => animation.cancel());
  const lines = [...view.element.querySelectorAll(".about-line")];
  const links = [...view.element.querySelectorAll(".social-link-wrap")];
  const items = [view.title, ...lines, ...links, view.backWrap];
  const frames = pageSpringFrames();
  view.animations = items.map((element, index) => {
    const isBack = element === view.backWrap;
    const isLink = links.includes(element);
    let delay = index === 0 ? 201 : isBack ? Math.max(1000, 300 + lines.length * ABOUT_CONFIG.lineStagger)
      : isLink ? 400 + links.indexOf(element) * 200 : 300 + (index - 1) * ABOUT_CONFIG.lineStagger;
    if (!entering) delay = (items.length - 1 - index) * 40;
    let keyframes = isBack ? [{ opacity: 0, offset: 0 }, { opacity: 1, offset: 1 }]
      : isLink ? frames.map(frame => ({ ...frame, transform: frame.transform.replace(/translateY\(-/, "translateY(") })) : frames;
    if (!entering) keyframes = keyframes.slice().reverse().map((frame, i, array) => ({ ...frame, offset: i / (array.length - 1) }));
    return element.animate(keyframes, {
      duration: pageMotion.matches ? 0 : index === 0 ? 750 : view.key === "gallery" && !isBack ? 1000 : ABOUT_CONFIG.lineDuration,
      delay: pageMotion.matches ? 0 : delay, fill: "both", easing: isBack ? "ease-out" : "linear",
    });
  });
  await Promise.all(view.animations.map(animation => animation.finished));
}

async function fadeHome(entering) {
  const animation = pageHome.animate([{ opacity: entering ? 0 : 1 }, { opacity: entering ? 1 : 0 }], {
    duration: pageMotion.matches ? 0 : ABOUT_CONFIG.pageFade, easing: "ease-out", fill: "forwards",
  });
  await animation.finished;
  pageHome.style.opacity = entering ? "" : "0";
  animation.cancel();
}

function restoreHome(view) {
  view.animations.forEach(animation => animation.cancel());
  view.animations = [];
  view.element.hidden = true;
  view.element.inert = true;
  pageHome.style.opacity = "";
  pageHome.style.visibility = "";
  pageHome.inert = false;
  document.documentElement.classList.remove("about-active");
  window.scrollTo(0, pageScroll);
  activePage = null;
  pageState = "home";
  view.open.focus({ preventScroll: true });
}

async function showPage(view) {
  if (pageState !== "home" || document.documentElement.classList.contains("intro-active")) return;
  pageState = "opening";
  activePage = view;
  pageScroll = window.scrollY;
  pageHome.inert = true;
  document.documentElement.classList.add("about-active");
  try {
    await fadeHome(false);
    pageHome.style.visibility = "hidden";
    if (!pageMotion.matches) await pageWait(ABOUT_CONFIG.blackPause);
    view.element.hidden = false;
    splitPageLines(view);
    await animatePage(view, true);
    view.element.inert = false;
    pageState = "open";
    view.back.focus({ preventScroll: true });
  } catch (error) { restoreHome(view); console.error(error); }
}

async function hidePage(view) {
  if (pageState !== "open" || activePage !== view) return;
  pageState = "closing";
  view.element.inert = true;
  try {
    await animatePage(view, false);
    view.element.hidden = true;
    view.element.scrollTop = 0;
    if (!pageMotion.matches) await pageWait(ABOUT_CONFIG.blackPause);
    pageHome.style.visibility = "";
    await fadeHome(true);
  } finally { restoreHome(view); }
}

Object.values(pages).forEach(view => {
  view.open.addEventListener("click", () => showPage(view));
  view.back.addEventListener("click", () => hidePage(view));
  view.element.addEventListener("keydown", event => {
    if (event.key === "Escape") { event.preventDefault(); hidePage(view); }
    if (event.key === "Tab") {
      const controls = [...view.element.querySelectorAll("a[href], button")];
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
});
let pageResize;
window.addEventListener("resize", () => {
  clearTimeout(pageResize);
  pageResize = setTimeout(() => {
    if (pageState !== "open") return;
    splitPageLines(activePage);
    activePage.element.querySelectorAll(".about-line").forEach(line => { line.style.opacity = "1"; });
  }, 100);
});
