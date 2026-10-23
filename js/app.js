document.addEventListener("DOMContentLoaded", () => {
    const instructions = document.querySelector("#instructions p");
    const captureButton = document.getElementById("capture-btn");
    const downloadButton = document.getElementById("download-btn");
    const photoPanel = document.getElementById("photo-panel");
    const photoPreview = document.getElementById("photo-preview");
    const consentCheckbox = document.getElementById("telegram-consent");
    const sendKeyInput = document.getElementById("send-key");
    const sendButton = document.getElementById("send-telegram-btn");
    const telegramStatus = document.getElementById("telegram-status");
    const retryButton = document.getElementById("retry-btn");
    const isGitHubPages = window.location.hostname.endsWith(".github.io");

    let capturedBlob = null;
    let capturedObjectUrl = null;
    let isSending = false;

    function updateSendButton() {
        sendButton.disabled = isGitHubPages || !capturedBlob || !consentCheckbox.checked ||
            !sendKeyInput.value.trim() || isSending;
    }

    function setTelegramStatus(message, isError) {
        telegramStatus.textContent = message;
        telegramStatus.classList.toggle("error", Boolean(isError));
    }

    function showDeploymentHelp() {
        if (isGitHubPages) {
            setTelegramStatus("This GitHub Pages site cannot run the protected Telegram API. Deploy this repo to Vercel and add the three server environment variables listed in README.md.", true);
        }
    }

    function blobToDataUrl(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("Could not prepare the photo for sending."));
            reader.readAsDataURL(blob);
        });
    }

    captureButton.addEventListener("click", async () => {
        captureButton.disabled = true;
        instructions.textContent = "Taking your photo... 📸";
        try {
            capturedBlob = await capturePhoto();

            if (capturedObjectUrl) URL.revokeObjectURL(capturedObjectUrl);
            capturedObjectUrl = URL.createObjectURL(capturedBlob);
            photoPreview.src = capturedObjectUrl;
            photoPanel.classList.remove("hidden");
            downloadButton.disabled = false;
            consentCheckbox.checked = false;
            sendKeyInput.value = "";

            if (isGitHubPages) {
                showDeploymentHelp();
            } else {
                setTelegramStatus("Photo captured on this device. It will not be sent unless you check consent and press Send to Telegram.", false);
            }

            instructions.textContent = "Photo ready! Review the preview below. ✨";
            updateSendButton();
        } catch (error) {
            instructions.textContent = error.message || "Could not take the photo. Please try again.";
        } finally {
            captureButton.disabled = false;
        }
    });

    downloadButton.addEventListener("click", () => {
        if (!capturedObjectUrl) return;
        const link = document.createElement("a");
        link.href = capturedObjectUrl;
        link.download = "cutemeter-photo.jpg";
        document.body.appendChild(link);
        link.click();
        link.remove();
    });

    consentCheckbox.addEventListener("change", updateSendButton);
    sendKeyInput.addEventListener("input", updateSendButton);

    sendButton.addEventListener("click", async () => {
        if (!capturedBlob || !consentCheckbox.checked || !sendKeyInput.value.trim() || isGitHubPages) {
            updateSendButton();
            return;
        }

        isSending = true;
        updateSendButton();
        setTelegramStatus("Sending the photo you selected to Telegram...", false);

        try {
            const imageData = await blobToDataUrl(capturedBlob);
            const response = await fetch("/api/send-photo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    imageData: imageData,
                    sendKey: sendKeyInput.value
                })
            });

            let result = {};
            try {
                result = await response.json();
            } catch (_) {
                result = {};
            }

            if (!response.ok || result.ok !== true) {
                throw new Error(result.error || "The server did not confirm delivery. Check the Vercel deployment and environment variables.");
            }

            setTelegramStatus(result.message || "Photo sent successfully to Telegram. 💌", false);
            sendKeyInput.value = "";
        } catch (error) {
            setTelegramStatus("Photo not sent: " + (error.message || "Unknown error") + " Check the setup in README.md.", true);
        } finally {
            isSending = false;
            updateSendButton();
        }
    });

    retryButton.addEventListener("click", () => {
        document.getElementById("result-overlay").classList.add("hidden");
        instructions.textContent = "Hold your device for 10 seconds 📱✨";
        startCountdown(10, onCountdownComplete);
    });

    initCamera().then(() => {
        captureButton.disabled = false;
        instructions.textContent = "Camera ready. Take a photo whenever you are ready. 📱✨";
        if (isGitHubPages) {
            setTelegramStatus("Telegram sending is disabled on GitHub Pages. The photo can still be captured and downloaded here. Deploy to Vercel to enable secure sending.", true);
        } else {
            setTelegramStatus("To send a photo, capture it, check the consent box, enter your private send key, then press Send to Telegram.", false);
        }
        setTimeout(() => startCountdown(10, onCountdownComplete), 1000);
    }).catch((error) => {
        instructions.textContent = (error.message || "Camera access is needed to play.") + " Check permission and reload the page.";
        captureButton.disabled = true;
        console.error("CuteMeter camera initialization failed:", error);
    });

    window.addEventListener("pagehide", () => {
        stopCamera();
        if (capturedObjectUrl) URL.revokeObjectURL(capturedObjectUrl);
    });
});

function onCountdownComplete() {
    document.querySelector("#instructions p").innerText = "Analyzing cuteness... 💖";

    setTimeout(() => {
        const score = generateCutenessScore();
        const compliment = getRandomCompliment();

        document.getElementById("cuteness-score").innerText = "Score: " + score + "/100 💗";
        document.getElementById("compliment-text").innerText = compliment;
        document.getElementById("result-overlay").classList.remove("hidden");
        document.querySelector("#instructions p").innerText = "Results are in! ✨";
    }, 800);
}
