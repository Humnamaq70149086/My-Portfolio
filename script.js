(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- split name into letters for the load animation ---------- */
  if (!reduceMotion) {
    let i = 0;
    $$("[data-split]").forEach((line) => {
      const text = line.textContent;
      line.textContent = "";
      for (const ch of text) {
        const span = document.createElement("span");
        span.className = "ch";
        span.setAttribute("aria-hidden", "true");
        span.style.setProperty("--i", i++);
        span.textContent = ch;
        line.appendChild(span);
      }
    });
  }

  /* ---------- typewriter for the role line ---------- */
  const typed = $("#typed");
  const phrases = [
    "ML models for health screening",
    "apps that put models to work",
    "secure, tested pipelines",
    "toward AI safety research",
  ];
  if (typed && !reduceMotion) {
    let p = 0, c = phrases[0].length, deleting = true;
    const tick = () => {
      const word = phrases[p];
      if (deleting) {
        c--;
        if (c <= 0) { deleting = false; p = (p + 1) % phrases.length; }
      } else {
        c++;
      }
      typed.textContent = phrases[p].slice(0, Math.max(c, 0));
      let delay = deleting ? 28 : 55;
      if (!deleting && c >= phrases[p].length) { deleting = true; delay = 2200; }
      if (deleting && c === 0) delay = 300;
      setTimeout(tick, delay);
    };
    setTimeout(tick, 3200);
  }

  /* ---------- header: scrolled state, progress bar, active link ---------- */
  const header = $(".site-header");
  const bar = $("#progressBar");
  const navLinks = $$(".nav-links a");
  const indicator = $(".nav-indicator");
  const sections = navLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  const timeline = $("#timeline");

  function moveIndicator(link) {
    if (!indicator) return;
    if (!link) { indicator.style.opacity = "0"; return; }
    const parent = link.closest(".nav-links").getBoundingClientRect();
    const r = link.getBoundingClientRect();
    indicator.style.width = r.width + "px";
    indicator.style.transform = `translateX(${r.left - parent.left}px)`;
    indicator.style.opacity = "1";
  }

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (header) header.classList.toggle("scrolled", y > 8);
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    let current = null;
    sections.forEach((sec, i) => {
      if (sec.getBoundingClientRect().top < innerHeight * 0.35) current = navLinks[i];
    });
    navLinks.forEach((a) => a.classList.toggle("active", a === current));
    moveIndicator(current);

    if (timeline && !reduceMotion) {
      const r = timeline.getBoundingClientRect();
      const f = (innerHeight * 0.75 - r.top) / r.height;
      timeline.style.setProperty("--fill", Math.min(Math.max(f, 0), 1).toFixed(3));
    }
  }
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(() => { onScroll(); ticking = false; }); ticking = true; }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- mobile menu ---------- */
  const menuBtn = $("#menuBtn");
  const menu = $("#navLinks");
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.textContent = open ? "Close" : "Menu";
    });
    navLinks.forEach((a) => a.addEventListener("click", () => {
      menu.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.textContent = "Menu";
    }));
  }

  /* ---------- scroll reveal (only for content below the fold at load) ---------- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.remove("pending");
          e.target.classList.add("shown");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal").forEach((el, i) => {
      if (el.getBoundingClientRect().top > innerHeight) {
        el.classList.add("pending");
        el.style.transitionDelay = (i % 3) * 70 + "ms";
        io.observe(el);
      }
    });
  }

  /* ---------- portrait parallax ---------- */
  const portrait = $("#portrait");
  if (portrait && finePointer && !reduceMotion) {
    window.addEventListener("pointermove", (e) => {
      const r = portrait.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / innerWidth;
      const y = (e.clientY - (r.top + r.height / 2)) / innerHeight;
      portrait.style.setProperty("--px", (x * 2).toFixed(3));
      portrait.style.setProperty("--py", (y * 2).toFixed(3));
    }, { passive: true });
  }

  /* ---------- card tilt ---------- */
  if (finePointer && !reduceMotion) {
    $$(".tilt").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        const amt = card.classList.contains("feature") ? 3 : 6;
        card.style.transform = `perspective(900px) rotateX(${(-y * amt).toFixed(2)}deg) rotateY(${(x * amt).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });

    /* magnetic buttons */
    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.25}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  /* ---------- RAG trace animation ---------- */
  const term = $("#terminal");
  const tQuery = $("#tQuery");
  const query = "/predict/heart  {age: 54, chol: 241, bp: 132}";
  if (term && tQuery) {
    const steps = $$("[data-step]", term).sort((a, b) => a.dataset.step - b.dataset.step);
    if (reduceMotion) {
      tQuery.textContent = query;
    } else {
      term.classList.add("playing");
      let running = false;
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      async function play() {
        running = true;
        while (true) {
          steps.forEach((s) => s.classList.remove("on"));
          tQuery.textContent = "";
          await wait(500);
          for (let i = 1; i <= query.length; i++) {
            tQuery.textContent = query.slice(0, i);
            await wait(32);
          }
          await wait(450);
          for (const s of steps) {
            s.classList.add("on");
            await wait(s.classList.contains("hits") ? 1600 : 1100);
          }
          await wait(3600);
        }
      }
      const startIo = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !running) { play(); startIo.disconnect(); }
      }, { threshold: 0.3 });
      startIo.observe(term);
    }
  }

  /* ---------- certificate viewer ---------- */
  const dlg = $("#certDialog");
  if (dlg && typeof dlg.showModal === "function") {
    const img = $("#certImg"), title = $("#certTitle"), pdf = $("#certPdf");
    let opener = null;
    $$(".cred-open").forEach((btn) => btn.addEventListener("click", () => {
      opener = btn;
      img.src = btn.dataset.img;
      img.alt = "Certificate: " + btn.dataset.title;
      title.textContent = btn.dataset.title;
      pdf.href = btn.dataset.pdf;
      dlg.showModal();
    }));
    $("#certClose").addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("close", () => { if (opener) opener.focus(); });
  } else {
    $$(".cred-open").forEach((btn) => btn.addEventListener("click", () => { location.href = btn.dataset.pdf; }));
  }

  /* ---------- contact form (Formspree) ---------- */
  const form = $("#contactForm");
  const submitBtn = $("#submitBtn");
  const status = $("#formStatus");
  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      status.className = "";
      let firstBad = null;
      $$(".field", form).forEach((f) => {
        const input = f.querySelector("input, textarea");
        const ok = input.checkValidity() && input.value.trim() !== "";
        f.classList.toggle("invalid", !ok);
        if (!ok && !firstBad) firstBad = input;
      });
      if (firstBad) {
        status.textContent = "Fill in every field with a valid email address, then send again.";
        status.className = "err";
        firstBad.focus();
        return;
      }
      submitBtn.textContent = "Sending...";
      submitBtn.disabled = true;
      try {
        const res = await fetch("https://formspree.io/f/maeynabn", {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("bad status");
        form.reset();
        status.textContent = "Message sent. I'll reply by email.";
        status.className = "ok";
        submitBtn.textContent = "Sent";
        setTimeout(() => { submitBtn.textContent = "Send message"; submitBtn.disabled = false; }, 3000);
      } catch (err) {
        status.textContent = "The message didn't send. Check your connection, or email Humnamaq06@gmail.com directly.";
        status.className = "err";
        submitBtn.textContent = "Send message";
        submitBtn.disabled = false;
      }
    });
  }
})();
