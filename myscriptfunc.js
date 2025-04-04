const practiceBtn = document.getElementById('practiceBtn');
const conversionBtn = document.getElementById('conversionBtn');
const quizBtn = document.getElementById('quizBtn');
const dashboardBtn = document.getElementById('dashboardBtn');
const practiceSection = document.getElementById('practiceSection');
const conversionSection = document.getElementById('conversionSection');
const quizSection = document.getElementById('quizSection');
const dashboardSection = document.getElementById('dashboardSection');
const webcamToggleBtn = document.getElementById('webcamToggleBtn');
const webcamContainer = document.getElementById('webcamContainer');
const recognizedText = document.getElementById('recognizedText');
const stopWebcamBtn = document.getElementById('stopWebcamBtn');

let webcamStream = null;

function showSection(sectionToShow) {
    practiceSection.style.display = 'none';
    conversionSection.style.display = 'none';
    quizSection.style.display = 'none';
    dashboardSection.style.display = 'none';
    sectionToShow.style.display = 'block';
    if (sectionToShow !== conversionSection) stopWebcam();
}

async function startWebcam(event) {
    event.preventDefault();
    const video = document.getElementById('webcam');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        video.srcObject = stream;
        webcamStream = stream;
        video.onloadedmetadata = () => {
            video.play();
            webcamContainer.style.display = 'flex';
            recognizedText.textContent = 'Initializing...';
            webcamToggleBtn.style.display = 'none';
            stopWebcamBtn.style.display = 'block';

            const hands = new Hands({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${file}`
            });
            hands.setOptions({
                staticImageMode: false,
                maxNumHands: 1,  // Match inference_classifier.py
                minDetectionConfidence: 0.3,
                minTrackingConfidence: 0.3
            });
            hands.onResults(async (results) => {
                if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                    let dataAux = [];
                    const landmarks = results.multiHandLandmarks[0]; // First hand only
                    let x = landmarks.map(lm => lm.x);
                    let y = landmarks.map(lm => lm.y);
                    let minX = Math.min(...x);
                    let minY = Math.min(...y);
                    for (const lm of landmarks) {
                        dataAux.push(lm.x - minX);
                        dataAux.push(lm.y - minY);
                    }
                    try {
                        const response = await fetch('/predict', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ landmarks: dataAux })
                        });
                        const result = await response.json();
                        recognizedText.textContent = result.prediction || 'Unknown';
                    } catch (e) {
                        recognizedText.textContent = 'Prediction error';
                    }
                } else {
                    recognizedText.textContent = 'No hand detected';
                }
            });

            const camera = new Camera(video, {
                onFrame: async () => await hands.send({ image: video }),
                width: 640,
                height: 480
            });
            camera.start();
        };
    } catch (error) {
        recognizedText.textContent = `Error: ${error.message}`;
    }
}

function stopWebcam() {
    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        webcamStream = null;
        webcamContainer.style.display = 'none';
        recognizedText.textContent = 'None';
        webcamToggleBtn.style.display = 'block';
        stopWebcamBtn.style.display = 'none';
    }
}

practiceBtn.addEventListener('click', () => showSection(practiceSection));
conversionBtn.addEventListener('click', () => showSection(conversionSection));
quizBtn.addEventListener('click', () => showSection(quizSection));
dashboardBtn.addEventListener('click', () => showSection(dashboardSection));
webcamToggleBtn.addEventListener('click', startWebcam);
stopWebcamBtn.addEventListener('click', stopWebcam);
stopWebcamBtn.style.display = 'none';
showSection(practiceSection);
