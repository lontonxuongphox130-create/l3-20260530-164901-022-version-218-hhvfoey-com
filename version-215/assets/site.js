(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
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

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var sortSelect = document.querySelector('[data-sort-select]');
    var filterScope = document.querySelector('[data-filter-scope]');
    var emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
        if (!filterScope) {
            return;
        }

        var cards = Array.prototype.slice.call(filterScope.querySelectorAll('[data-title]'));
        var keyword = normalize(filterInput ? filterInput.value : '');
        var visibleCount = 0;

        cards.forEach(function (card) {
            var text = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-category'),
                card.textContent
            ].join(' '));
            var matched = !keyword || text.indexOf(keyword) !== -1;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.style.display = visibleCount ? 'none' : 'block';
        }
    }

    function applySort() {
        if (!filterScope || !sortSelect) {
            return;
        }

        var items = Array.prototype.slice.call(filterScope.querySelectorAll('[data-title]'));
        var mode = sortSelect.value;

        items.sort(function (a, b) {
            if (mode === 'year-asc') {
                return Number(a.getAttribute('data-year') || 0) - Number(b.getAttribute('data-year') || 0);
            }
            if (mode === 'hot-desc') {
                return Number(b.getAttribute('data-hot') || 0) - Number(a.getAttribute('data-hot') || 0);
            }
            return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
        });

        items.forEach(function (item) {
            filterScope.appendChild(item);
        });
        applyFilter();
    }

    if (filterInput) {
        filterInput.addEventListener('input', applyFilter);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', applySort);
        applySort();
    } else {
        applyFilter();
    }
}());
