(function () {
  const button = document.querySelector('[data-mobile-button]');
  const nav = document.querySelector('[data-mobile-nav]');

  if (button && nav) {
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const previous = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === index);
      });

      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === index);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener('click', function () {
        showSlide(current);
        startTimer();
      });
    });

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  const grids = Array.from(document.querySelectorAll('[data-movie-grid]'));
  const searchInput = document.querySelector('[data-search-input]');
  const categoryFilter = document.querySelector('[data-category-filter]');
  const yearFilter = document.querySelector('[data-year-filter]');
  const typeFilter = document.querySelector('[data-type-filter]');
  const emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function updateCards() {
    const query = normalize(searchInput ? searchInput.value : '');
    const category = normalize(categoryFilter ? categoryFilter.value : '');
    const year = normalize(yearFilter ? yearFilter.value : '');
    const type = normalize(typeFilter ? typeFilter.value : '');
    let visible = 0;

    grids.forEach(function (grid) {
      const cards = Array.from(grid.querySelectorAll('.movie-card'));

      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.tags,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.category
        ].join(' '));

        const ok = (!query || haystack.indexOf(query) !== -1) &&
          (!category || normalize(card.dataset.category) === category) &&
          (!year || normalize(card.dataset.year) === year) &&
          (!type || normalize(card.dataset.type) === type);

        card.hidden = !ok;

        if (ok) {
          visible += 1;
        }
      });
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  [searchInput, categoryFilter, yearFilter, typeFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', updateCards);
      control.addEventListener('change', updateCards);
    }
  });

  updateCards();
})();
