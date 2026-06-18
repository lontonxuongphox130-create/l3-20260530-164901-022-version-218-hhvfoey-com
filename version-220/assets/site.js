
(function () {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const normalize = (value) => (value || "").toString().toLowerCase().trim().replace(/\s+/g, " ");

  const body = document.body;
  const menuToggle = $("[data-menu-toggle]");
  if (menuToggle) {
    menuToggle.addEventListener("click", () => body.classList.toggle("menu-open"));
  }

  $$('[data-live-filter]').forEach((input) => {
    const selector = input.getAttribute('data-live-filter');
    const scope = input.closest('[data-filter-shell]') || document;
    const update = () => {
      const query = normalize(input.value);
      let visible = 0;
      $$(selector, scope).forEach((el) => {
        const hay = normalize(el.getAttribute('data-search-text') || el.textContent);
        const match = !query || hay.includes(query);
        el.classList.toggle('hidden', !match);
        if (match) visible += 1;
      });
    };
    input.addEventListener('input', update);
    input.addEventListener('change', update);
    update();
  });

  const hero = $('[data-hero-root]');
  if (hero) {
    const bg = $('[data-hero-bg]', hero);
    const eyebrow = $('[data-hero-eyebrow]', hero);
    const title = $('[data-hero-title]', hero);
    const lede = $('[data-hero-lede]', hero);
    const meta = $('[data-hero-meta]', hero);
    const playLink = $('[data-hero-play]', hero);
    const browseLink = $('[data-hero-browse]', hero);
    const cards = $$('[data-hero-card]', hero);
    const applyCard = (card) => {
      if (!card) return;
      const cover = card.getAttribute('data-cover');
      const titleText = card.getAttribute('data-title');
      const ledeText = card.getAttribute('data-lede');
      const metaText = card.getAttribute('data-meta');
      const link = card.getAttribute('data-link');
      const eyebrowText = card.getAttribute('data-eyebrow') || '焦点推荐';
      if (bg && cover) bg.src = cover;
      if (eyebrow) eyebrow.textContent = eyebrowText;
      if (title) title.textContent = titleText || '';
      if (lede) lede.textContent = ledeText || '';
      if (meta) meta.textContent = metaText || '';
      if (playLink && link) playLink.setAttribute('href', link);
      if (browseLink && link) browseLink.setAttribute('href', link);
      cards.forEach((item) => item.classList.toggle('is-active', item === card));
    };
    cards.forEach((card) => card.addEventListener('click', () => applyCard(card)));
    if (cards[0]) {
      applyCard(cards[0]);
      let idx = 0;
      window.setInterval(() => {
        idx = (idx + 1) % cards.length;
        applyCard(cards[idx]);
      }, 6500);
    }
  }

  $$('video[data-src]').forEach((video) => {
    const src = video.getAttribute('data-src');
    if (!src) return;
    const attachNative = () => {
      if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
        video.src = src;
      }
    };
    if (window.Hls && window.Hls.isSupported()) {
      try {
        const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 30 });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) attachNative();
        });
      } catch (err) {
        attachNative();
      }
    } else {
      attachNative();
    }
  });

  const searchRoot = $('[data-search-page]');
  if (searchRoot && Array.isArray(window.MOVIE_INDEX)) {
    const input = $('[data-search-input]', searchRoot);
    const regionSelect = $('[data-region-select]', searchRoot);
    const typeSelect = $('[data-type-select]', searchRoot);
    const results = $('[data-search-results]', searchRoot);
    const count = $('[data-search-count]', searchRoot);
    const initial = window.MOVIE_INDEX.slice().sort((a, b) => b.score - a.score).slice(0, 72);

    const renderCard = (movie) => {
      const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span class="tag">${tag}</span>`).join('');
      return `
        <article class="movie-card js-search-card" data-search-text="${normalize([movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(' '), movie.one_line].join(' '))}">
          <a href="${movie.url}">
            <div class="poster">
              <img src="${movie.cover}" alt="${movie.title}" loading="lazy" decoding="async">
              <div class="poster-overlay"></div>
              <div class="poster-chip">${movie.year}</div>
            </div>
            <div class="card-body">
              <h3 class="card-title">${movie.title}</h3>
              <p class="card-meta">${movie.region} · ${movie.type} · ${movie.genre || ''}</p>
              <p class="card-desc">${movie.one_line || ''}</p>
              <div class="card-footer">${tags}</div>
            </div>
          </a>
        </article>`;
    };

    const render = () => {
      const q = normalize(input ? input.value : '');
      const region = (regionSelect && regionSelect.value) || '';
      const type = (typeSelect && typeSelect.value) || '';
      let filtered = window.MOVIE_INDEX.filter((movie) => {
        const hay = normalize([movie.title, movie.region, movie.type, movie.genre, movie.one_line, (movie.tags || []).join(' '), movie.year].join(' '));
        if (q && !hay.includes(q)) return false;
        if (region && movie.region !== region) return false;
        if (type && movie.type !== type) return false;
        return true;
      }).sort((a, b) => b.score - a.score);
      if (!q && !region && !type) filtered = initial;
      if (count) count.textContent = `${filtered.length} 条结果`;
      if (results) {
        results.innerHTML = filtered.slice(0, 120).map(renderCard).join('') || `<div class="detail-box" style="padding:18px;"><p style="margin:0;color:#cbd5e1;">未找到匹配结果，试试电影名、地区、类型或标签。</p></div>`;
      }
    };

    input && input.addEventListener('input', render);
    regionSelect && regionSelect.addEventListener('change', render);
    typeSelect && typeSelect.addEventListener('change', render);
    render();
  }
})();
