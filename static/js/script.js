var player = videojs('my-video');

        // Update CC div to show current subtitle
        player.on('loadedmetadata', function() {
            var track = player.textTracks()[0]; // Assuming only one track for simplicity
            track.mode = 'showing'; // Show the track by default
            track.oncuechange = function() {
                var currentCue = track.activeCues[0];
                if (currentCue) {
                    document.getElementById('cc-div').innerText = currentCue.text; // Show subtitles in the CC div
                }
            };
        });


document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById('Video-Transcribe');
    const player = videojs('my-video');
    let segmentSpans = [];

    fetch('/static/subtitles/ahaguru-Transcription-sample-001_hindi.json')
        .then(response => response.json())
        .then(data => {
            container.innerHTML = '';
            // const segments = data.audio_segments;
            const segments = data.audio_segments;

            segments.forEach((segment, index) => {
                const span = document.createElement('span');
                span.textContent = `${formatTime(parseFloat(segment.start_time))} - ${segment.transcript}`;
                span.style.display = 'block';
                span.style.cursor = 'pointer';
                span.dataset.start = parseFloat(segment.start_time);
                span.dataset.end = parseFloat(segment.end_time);
                span.dataset.index = index;

                span.onclick = () => {
                    player.currentTime(span.dataset.start);
                    player.play();
                };

                container.appendChild(span);
                segmentSpans.push(span);
            });

            // Track current time and highlight transcript
            player.on('timeupdate', () => {
                const currentTime = player.currentTime();
                segmentSpans.forEach(span => {
                    const start = parseFloat(span.dataset.start);
                    const end = parseFloat(span.dataset.end);
                    if (currentTime >= start && currentTime <= end) {
                        span.style.backgroundColor = '#0000ff25';
                        span.style.fontWeight = 'bold';
                        // Scroll to visible
                        span.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else {
                        span.style.backgroundColor = '';
                        span.style.fontWeight = 'normal';
                    }
                });
            });
        })
        .catch(error => {
            container.textContent = 'Failed to load transcript';
            console.error('Error loading transcript:', error);
        });

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
});
