
  const player = videojs('my-video');
  let segmentSpans = [];
  let lastHighlightedIndex = -1;

  document.addEventListener("DOMContentLoaded", function () {
    player.ready(() => {
      // Listen for subtitle track change
      const textTracks = player.textTracks();

      for (let i = 0; i < textTracks.length; i++) {
        textTracks[i].addEventListener('change', () => {
          if (textTracks[i].mode === 'showing') {
            loadTranscriptByLang(textTracks[i].language);
            updateCCDisplay(textTracks[i]);
          }
        });

        // Set default transcript on first load
        if (textTracks[i].mode === 'showing') {
          loadTranscriptByLang(textTracks[i].language);
          updateCCDisplay(textTracks[i]);
        }
      }
    });
  });

  function loadTranscriptByLang(langCode) {
    const transcriptMap = {
      en: 'ahaguru-Transcription-sample-001_en.json',
      hi: 'ahaguru-Transcription-sample-001_hindi.json',
      ta: 'ahaguru-Transcription-sample-001_tamil.json',
    };

    const path = `/static/subtitles/${transcriptMap[langCode]}`;
    const container = document.getElementById('Video-Transcribe');
    container.innerHTML = '';
    segmentSpans = [];
    lastHighlightedIndex = -1;

    fetch(path)
      .then((res) => res.json())
      .then((data) => {
        const segments = data.audio_segments;

        segments.forEach((segment, index) => {
          const span = document.createElement('span');
          span.textContent = `${formatTime(segment.start_time)} - ${segment.transcript}`;
          span.style.display = 'block';
          span.style.cursor = 'pointer';
          span.dataset.start = segment.start_time;
          span.dataset.end = segment.end_time;
          span.dataset.index = index;

          span.onclick = () => {
            player.currentTime(parseFloat(span.dataset.start));
            player.play();
          };

          container.appendChild(span);
          segmentSpans.push(span);
        });

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
      .catch((err) => {
        container.textContent = 'Transcript failed to load.';
        console.error(err);
      });
  }

  function updateCCDisplay(track) {
    track.oncuechange = () => {
      const cue = track.activeCues[0];
      const ccDiv = document.getElementById('cc-div');
      ccDiv.innerText = cue ? cue.text : 'No captions selected';
    };
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

