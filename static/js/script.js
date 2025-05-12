
  const player = videojs('my-video');
  let segmentSpans = [];
  let lastHighlightedIndex = -1;

  document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById('Video-Transcribe');

    // Load English transcript JSON (default)
    fetch('/static/subtitles/ahaguru-Transcription-sample-001_en.json')
      .then(response => response.json())
      .then(data => {
        container.innerHTML = '';
        segmentSpans = [];

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
            player.currentTime(parseFloat(span.dataset.start));
            player.play();
          };

          container.appendChild(span);
          segmentSpans.push(span);
        });

        // Add timeupdate listener only once
        player.off('timeupdate');
        player.on('timeupdate', () => {
          const currentTime = player.currentTime();
          let newIndex = -1;

          for (let i = 0; i < segmentSpans.length; i++) {
            const start = parseFloat(segmentSpans[i].dataset.start);
            const end = parseFloat(segmentSpans[i].dataset.end);
            if (currentTime >= start && currentTime <= end) {
              newIndex = i;
              break;
            }
          }

          if (newIndex !== -1 && newIndex !== lastHighlightedIndex) {
            segmentSpans.forEach((span, idx) => {
              if (idx === newIndex) {
                span.style.backgroundColor = '#0000ff25';
                span.style.fontWeight = 'bold';
                span.scrollIntoView({ behavior: 'smooth', block: 'center' });
              } else {
                span.style.backgroundColor = '';
                span.style.fontWeight = 'normal';
              }
            });
            lastHighlightedIndex = newIndex;
          }
        });
      })
      .catch(error => {
        container.textContent = 'Failed to load transcript';
        console.error('Error loading transcript:', error);
      });

    // Load CC from video track
    player.on('loadedmetadata', function () {
      const tracks = player.textTracks();

      for (let i = 0; i < tracks.length; i++) {
        // Enable only English by default
        if (tracks[i].language === 'en') {
          tracks[i].mode = 'showing';

          tracks[i].oncuechange = function () {
            const cue = tracks[i].activeCues[0];
            const ccDiv = document.getElementById('cc-div');
            if (cue && ccDiv) {
              ccDiv.innerText = cue.text;
            } else if (ccDiv) {
              ccDiv.innerText = '';
            }
          };
        } else {
          tracks[i].mode = 'disabled';
        }
      }
    });

    function formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  });
