(async () => {
  // 1) Load models from CDN
  const MODEL_URL = 'https://cdn.jsdelivr.net/gh/cgarciagl/face-api.js@0.22.2/weights';
  await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

  // 2) Grab elements
  const video      = document.getElementById('video');
  const canvas     = document.getElementById('capture');
  const btnStart   = document.getElementById('startCamera');
  let    stream    = null;
  let    descriptor;

  btnStart.addEventListener('click', async () => {
    if (!stream) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.hidden    = false;
        await video.play();             
        btnStart.textContent = 'Capture Face';
      } catch (err) {
        return alert('❌ Cannot access camera: ' + err.message);
      }
      return;
    }
    const detection = await faceapi
      .detectSingleFace(video)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      return alert('⚠️ No face detected. Please align your face and try again.');
    }

    descriptor = Array.from(detection.descriptor);

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.hidden = false;

    stream.getTracks().forEach(t => t.stop());

    btnStart.disabled     = true;
    btnStart.textContent  = 'Face Captured';
    alert('✅ Face captured! Now submit your registration.');
  });

  // 4) Handle form submit
  document.getElementById('regForm').addEventListener('submit', async e => {
    e.preventDefault();
    if (!descriptor) {
      return alert('⚠️ Please capture your face before submitting.');
    }
    const name    = document.getElementById('name').value;
    const aadhaar = document.getElementById('aadhaar').value;

    const res = await fetch('/api/users/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, aadhaar, descriptor })
    });
    const data = await res.json();
    if (data.success) {
      alert(`🎉 Registered! Your new user ID is ${data.userId}`);
      window.location.href = '/';
    } else {
      alert(`❌ Registration error: ${data.error || 'Unknown'}`);
    }
  });
})();
