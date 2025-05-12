# Face-Recognition Attendance System

## 1. Overview

This web-based application enables users to register and mark attendance using face recognition, combined with Aadhaar number validation. It supports online and offline modes, synchronizing captured attendance records when connectivity is restored.

**Key Objectives:**

* **Face-Based Authentication:** Capture and match live webcam feed against registered face descriptors.
* **Aadhaar Integration (Dummy):** Collect 12-digit Aadhaar number during registration (without OTP).
* **Offline Support:** Mark attendance offline and sync automatically when online.
* **Interactive UI:** Modern, responsive interface written in html, css, js (via CDN) for both registration and attendance.

## 2. Features

1. **User Registration**

   * Capture user’s name, Aadhaar number, and face descriptor.
   * Live camera preview, snapshot, and face detection.
   * Storage of face descriptor vector and Aadhaar number in MongoDB.

2. **Attendance Marking**

   * Live camera capture to detect and recognize face.
   * Match against existing descriptors using `face-api.js`.
   * Store attendance record (`userId`, `timestamp`) online or offline.

3. **Data Listing**

   * Display table of registered users (name, Aadhaar, user ID).
   * Display chronological attendance records (user name, timestamp).

4. **Offline-First**

   * Service Worker caches application shell and optional assets.
   * Background Sync API queues offline attendance records and pushes them when connectivity returns.

## 3. Tech Stack

* **Frontend**

  * **HTML,JS ** (via CDN) for UI.
  * **face-api.js** for client-side face detection & recognition.
  * **Service Worker & Background Sync** for offline support.
  * **HTML/CSS** for layout and styling.

* **Backend**

  * **Node.js & Express** for REST API endpoints.
  * **MongoDB** (Atlas) with **Mongoose**  for data persistence.
  * **CORS & body-parser** middleware for JSON handling.

* **Hosting**

  * Serve static files via Express from `public/`.
  * Models served under `/models` route. (don't use because it take the long time)

## 4. Architecture & Flow

1. **Registration Flow**

   * User navigates to `/register.html`.
   * page loads `face-api.js` models from CDN.
   * User clicks “Start Camera”, then “Capture Face” to generate a descriptor.
   * On form submit, name + Aadhaar + descriptor POST to `/api/users/register`.
   * Backend stores in `users` collection.

2. **Attendance Flow**

   * User opens `/` (attendance page).
   * page fetches `/api/users` and `/api/attendance`, renders tables.
   * User clicks “Start Camera” → “Capture & Mark”.
   * Face descriptor extracted and matched via `FaceMatcher`.
   * If recognized, attendance record POST to `/api/attendance` (or stored locally if offline).
   * Table of attendance refreshes.

3. **Offline Sync**

   * Service Worker registers `sw.js`.
   * On offline mark, record pushed into `localStorage.pending` and Background Sync registered.
   * When back online, SW triggers sync event, posts `pending` records to `/api/attendance/bulk` and clears queue.

## 5. Folder Structure

```
face-attend/
├─ public/           
│     ├ index.html             # Attendance page
│     ├ register.html          # Registration page
│     ├ app.js                 # Attendance React logic
│     ├ register.js            # Registration React logic
│     ├ sw.js                  # Service Worker
│     └ face-api.min.js        # face-api UMD (CDN fallback)
└─ server/
   ├ models/
   │  ├ User.js                # Mongoose User schema
   │  └ Attendance.js           # Mongoose Attendance schema
   ├ routes/
   │  ├ users.js               # /api/users endpoints
   │  └ attendance.js          # /api/attendance endpoints
   └ index.js                    # Express entry point
```

## 6. Setup & Run Instructions

1. **Clone & Install**

   ```bash
   git clone https://github.com/Sachin9548/Face-Recognition-Attendance-System.git face-attend && cd face-attend
   npm install express mongoose cors body-parser
   ```

2. **Configure MongoDB**

   * Update connection string in `server/app.js` (uses Atlas or local `mongodb://localhost/face_attend`).

3. **Start the Server**

   ```bash
   node server/app.js
   ```

4. **Access the App**

   * **Registration:**  [http://localhost:3000/register.html](http://localhost:3000/register.html)
   * **Attendance:**    [http://localhost:3000/](http://localhost:3000/)

5. **Offline Testing**

   * In Chrome DevTools → Application → Service Workers → check “Offline”
   * Mark attendance, then uncheck offline and watch sync.

*End of documentation*
