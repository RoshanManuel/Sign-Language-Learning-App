const webcamToggleBtn = document.getElementById('webcamToggleBtn');
const stopWebcamBtn = document.getElementById('stopWebcamBtn');
const webcamContainer = document.getElementById('webcamContainer');
const webcam = document.getElementById('webcam');
const recognizedText = document.getElementById('recognizedText');

const practiceBtn = document.getElementById('practiceBtn');
const conversionBtn = document.getElementById('conversionBtn');
const quizBtn = document.getElementById('quizBtn');
const dashboardBtn = document.getElementById('dashboardBtn');
const practiceSection = document.getElementById('practiceSection');
const conversionSection = document.getElementById('conversionSection');
const quizSection = document.getElementById('quizSection');
const dashboardSection = document.getElementById('dashboardSection');

let webcamStream = null;

function showSection(sectionToShow) {
  practiceSection.style.display = 'none';
  conversionSection.style.display = 'none';
  quizSection.style.display = 'none';
  dashboardSection.style.display = 'none';
  sectionToShow.style.display = 'block';
  if (sectionToShow !== conversionSection) stopWebcam();
}

webcamToggleBtn.addEventListener('click', async () => {
  try {
    webcamContainer.style.display = 'flex';
    recognizedText.textContent = 'Starting webcam...';

    if (!webcamStream) {
      webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
      webcam.srcObject = webcamStream;
      webcam.play();
      startPredictionLoop();
      webcamToggleBtn.style.display = 'none';
      stopWebcamBtn.style.display = 'block';
    }
  } catch (err) {
    recognizedText.textContent = `Webcam error: ${err.message}`;
  }
});

stopWebcamBtn.addEventListener('click', stopWebcam);

function stopWebcam() {
  if (webcamStream) {
    webcamStream.getTracks().forEach(track => track.stop());
    webcam.srcObject = null;
    webcamStream = null;
  }
  webcamContainer.style.display = 'none';
  recognizedText.textContent = 'None';
  webcamToggleBtn.style.display = 'block';
  stopWebcamBtn.style.display = 'none';
}

function captureFrame(videoElement) {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg');
}

async function sendToServer(base64Image) {
  try {
    const response = await fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image })
    });

    const data = await response.json();
    if (data.prediction) {
      recognizedText.textContent = data.prediction;
    } else {
      recognizedText.textContent = 'Unknown';
    }
  } catch (err) {
    recognizedText.textContent = 'Server error';
    console.error(err);
  }
}

function startPredictionLoop() {
  setInterval(() => {
    if (webcamStream) {
      const base64 = captureFrame(webcam);
      sendToServer(base64);
    }
  }, 1500);
}

practiceBtn.addEventListener('click', () => showSection(practiceSection));
conversionBtn.addEventListener('click', () => showSection(conversionSection));
quizBtn.addEventListener('click', () => showSection(quizSection));
dashboardBtn.addEventListener('click', () => showSection(dashboardSection));
stopWebcamBtn.style.display = 'none';
showSection(practiceSection);
