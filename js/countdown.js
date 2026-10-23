const countdownOverlay = document.getElementById('countdown-overlay');
const countdownText = document.getElementById('countdown-text');
const circle = document.querySelector('.progress-ring__circle');
const radius = circle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;

circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = circumference;

function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDashoffset = offset;
}

function startCountdown(duration, callback) {
    countdownOverlay.classList.remove('hidden');
    let timeLeft = duration;
    
    countdownText.innerText = timeLeft;
    setProgress(100);
    
    const interval = setInterval(() => {
        timeLeft--;
        countdownText.innerText = timeLeft;
        setProgress((timeLeft / duration) * 100);
        
        if (timeLeft <= 0) {
            clearInterval(interval);
            countdownOverlay.classList.add('hidden');
            callback();
        }
    }, 1000);
}