// Get buttons and sections
const practiceBtn = document.getElementById('practiceBtn');
const conversionBtn = document.getElementById('conversionBtn');
const quizBtn = document.getElementById('quizBtn');
const dashboardBtn = document.getElementById('dashboardBtn');

const practiceSection = document.getElementById('practiceSection');
const conversionSection = document.getElementById('conversionSection');
const quizSection = document.getElementById('quizSection');
const dashboardSection = document.getElementById('dashboardSection');

let openWebcamBtn = document.getElementById('openWebcamBtn');
let webcam = null;
let webcamWindow = null;
let webcamStream = null;
let recognitionInterval = null;

// Show one section and hide others
function showSection(sectionToShow) {
    if (practiceSection) practiceSection.style.display = 'none';
    if (conversionSection) conversionSection.style.display = 'none';
    if (quizSection) quizSection.style.display = 'none';
    if (dashboardSection) dashboardSection.style.display = 'none';
    sectionToShow.style.display = 'block';

    if (sectionToShow === conversionSection) {
        openWebcamBtn = document.getElementById('openWebcamBtn');
        if (openWebcamBtn && !openWebcamBtn.onclick) {
            openWebcamBtn.onclick = () => {
                webcamWindow = window.open('webcam.html', '_blank', 'width=800,height=600');
                webcamWindow.onload = () => {
                    webcam = webcamWindow.document.getElementById('webcam');
                    startWebcam();
                    setupWebcamWindow();
                };
            };
        }
    } else {
        stopWebcam();
        if (webcamWindow) {
            webcamWindow.close();
            webcamWindow = null;
            webcam = null;
        }
    }
}

// Start webcam
function startWebcam() {
    if (webcam) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                webcam.srcObject = stream;
                webcamStream = stream;
                console.log('Webcam started');
            })
            .catch(error => {
                console.error('Error accessing webcam:', error);
                webcam.insertAdjacentHTML('afterend', '<p style="color: red;">Webcam access denied. Please allow camera permissions.</p>');
            });
    }
}

// Stop webcam
function stopWebcam() {
    if (webcamStream) {
        const tracks = webcamStream.getTracks();
        tracks.forEach(track => track.stop());
        webcamStream = null;
        console.log('Webcam stopped');
    }
    if (recognitionInterval) {
        clearInterval(recognitionInterval);
        recognitionInterval = null;
    }
}

// Placeholder sign recognition
function simulateSignRecognition() {
    if (webcamWindow && webcamWindow.document.getElementById('recognizedText')) {
        const recognizedText = webcamWindow.document.getElementById('recognizedText');
        const signs = ['Hello', 'Yes', 'No', 'Thank You', 'Please'];
        const randomSign = signs[Math.floor(Math.random() * signs.length)];
        recognizedText.textContent = randomSign;
    }
}

// Setup webcam window controls
function setupWebcamWindow() {
    const stopBtn = webcamWindow.document.getElementById('stopWebcamBtn');
    if (stopBtn) {
        stopBtn.onclick = () => {
            stopWebcam();
            webcamWindow.close();
            webcamWindow = null;
            webcam = null;
        };
    }
    recognitionInterval = setInterval(simulateSignRecognition, 2000);
}

// Button click events
if (practiceBtn) practiceBtn.addEventListener('click', () => showSection(practiceSection));
if (conversionBtn) conversionBtn.addEventListener('click', () => showSection(conversionSection));
if (quizBtn) quizBtn.addEventListener('click', () => showSection(quizSection));
if (dashboardBtn) dashboardBtn.addEventListener('click', () => showSection(dashboardSection));

// Show Practice (Classes) by default
if (practiceSection) showSection(practiceSection);

// Handle webcam.html logic
if (window.location.pathname.includes('webcam.html')) {
    webcam = document.getElementById('webcam');
    startWebcam();
}   
