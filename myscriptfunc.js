// Check which page we're on
const isAuthPage = window.location.pathname === '/';
const isIndexPage = window.location.pathname === '/index';

// Common elements (available on both pages)
const authBtn = document.getElementById('authBtn');
const authSection = document.getElementById('authSection');
const signInPage = document.getElementById('signInPage');
const signUpPage = document.getElementById('signUpPage');
const showSignUpLink = document.getElementById('showSignUpLink');
const showSignInLink = document.getElementById('showSignInLink');
const signInBtn = document.getElementById('signInBtn');
const signUpBtn = document.getElementById('signUpBtn');

// Index page elements
let webcamToggleBtn, stopWebcamBtn, webcamContainer, webcam, recognizedText,
    practiceBtn, conversionBtn, quizBtn, dashboardBtn,
    practiceSection, conversionSection, quizSection, dashboardSection;

if (isIndexPage) {
    webcamToggleBtn = document.getElementById('webcamToggleBtn');
    stopWebcamBtn = document.getElementById('stopWebcamBtn');
    webcamContainer = document.getElementById('webcamContainer');
    webcam = document.getElementById('webcam');
    recognizedText = document.getElementById('recognizedText');
    practiceBtn = document.getElementById('practiceBtn');
    conversionBtn = document.getElementById('conversionBtn');
    quizBtn = document.getElementById('quizBtn');
    dashboardBtn = document.getElementById('dashboardBtn');
    practiceSection = document.getElementById('practiceSection');
    conversionSection = document.getElementById('conversionSection');
    quizSection = document.getElementById('quizSection');
    dashboardSection = document.getElementById('dashboardSection');
}

let webcamStream = null;
const canvas = document.createElement('canvas');

// Authentication logic (only for auth.html)
if (isAuthPage) {
    authBtn.addEventListener('click', () => {
        authSection.style.display = 'block';
        authBtn.style.display = 'none';
    });

    showSignUpLink.addEventListener('click', () => {
        signInPage.style.display = 'none';
        signUpPage.style.display = 'block';
    });

    showSignInLink.addEventListener('click', () => {
        signUpPage.style.display = 'none';
        signInPage.style.display = 'block';
    });

    signUpBtn.addEventListener('click', () => {
        const name = document.getElementById('signUpName').value;
        const email = document.getElementById('signUpEmail').value;
        const password = document.getElementById('signUpPassword').value;

        if (name && email && password) {
            const userDetails = { name, email, password };
            localStorage.setItem('user', JSON.stringify(userDetails));
            alert(`Account Created Successfully\nDetails:\nName: ${name}\nEmail: ${email}\nPassword: ${password}`);
            console.log('Stored User Details:', userDetails);
            window.location.href = '/index';
        } else {
            alert('Please fill in all fields.');
        }
    });

    signInBtn.addEventListener('click', () => {
        const email = document.getElementById('signInEmail').value;
        const password = document.getElementById('signInPassword').value;
        const storedUser = JSON.parse(localStorage.getItem('user'));

        if (storedUser && storedUser.email === email && storedUser.password === password) {
            alert(`Welcome back, ${storedUser.name}!`);
            window.location.href = '/index';
        } else {
            alert('Invalid email or password. Please sign up if you don\'t have an account.');
        }
    });
}

// Index page logic
if (isIndexPage) {
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
                webcam.onloadedmetadata = () => {
                    webcam.play();
                    canvas.width = webcam.videoWidth;
                    canvas.height = webcam.videoHeight;
                    startPredictionLoop();
                    webcamToggleBtn.style.display = 'none';
                    stopWebcamBtn.style.display = 'block';
                    recognizedText.textContent = 'None';
                };
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

    async function sendToServer(base64Image) {
        try {
            console.log('Sending frame to server');
            const response = await fetch('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64Image })
            });
            const data = await response.json();
            console.log('Prediction result:', data);
            recognizedText.textContent = data.prediction || 'Unknown';
        } catch (err) {
            recognizedText.textContent = 'Server error';
            console.error(err);
        }
    }

    function startPredictionLoop() {
        const ctx = canvas.getContext('2d');
        let lastPredictionTime = 0;
        const predictionInterval = 500;

        function processFrame() {
            if (!webcamStream) return;
            const now = Date.now();
            if (now - lastPredictionTime >= predictionInterval) {
                ctx.drawImage(webcam, 0, 0, canvas.width, canvas.height);
                const base64 = canvas.toDataURL('image/jpeg', 0.8);
                sendToServer(base64);
                lastPredictionTime = now;
            }
            requestAnimationFrame(processFrame);
        }
        requestAnimationFrame(processFrame);
    }

    practiceBtn.addEventListener('click', () => showSection(practiceSection));
    conversionBtn.addEventListener('click', () => showSection(conversionSection));
    quizBtn.addEventListener('click', () => showSection(quizSection));
    dashboardBtn.addEventListener('click', () => showSection(dashboardSection));
    stopWebcamBtn.style.display = 'none';
    showSection(practiceSection);
}
