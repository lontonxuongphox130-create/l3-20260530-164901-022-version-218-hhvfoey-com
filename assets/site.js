(function () {
  const fallbackSources = [
  "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
  "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8",
  "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
  "https://d2zihajmogu5jn.cloudfront.net/elephantsdream/master.m3u8",
  "https://multiplatform-f.akamaihd.net/i/multi/will/bunny/big_buck_bunny_,640x360_400,640x360_700,640x360_1000,950x540_1500,.f4v.csmil/master.m3u8"
];

  function initMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    if (!toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }

  function initImageFallbacks() {
    document.querySelectorAll('img[data-fallback]').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('image-hidden');
        const wrap = img.closest('.poster-wrap');
        if (wrap) {
          wrap.classList.add('cover-fallback');
        }
      }, { once: true });
    });
  }

  function initHero() {
    const hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let active = 0;
    let timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(active + 1);
      }, 6200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.heroDot || 0));
        restart();
      });
    });

    restart();
  }

  function initHomeSearch() {
    const form = document.querySelector('[data-home-search]');
    if (!form) {
      return;
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const query = input ? input.value.trim() : '';
      const target = 'catalog.html' + (query ? '?q=' + encodeURIComponent(query) : '');
      window.location.href = target;
    });
  }

  function initFilters() {
    const scope = document.querySelector('[data-filter-scope]');
    if (!scope) {
      return;
    }
    const searchInput = scope.querySelector('[data-filter-search]');
    const categorySelect = scope.querySelector('[data-filter-category]');
    const yearInput = scope.querySelector('[data-filter-year]');
    const cards = Array.from(document.querySelectorAll('[data-card]'));
    const emptyState = scope.querySelector('[data-empty-state]');
    const params = new URLSearchParams(window.location.search);

    if (searchInput && params.get('q')) {
      searchInput.value = params.get('q');
    }

    function applyFilters() {
      const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      const category = categorySelect ? categorySelect.value : '';
      const year = yearInput ? yearInput.value.trim() : '';
      let visible = 0;

      cards.forEach(function (card) {
        const text = card.dataset.search || '';
        const cardCategory = card.dataset.category || '';
        const cardYear = card.dataset.year || '';
        const matched = (!query || text.includes(query)) &&
          (!category || cardCategory === category) &&
          (!year || cardYear.includes(year));
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    [searchInput, categorySelect, yearInput].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  function initPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      const video = player.querySelector('video');
      const button = player.querySelector('[data-play-button]');
      const status = player.querySelector('[data-player-status]');
      if (!video || !button) {
        return;
      }

      const primary = video.dataset.src ? [video.dataset.src] : [];
      const sources = primary.concat(fallbackSources.filter(function (source) {
        return primary.indexOf(source) === -1;
      }));
      let sourceIndex = 0;
      let hls = null;
      let started = false;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function playVideo() {
        button.classList.add('is-hidden');
        video.controls = true;
        const promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            button.classList.remove('is-hidden');
            setStatus('播放已准备好，请再次点击播放。');
          });
        }
      }

      function destroyHls() {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      }

      function loadCurrentSource() {
        const source = sources[sourceIndex];
        if (!source) {
          setStatus('未找到可用播放源。');
          return;
        }
        setStatus('正在加载高清播放源。');
        destroyHls();

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('播放源加载完成。');
            playVideo();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              if (sourceIndex < sources.length - 1) {
                sourceIndex += 1;
                loadCurrentSource();
              } else {
                setStatus('视频加载失败，请稍后重试。');
                button.classList.remove('is-hidden');
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            setStatus('播放源加载完成。');
            playVideo();
          }, { once: true });
          video.addEventListener('error', function () {
            if (sourceIndex < sources.length - 1) {
              sourceIndex += 1;
              loadCurrentSource();
            } else {
              setStatus('视频加载失败，请稍后重试。');
              button.classList.remove('is-hidden');
            }
          }, { once: true });
        } else {
          setStatus('当前浏览器不支持 HLS 视频播放。');
        }
      }

      function startPlayback() {
        if (!started) {
          started = true;
          loadCurrentSource();
        } else {
          playVideo();
        }
      }

      button.addEventListener('click', startPlayback);
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });
      window.addEventListener('pagehide', destroyHls);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initImageFallbacks();
    initHero();
    initHomeSearch();
    initFilters();
    initPlayers();
  });
}());
