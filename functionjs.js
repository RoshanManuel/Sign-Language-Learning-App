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

// Show one section and hide others
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

// Start webcam
function startWebcam() {
    const video = document.getElementById('webcam');
    if (video) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream;
                webcamStream = stream;
                webcamContainer.style.display = 'flex';
                recognizedText.textContent = 'Webcam active';
                webcamToggleBtn.style.display = 'none';
                stopWebcamBtn.style.display = 'block';
                recognitionInterval = setInterval(simulateSignRecognition, 2000);
                console.log('Webcam started');
            })
            .catch(error => {
                console.error('Error accessing webcam:', error);
                video.insertAdjacentHTML('afterend', '<p style="color: red;">Webcam access denied. Please allow camera permissions.</p>');
            });
    }
}

// Stop webcam
function stopWebcam() {
    if (webcamStream) {
        const tracks = webcamStream.getTracks();
        tracks.forEach(track => track.stop());
        webcamStream = null;
        webcamContainer.style.display = 'none';
        recognizedText.textContent = 'None';
        webcamToggleBtn.style.display = 'block'; // Ensure it’s visible and centered
        stopWebcamBtn.style.display = 'none';
        if (recognitionInterval) {
            clearInterval(recognitionInterval);
            recognitionInterval = null;
        }
        console.log('Webcam stopped');
    }
}

// Placeholder sign recognition
function simulateSignRecognition() {
    const signs = ['Hello', 'Yes', 'No', 'Thank You', 'Please'];
    const randomSign = signs[Math.floor(Math.random() * signs.length)];
    recognizedText.textContent = randomSign;
}

// Button click events
if (practiceBtn) practiceBtn.addEventListener('click', () => showSection(practiceSection));
if (conversionBtn) conversionBtn.addEventListener('click', () => showSection(conversionSection));
if (quizBtn) quizBtn.addEventListener('click', () => showSection(quizSection));
if (dashboardBtn) dashboardBtn.addEventListener('click', () => showSection(dashboardSection));

if (webcamToggleBtn) webcamToggleBtn.addEventListener('click', startWebcam);
if (stopWebcamBtn) {
    stopWebcamBtn.style.display = 'none'; // Initially hidden
    stopWebcamBtn.addEventListener('click', stopWebcam);
}

// Show Classes by default
if (practiceSection) showSection(practiceSection);
