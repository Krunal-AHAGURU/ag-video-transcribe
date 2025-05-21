
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
      ccDiv.innerText = cue ? cue.text : '...';
    };
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }



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
                <div class="w-100 d-flex justify-content-between align-items-center">
                <span>${section.subtitle}</span>
                <span class="text-muted small">${section.start_time} &nbsp;</span>
                </div>
            </button>
            </h2>
            <div id="collapse${index}" class="accordion-collapse collapse" data-bs-parent="#accordionSections">
                <div class="accordion-body">${section.summary}</div>
            </div>
          </div>
        `;
      });
      html+=`<br><p>${data.conclusion}</p>`
      html += `</div>`;
      container.innerHTML = html;
}



// async function loadqnaDataSummeryzation() {
//   try {

//     const jsonQnaFilePath = '/static/subtitles/ahaguru-Transcription-sample-001_en_qns.json';

//     const response = await fetch(jsonQnaFilePath);
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     const qnaData = await response.json();
//     renderqnaContent(qnaData);
//   } catch (error) {
//     console.error('Error loading the summary JSON:', error);
//   }
// }

// loadqnaDataSummeryzation()


// function renderqnaContent(data) {
//     const container = document.getElementById('qna-container');
//     let html = '';
//     data.questions.forEach((section, index) => {
//         html += `
//           <div class="accordion-item">
//            <h2 class="accordion-header" id="heading${index}">
//             <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}">
//                 <div class="w-100 d-flex justify-content-between align-items-center">
//                 <span>${section.question}</span>
//                 </div>
//             </button>
//             </h2>
//             <div id="collapse${index}" class="accordion-collapse collapse" data-bs-parent="#accordionSections">
//                 <div class="accordion-body">
//                     ${section.answer}
//                     <br>
//                     <span class="qna-timeStemp">Time Stamp : ${section.timestamp} &nbsp;</span>
//                 </div>
//             </div>
//           </div>
//         `;
//       });
//       html += `</div>`;
//       container.innerHTML = html;
// }

async function loadqnaDataSummeryzation() {
  try {
    const jsonQnaFilePath = '/static/subtitles/ahaguru-Transcription-sample-001_en_qns.json';
    const response = await fetch(jsonQnaFilePath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const qnaData = await response.json();
    renderqnaContent(qnaData);
  } catch (error) {
    console.error('Error loading the summary JSON:', error);
  }
}

function renderqnaContent(data) {
  const container = document.getElementById('qna-container');
  let html = '';
  data.questions.forEach((section, index) => {
    html += `
      <div class="accordion-item">
        <h2 class="accordion-header" id="heading${index}">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}">
            <div class="w-100 d-flex justify-content-between align-items-center">
              <span>${section.question}</span>
            </div>
          </button>
        </h2>
        <div id="collapse${index}" class="accordion-collapse collapse" data-bs-parent="#accordionSections">
          <div class="accordion-body">
            ${section.answer}
            <br>
            <span class="qna-timeStemp">Time Stamp : ${section.timestamp} &nbsp;</span>
          </div>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;

  // Re-render math expressions using KaTeX
  if (typeof renderMathInElement === 'function') {
    renderMathInElement(container, {
      delimiters: [
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false }
      ]
    });
  }
}

loadqnaDataSummeryzation();


 document.addEventListener('DOMContentLoaded', function() {
            // Get elements
            const predefinedQuestionBtn = document.getElementById('predefined-question');
            const chatDisplay = document.getElementById('chat-display');
            const inputField = document.getElementById('ask-ahaguru-ai-input');
            const sendBtn = document.getElementById('ask-ai-btn');
            
            // Answer to the predefined question
            const answer = "A force at an angle can always be broken down into a horizontal component and a vertical component.";
            
            // Add click event to the predefined question button
            predefinedQuestionBtn.addEventListener('click', function() {
                // Show the chat container if it's hidden
                chatDisplay.style.display = 'block';
                
                // Clear previous content
                chatDisplay.innerHTML = '';
                
                // Create question bubble
                const questionBubble = document.createElement('div');
                questionBubble.className = 'question-bubble';
                questionBubble.textContent = predefinedQuestionBtn.textContent;
                chatDisplay.appendChild(questionBubble);
                
                // Create answer bubble
                const answerBubble = document.createElement('div');
                answerBubble.className = 'answer-bubble';
                answerBubble.textContent = answer;
                chatDisplay.appendChild(answerBubble);
                
                // Enable input field and send button
                inputField.disabled = false;
                sendBtn.disabled = false;
                
                // Scroll to the bottom of the chat
                chatDisplay.scrollTop = chatDisplay.scrollHeight;
            });
            
            // Optional: Add functionality for the send button
            sendBtn.addEventListener('click', function() {
                const userMessage = inputField.value.trim();
                if (userMessage) {
                    // Create user message bubble
                    const userBubble = document.createElement('div');
                    userBubble.className = 'question-bubble';
                    userBubble.textContent = userMessage;
                    chatDisplay.appendChild(userBubble);
                    
                    // Here you would typically send the message to your backend
                    // and get a response, but for now we'll just show a placeholder
                    const responseBubble = document.createElement('div');
                    responseBubble.className = 'answer-bubble';
                    responseBubble.textContent = "I'm a simple demo. In a real app, I would respond to your question!";
                    chatDisplay.appendChild(responseBubble);
                    
                    // Clear input field
                    inputField.value = '';
                    
                    // Scroll to the bottom of the chat
                    chatDisplay.scrollTop = chatDisplay.scrollHeight;
                }
            });
            
            // Optional: Allow sending messages with Enter key
            inputField.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendBtn.click();
                }
            });
        });