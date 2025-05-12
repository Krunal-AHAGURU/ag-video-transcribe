
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



function addAIGenratedQNA(){

}

    // Q&A functionality
const qnaContainer = document.getElementById('ai-genrate-qna');
// const qnaTabButton = document.getElementById('qna-tab-button');
const qnaTabContent = document.getElementById('qna-tab-content');
const videoElement = document.getElementById('my-video'); // Get video element

const jsonFilePath = '/static/subtitles/ahaguru-Transcription-sample-001_en_qns.json';

// Function to fetch and display the Q&A
async function loadAndDisplayQnA() {
    try {
        const response = await fetch(jsonFilePath);
        const data = await response.json();
        console.log(data); // Log the data for debugging

        // Clear any existing content
        qnaTabContent.innerHTML = '';

        data.questions.forEach(item => {
            const questionDiv = document.createElement('div');
            questionDiv.classList.add('question-item');

            const questionText = document.createElement('p');
            questionText.textContent = item.question;
            questionText.classList.add('question-text');
            questionDiv.appendChild(questionText);

            const answerDiv = document.createElement('div');
            answerDiv.classList.add('answer');
            answerDiv.textContent = item.answer;
            answerDiv.style.display = 'none'; // Initially hide the answer
            questionDiv.appendChild(answerDiv);

            const timestampLink = document.createElement('a');
            timestampLink.href = '#'; // Placeholder, will be updated
            timestampLink.textContent = `[${item.timestamp}]`;
            timestampLink.classList.add('timestamp-link');
            questionDiv.appendChild(timestampLink);

            qnaTabContent.appendChild(questionDiv);

            // Add event listener to toggle answer visibility
            questionText.addEventListener('click', () => {
                answerDiv.style.display = answerDiv.style.display === 'none' ? 'block' : 'none';
            });
            
             // Add event listener to timestamp link to seek video
            timestampLink.addEventListener('click', (event) => {
                event.preventDefault(); // Prevent default link behavior
                const [start, end] = item.timestamp.split(" - ");
                const [startMinutes, startSeconds] = start.split(":").map(parseFloat);
                const startTime = startMinutes * 60 + startSeconds;
                videoElement.currentTime = startTime;
            });
        });

    } catch (error) {
        console.error('Error loading or parsing JSON:', error);
        qnaTabContent.textContent = 'Failed to load Q&A.';
    }
}

loadAndDisplayQnA()




async function loadVideoDataSummeryzation() {
  try {
    let summeryjsonFilePath = '/static/subtitles/ahaguru-video-summary_en.json';
    const response = await fetch(summeryjsonFilePath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const videoData = await response.json();
    renderVideoContent(videoData);
  } catch (error) {
    console.error('Error loading the summary JSON:', error);
  }
}

loadVideoDataSummeryzation()

    function renderVideoContent(data) {
      const container = document.getElementById('ai-summary');
      let html = `
        <h1>${data.title}</h1>
        <p>${data.main_summary}</p>
        <div class="accordion" id="accordionSections">
      `;

      data.sections.forEach((section, index) => {
        html += `
          <div class="accordion-item">
            <h2 class="accordion-header" id="heading${index}">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}">
                ${section.subtitle} <span class="ms-auto text-muted small">${section.start_time}</span>
              </button>
            </h2>
            <div id="collapse${index}" class="accordion-collapse collapse" data-bs-parent="#accordionSections">
              <div class="accordion-body">${section.summary}</div>
            </div>
          </div>
        `;
      });

      html += `</div>`;
      container.innerHTML = html;
    }

    