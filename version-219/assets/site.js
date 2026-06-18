(() => {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');

  if (header && menuToggle) {
    menuToggle.addEventListener('click', () => {
      const open = header.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(open));
    });
  }

  const slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    let index = 0;

    const showSlide = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        showSlide(Number(dot.dataset.heroDot || 0));
      });
    });

    if (slides.length > 1) {
      window.setInterval(() => showSlide(index + 1), 5600);
    }
  }

  const searchInput = document.querySelector('[data-search-input]');

  if (searchInput) {
    const scope = document.querySelector('[data-card-scope]') || document;
    const cards = Array.from(scope.querySelectorAll('.movie-card'));

    searchInput.addEventListener('input', () => {
      const keyword = searchInput.value.trim().toLowerCase();
      cards.forEach((card) => {
        const haystack = `${card.dataset.title || ''} ${card.dataset.meta || ''}`.toLowerCase();
        card.dataset.filterHidden = keyword && !haystack.includes(keyword) ? 'true' : 'false';
      });
    });
  }

  const startPlayer = (shell) => {
    const video = shell.querySelector('.video-node');
    const cover = shell.querySelector('.player-cover');
    const src = shell.dataset.videoSrc;

    if (!video || !src) {
      return;
    }

    const launch = () => {
      if (!video.dataset.ready) {
        if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          video._hls = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else {
          video.src = src;
        }
        video.dataset.ready = 'true';
      }

      if (cover) {
        cover.classList.add('is-hidden');
      }

      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    };

    if (cover) {
      cover.addEventListener('click', launch);
    }

    video.addEventListener('click', () => {
      if (!video.dataset.ready) {
        launch();
      }
    });
  };

  document.querySelectorAll('.player-shell').forEach(startPlayer);
})();
