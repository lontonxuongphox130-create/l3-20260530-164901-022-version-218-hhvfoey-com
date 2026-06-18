(function () {
    function boot(options) {
        var video = document.getElementById(options.videoId);
        var button = document.getElementById(options.buttonId);
        var url = options.url;
        var hlsInstance = null;
        var started = false;

        if (!video || !url) {
            return;
        }

        function attachSource() {
            if (started) {
                return;
            }

            started = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function playVideo() {
            attachSource();
            if (button) {
                button.classList.add('hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('hidden');
            }
        });

        video.addEventListener('ended', function () {
            if (button) {
                button.classList.remove('hidden');
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    window.MoviePlayer = {
        boot: boot
    };
}());
