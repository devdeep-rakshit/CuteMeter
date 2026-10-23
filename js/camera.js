const video = document.getElementById("camera-feed");
let cameraStream = null;

async function initCamera() {
    if (cameraStream) return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("This browser cannot access the camera. Open the site over HTTPS and use a supported browser.");
    }

    let requestedStream = null;

    try {
        requestedStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user",
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });

        video.srcObject = requestedStream;

        await new Promise((resolve, reject) => {
            let settled = false;
            const timeoutId = setTimeout(() => finish(new Error("Camera took too long to start. Try again.")), 10000);

            function finish(error) {
                if (settled) return;
                settled = true;
                clearTimeout(timeoutId);
                video.removeEventListener("loadedmetadata", onLoaded);
                video.removeEventListener("error", onError);
                if (error) reject(error);
                else resolve();
            }

            function onLoaded() {
                if (video.videoWidth > 0 && video.videoHeight > 0) finish();
            }

            function onError() {
                finish(new Error("The browser could not read the camera stream."));
            }

            video.addEventListener("loadedmetadata", onLoaded);
            video.addEventListener("error", onError);

            if (video.readyState >= 1 && video.videoWidth > 0 && video.videoHeight > 0) onLoaded();
        });

        await video.play();
        cameraStream = requestedStream;
    } catch (error) {
        if (requestedStream) requestedStream.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
        throw error instanceof Error ? error : new Error("Could not start the camera. Check your camera permission.");
    }
}

async function capturePhoto() {
    if (!cameraStream || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
        throw new Error("The camera is not ready yet. Wait for the live preview and try again.");
    }

    const maxDimension = 1280;
    const scale = Math.min(1, maxDimension / Math.max(video.videoWidth, video.videoHeight));
    const width = Math.max(1, Math.round(video.videoWidth * scale));
    const height = Math.max(1, Math.round(video.videoHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not prepare the photo. Please try again.");

    // Mirror the saved image so it matches the front-camera preview.
    context.translate(width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, width, height);

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("The browser could not create a photo. Please try again."));
        }, "image/jpeg", 0.84);
    });
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        cameraStream = null;
    }
    if (video) video.srcObject = null;
}
