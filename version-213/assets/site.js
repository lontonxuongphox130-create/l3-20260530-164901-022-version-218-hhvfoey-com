
(function () {
  var navButton = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.site-nav');

  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var heroPattern = document.querySelector('.hero-pattern');

  if (heroPattern) {
    window.addEventListener('scroll', function () {
      heroPattern.style.setProperty('--hero-y', window.scrollY * 0.35 + 'px');
    }, { passive: true });
  }

  document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  });

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  document.querySelectorAll('[data-filter-form]').forEach(function (panel) {
    var section = panel.closest('section') || document;
    var input = panel.querySelector('[data-page-search]');
    var select = panel.querySelector('[data-genre-filter]');
    var cards = Array.prototype.slice.call(section.querySelectorAll('.searchable-card'));
    var empty = section.querySelector('.empty-state');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    function apply() {
      var text = normalize(input && input.value);
      var genre = normalize(select && select.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search') || card.textContent);
        var cardGenre = normalize(card.getAttribute('data-genre') || '');
        var matchedText = !text || haystack.indexOf(text) !== -1;
        var matchedGenre = !genre || cardGenre.indexOf(genre) !== -1 || haystack.indexOf(genre) !== -1;
        var matched = matchedText && matchedGenre;

        card.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    if (select) {
      select.addEventListener('change', apply);
    }

    apply();
  });
})();
