const CACHE_NAME = "face-attend-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/register.html",
  "/app.js",
  "/register.js",
  "/models/ssd_mobilenetv1_model-weights_manifest.json" ,
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});

self.addEventListener("sync", (evt) => {
  if (evt.tag === "sync-attendance") {
    evt.waitUntil(
      (async () => {
        const records = JSON.parse(localStorage.getItem("pending") || "[]");
        if (!records.length) return;
        await fetch("/api/attendance/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ records }),
        });
        localStorage.removeItem("pending");
      })(),
    );
  }
});
