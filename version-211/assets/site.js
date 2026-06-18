(function () {
  var header = document.querySelector('[data-site-header]');
  var toggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function updateHeader() {
    if (!header) return;
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (toggle && mobileNav && header) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
      header.classList.toggle('menu-open', mobileNav.classList.contains('open'));
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(next) {
      if (!slides.length) return;
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  function getQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  document.querySelectorAll('[data-filter-root]').forEach(function (root) {
    var search = root.querySelector('[data-filter-search]');
    var region = root.querySelector('[data-filter-region]');
    var type = root.querySelector('[data-filter-type]');
    var year = root.querySelector('[data-filter-year]');
    var channel = root.querySelector('[data-filter-channel]');
    var note = root.querySelector('[data-filter-note]');
    var empty = root.querySelector('[data-empty-state]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-movie-card]'));

    if (search) {
      var query = getQueryValue('q');
      if (query) search.value = query;
    }

    function textOf(card) {
      return [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-type') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-tags') || '',
        card.textContent || ''
      ].join(' ').toLowerCase();
    }

    function applyFilter() {
      var q = search ? search.value.trim().toLowerCase() : '';
      var r = region ? region.value : '';
      var t = type ? type.value : '';
      var y = year ? year.value : '';
      var c = channel ? channel.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var ok = true;
        if (q && textOf(card).indexOf(q) === -1) ok = false;
        if (r && card.getAttribute('data-region') !== r) ok = false;
        if (t && card.getAttribute('data-type') !== t) ok = false;
        if (y && card.getAttribute('data-year') !== y) ok = false;
        if (c && (card.textContent || '').indexOf(c) === -1) ok = false;
        card.classList.toggle('is-hidden', !ok);
        if (ok) visible += 1;
      });

      if (empty) empty.classList.toggle('show', visible === 0);
      if (note) note.textContent = visible === 0 ? '没有匹配内容，请调整筛选条件。' : '筛选结果已更新。';
    }

    [search, region, type, year, channel].forEach(function (el) {
      if (!el) return;
      el.addEventListener('input', applyFilter);
      el.addEventListener('change', applyFilter);
    });

    applyFilter();
  });
})();
