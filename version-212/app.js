(function () {
  const onReady = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  };

  function loadScript(src) {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve(window.Hls || null);
      script.onerror = () => resolve(null);
      document.head.appendChild(script);
    });
  }

  function initHeader() {
    const header = document.querySelector(".site-header");
    const menuBtn = document.querySelector("[data-mobile-toggle]");
    const mobileMenu = document.querySelector("[data-mobile-menu]");

    const onScroll = () => {
      if (!header) return;
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (menuBtn && mobileMenu) {
      menuBtn.addEventListener("click", () => {
        const open = mobileMenu.classList.toggle("is-open");
        menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      });

      mobileMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          mobileMenu.classList.remove("is-open");
          menuBtn.setAttribute("aria-expanded", "false");
        });
      });
    }
  }

  function initBackTop() {
    const btn = document.querySelector("[data-back-top]");
    if (!btn) return;
    const onScroll = () => {
      btn.classList.toggle("is-visible", window.scrollY > 500);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function applyFilters(root) {
    const searchInput = root.querySelector("[data-search]");
    const categorySelect = root.querySelector("[data-category]");
    const sortSelect = root.querySelector("[data-sort]");
    const cards = Array.from(root.querySelectorAll("[data-card]"));
    if (!searchInput && !categorySelect && !sortSelect) return;

    const render = () => {
      const q = normalize(searchInput ? searchInput.value : "");
      const cat = categorySelect ? categorySelect.value : "";
      const sort = sortSelect ? sortSelect.value : "score";

      const filtered = cards.filter((card) => {
        const hay = normalize([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.region,
          card.dataset.type,
          card.dataset.tags,
          card.dataset.year,
          card.dataset.category,
        ].join(" "));
        const matchQuery = !q || hay.includes(q);
        const matchCat = !cat || card.dataset.category === cat;
        return matchQuery && matchCat;
      });

      filtered.sort((a, b) => {
        if (sort === "year-desc") return (Number(b.dataset.year) || 0) - (Number(a.dataset.year) || 0);
        if (sort === "year-asc") return (Number(a.dataset.year) || 0) - (Number(b.dataset.year) || 0);
        if (sort === "title-asc") return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
        if (sort === "title-desc") return (b.dataset.title || "").localeCompare(a.dataset.title || "", "zh-Hans-CN");
        return (Number(b.dataset.score) || 0) - (Number(a.dataset.score) || 0);
      });

      cards.forEach((card) => (card.hidden = true));
      filtered.forEach((card) => {
        card.hidden = false;
        card.parentElement.appendChild(card);
      });

      const counter = root.querySelector("[data-filter-count]");
      if (counter) counter.textContent = String(filtered.length);
    };

    [searchInput, categorySelect, sortSelect].forEach((el) => {
      if (!el) return;
      el.addEventListener("input", render);
      el.addEventListener("change", render);
    });

    render();
  }

  async function setupPlayer(video) {
    const hlsSrc = video.dataset.hls;
    const mp4Src = video.dataset.mp4 || "";
    const overlay = video.closest(".player-box")?.querySelector("[data-play-overlay]");

    if (overlay) {
      overlay.addEventListener("click", async (ev) => {
        ev.preventDefault();
        try {
          await video.play();
          overlay.style.opacity = "0";
          overlay.style.pointerEvents = "none";
        } catch (err) {
          console.warn(err);
        }
      });
    }

    const showOverlay = () => {
      if (!overlay) return;
      overlay.style.opacity = "1";
      overlay.style.pointerEvents = "auto";
    };

    const hideOverlay = () => {
      if (!overlay) return;
      overlay.style.opacity = "0";
      overlay.style.pointerEvents = "none";
    };

    video.addEventListener("playing", hideOverlay);
    video.addEventListener("pause", showOverlay);

    if (hlsSrc) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsSrc;
      } else {
        const Hls = window.Hls || await loadScript("https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js");
        if (Hls && Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(hlsSrc);
          hls.attachMedia(video);
          video._hls = hls;
        } else if (mp4Src && !video.getAttribute("src")) {
          video.src = mp4Src;
        }
      }
    } else if (mp4Src && !video.getAttribute("src")) {
      video.src = mp4Src;
    }
  }

  async function initPlayers() {
    const videos = Array.from(document.querySelectorAll("video[data-hls], video[data-mp4]"));
    if (!videos.length) return;
    for (const video of videos) {
      await setupPlayer(video);
    }
  }

  onReady(() => {
    initHeader();
    initBackTop();
    document.querySelectorAll("[data-filter-root]").forEach(applyFilters);
    initPlayers();
  });
})();
