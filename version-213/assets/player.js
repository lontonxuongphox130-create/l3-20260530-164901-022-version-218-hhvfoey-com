
(function () {
  function setup(container) {
    var stream = container.getAttribute('data-stream');
    var video = container.querySelector('video');
    var cover = container.querySelector('.player-cover');
    var started = false;
    var hls = null;

    if (!stream || !video || !cover) {
      return;
    }

    function tryPlay() {
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    function start() {
      if (started) {
        tryPlay();
        return;
      }

      started = true;
      cover.classList.add('is-hidden');

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          tryPlay();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal || !hls) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.addEventListener('loadedmetadata', tryPlay, { once: true });
        tryPlay();
      } else {
        video.src = stream;
        tryPlay();
      }
    }

    cover.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.player-card[data-stream]').forEach(setup);
  });
})();
