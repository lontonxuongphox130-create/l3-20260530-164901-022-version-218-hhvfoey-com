
import { H as Hls } from "./hls-dru42stk.js";

function qs(selector, root = document) {
  return root.querySelector(selector);
}

function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function initMobileMenu() {
  const toggle = qs("[data-menu-toggle]");
  const nav = qs("[data-site-nav]");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    nav.classList.toggle("is-open");
  });
}

function normalize(text) {
  return (text || "").toLowerCase().trim();
}

function initSearchFilters() {
  qsa("[data-search-input]").forEach((input) => {
    const targetSelector = input.dataset.filterTarget;
    const container = targetSelector ? qs(targetSelector) : null;
    if (!container) return;

    const cards = qsa("[data-card]", container);

    const applyFilter = () => {
      const term = normalize(input.value);
      cards.forEach((card) => {
        const haystack = normalize(card.dataset.search || card.textContent);
        const show = !term || haystack.includes(term);
        card.classList.toggle("hidden", !show);
      });
    };

    input.addEventListener("input", applyFilter);

    const form = input.closest("form");
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        applyFilter();
      });
    }
  });
}

function initHeroSlider() {
  const slider = qs("[data-hero-slider]");
  if (!slider) return;

  const slides = qsa("[data-hero-slide]", slider);
  if (slides.length <= 1) return;

  const prev = qs("[data-hero-prev]");
  const next = qs("[data-hero-next]");
  const dotsWrap = qs("[data-hero-dots]");

  let index = 0;
  let timer = null;

  const dots = slides.map((_, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "slider-dot";
    btn.setAttribute("aria-label", `切换到第 ${i + 1} 页`);
    btn.addEventListener("click", () => {
      goTo(i);
      restart();
    });
    dotsWrap && dotsWrap.appendChild(btn);
    return btn;
  });

  function render() {
    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === index);
    });
  }

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    render();
  }

  function restart() {
    if (timer) window.clearInterval(timer);
    timer = window.setInterval(() => goTo(index + 1), 6500);
  }

  prev && prev.addEventListener("click", () => {
    goTo(index - 1);
    restart();
  });

  next && next.addEventListener("click", () => {
    goTo(index + 1);
    restart();
  });

  render();
  restart();
}

function initVideoPlayers() {
  qsa("[data-player]").forEach((box) => {
    const video = qs("video", box);
    const overlay = qs("[data-play-overlay]", box);
    if (!video) return;

    const source = video.dataset.src || qs("source", video)?.getAttribute("src");
    if (!source) return;

    const startPlayback = async () => {
      try {
        if (video.paused) {
          await video.play();
        }
      } catch (error) {
        console.warn("视频播放失败：", error);
      }
    };

    const hideOverlay = () => overlay && overlay.classList.add("hidden");
    const showOverlay = () => overlay && overlay.classList.remove("hidden");

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      box._hls = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    }

    overlay && overlay.addEventListener("click", startPlayback);
    video.addEventListener("click", startPlayback);
    video.addEventListener("play", hideOverlay);
    video.addEventListener("pause", () => {
      if (!video.ended) showOverlay();
    });
    video.addEventListener("ended", showOverlay);
  });
}

function highlightCurrentPage() {
  const current = location.pathname.split("/").pop() || "index.html";
  qsa(".nav-link").forEach((link) => {
    const href = link.getAttribute("href") || "";
    const target = href.split("/").pop();
    if (target === current || (current === "" && target === "index.html")) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initSearchFilters();
  initHeroSlider();
  initVideoPlayers();
  highlightCurrentPage();
});
