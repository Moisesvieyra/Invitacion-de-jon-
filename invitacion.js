/* =========================================================
   invitacion.js
   Versión premium optimizada para móvil
   Invitación: Cumpleaños & Graduación | Jonatan Vieyra Chalé

   Conecta este archivo así, antes de </body>:
   <script src="./invitacion.js" defer></script>

   Objetivo:
   - Mantener la experiencia premium en computadora.
   - Activar modo ligero automático en celulares o equipos lentos.
   - Evitar trabones por canvas, parallax, tilt, partículas y confetti excesivo.
========================================================= */

(() => {
  "use strict";

  /* =========================================================
     01. DATOS DEL EVENTO
  ========================================================= */

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

  /* =========================================================
     02. SELECTORES
  ========================================================= */

  const SELECTORS = {
    card: ".invitation, .invite-card",
    stage: ".stage, .invitation-stage",
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

  /* =========================================================
     03. DETECCIÓN DE RENDIMIENTO
  ========================================================= */

  const hasMatchMedia = typeof globalThis.matchMedia === "function";

  const prefersReducedMotion = hasMatchMedia
    ? globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  const isMobileViewport = hasMatchMedia
    ? globalThis.matchMedia("(max-width: 760px)").matches
    : globalThis.innerWidth <= 760;

  const isTouchDevice = hasMatchMedia
    ? globalThis.matchMedia("(pointer: coarse)").matches
    : "ontouchstart" in globalThis;

  const lowCpuDevice =
    typeof navigator.hardwareConcurrency === "number" &&
    navigator.hardwareConcurrency > 0 &&
    navigator.hardwareConcurrency <= 4;

  const saveDataEnabled =
    Boolean(navigator.connection && navigator.connection.saveData);

  const lowMemoryDevice =
    typeof navigator.deviceMemory === "number" &&
    navigator.deviceMemory > 0 &&
    navigator.deviceMemory <= 4;

  const useLiteMode =
    prefersReducedMotion ||
    isMobileViewport ||
    isTouchDevice ||
    lowCpuDevice ||
    lowMemoryDevice ||
    saveDataEnabled;

  const PERFORMANCE = {
    lite: useLiteMode,
    particleCount: useLiteMode ? 0 : 70,
    confettiNormal: useLiteMode ? 8 : 34,
    confettiBig: useLiteMode ? 14 : 56,
    confettiMax: useLiteMode ? 18 : 90,
    loaderDuration: useLiteMode ? 650 : 1200,
    toastDuration: 2000,
    revealDelay: useLiteMode ? 28 : 65,
    enableCanvas: !useLiteMode,
    enableCursorGlow: !useLiteMode,
    enableTilt: !useLiteMode,
    enableParallax: !useLiteMode,
    enableTypewriter: !useLiteMode,
    enableFloatingSymbols: !useLiteMode,
    enableMagneticButtons: !useLiteMode,
    enableEntranceConfetti: true
  };

  /* =========================================================
     04. ESTADO GLOBAL
  ========================================================= */

  const state = {
    started: false,
    toastTimer: null,
    countdownTimer: null,
    tiltFrame: null,
    particleFrame: null,
    particleCanvas: null,
    particleContext: null,
    pointerX: 0,
    pointerY: 0,
    pointerActive: false,
    activeConfetti: 0
  };

  /* =========================================================
     05. HELPERS
  ========================================================= */

  const $ = (selector, root = document) => root.querySelector(selector);

  const $$ = (selector, root = document) => {
    return Array.from(root.querySelectorAll(selector));
  };

  const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  };

  const random = (min, max) => {
    return Math.random() * (max - min) + min;
  };

  const randomInt = (min, max) => {
    return Math.floor(random(min, max + 1));
  };

  const wait = (ms) => {
    return new Promise((resolve) => globalThis.setTimeout(resolve, ms));
  };

  const canVibrate = () => {
    return "vibrate" in navigator && !PERFORMANCE.lite;
  };

  const vibrate = () => {
    if (canVibrate()) {
      navigator.vibrate(16);
    }
  };

  const requestIdle = (callback) => {
    if ("requestIdleCallback" in globalThis) {
      globalThis.requestIdleCallback(callback, { timeout: 1200 });
      return;
    }

    globalThis.setTimeout(callback, 1);
  };

  const safeOpen = (url) => {
    globalThis.open(url, "_blank", "noopener,noreferrer");
  };

  /* =========================================================
     06. CSS INYECTADO OPTIMIZADO
  ========================================================= */

  function injectStyles() {
    if ($("#premium-effects-style")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "premium-effects-style";

    style.textContent = `
      :root {
        --mouse-x: 50%;
        --mouse-y: 50%;
      }

      body.premium-lite .premium-cursor-glow,
      body.premium-lite .premium-particle-canvas,
      body.premium-lite .premium-floating-symbol {
        display: none !important;
      }

      body.premium-lite .card-foil,
      body.premium-lite .gold-noise {
        opacity: .12 !important;
        animation: none !important;
      }

      body.premium-lite .spark,
      body.premium-lite .confetti,
      body.premium-lite .mini-ball {
        animation-duration: 1ms !important;
        animation-iteration-count: 1 !important;
      }

      body.premium-lite .invitation,
      body.premium-lite .invite-card,
      body.premium-lite .location-card,
      body.premium-lite .achievement-panel,
      body.premium-lite .detail-card,
      body.premium-lite .rsvp {
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
        will-change: auto !important;
      }

      body.premium-lite .premium-countdown__item::before,
      body.premium-lite .btn::before,
      body.premium-lite .button::before {
        animation: none !important;
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
        box-shadow: 0 0 18px rgba(244, 216, 146, .45);
        pointer-events: none;
      }

      .premium-cursor-glow {
        position: fixed;
        inset: 0;
        z-index: 2;
        pointer-events: none;
        background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(244,216,146,.16), transparent 18rem);
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
        transition: opacity 520ms ease, visibility 520ms ease;
      }

      .premium-loader.is-hidden {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
      }

      .premium-loader__seal {
        width: min(235px, 74vw);
        aspect-ratio: 1;
        display: grid;
        place-items: center;
        border-radius: 50%;
        border: 2px solid rgba(216,173,85,.86);
        color: #fff8ea;
        box-shadow:
          0 0 0 9px rgba(216,173,85,.055),
          0 0 52px rgba(216,173,85,.18),
          inset 0 0 24px rgba(216,173,85,.10);
        position: relative;
        overflow: hidden;
        text-align: center;
      }

      .premium-loader__seal::before {
        content: "";
        position: absolute;
        inset: 20px;
        border-radius: 50%;
        border: 1px solid rgba(255,248,234,.30);
      }

      .premium-loader__seal::after {
        content: "";
        position: absolute;
        inset: -60%;
        background: linear-gradient(110deg, transparent, rgba(255,255,255,.16), transparent);
        transform: rotate(18deg) translateX(-45%);
        animation: premiumLoaderShine 1800ms ease-in-out infinite;
      }

      body.premium-lite .premium-loader__seal::after {
        animation: none !important;
      }

      .premium-loader__script {
        position: relative;
        z-index: 1;
        display: block;
        font-family: "Great Vibes", cursive;
        font-size: clamp(54px, 12vw, 90px);
        line-height: .75;
        color: #f4d892;
        text-shadow: 0 0 22px rgba(244,216,146,.32);
      }

      .premium-loader__small {
        position: relative;
        z-index: 1;
        display: block;
        margin-top: 16px;
        font-family: Arial, sans-serif;
        font-size: 10px;
        letter-spacing: 1.7px;
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
        opacity: .72;
      }

      .js-reveal {
        opacity: 0;
        transform: translateY(14px);
        transition:
          opacity 650ms ease,
          transform 650ms ease;
      }

      .js-reveal.is-visible {
        opacity: 1;
        transform: translateY(0);
      }

      body:not(.premium-lite) .js-reveal {
        filter: blur(3px);
      }

      body:not(.premium-lite) .js-reveal.is-visible {
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
        min-height: 82px;
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
        background: linear-gradient(110deg, transparent, rgba(255,255,255,.38), transparent);
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
        font-size: clamp(25px, 4vw, 40px);
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
        letter-spacing: 1px;
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
        transition:
          transform 220ms ease,
          box-shadow 220ms ease,
          background 220ms ease;
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
        background: rgba(244,216,146,.42);
        pointer-events: none;
        animation: premiumRipple 520ms ease-out forwards;
      }

      @keyframes premiumRipple {
        from { opacity: 1; transform: translate(-50%, -50%) scale(.4); }
        to { opacity: 0; transform: translate(-50%, -50%) scale(15); }
      }

      .premium-confetti {
        position: fixed;
        top: -20px;
        z-index: 9997;
        width: 9px;
        height: 13px;
        border-radius: 3px;
        pointer-events: none;
        animation: premiumConfettiFall var(--fall-duration, 1500ms) ease-out forwards;
      }

      @keyframes premiumConfettiFall {
        0% { opacity: 1; transform: translate3d(0, -20px, 0) rotate(0deg) scale(1); }
        100% { opacity: 0; transform: translate3d(var(--fall-x, 0px), calc(100vh + 50px), 0) rotate(var(--fall-rotate, 480deg)) scale(.8); }
      }

      .premium-floating-symbol {
        position: absolute;
        z-index: 3;
        pointer-events: none;
        color: rgba(201,155,69,.78);
        font-size: var(--symbol-size, 22px);
        filter: drop-shadow(0 8px 12px rgba(7,25,54,.10));
        animation: premiumSymbolFloat var(--symbol-duration, 7800ms) ease-in-out infinite;
      }

      @keyframes premiumSymbolFloat {
        0%, 100% { transform: translate3d(0,0,0) rotate(var(--symbol-rotate, 0deg)); opacity: .22; }
        50% { transform: translate3d(0,-18px,0) rotate(calc(var(--symbol-rotate, 0deg) + 8deg)); opacity: .68; }
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
        transition: opacity 240ms ease, visibility 240ms ease;
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
        background:
          radial-gradient(circle at top, rgba(255,255,255,.98), transparent 38%),
          linear-gradient(180deg, #fffdf7, #fff2dc);
        box-shadow:
          0 30px 80px rgba(0,0,0,.38),
          inset 0 0 0 7px rgba(201,155,69,.10);
        padding: 32px 26px 26px;
        text-align: center;
        color: #071936;
        transform: translateY(14px) scale(.98);
        transition: transform 240ms ease;
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
        animation: premiumShake 360ms ease;
      }

      @keyframes premiumShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-2px); }
        50% { transform: translateX(2px); }
        75% { transform: translateX(-1px); }
      }

      @media (max-width: 760px) {
        .premium-countdown {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .premium-countdown__item {
          min-height: 74px;
          box-shadow:
            inset 0 0 0 3px rgba(201,155,69,.045),
            0 8px 18px rgba(7,25,54,.06);
        }

        .premium-mini-actions {
          display: grid;
        }

        .premium-mini-action {
          width: 100%;
        }

        .premium-cursor-glow,
        .premium-particle-canvas,
        .premium-floating-symbol {
          display: none !important;
        }

        .premium-ripple {
          animation-duration: 360ms;
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

  /* =========================================================
     07. TOAST
  ========================================================= */

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

  function showToast(message, duration = PERFORMANCE.toastDuration) {
    const toast = ensureToast();

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(state.toastTimer);

    state.toastTimer = globalThis.setTimeout(() => {
      toast.classList.remove("show");
    }, duration);
  }

  /* =========================================================
     08. LOADER
  ========================================================= */

  function createLoader() {
    if (prefersReducedMotion || $("#premiumLoader")) {
      return;
    }

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

    globalThis.setTimeout(() => {
      loader.classList.add("is-hidden");
    }, PERFORMANCE.loaderDuration);

    globalThis.setTimeout(() => {
      loader.remove();
    }, PERFORMANCE.loaderDuration + 750);
  }

  /* =========================================================
     09. PROGRESO DE SCROLL
  ========================================================= */

  function initScrollProgress() {
    let progress = $(".premium-progress");

    if (!progress) {
      progress = document.createElement("div");
      progress.className = "premium-progress";
      document.body.appendChild(progress);
    }

    let ticking = false;

    const update = () => {
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;

      const scrollHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      const ratio = scrollHeight <= 0 ? 0 : scrollTop / scrollHeight;
      progress.style.transform = `scaleX(${clamp(ratio, 0, 1)})`;
      ticking = false;
    };

    document.addEventListener(
      "scroll",
      () => {
        if (ticking) {
          return;
        }

        ticking = true;
        requestAnimationFrame(update);
      },
      { passive: true }
    );

    update();
  }

  /* =========================================================
     10. CURSOR GLOW SOLO ESCRITORIO
  ========================================================= */

  function initCursorGlow() {
    if (!PERFORMANCE.enableCursorGlow) {
      return;
    }

    const glow = document.createElement("div");
    glow.className = "premium-cursor-glow";
    document.body.appendChild(glow);

    let frame = null;

    document.addEventListener(
      "pointermove",
      (event) => {
        if (frame) {
          return;
        }

        frame = requestAnimationFrame(() => {
          document.documentElement.style.setProperty("--mouse-x", `${event.clientX}px`);
          document.documentElement.style.setProperty("--mouse-y", `${event.clientY}px`);
          frame = null;
        });
      },
      { passive: true }
    );
  }

  /* =========================================================
     11. PARTICULAS SOLO ESCRITORIO
  ========================================================= */

  function initParticleCanvas() {
    if (!PERFORMANCE.enableCanvas) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.className = "premium-particle-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);

    const ctx = canvas.getContext("2d", { alpha: true });
    const particles = [];

    let width = 0;
    let height = 0;
    let dpr = 1;

    const makeParticle = () => ({
      x: random(0, width),
      y: random(0, height),
      size: random(0.65, 1.9),
      speedX: random(-0.06, 0.06),
      speedY: random(0.035, 0.16),
      alpha: random(0.14, 0.48),
      pulse: random(0, Math.PI * 2)
    });

    const resize = () => {
      dpr = Math.min(globalThis.devicePixelRatio || 1, 1.5);

      width = canvas.width = Math.floor(globalThis.innerWidth * dpr);
      height = canvas.height = Math.floor(globalThis.innerHeight * dpr);

      canvas.style.width = `${globalThis.innerWidth}px`;
      canvas.style.height = `${globalThis.innerHeight}px`;

      particles.length = 0;

      const screenBasedAmount = Math.floor(
        (globalThis.innerWidth * globalThis.innerHeight) / 22000
      );

      const amount = Math.min(
        PERFORMANCE.particleCount,
        Math.max(24, screenBasedAmount)
      );

      for (let i = 0; i < amount; i += 1) {
        particles.push(makeParticle());
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((particle) => {
        particle.x += particle.speedX * dpr;
        particle.y += particle.speedY * dpr;
        particle.pulse += 0.012;

        if (particle.y > height + 20) {
          particle.y = -20;
          particle.x = random(0, width);
        }

        if (particle.x < -20) {
          particle.x = width + 20;
        }

        if (particle.x > width + 20) {
          particle.x = -20;
        }

        const alpha = clamp(
          particle.alpha + Math.sin(particle.pulse) * 0.10,
          0.06,
          0.58
        );

        ctx.beginPath();
        ctx.fillStyle = `rgba(244,216,146,${alpha})`;
        ctx.arc(
          particle.x,
          particle.y,
          particle.size * dpr,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });

      state.particleFrame = requestAnimationFrame(draw);
    };

    resize();
    draw();

    let resizeTimer = null;

    globalThis.addEventListener(
      "resize",
      () => {
        clearTimeout(resizeTimer);
        resizeTimer = globalThis.setTimeout(resize, 180);
      },
      { passive: true }
    );

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(state.particleFrame);
      } else {
        draw();
      }
    });

    state.particleCanvas = canvas;
    state.particleContext = ctx;
  }

  /* =========================================================
     12. TILT SOLO ESCRITORIO
  ========================================================= */

  function initCardTilt() {
    const card = $(SELECTORS.card);

    if (!card || !PERFORMANCE.enableTilt) {
      return;
    }

    const updateTilt = () => {
      const rect = card.getBoundingClientRect();

      if (!state.pointerActive || rect.width === 0 || rect.height === 0) {
        return;
      }

      const x = state.pointerX - rect.left;
      const y = state.pointerY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = clamp(((y - centerY) / centerY) * -1.05, -1.7, 1.7);
      const rotateY = clamp(((x - centerX) / centerX) * 1.05, -1.7, 1.7);

      card.style.transform =
        `perspective(1800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const requestTilt = () => {
      if (state.tiltFrame) {
        return;
      }

      state.tiltFrame = requestAnimationFrame(() => {
        updateTilt();
        state.tiltFrame = null;
      });
    };

    card.addEventListener(
      "pointermove",
      (event) => {
        if (event.target.closest("a, button, input, textarea, select")) {
          return;
        }

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

  /* =========================================================
     13. PARALLAX SOLO ESCRITORIO
  ========================================================= */

  function initParallax() {
    if (!PERFORMANCE.enableParallax) {
      return;
    }

    const stage = $(SELECTORS.stage);
    const items = $$(SELECTORS.parallax);

    if (!stage || items.length === 0) {
      return;
    }

    let frame = null;

    stage.addEventListener(
      "pointermove",
      (event) => {
        if (frame) {
          return;
        }

        frame = requestAnimationFrame(() => {
          const rect = stage.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;

          items.forEach((item, index) => {
            const depth = (index % 4) + 1;
            item.style.translate = `${x * depth * 2.4}px ${y * depth * 2.4}px`;
          });

          frame = null;
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

  /* =========================================================
     14. REVEAL LIGERO
  ========================================================= */

  function initReveal() {
    const elements = $$(SELECTORS.reveal).filter(Boolean);

    if (elements.length === 0) {
      return;
    }

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
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.10,
        rootMargin: "0px 0px -6% 0px"
      }
    );

    elements.forEach((element, index) => {
      element.style.transitionDelay =
        `${Math.min(index * PERFORMANCE.revealDelay, 360)}ms`;

      observer.observe(element);
    });
  }

  /* =========================================================
     15. TYPEWRITER SOLO ESCRITORIO
  ========================================================= */

  function initTypewriter() {
    if (!PERFORMANCE.enableTypewriter) {
      return;
    }

    const element = $(".main-message, .message");

    if (!element || element.dataset.typewriterReady === "true") {
      return;
    }

    const original = String(element.textContent || "").trim();

    if (original.length < 8 || original.length > 95) {
      return;
    }

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

    globalThis.setTimeout(type, 850);
  }

  /* =========================================================
     16. CUENTA REGRESIVA
  ========================================================= */

  function createCountdown() {
    if ($(".premium-countdown")) {
      return;
    }

    const info = $(".info, .info-area") || $(".location-card");

    if (!info) {
      return;
    }

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

      const daysEl = $("[data-count='days']", countdown);
      const hoursEl = $("[data-count='hours']", countdown);
      const minutesEl = $("[data-count='minutes']", countdown);
      const secondsEl = $("[data-count='seconds']", countdown);

      if (daysEl) daysEl.textContent = String(days).padStart(2, "0");
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
      if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, "0");
      if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, "0");
    };

    update();
    state.countdownTimer = globalThis.setInterval(update, 1000);
  }

  /* =========================================================
     17. MINI ACCIONES
  ========================================================= */

  function createMiniActions() {
    if ($(".premium-mini-actions")) {
      return;
    }

    const locationCard = $(".location-card");

    if (!locationCard) {
      return;
    }

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

      if (!button) {
        return;
      }

      const action = button.dataset.premiumAction;

      if (action === "calendar") {
        downloadCalendarFile();
      }

      if (action === "details") {
        openDetailsModal();
      }

      if (action === "photo") {
        togglePhotoMode();
      }

      vibrate();
    });
  }

  /* =========================================================
     18. MODAL
  ========================================================= */

  function ensureModal() {
    let modal = $("#premiumModal");

    if (modal) {
      return modal;
    }

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
      if (event.key === "Escape") {
        closeModal();
      }
    });

    return modal;
  }

  function openDetailsModal() {
    ensureModal().classList.add("is-open");
    confettiBurst(PERFORMANCE.confettiNormal);
  }

  function closeModal() {
    const modal = $("#premiumModal");

    if (modal) {
      modal.classList.remove("is-open");
    }
  }

  /* =========================================================
     19. BOTONES
  ========================================================= */

  async function copyText(text, successMessage) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMessage);
      confettiBurst(PERFORMANCE.confettiNormal);
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

      globalThis.setTimeout(() => {
        globalThis.print();
      }, 280);
    });

    $(SELECTORS.shareInvite)?.addEventListener("click", shareInvitation);

    $$("a[href*='maps'], a[href*='google.com/maps']").forEach((link) => {
      link.href = EVENT_DATA.mapsUrl;

      link.addEventListener("click", () => {
        showToast("Abriendo ubicación en Google Maps...");
        confettiBurst(PERFORMANCE.confettiNormal);
      });
    });

    $$("a[href*='wa.me']").forEach((link) => {
      link.href = EVENT_DATA.whatsappUrl;

      link.addEventListener("click", () => {
        showToast("Abriendo confirmación por WhatsApp...");
        confettiBurst(PERFORMANCE.confettiNormal);
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
        confettiBurst(PERFORMANCE.confettiBig);
      } catch (error) {
        console.warn("No se compartió:", error);
        showToast("No se compartió la invitación.");
      }

      return;
    }

    await copyText(text, "Texto de invitación copiado.");
  }

  /* =========================================================
     20. CALENDARIO
  ========================================================= */

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
    confettiBurst(PERFORMANCE.confettiBig);
  }

  /* =========================================================
     21. CONFETTI OPTIMIZADO
  ========================================================= */

  function confettiBurst(amount = PERFORMANCE.confettiNormal) {
    if (prefersReducedMotion) {
      return;
    }

    const safeAmount = Math.min(amount, PERFORMANCE.confettiMax);

    if (state.activeConfetti > PERFORMANCE.confettiMax * 2) {
      return;
    }

    const colors = [
      "#c99b45",
      "#f4d892",
      "#fff5d0",
      "#071936",
      "#113268",
      "#ffffff"
    ];

    for (let index = 0; index < safeAmount; index += 1) {
      const piece = document.createElement("span");

      piece.className = "premium-confetti";
      piece.style.left = `${random(0, 100)}vw`;
      piece.style.background = colors[randomInt(0, colors.length - 1)];
      piece.style.setProperty("--fall-x", `${random(-140, 140)}px`);
      piece.style.setProperty("--fall-rotate", `${random(180, 760)}deg`);
      piece.style.setProperty("--fall-duration", `${random(950, 2100)}ms`);
      piece.style.width = `${random(5, 10)}px`;
      piece.style.height = `${random(7, 15)}px`;

      document.body.appendChild(piece);
      state.activeConfetti += 1;

      globalThis.setTimeout(() => {
        piece.remove();
        state.activeConfetti = Math.max(0, state.activeConfetti - 1);
      }, 2300);
    }
  }

  /* =========================================================
     22. RIPPLES LIGEROS
  ========================================================= */

  function initRipples() {
    document.addEventListener("click", (event) => {
      const target = event.target.closest(SELECTORS.buttons);

      if (!target) {
        return;
      }

      if (PERFORMANCE.lite && target.classList.contains("premium-mini-action")) {
        return;
      }

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

      globalThis.setTimeout(() => {
        ripple.remove();
      }, PERFORMANCE.lite ? 390 : 580);
    });
  }

  /* =========================================================
     23. BOTONES MAGNÉTICOS SOLO ESCRITORIO
  ========================================================= */

  function initMagneticButtons() {
    if (!PERFORMANCE.enableMagneticButtons) {
      return;
    }

    $$(SELECTORS.buttons).forEach((button) => {
      button.addEventListener(
        "pointermove",
        (event) => {
          const rect = button.getBoundingClientRect();
          const x = event.clientX - rect.left - rect.width / 2;
          const y = event.clientY - rect.top - rect.height / 2;

          button.style.transform = `translate(${x * 0.10}px, ${y * 0.10}px)`;
        },
        { passive: true }
      );

      button.addEventListener("pointerleave", () => {
        button.style.transform = "translate(0, 0)";
      });
    });
  }

  /* =========================================================
     24. SÍMBOLOS FLOTANTES SOLO ESCRITORIO
  ========================================================= */

  function createFloatingSymbols() {
    if (!PERFORMANCE.enableFloatingSymbols) {
      return;
    }

    const card = $(SELECTORS.card);

    if (!card || $(".premium-floating-symbol", card)) {
      return;
    }

    const symbols = ["✦", "✧", "🎓", "🏅", "❦", "⚽", "🏆", "✦"];

    symbols.forEach((symbol, index) => {
      const item = document.createElement("span");

      item.className = "premium-floating-symbol";
      item.textContent = symbol;
      item.style.left = `${random(7, 88)}%`;
      item.style.top = `${random(8, 86)}%`;
      item.style.setProperty("--symbol-size", `${random(14, 24)}px`);
      item.style.setProperty("--symbol-duration", `${random(6800, 9800)}ms`);
      item.style.setProperty("--symbol-rotate", `${random(-18, 18)}deg`);
      item.style.animationDelay = `${index * 360}ms`;

      card.appendChild(item);
    });
  }

  /* =========================================================
     25. EASTER EGG FUTBOLERO
  ========================================================= */

  function initFootballEasterEgg() {
    $$(SELECTORS.football).forEach((element) => {
      element.style.cursor = "pointer";
      element.style.pointerEvents = "auto";

      element.addEventListener("click", () => {
        element.classList.add("premium-shake");
        confettiBurst(PERFORMANCE.confettiNormal);
        showToast("¡Gol de celebración! ⚽");
        vibrate();

        globalThis.setTimeout(() => {
          element.classList.remove("premium-shake");
        }, 420);
      });
    });
  }

  /* =========================================================
     26. MODO FOTO
  ========================================================= */

  function togglePhotoMode() {
    document.body.classList.toggle("photo-mode");

    if (document.body.classList.contains("photo-mode")) {
      showToast("Modo foto activado.");
    } else {
      showToast("Modo foto desactivado.");
    }
  }

  /* =========================================================
     27. ATAJOS DE TECLADO
  ========================================================= */

  function initKeyboardShortcuts() {
    document.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();

      if (event.target.matches("input, textarea, select")) {
        return;
      }

      if (key === "m") {
        safeOpen(EVENT_DATA.mapsUrl);
        showToast("Abriendo ubicación...");
      }

      if (key === "w") {
        safeOpen(EVENT_DATA.whatsappUrl);
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

  /* =========================================================
     28. PAUSA AL CAMBIAR DE PESTAÑA
  ========================================================= */

  function initVisibilityPause() {
    document.addEventListener("visibilitychange", () => {
      document.body.classList.toggle("is-paused", document.hidden);

      if (document.hidden && state.particleFrame) {
        cancelAnimationFrame(state.particleFrame);
      }
    });
  }

  /* =========================================================
     29. VALIDACIÓN Y LINKS
  ========================================================= */

  function validateElements() {
    const missing = [];

    if (!$(SELECTORS.card)) missing.push(".invitation");
    if (!$(SELECTORS.copyPhone)) missing.push("#copyPhone");
    if (!$(SELECTORS.shareInvite)) missing.push("#shareInvite");
    if (!$(SELECTORS.printInvite)) missing.push("#printInvite");

    if (missing.length > 0) {
      console.info(
        "Invitación premium JS: elementos opcionales no encontrados:",
        missing.join(", ")
      );
    }
  }

  function refreshLinks() {
    $$("a[href*='maps.app.goo.gl'], a[href*='google.com/maps']").forEach((link) => {
      link.href = EVENT_DATA.mapsUrl;
    });

    $$("a[href*='wa.me']").forEach((link) => {
      link.href = EVENT_DATA.whatsappUrl;
    });
  }

  /* =========================================================
     30. INICIO
  ========================================================= */

  async function initPremiumInvitation() {
    if (state.started) {
      return;
    }

    state.started = true;

    document.body.classList.toggle("premium-lite", PERFORMANCE.lite);
    document.body.classList.toggle("premium-full", !PERFORMANCE.lite);

    injectStyles();
    ensureToast();
    validateElements();
    refreshLinks();

    createLoader();
    initScrollProgress();
    initReveal();
    createCountdown();
    createMiniActions();
    setupButtons();
    initRipples();
    initFootballEasterEgg();
    initKeyboardShortcuts();
    initVisibilityPause();

    requestIdle(() => {
      initCursorGlow();
      initParticleCanvas();
      initCardTilt();
      initParallax();
      initTypewriter();
      initMagneticButtons();
      createFloatingSymbols();
    });

    document.body.classList.add("premium-loaded");

    await wait(PERFORMANCE.lite ? 760 : 1320);

    if (PERFORMANCE.enableEntranceConfetti) {
      confettiBurst(PERFORMANCE.confettiNormal);
    }

    showToast(
      PERFORMANCE.lite
        ? "Invitación cargada en modo ligero ✨"
        : "Invitación premium cargada ✨",
      1700
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPremiumInvitation, {
      once: true
    });
  } else {
    initPremiumInvitation();
  }

  /* =========================================================
     31. API GLOBAL
  ========================================================= */

  globalThis.PremiumInvitation = {
    data: EVENT_DATA,
    performance: PERFORMANCE,
    init: initPremiumInvitation,
    toast: showToast,
    confetti: confettiBurst,
    share: shareInvitation,
    calendar: downloadCalendarFile,
    photoMode: togglePhotoMode,
    details: openDetailsModal
  };
})();
