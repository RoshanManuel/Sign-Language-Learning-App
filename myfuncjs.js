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
const recognizedText = document.getElementById('recognizedText');


let webcam = document.getElementById('webcam');
let webcamWindow = null;


function startWebcam() {
    if (webcam) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                webcam.srcObject = stream;
            })
            .catch(error => {
                console.error('Error accessing webcam:', error);
                webcam.insertAdjacentHTML('afterend', '<p style="color: red;">Webcam access denied. Please allow camera permissions.</p>');
            });
    }
}


function stopWebcam() {
    if (webcam && webcam.srcObject) {
        const tracks = webcam.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        webcam.srcObject = null;
    }
}


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
                webcamWindow = window.open('webcam.html', '_blank');
                webcamWindow.onload = () => {
                    webcam = webcamWindow.document.getElementById('webcam');
                    startWebcam();
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


if (practiceBtn) practiceBtn.addEventListener('click', () => showSection(practiceSection));
if (conversionBtn) conversionBtn.addEventListener('click', () => showSection(conversionSection));
if (quizBtn) quizBtn.addEventListener('click', () => showSection(quizSection));
if (dashboardBtn) dashboardBtn.addEventListener('click', () => showSection(dashboardSection));

// Show Practice by default(need to add another holder)
if (practiceSection) showSection(practiceSection);

if (window.location.pathname.includes('webcam.html')) {
    webcam = document.getElementById('webcam');
    startWebcam();
}
