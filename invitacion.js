/* =========================================================
   invitacion-premium-effects.js
   Efectos premium para invitación de cumpleaños y graduación.
   Uso:
   <script src="./invitacion-premium-effects.js" defer></script>
========================================================= */

(() => {
  "use strict";

  const EVENT_DATA = {
    celebrant: "Jonatan Vieyra Chalé",
    title: "Cumpleaños & Graduación de Secundaria",
    dateLabel: "Viernes 10 de julio",
    timeLabel: "2:00 p. m.",
    eventISO: "2026-07-10T14:00:00-05:00",
    phone: "9983399964",
    mapsUrl:
      "https://www.google.com/maps/place/21%C2%B012'09.8%22N+86%C2%B049'53.8%22W/@21.2027069,-86.8364829,17z/data=!3m1!4b1!4m4!3m3!8m2!3d21.202707!4d-86.831612?entry=ttu&g_ep=EgoyMDI2MDYyMS4wIKXMDSoASAFQAw%3D%3D",
    whatsappUrl:
      "https://wa.me/529983399964?text=Hola%2C%20confirmo%20mi%20asistencia%20al%20cumplea%C3%B1os%20y%20graduaci%C3%B3n%20de%20Jonatan%20Vieyra%20Chal%C3%A9.%20Nos%20vemos%20el%20viernes%2010%20de%20julio%20a%20las%202%3A00%20p.%20m."
  };

  const SELECTORS = {
    card: ".invitation, .invite-card",
    stage: ".stage, .invitation-stage",
    sparkLayer: ".sparkles, .sparkle-layer",
    toast: "#toast",
    copyPhone: "#copyPhone",
    shareInvite: "#shareInvite",
    printInvite: "#printInvite",
    buttons: ".btn, .button, .toolbar a, .toolbar button, .premium-mini-action",
    reveal:
      ".eyebrow-wrap, .headline, .subtitle, .name-kicker, .main-title, .title-block, .honor-line, .detail-grid, .info, .info-area, .main-message, .message, .warm-note, .special-note, .highlight-row, .achievement-panel, .location-card, .rsvp, .rsvp-card, .closing, .mini-footer",
    parallax:
      ".graduation-visual, .party-visual, .academic-gown, .cap, .diploma-stack, .extra-cap, .mini-medal, .soccer-medal, .jersey, .mini-ball, .side-leaves",
    football:
      ".soccer-medal, .jersey, .mini-ball, .floating-football"
  };

  const prefersReducedMotion = globalThis.matchMedia
    ? globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  const state = {
    toastTimer: null,
    countdownTimer: null,
    tiltFrame: null,
    pointerX: 0,
    pointerY: 0,
    pointerActive: false,
    started: false
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const random = (min, max) => Math.random() * (max - min) + min;
  const randomInt = (min, max) => Math.floor(random(min, max + 1));
  const wait = (ms) => new Promise((resolve) => globalThis.setTimeout(resolve, ms));

  function injectStyles() {
    if ($("#premium-effects-style")) return;

    const style = document.createElement("style");
    style.id = "premium-effects-style";
    style.textContent = `
      :root {
        --mouse-x: 50%;
        --mouse-y: 50%;
      }

      .premium-progress {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 9998;
        width: 100%;
        height: 4px;
        transform: scaleX(0);
        transform-origin: left;
        background: linear-gradient(90deg, #76511d, #f4d892, #fff5d0, #c99b45);
        box-shadow: 0 0 18px rgba(244,216,146,.55);
        pointer-events: none;
      }

      .premium-cursor-glow {
        position: fixed;
        inset: 0;
        z-index: 2;
        pointer-events: none;
        background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(244,216,146,.18), transparent 19rem);
        mix-blend-mode: screen;
      }

      .premium-loader {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: grid;
        place-items: center;
        background:
          radial-gradient(circle at 50% 40%, rgba(244,216,146,.22), transparent 28%),
          linear-gradient(135deg, #01040c, #071936 52%, #01040c);
        transition: opacity 700ms ease, visibility 700ms ease;
      }

      .premium-loader.is-hidden {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
      }

      .premium-loader__seal {
        width: min(260px, 78vw);
        aspect-ratio: 1;
        display: grid;
        place-items: center;
        border-radius: 50%;
        border: 2px solid rgba(216,173,85,.88);
        color: #fff8ea;
        box-shadow: 0 0 0 10px rgba(216,173,85,.06), 0 0 60px rgba(216,173,85,.22), inset 0 0 28px rgba(216,173,85,.12);
        position: relative;
        overflow: hidden;
        text-align: center;
      }

      .premium-loader__seal::before {
        content: "";
        position: absolute;
        inset: 22px;
        border-radius: 50%;
        border: 1px solid rgba(255,248,234,.30);
      }

      .premium-loader__seal::after {
        content: "";
        position: absolute;
        inset: -60%;
        background: linear-gradient(110deg, transparent, rgba(255,255,255,.18), transparent);
        transform: rotate(18deg) translateX(-45%);
        animation: premiumLoaderShine 1800ms ease-in-out infinite;
      }

      .premium-loader__script {
        position: relative;
        z-index: 1;
        display: block;
        font-family: "Great Vibes", cursive;
        font-size: clamp(58px, 13vw, 96px);
        line-height: .75;
        color: #f4d892;
        text-shadow: 0 0 24px rgba(244,216,146,.35);
      }

      .premium-loader__small {
        position: relative;
        z-index: 1;
        display: block;
        margin-top: 18px;
        font-family: Arial, sans-serif;
        font-size: 11px;
        letter-spacing: 2px;
        text-transform: uppercase;
        opacity: .82;
      }

      @keyframes premiumLoaderShine {
        from { transform: rotate(18deg) translateX(-55%); }
        to { transform: rotate(18deg) translateX(55%); }
      }

      .premium-particle-canvas {
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        opacity: .82;
      }

      .js-reveal {
        opacity: 0;
        transform: translateY(18px) scale(.985);
        filter: blur(4px);
        transition: opacity 820ms ease, transform 820ms ease, filter 820ms ease;
      }

      .js-reveal.is-visible {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0);
      }

      .premium-countdown {
        width: min(760px, 100%);
        margin: 22px auto 0;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
      }

      .premium-countdown__item {
        min-height: 86px;
        display: grid;
        place-items: center;
        text-align: center;
        border-radius: 18px;
        border: 1px solid rgba(201,155,69,.48);
        background: linear-gradient(180deg, rgba(255,255,255,.58), rgba(255,248,234,.78));
        box-shadow: inset 0 0 0 4px rgba(201,155,69,.06), 0 12px 22px rgba(7,25,54,.08);
        position: relative;
        overflow: hidden;
      }

      .premium-countdown__item::before {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(110deg, transparent, rgba(255,255,255,.44), transparent);
        transform: translateX(-130%);
        animation: premiumCountdownShine 6s ease-in-out infinite;
      }

      @keyframes premiumCountdownShine {
        0% { transform: translateX(-130%); }
        42% { transform: translateX(130%); }
        100% { transform: translateX(130%); }
      }

      .premium-countdown__number {
        position: relative;
        z-index: 1;
        display: block;
        color: #071936;
        font-family: "Cinzel", Georgia, serif;
        font-size: clamp(26px, 4vw, 42px);
        font-weight: 900;
        line-height: 1;
      }

      .premium-countdown__label {
        position: relative;
        z-index: 1;
        display: block;
        margin-top: 6px;
        color: #76511d;
        font-family: Arial, sans-serif;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 1.1px;
        text-transform: uppercase;
      }

      .premium-mini-actions {
        width: min(740px, 100%);
        margin: 18px auto 0;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;
      }

      .premium-mini-action {
        appearance: none;
        border: 1px solid rgba(201,155,69,.52);
        border-radius: 999px;
        padding: 10px 15px;
        cursor: pointer;
        color: #071936;
        background: rgba(255,255,255,.55);
        font-family: Arial, sans-serif;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: .2px;
        transition: transform 260ms ease, box-shadow 260ms ease, background 260ms ease;
      }

      .premium-mini-action:hover {
        transform: translateY(-2px);
        background: rgba(255,248,234,.88);
        box-shadow: 0 10px 20px rgba(7,25,54,.12);
      }

      .premium-ripple {
        position: absolute;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        background: rgba(244,216,146,.45);
        pointer-events: none;
        animation: premiumRipple 680ms ease-out forwards;
      }

      @keyframes premiumRipple {
        from { opacity: 1; transform: translate(-50%, -50%) scale(.4); }
        to { opacity: 0; transform: translate(-50%, -50%) scale(18); }
      }

      .premium-confetti {
        position: fixed;
        top: -20px;
        z-index: 9997;
        width: 10px;
        height: 14px;
        border-radius: 3px;
        pointer-events: none;
        animation: premiumConfettiFall var(--fall-duration, 1600ms) ease-out forwards;
      }

      @keyframes premiumConfettiFall {
        0% { opacity: 1; transform: translate3d(0, -20px, 0) rotate(0deg) scale(1); }
        100% { opacity: 0; transform: translate3d(var(--fall-x, 0px), calc(100vh + 60px), 0) rotate(var(--fall-rotate, 540deg)) scale(.8); }
      }

      .premium-floating-symbol {
        position: absolute;
        z-index: 3;
        pointer-events: none;
        color: rgba(201,155,69,.82);
        font-size: var(--symbol-size, 22px);
        filter: drop-shadow(0 8px 12px rgba(7,25,54,.12));
        animation: premiumSymbolFloat var(--symbol-duration, 7800ms) ease-in-out infinite;
      }

      @keyframes premiumSymbolFloat {
        0%, 100% { transform: translate3d(0,0,0) rotate(var(--symbol-rotate, 0deg)); opacity: .22; }
        50% { transform: translate3d(0,-18px,0) rotate(calc(var(--symbol-rotate, 0deg) + 8deg)); opacity: .72; }
      }

      .premium-modal {
        position: fixed;
        inset: 0;
        z-index: 9996;
        display: grid;
        place-items: center;
        padding: 18px;
        background: rgba(1,4,12,.64);
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition: opacity 260ms ease, visibility 260ms ease;
      }

      .premium-modal.is-open {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
      }

      .premium-modal__panel {
        width: min(560px, 100%);
        position: relative;
        overflow: hidden;
        border-radius: 28px;
        border: 2px solid rgba(201,155,69,.82);
        background: radial-gradient(circle at top, rgba(255,255,255,.98), transparent 38%), linear-gradient(180deg, #fffdf7, #fff2dc);
        box-shadow: 0 34px 90px rgba(0,0,0,.45), inset 0 0 0 7px rgba(201,155,69,.10);
        padding: 32px 26px 26px;
        text-align: center;
        color: #071936;
        transform: translateY(16px) scale(.98);
        transition: transform 280ms ease;
      }

      .premium-modal.is-open .premium-modal__panel {
        transform: translateY(0) scale(1);
      }

      .premium-modal__close {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        border: 1px solid rgba(201,155,69,.55);
        color: #fff8ea;
        background: linear-gradient(135deg, #01040c, #113268);
        cursor: pointer;
        font-size: 18px;
      }

      .premium-modal__title {
        margin: 0 0 8px;
        font-family: "Cinzel", Georgia, serif;
        font-size: clamp(22px, 4vw, 32px);
        letter-spacing: .6px;
      }

      .premium-modal__text {
        margin: 0 auto 18px;
        max-width: 420px;
        color: #6f6048;
        font-family: Arial, sans-serif;
        font-size: 14px;
        line-height: 1.55;
        font-weight: 600;
      }

      .premium-modal__actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
      }

      .premium-modal__actions a,
      .premium-modal__actions button {
        border-radius: 999px;
        padding: 11px 16px;
        border: 1px solid rgba(201,155,69,.58);
        text-decoration: none;
        cursor: pointer;
        font-family: Arial, sans-serif;
        font-size: 12px;
        font-weight: 800;
      }

      .premium-modal__actions a:first-child {
        color: #fff8ea;
        background: linear-gradient(135deg, #01040c, #113268);
      }

      .premium-modal__actions a:nth-child(2),
      .premium-modal__actions button {
        color: #071936;
        background: linear-gradient(135deg, #fff8d8, #f4d892);
      }

      .photo-mode .toolbar,
      .photo-mode .premium-progress,
      .photo-mode .premium-cursor-glow,
      .photo-mode .premium-particle-canvas {
        display: none !important;
      }

      .is-paused * {
        animation-play-state: paused !important;
      }

      .premium-shake {
        animation: premiumShake 460ms ease;
      }

      @keyframes premiumShake {
        0%, 100% { transform: translateX(0); }
        18% { transform: translateX(-3px); }
        36% { transform: translateX(3px); }
        54% { transform: translateX(-2px); }
        72% { transform: translateX(2px); }
      }

      @media (max-width: 720px) {
        .premium-countdown {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .premium-countdown__item {
          min-height: 76px;
        }

        .premium-mini-actions {
          display: grid;
        }

        .premium-mini-action {
          width: 100%;
        }

        .premium-cursor-glow {
          display: none;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .premium-loader,
        .premium-loader *,
        .premium-countdown__item::before,
        .premium-floating-symbol,
        .premium-confetti,
        .premium-ripple {
          animation: none !important;
          transition: none !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function ensureToast() {
    let toast = $(SELECTORS.toast);

    if (!toast) {
      toast = document.createElement("output");
      toast.id = "toast";
      toast.className = "toast";
      toast.setAttribute("aria-live", "polite");
      toast.textContent = "Listo.";
      document.body.appendChild(toast);
    }

    return toast;
  }

  function showToast(message, duration = 2400) {
    const toast = ensureToast();
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(state.toastTimer);

    state.toastTimer = globalThis.setTimeout(() => {
      toast.classList.remove("show");
    }, duration);
  }

  function createLoader() {
    if (prefersReducedMotion || $("#premiumLoader")) return;

    const loader = document.createElement("div");
    loader.id = "premiumLoader";
    loader.className = "premium-loader";
    loader.innerHTML = `
      <div class="premium-loader__seal">
        <div>
          <span class="premium-loader__script">J</span>
          <span class="premium-loader__small">${EVENT_DATA.celebrant}</span>
        </div>
      </div>
    `;

    document.body.appendChild(loader);

    globalThis.setTimeout(() => loader.classList.add("is-hidden"), 1100);
    globalThis.setTimeout(() => loader.remove(), 1900);
  }

  function initScrollProgress() {
    let progress = $(".premium-progress");

    if (!progress) {
      progress = document.createElement("div");
      progress.className = "premium-progress";
      document.body.appendChild(progress);
    }

    const update = () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const ratio = scrollHeight <= 0 ? 0 : scrollTop / scrollHeight;
      progress.style.transform = `scaleX(${clamp(ratio, 0, 1)})`;
    };

    document.addEventListener("scroll", update, { passive: true });
    update();
  }

  function initCursorGlow() {
    if (prefersReducedMotion || globalThis.innerWidth < 720) return;

    const glow = document.createElement("div");
    glow.className = "premium-cursor-glow";
    document.body.appendChild(glow);

    document.addEventListener(
      "pointermove",
      (event) => {
        document.documentElement.style.setProperty("--mouse-x", `${event.clientX}px`);
        document.documentElement.style.setProperty("--mouse-y", `${event.clientY}px`);
      },
      { passive: true }
    );
  }

  function initParticleCanvas() {
    if (prefersReducedMotion) return;

    const canvas = document.createElement("canvas");
    canvas.className = "premium-particle-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);

    const ctx = canvas.getContext("2d");
    const particles = [];
    let width = 0;
    let height = 0;
    let frame = null;

    const makeParticle = () => ({
      x: random(0, width),
      y: random(0, height),
      size: random(0.7, 2.2),
      speedX: random(-0.08, 0.08),
      speedY: random(0.05, 0.22),
      alpha: random(0.18, 0.62),
      pulse: random(0, Math.PI * 2)
    });

    const resize = () => {
      width = canvas.width = globalThis.innerWidth * devicePixelRatio;
      height = canvas.height = globalThis.innerHeight * devicePixelRatio;

      canvas.style.width = `${globalThis.innerWidth}px`;
      canvas.style.height = `${globalThis.innerHeight}px`;

      particles.length = 0;

      const amount = Math.min(
        90,
        Math.floor((globalThis.innerWidth * globalThis.innerHeight) / 16000)
      );

      for (let i = 0; i < amount; i += 1) {
        particles.push(makeParticle());
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((particle) => {
        particle.x += particle.speedX * devicePixelRatio;
        particle.y += particle.speedY * devicePixelRatio;
        particle.pulse += 0.015;

        if (particle.y > height + 20) {
          particle.y = -20;
          particle.x = random(0, width);
        }

        const alpha = clamp(particle.alpha + Math.sin(particle.pulse) * 0.12, 0.08, 0.72);

        ctx.beginPath();
        ctx.fillStyle = `rgba(244,216,146,${alpha})`;
        ctx.arc(
          particle.x,
          particle.y,
          particle.size * devicePixelRatio,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });

      frame = requestAnimationFrame(draw);
    };

    resize();
    draw();

    globalThis.addEventListener("resize", resize, { passive: true });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
      } else {
        draw();
      }
    });
  }

  function initCardTilt() {
    const card = $(SELECTORS.card);
    if (!card || prefersReducedMotion) return;

    const updateTilt = () => {
      const rect = card.getBoundingClientRect();
      if (!state.pointerActive || rect.width === 0 || rect.height === 0) return;

      const x = state.pointerX - rect.left;
      const y = state.pointerY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = clamp(((y - centerY) / centerY) * -1.2, -2, 2);
      const rotateY = clamp(((x - centerX) / centerX) * 1.2, -2, 2);

      card.style.transform = `perspective(1800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const requestTilt = () => {
      if (state.tiltFrame) return;
      state.tiltFrame = requestAnimationFrame(() => {
        updateTilt();
        state.tiltFrame = null;
      });
    };

    card.addEventListener(
      "pointermove",
      (event) => {
        if (event.target.closest("a, button, input, textarea, select")) return;

        state.pointerX = event.clientX;
        state.pointerY = event.clientY;
        state.pointerActive = true;
        requestTilt();
      },
      { passive: true }
    );

    card.addEventListener("pointerleave", () => {
      state.pointerActive = false;
      card.style.transform = "perspective(1800px) rotateX(0deg) rotateY(0deg)";
    });
  }

  function initParallax() {
    if (prefersReducedMotion || globalThis.innerWidth < 720) return;

    const stage = $(SELECTORS.stage);
    const items = $$(SELECTORS.parallax);

    if (!stage || items.length === 0) return;

    stage.addEventListener(
      "pointermove",
      (event) => {
        const rect = stage.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        items.forEach((item, index) => {
          const depth = (index % 5) + 1;
          item.style.translate = `${x * depth * 3}px ${y * depth * 3}px`;
        });
      },
      { passive: true }
    );

    stage.addEventListener("pointerleave", () => {
      items.forEach((item) => {
        item.style.translate = "0 0";
      });
    });
  }

  function initReveal() {
    const elements = $$(SELECTORS.reveal).filter(Boolean);
    if (elements.length === 0) return;

    elements.forEach((element) => {
      element.classList.add("js-reveal");
    });

    if (!("IntersectionObserver" in globalThis) || prefersReducedMotion) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    elements.forEach((element, index) => {
      element.style.transitionDelay = `${index * 65}ms`;
      observer.observe(element);
    });
  }

  function initTypewriter() {
    if (prefersReducedMotion) return;

    const element = $(".main-message, .message");
    if (!element || element.dataset.typewriterReady === "true") return;

    const original = String(element.textContent || "").trim();

    if (original.length < 8 || original.length > 95) return;

    element.dataset.typewriterReady = "true";
    element.textContent = "";

    let index = 0;

    const type = () => {
      element.textContent = original.slice(0, index);
      index += 1;

      if (index <= original.length) {
        globalThis.setTimeout(type, 28);
      }
    };

    globalThis.setTimeout(type, 1000);
  }

  function createCountdown() {
    if ($(".premium-countdown")) return;

    const info = $(".info, .info-area") || $(".location-card");
    if (!info) return;

    const countdown = document.createElement("section");
    countdown.className = "premium-countdown";
    countdown.setAttribute("aria-label", "Cuenta regresiva del evento");

    countdown.innerHTML = `
      <div class="premium-countdown__item">
        <span class="premium-countdown__number" data-count="days">00</span>
        <span class="premium-countdown__label">Días</span>
      </div>

      <div class="premium-countdown__item">
        <span class="premium-countdown__number" data-count="hours">00</span>
        <span class="premium-countdown__label">Horas</span>
      </div>

      <div class="premium-countdown__item">
        <span class="premium-countdown__number" data-count="minutes">00</span>
        <span class="premium-countdown__label">Minutos</span>
      </div>

      <div class="premium-countdown__item">
        <span class="premium-countdown__number" data-count="seconds">00</span>
        <span class="premium-countdown__label">Segundos</span>
      </div>
    `;

    info.insertAdjacentElement("afterend", countdown);

    const target = new Date(EVENT_DATA.eventISO).getTime();

    const update = () => {
      const distance = target - Date.now();

      if (Number.isNaN(target) || distance <= 0) {
        $$("[data-count]", countdown).forEach((item) => {
          item.textContent = "00";
        });
        clearInterval(state.countdownTimer);
        return;
      }

      const days = Math.floor(distance / 86400000);
      const hours = Math.floor((distance % 86400000) / 3600000);
      const minutes = Math.floor((distance % 3600000) / 60000);
      const seconds = Math.floor((distance % 60000) / 1000);

      $("[data-count='days']", countdown).textContent = String(days).padStart(2, "0");
      $("[data-count='hours']", countdown).textContent = String(hours).padStart(2, "0");
      $("[data-count='minutes']", countdown).textContent = String(minutes).padStart(2, "0");
      $("[data-count='seconds']", countdown).textContent = String(seconds).padStart(2, "0");
    };

    update();
    state.countdownTimer = globalThis.setInterval(update, 1000);
  }

  function createMiniActions() {
    if ($(".premium-mini-actions")) return;

    const locationCard = $(".location-card");
    if (!locationCard) return;

    const actions = document.createElement("div");
    actions.className = "premium-mini-actions";

    actions.innerHTML = `
      <button class="premium-mini-action" type="button" data-premium-action="calendar">
        🗓️ Agregar al calendario
      </button>

      <button class="premium-mini-action" type="button" data-premium-action="details">
        ✨ Ver detalles
      </button>

      <button class="premium-mini-action" type="button" data-premium-action="photo">
        📸 Modo foto
      </button>
    `;

    locationCard.insertAdjacentElement("afterend", actions);

    actions.addEventListener("click", (event) => {
      const button = event.target.closest("[data-premium-action]");
      if (!button) return;

      const action = button.dataset.premiumAction;

      if (action === "calendar") downloadCalendarFile();
      if (action === "details") openDetailsModal();
      if (action === "photo") togglePhotoMode();

      vibrate();
    });
  }

  function ensureModal() {
    let modal = $("#premiumModal");
    if (modal) return modal;

    modal = document.createElement("section");
    modal.id = "premiumModal";
    modal.className = "premium-modal";
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-labelledby", "premiumModalTitle");

    modal.innerHTML = `
      <div class="premium-modal__panel">
        <button class="premium-modal__close" type="button" aria-label="Cerrar" data-close-modal>
          ×
        </button>

        <h2 class="premium-modal__title" id="premiumModalTitle">
          Detalles del evento
        </h2>

        <p class="premium-modal__text" id="premiumModalText">
          ${EVENT_DATA.dateLabel}, ${EVENT_DATA.timeLabel}. Celebramos el cumpleaños y graduación de ${EVENT_DATA.celebrant}.
        </p>

        <div class="premium-modal__actions">
          <a href="${EVENT_DATA.mapsUrl}" target="_blank" rel="noopener noreferrer">
            📍 Ubicación
          </a>

          <a href="${EVENT_DATA.whatsappUrl}" target="_blank" rel="noopener noreferrer">
            💬 Confirmar
          </a>

          <button type="button" data-close-modal>
            Cerrar
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener("click", (event) => {
      if (event.target === modal || event.target.closest("[data-close-modal]")) {
        closeModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeModal();
    });

    return modal;
  }

  function openDetailsModal() {
    ensureModal().classList.add("is-open");
    confettiBurst(36);
  }

  function closeModal() {
    const modal = $("#premiumModal");
    if (modal) modal.classList.remove("is-open");
  }

  async function copyText(text, successMessage) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMessage);
      confettiBurst(24);
      return true;
    } catch (error) {
      console.warn("No se pudo copiar:", error);
      showToast("No se pudo copiar automáticamente.");
      return false;
    }
  }

  function setupButtons() {
    $(SELECTORS.copyPhone)?.addEventListener("click", async () => {
      await copyText(EVENT_DATA.phone, `Número copiado: ${EVENT_DATA.phone}`);
      vibrate();
    });

    $(SELECTORS.printInvite)?.addEventListener("click", () => {
      showToast("Preparando versión para PDF...");
      globalThis.setTimeout(() => globalThis.print(), 350);
    });

    $(SELECTORS.shareInvite)?.addEventListener("click", shareInvitation);

    $$("a[href*='maps'], a[href*='google.com/maps']").forEach((link) => {
      link.href = EVENT_DATA.mapsUrl;
      link.addEventListener("click", () => {
        showToast("Abriendo ubicación en Google Maps...");
        confettiBurst(18);
      });
    });

    $$("a[href*='wa.me']").forEach((link) => {
      link.href = EVENT_DATA.whatsappUrl;
      link.addEventListener("click", () => {
        showToast("Abriendo confirmación por WhatsApp...");
        confettiBurst(28);
      });
    });
  }

  async function shareInvitation() {
    const text =
      `Estás invitado al cumpleaños y graduación de ${EVENT_DATA.celebrant}. ` +
      `${EVENT_DATA.dateLabel}, ${EVENT_DATA.timeLabel}. ` +
      `Ubicación: ${EVENT_DATA.mapsUrl} ` +
      `Confirmar asistencia: ${EVENT_DATA.phone}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: EVENT_DATA.title,
          text,
          url: EVENT_DATA.mapsUrl
        });

        showToast("Invitación compartida.");
        confettiBurst(36);
      } catch (error) {
        console.warn("No se compartió:", error);
        showToast("No se compartió la invitación.");
      }

      return;
    }

    await copyText(text, "Texto de invitación copiado.");
  }

  function formatICSDate(date) {
    const pad = (num) => String(num).padStart(2, "0");

    return (
      date.getUTCFullYear() +
      pad(date.getUTCMonth() + 1) +
      pad(date.getUTCDate()) +
      "T" +
      pad(date.getUTCHours()) +
      pad(date.getUTCMinutes()) +
      pad(date.getUTCSeconds()) +
      "Z"
    );
  }

  function cleanICS(value) {
    return String(value ?? "")
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  }

  function downloadCalendarFile() {
    const start = new Date(EVENT_DATA.eventISO);
    const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);

    if (Number.isNaN(start.getTime())) {
      showToast("No se pudo generar el calendario.");
      return;
    }

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Invitacion Premium//Jonatan Vieyra Chale//ES",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${Date.now()}-jonatan-graduacion@invitacion-premium`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(start)}`,
      `DTEND:${formatICSDate(end)}`,
      `SUMMARY:${cleanICS(EVENT_DATA.title)}`,
      `DESCRIPTION:${cleanICS("Celebración de cumpleaños y graduación de secundaria de Jonatan Vieyra Chalé.")}`,
      `LOCATION:${cleanICS(EVENT_DATA.mapsUrl)}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "cumple-graduacion-jonatan.ics";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
    showToast("Evento descargado para calendario.");
    confettiBurst(42);
  }

  function confettiBurst(amount = 50) {
    if (prefersReducedMotion) return;

    const colors = ["#c99b45", "#f4d892", "#fff5d0", "#071936", "#113268", "#ffffff"];
    const count = Math.min(amount, 110);

    for (let index = 0; index < count; index += 1) {
      const piece = document.createElement("span");

      piece.className = "premium-confetti";
      piece.style.left = `${random(0, 100)}vw`;
      piece.style.background = colors[randomInt(0, colors.length - 1)];
      piece.style.setProperty("--fall-x", `${random(-180, 180)}px`);
      piece.style.setProperty("--fall-rotate", `${random(240, 1080)}deg`);
      piece.style.setProperty("--fall-duration", `${random(1200, 2600)}ms`);
      piece.style.width = `${random(6, 12)}px`;
      piece.style.height = `${random(8, 18)}px`;

      document.body.appendChild(piece);

      globalThis.setTimeout(() => piece.remove(), 2800);
    }
  }

  function initRipples() {
    document.addEventListener("click", (event) => {
      const target = event.target.closest(SELECTORS.buttons);
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const ripple = document.createElement("span");

      ripple.className = "premium-ripple";
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;

      if (getComputedStyle(target).position === "static") {
        target.style.position = "relative";
      }

      target.style.overflow = "hidden";
      target.appendChild(ripple);

      globalThis.setTimeout(() => ripple.remove(), 700);
    });
  }

  function initMagneticButtons() {
    if (prefersReducedMotion || globalThis.innerWidth < 720) return;

    $$(SELECTORS.buttons).forEach((button) => {
      button.addEventListener(
        "pointermove",
        (event) => {
          const rect = button.getBoundingClientRect();
          const x = event.clientX - rect.left - rect.width / 2;
          const y = event.clientY - rect.top - rect.height / 2;
          button.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
        },
        { passive: true }
      );

      button.addEventListener("pointerleave", () => {
        button.style.transform = "translate(0, 0)";
      });
    });
  }

  function createFloatingSymbols() {
    if (prefersReducedMotion) return;

    const card = $(SELECTORS.card);
    if (!card || $(".premium-floating-symbol", card)) return;

    const symbols = ["✦", "✧", "🎓", "🏅", "✦", "❦", "⚽", "✧", "✦", "🏆"];

    symbols.forEach((symbol, index) => {
      const item = document.createElement("span");

      item.className = "premium-floating-symbol";
      item.textContent = symbol;
      item.style.left = `${random(6, 90)}%`;
      item.style.top = `${random(8, 88)}%`;
      item.style.setProperty("--symbol-size", `${random(14, 26)}px`);
      item.style.setProperty("--symbol-duration", `${random(6200, 9800)}ms`);
      item.style.setProperty("--symbol-rotate", `${random(-18, 18)}deg`);
      item.style.animationDelay = `${index * 340}ms`;

      card.appendChild(item);
    });
  }

  function initFootballEasterEgg() {
    $$(SELECTORS.football).forEach((element) => {
      element.style.cursor = "pointer";
      element.style.pointerEvents = "auto";

      element.addEventListener("click", () => {
        element.classList.add("premium-shake");
        confettiBurst(46);
        showToast("¡Gol de celebración! ⚽");
        vibrate();

        globalThis.setTimeout(() => element.classList.remove("premium-shake"), 500);
      });
    });
  }

  function togglePhotoMode() {
    document.body.classList.toggle("photo-mode");

    if (document.body.classList.contains("photo-mode")) {
      showToast("Modo foto activado. Presiona otra vez para salir.");
    } else {
      showToast("Modo foto desactivado.");
    }
  }

  function initKeyboardShortcuts() {
    document.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();

      if (event.target.matches("input, textarea, select")) return;

      if (key === "m") {
        globalThis.open(EVENT_DATA.mapsUrl, "_blank", "noopener,noreferrer");
        showToast("Abriendo ubicación...");
      }

      if (key === "w") {
        globalThis.open(EVENT_DATA.whatsappUrl, "_blank", "noopener,noreferrer");
        showToast("Abriendo WhatsApp...");
      }

      if (key === "p") {
        globalThis.print();
      }

      if (key === "c") {
        copyText(EVENT_DATA.phone, `Número copiado: ${EVENT_DATA.phone}`);
      }

      if (key === "f") {
        togglePhotoMode();
      }
    });
  }

  function initVisibilityPause() {
    document.addEventListener("visibilitychange", () => {
      document.body.classList.toggle("is-paused", document.hidden);
    });
  }

  function vibrate() {
    if ("vibrate" in navigator) {
      navigator.vibrate(18);
    }
  }

  function validateElements() {
    const missing = [];

    if (!$(SELECTORS.card)) missing.push(".invitation");
    if (!$(SELECTORS.copyPhone)) missing.push("#copyPhone");
    if (!$(SELECTORS.shareInvite)) missing.push("#shareInvite");
    if (!$(SELECTORS.printInvite)) missing.push("#printInvite");

    if (missing.length > 0) {
      console.info("Invitación premium JS: elementos opcionales no encontrados:", missing.join(", "));
    }
  }

  async function initPremiumInvitation() {
    if (state.started) return;
    state.started = true;

    injectStyles();
    ensureToast();
    validateElements();

    createLoader();
    initScrollProgress();
    initCursorGlow();
    initParticleCanvas();
    initCardTilt();
    initParallax();
    initReveal();
    initTypewriter();
    createCountdown();
    createMiniActions();
    setupButtons();
    initRipples();
    initMagneticButtons();
    createFloatingSymbols();
    initFootballEasterEgg();
    initKeyboardShortcuts();
    initVisibilityPause();

    document.body.classList.add("premium-loaded");

    await wait(1300);

    confettiBurst(30);
    showToast("Invitación premium cargada ✨", 1800);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPremiumInvitation);
  } else {
    initPremiumInvitation();
  }

  globalThis.PremiumInvitation = {
    data: EVENT_DATA,
    init: initPremiumInvitation,
    toast: showToast,
    confetti: confettiBurst,
    share: shareInvitation,
    calendar: downloadCalendarFile,
    photoMode: togglePhotoMode,
    details: openDetailsModal
  };
})();
