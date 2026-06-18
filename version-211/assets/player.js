(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    document.querySelectorAll('[data-video-player]').forEach(function (root) {
      var video = root.querySelector('video');
      var play = root.querySelector('[data-player-play]');
      var state = root.querySelector('[data-player-state]');
      var source = root.getAttribute('data-src') || (video && video.getAttribute('data-src')) || '';
      var hlsReady = false;

      function setState(text) {
        if (state) state.textContent = text;
      }

      function attachSource() {
        if (!video || !source || hlsReady) return;
        var canNative = video.canPlayType('application/vnd.apple.mpegURL') || video.canPlayType('application/x-mpegURL');
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setState('播放源已就绪');
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setState('播放源正在重试');
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              }
            }
          });
        } else if (canNative) {
          video.src = source;
          setState('播放源已就绪');
        } else {
          video.src = source;
          setState('正在尝试播放');
        }
        hlsReady = true;
      }

      function startPlayback() {
        if (!video) return;
        attachSource();
        if (play) play.classList.add('hidden');
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.then(function () {
            setState('正在播放');
          }).catch(function () {
            setState('请再次点击播放');
            if (play) play.classList.remove('hidden');
          });
        } else {
          setState('正在播放');
        }
      }

      if (play) {
        play.addEventListener('click', startPlayback);
      }
      if (video) {
        video.addEventListener('play', function () {
          if (play) play.classList.add('hidden');
          setState('正在播放');
        });
        video.addEventListener('pause', function () {
          setState('已暂停');
        });
        video.addEventListener('click', function () {
          if (video.paused) startPlayback();
        });
      }
    });
  });
})();
