const Hls = window.Hls;

const players = Array.from(document.querySelectorAll('[data-player]'));

players.forEach(function (wrap) {
  const video = wrap.querySelector('video');
  const playButton = wrap.querySelector('[data-play]');
  const message = wrap.querySelector('[data-player-message]');

  if (!video || !playButton) {
    return;
  }

  const stream = video.getAttribute('data-stream');
  let hls = null;
  let ready = false;

  function showMessage() {
    if (message) {
      message.textContent = '视频暂时无法播放';
      message.classList.add('show');
    }
  }

  function prepare() {
    if (ready) {
      return;
    }

    ready = true;

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showMessage();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else {
      showMessage();
    }
  }

  function play() {
    prepare();
    const result = video.play();

    if (result && typeof result.catch === 'function') {
      result.catch(function () {
        showMessage();
      });
    }
  }

  playButton.addEventListener('click', play);

  video.addEventListener('play', function () {
    wrap.classList.add('is-playing');
  });

  video.addEventListener('pause', function () {
    if (video.currentTime <= 0) {
      wrap.classList.remove('is-playing');
    }
  });

  video.addEventListener('ended', function () {
    wrap.classList.remove('is-playing');
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
});
