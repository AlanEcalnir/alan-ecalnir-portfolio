// Mobile navigation (hamburger menu)
const menuBtn = document.querySelector(".menu-btn");
const menu = document.getElementById("menu");

function setMenu(open) {
  menu.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
}

menuBtn.addEventListener("click", () => {
  setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
});

// Close after choosing a link
menu.addEventListener("click", (e) => {
  if (e.target.closest("a")) setMenu(false);
});

// Close with Escape and return focus to the button
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menu.classList.contains("open")) {
    setMenu(false);
    menuBtn.focus();
  }
});

// Scroll effects: reveal on scroll, active link, progress bar, back to top
const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!calm && "IntersectionObserver" in window) {
  const reveal = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          setTimeout(() => (e.target.style.transitionDelay = ""), 900);
          reveal.unobserve(e.target);
        }
      }),
    { threshold: 0.1 },
  );
  document.querySelectorAll("main section:not(.hero), .card, figure").forEach((el) => {
    el.classList.add("reveal");
    el.style.transitionDelay = Math.min([...el.parentElement.children].indexOf(el), 5) * 70 + "ms";
    reveal.observe(el);
  });
}

const spyLinks = [...document.querySelectorAll('.menu a[href^="#"]')];
if (spyLinks.length && "IntersectionObserver" in window) {
  const spy = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        spyLinks.forEach((a) => {
          if (a.getAttribute("href") === "#" + e.target.id)
            a.setAttribute("aria-current", "location");
          else a.removeAttribute("aria-current");
        });
      }),
    { rootMargin: "-45% 0px -50% 0px" },
  );
  spyLinks.forEach((a) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (target) spy.observe(target);
  });
}

const bar = document.createElement("div");
bar.className = "progress";
bar.setAttribute("aria-hidden", "true");
const topBtn = document.createElement("button");
topBtn.className = "to-top";
topBtn.type = "button";
topBtn.setAttribute("aria-label", "Back to top");
topBtn.textContent = "↑";
document.body.append(bar, topBtn);
topBtn.addEventListener("click", () => scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" }));

function onScroll() {
  const max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  bar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
  topBtn.classList.toggle("show", scrollY > 600);
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Click a screenshot to enlarge it (native dialog: Esc closes)
const shots = document.querySelectorAll("figure img");
if (shots.length) {
  const box = document.createElement("dialog");
  box.className = "lightbox";
  box.innerHTML = '<img alt=""><button type="button" aria-label="Close image">×</button>';
  document.body.append(box);
  const big = box.querySelector("img");
  shots.forEach((img) => {
    const open = () => {
      big.src = img.src;
      big.alt = img.alt;
      box.showModal();
    };
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.title = "Click to enlarge";
    img.addEventListener("click", open);
    img.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  });
  box.addEventListener("click", () => box.close());
}

// Soft glow that follows the pointer
if (!calm && matchMedia("(pointer: fine)").matches) {
  addEventListener(
    "pointermove",
    (e) => {
      document.body.style.setProperty("--mx", e.clientX + "px");
      document.body.style.setProperty("--my", e.clientY + "px");
    },
    { passive: true },
  );
}

// Count up the highlight numbers when they scroll into view
document.querySelectorAll(".stats b").forEach((el) => {
  const m = el.textContent.match(/^\d+/);
  if (!m || calm || !("IntersectionObserver" in window)) return;
  const end = Number(m[0]);
  const rest = el.textContent.slice(m[0].length);
  el.textContent = "0" + rest;
  const counter = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    counter.disconnect();
    const start = performance.now();
    (function step(now) {
      const p = Math.min((now - start) / 900, 1);
      el.textContent = Math.round(end * p) + rest;
      if (p < 1) requestAnimationFrame(step);
    })(start);
  });
  counter.observe(el);
});

