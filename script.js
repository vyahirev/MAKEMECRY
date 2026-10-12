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
