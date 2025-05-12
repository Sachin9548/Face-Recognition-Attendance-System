(async () => {
  // 1) Load models from CDN
  const MODEL_URL =
    "https://cdn.jsdelivr.net/gh/cgarciagl/face-api.js@0.22.2/weights";
  await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

  // 2) Fetch users & attendance, then render both tables
  let users = [];
  try {
    const res = await fetch("/api/users");
    console.log(res)
    if (!res.ok) throw new Error(res.statusText);
    users = await res.json();
    renderUsers(users);
  } catch (e) {
    return alert("Failed to load users: " + e.message);
  }

  // attendance fetch + render
  async function loadAttendance() {
    try {
      const res = await fetch("/api/attendance");
      if (!res.ok) throw new Error(res.statusText);
      const records = await res.json();
      renderAttendance(records);
    } catch (e) {
      console.error("Attendance load error:", e);
    }
  }
  await loadAttendance();

  // 3) Build FaceMatcher only if we have users
  if (users.length === 0) {
    alert("No users registered. Please register at /register.html first.");
    return;
  }
  const labeledDescriptors = users.map(
    (u) =>
      new faceapi.LabeledFaceDescriptors(u._id, [
        new Float32Array(u.descriptor),
      ]),
  );
  const matcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

  // 4) Set up camera / capture buttons
  const startBtn = document.getElementById("startCamera");
  const captureBtn = document.getElementById("captureAttendance");
  const video = document.getElementById("video");
  let stream;

  startBtn.addEventListener("click", async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      await video.play();
      video.hidden = false;
      startBtn.disabled = true;
      captureBtn.disabled = false;
    } catch (err) {
      alert("Cannot access camera: " + err.message);
    }
  });

  captureBtn.addEventListener("click", async () => {
    if (!stream) return alert("Camera not started.");

    // detect
    const detection = await faceapi
      .detectSingleFace(video)
      .withFaceLandmarks()
      .withFaceDescriptor();
    stream.getTracks().forEach((t) => t.stop());
    video.hidden = true;
    startBtn.disabled = false;
    captureBtn.disabled = true;

    if (!detection) {
      return alert("No face detected.");
    }

    // match
    const match = matcher.findBestMatch(detection.descriptor);
    if (match.label === "unknown") {
      return alert("Face not recognized.");
    }

    // record
    const record = { userId: match.label, timestamp: new Date().toISOString() };
    if (navigator.onLine) {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });
      alert(`Attendance marked for ${match.label}`);
      await loadAttendance(); // refresh table
    } else {
      const pending = JSON.parse(localStorage.getItem("pending") || "[]");
      pending.push(record);
      localStorage.setItem("pending", JSON.stringify(pending));
      navigator.serviceWorker.ready.then((sw) =>
        sw.sync.register("sync-attendance"),
      );
      alert("Saved offline; will sync when online.");
    }
  });

  // register SW (for offline sync)
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
  }

  // --- rendering helpers ---
  function renderUsers(userList) {
    const tbody = document.querySelector("#usersTable tbody");
    tbody.innerHTML = "";
    userList.forEach((u) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.name}</td>
        <td>${u.aadhaar}</td>
        <td>${u._id}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderAttendance(records) {
    const tbody = document.querySelector("#attendanceTable tbody");
    tbody.innerHTML = "";
    records.forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.userId.name}</td>
        <td>${new Date(r.timestamp).toLocaleString()}</td>
      `;
      tbody.appendChild(tr);
    });
  }
})();