// Light / dark theme toggle (remembered in this browser)
const themeBtn = document.querySelector(".theme-btn");
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeBtn.textContent = theme === "light" ? "☾ Dark" : "☀ Light";
  try {
    localStorage.setItem("theme", theme);
  } catch (e) {}
}
setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
themeBtn.addEventListener("click", () => {
  setTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
});

// Copy email button
document.querySelectorAll("[data-copy]").forEach((btn) => {
  const note = btn.nextElementSibling;
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      note.textContent = "Copied!";
    } catch (e) {
      note.textContent = "Copy failed. Select the email text instead.";
    }
    setTimeout(() => (note.textContent = ""), 2000);
  });
});

// Scrolling strip of tools under the hero (decorative)
const toolLists = [...document.querySelectorAll("#about .chips")].slice(0, 2);
const heroSection = document.querySelector(".hero");
if (heroSection && toolLists.length) {
  const names = toolLists.flatMap((ul) => [...ul.children].map((li) => li.textContent.trim()));
  const items = names.map((n) => `<span>${n}</span>`).join("");
  const strip = document.createElement("div");
  strip.className = "marquee";
  strip.setAttribute("aria-hidden", "true");
  strip.innerHTML = `<div class="track">${items}${items}</div>`;
  heroSection.after(strip);
}

// CCSRMS sample: pick a day, click a time for free rooms, click a slot to flip it
const demo = document.getElementById("demo");
if (demo) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const rooms = ["407", "408", "409", "503", "504"];
  const times = ["7AM", "9AM", "11AM", "1PM", "3PM", "5PM"];
  const state = days.map((_, d) =>
    rooms.map((_, r) => times.map((_, t) => (d * 3 + r * 5 + t * 2) % 4 === 0)),
  );
  let day = 0;
  demo.innerHTML =
    '<div class="demo-days" role="group" aria-label="Day"></div><div class="demo-grid"></div><p class="demo-note" role="status"></p>';
  const daysEl = demo.querySelector(".demo-days");
  const grid = demo.querySelector(".demo-grid");
  const note = demo.querySelector(".demo-note");

  function render() {
    daysEl.innerHTML = days
      .map(
        (d, i) =>
          `<button type="button" class="chip-btn" aria-pressed="${i === day}" data-day="${i}">${d}</button>`,
      )
      .join("");
    const head = times
      .map((t, i) => `<button type="button" class="slot-head" data-time="${i}">${t}</button>`)
      .join("");
    const body = rooms
      .map((r, ri) => {
        const cells = times
          .map((t, ti) => {
            const busy = state[day][ri][ti];
            const label = `Room ${r}, ${t}, ${busy ? "scheduled" : "available"}`;
            return `<button type="button" class="slot${busy ? " busy" : ""}" aria-pressed="${busy}" aria-label="${label}" data-r="${ri}" data-t="${ti}"></button>`;
          })
          .join("");
        return `<b>${r}</b>${cells}`;
      })
      .join("");
    grid.innerHTML = "<span></span>" + head + body;
  }

  demo.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.day) {
      day = Number(b.dataset.day);
      render();
      demo.querySelector(`[data-day="${day}"]`).focus();
      note.textContent = `${days[day]} schedule loaded.`;
    } else if (b.dataset.time) {
      const t = Number(b.dataset.time);
      const free = rooms.filter((_, r) => !state[day][r][t]);
      note.textContent =
        `${days[day]} ${times[t]}: ` +
        (free.length ? `free rooms are ${free.join(", ")}.` : "no free rooms.");
    } else if (b.dataset.r) {
      const r = Number(b.dataset.r);
      const t = Number(b.dataset.t);
      state[day][r][t] = !state[day][r][t];
      render();
      demo.querySelector(`[data-r="${r}"][data-t="${t}"]`).focus();
      note.textContent = `Room ${rooms[r]} at ${times[t]} is now ${state[day][r][t] ? "scheduled" : "available"}.`;
    }
  });
  render();
}
