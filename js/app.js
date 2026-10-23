document.addEventListener("DOMContentLoaded", () => {
    const instructions = document.querySelector("#instructions p");
    
    // Initialize the camera
    initCamera().then(() => {
        instructions.innerText = "Hold your device for 10 seconds 📱✨";
        // Start countdown once camera is ready
        setTimeout(() => {
            startCountdown(10, onCountdownComplete);
        }, 1000);
    }).catch(err => {
        instructions.innerText = "Camera access needed to play! 📸";
        console.error(err);
    });

    document.getElementById('retry-btn').addEventListener('click', () => {
        document.getElementById('result-overlay').classList.add('hidden');
        instructions.innerText = "Hold your device for 10 seconds 📱✨";
        startCountdown(10, onCountdownComplete);
    });
});

function onCountdownComplete() {
    document.querySelector("#instructions p").innerText = "Analyzing cuteness... 💖";
    
    setTimeout(() => {
        const score = generateCutenessScore();
        const compliment = getRandomCompliment();
        
        document.getElementById('cuteness-score').innerText = `Score: ${score}/100 💗`;
        document.getElementById('compliment-text').innerText = compliment;
        
        document.getElementById('result-overlay').classList.remove('hidden');
        document.querySelector("#instructions p").innerText = "Results are in! ✨";
    }, 800);
}