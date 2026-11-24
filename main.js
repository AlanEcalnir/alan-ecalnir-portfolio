const rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
// Typing effect in the hero
const el = document.getElementById("type");
const lines = [
  "I build web apps people can use.",
  "I lead requirements and documentation.",
  "I run student organizations.",
];
let i = 0,
  j = 0,
  del = false;
function tick() {
  const s = lines[i];
  j += del ? -1 : 1;
  el.textContent = s.slice(0, j);
  let d = del ? 18 : 45;
  if (!del && j === s.length) {
    del = true;
    d = 1400;
  } else if (del && j === 0) {
    del = false;
    i = (i + 1) % lines.length;
    d = 300;
  }
  setTimeout(tick, d);
}
if (rm) el.textContent = lines[0];
else tick();

// Draggable 3D computer (mouse, touch, and arrow keys)
const st = document.querySelector(".stage"),
  pc = document.querySelector(".pc");
let rx = -12,
  ry = 25,
  drag = false,
  px = 0,
  py = 0;
const clamp = (v) => Math.max(-60, Math.min(60, v));
const draw = () => (pc.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`);
st.addEventListener("pointerdown", (e) => {
  st.classList.add("used");
  drag = true;
  px = e.clientX;
  py = e.clientY;
  st.setPointerCapture(e.pointerId);
  st.style.cursor = "grabbing";
});
st.addEventListener("pointermove", (e) => {
  if (!drag) return;
  ry += (e.clientX - px) * 0.6;
  rx = clamp(rx - (e.clientY - py) * 0.6);
  px = e.clientX;
  py = e.clientY;
  draw();
});
const up = () => {
  drag = false;
  st.style.cursor = "grab";
};
st.addEventListener("pointerup", up);
st.addEventListener("pointercancel", up);
st.addEventListener("keydown", (e) => {
  const k = { ArrowLeft: [0, -10], ArrowRight: [0, 10], ArrowUp: [-10, 0], ArrowDown: [10, 0] }[
    e.key
  ];
  if (k) {
    e.preventDefault();
    rx = clamp(rx + k[0]);
    ry += k[1];
    draw();
  }
});
if (!rm)
  (function spin() {
    if (!drag) {
      ry += 0.15;
      draw();
    }
    requestAnimationFrame(spin);
  })();
