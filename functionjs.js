// Get buttons and sections
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
let recognitionInterval = null;


function showSection(sectionToShow) {
    if (practiceSection) practiceSection.style.display = 'none';
    if (conversionSection) conversionSection.style.display = 'none';
    if (quizSection) quizSection.style.display = 'none';
    if (dashboardSection) dashboardSection.style.display = 'none';
    sectionToShow.style.display = 'block';

    if (sectionToShow !== conversionSection) {
        stopWebcam();
    }
}

function startWebcam(event) {
    event.preventDefault();
    const video = document.getElementById('webcam');
    if (video) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
            .then(stream => {
                video.srcObject = stream;
                webcamStream = stream;
                video.onloadedmetadata = () => {
                    video.play();
                    webcamContainer.style.display = 'flex';
                    recognizedText.textContent = 'Webcam active';
                    webcamToggleBtn.style.display = 'none';
                    stopWebcamBtn.style.display = 'block';
                    recognitionInterval = setInterval(simulateSignRecognition, 2000);
                    console.log('Webcam started, stream active:', stream.getVideoTracks()[0].label);
                };
            })
            .catch(error => {
                console.error('Webcam error:', error);
                recognizedText.textContent = `Error: ${error.message} (Check camera permissions)`;
            });
    } else {
        console.error('Video element not found');
        recognizedText.textContent = 'Error: Video element missing';
    }
}


function stopWebcam() {
    if (webcamStream) {
        const tracks = webcamStream.getTracks();
        tracks.forEach(track => track.stop());
        webcamStream = null;
        webcamContainer.style.display = 'none';
        recognizedText.textContent = 'None';
        webcamToggleBtn.style.display = 'block';
        stopWebcamBtn.style.display = 'none';
        if (recognitionInterval) {
            clearInterval(recognitionInterval);
            recognitionInterval = null;
        }
        console.log('Webcam stopped');
    }
}


function simulateSignRecognition() {
    const signs = ['Hello', 'Yes', 'No', 'Thank You', 'Please'];
    const randomSign = signs[Math.floor(Math.random() * signs.length)];
    recognizedText.textContent = randomSign;
}


if (practiceBtn) practiceBtn.addEventListener('click', () => showSection(practiceSection));
if (conversionBtn) conversionBtn.addEventListener('click', () => showSection(conversionSection));
if (quizBtn) quizBtn.addEventListener('click', () => showSection(quizSection));
if (dashboardBtn) dashboardBtn.addEventListener('click', () => showSection(dashboardSection));

if (webcamToggleBtn) webcamToggleBtn.addEventListener('click', startWebcam);
if (stopWebcamBtn) {
    stopWebcamBtn.style.display = 'none';
    stopWebcamBtn.addEventListener('click', stopWebcam);
}

if (practiceSection) showSection(practiceSection);
