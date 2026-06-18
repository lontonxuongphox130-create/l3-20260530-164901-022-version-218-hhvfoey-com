(function () {
  "use strict";

  var header = document.querySelector("[data-site-header]");
  var menuToggle = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 36) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startHero() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = parseInt(dot.getAttribute("data-hero-dot"), 10);
        showSlide(index);
        startHero();
      });
    });

    showSlide(0);
    startHero();
  }

  var searchInput = document.querySelector("[data-card-search]");
  var cardContainer = document.querySelector("[data-card-container]");
  var resultCount = document.querySelector("[data-result-count]");
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-channel], [data-filter-keyword]"));
  var activeChannel = "all";
  var activeKeyword = "all";

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function applyFilters() {
    if (!cardContainer) {
      return;
    }
    var query = normalize(searchInput ? searchInput.value : "");
    var cards = Array.prototype.slice.call(cardContainer.querySelectorAll(".movie-card"));
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-search"));
      var channel = card.getAttribute("data-channel") || "";
      var matchesQuery = !query || text.indexOf(query) !== -1;
      var matchesChannel = activeChannel === "all" || channel === activeChannel;
      var matchesKeyword = activeKeyword === "all" || text.indexOf(normalize(activeKeyword)) !== -1;
      var shouldShow = matchesQuery && matchesChannel && matchesKeyword;

      card.classList.toggle("hidden-by-filter", !shouldShow);
      if (shouldShow) {
        visible += 1;
      }
    });

    if (resultCount) {
      resultCount.textContent = visible + " 部影片";
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var channel = button.getAttribute("data-filter-channel");
      var keyword = button.getAttribute("data-filter-keyword");
      var groupSelector = channel !== null ? "[data-filter-channel]" : "[data-filter-keyword]";

      Array.prototype.slice.call(document.querySelectorAll(groupSelector)).forEach(function (otherButton) {
        otherButton.classList.remove("is-active");
      });
      button.classList.add("is-active");

      if (channel !== null) {
        activeChannel = channel;
      }
      if (keyword !== null) {
        activeKeyword = keyword;
      }
      applyFilters();
    });
  });

  applyFilters();

  function initializePlayer(player) {
    var video = player.querySelector("video");
    var overlay = player.querySelector(".player-overlay");
    var message = player.querySelector("[data-player-message]");
    var source = player.getAttribute("data-video-src");
    var hlsInstance = null;

    function setMessage(text) {
      if (message) {
        message.textContent = text || "";
      }
    }

    function loadAndPlay() {
      if (!video || !source) {
        setMessage("播放源暂不可用");
        return;
      }

      if (player.getAttribute("data-initialized") !== "true") {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          player.setAttribute("data-initialized", "true");
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setMessage("");
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage("当前网络环境下播放源加载失败，可刷新页面后重试");
            }
          });
          player.setAttribute("data-initialized", "true");
        } else {
          setMessage("当前浏览器暂不支持 HLS 播放");
          return;
        }
      }

      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          setMessage("浏览器阻止了自动播放，请再次点击播放按钮");
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", loadAndPlay);
    }

    if (video) {
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        player.classList.remove("is-playing");
      });
      video.addEventListener("click", function () {
        if (video.paused) {
          loadAndPlay();
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll(".movie-player")).forEach(initializePlayer);
})();
