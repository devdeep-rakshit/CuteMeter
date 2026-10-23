const video = document.getElementById('camera-feed');
let stream = null;

async function initCamera() {
    if (stream) return;
    
    try {
        const constraints = {
            video: {
                facingMode: 'user', // Prioritize front camera
                width: { ideal: 720 },
                height: { ideal: 1280 }
            },
            audio: false
        };
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        
        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play();
                resolve();
            };
        });
    } catch (err) {
        throw new Error("Could not access camera.");
    }
}