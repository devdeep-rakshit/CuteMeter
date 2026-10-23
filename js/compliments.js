const compliments = [
    "Warning: Too cute for this planet. 👽💖",
    "Your smile just improved the internet by 87%. ✨",
    "Scientists have detected dangerously high levels of adorable. 🧪💕",
    "Main character energy: MAXIMUM. 🎬👑",
    "Your face has officially unlocked premium-level cuteness. 🔓🎀",
    "The camera needs a moment to process all that charm. 📸💗",
    "Achievement unlocked: Professional Heart Stealer. 🏆💘",
    "If cuteness were currency, you'd own the entire planet. 🌍💸",
    "Plot twist: You were the reason the flowers bloomed. 🌸",
    "Confidence looks good on you. Keep shining. ✨",
    "Error 404: Flaws not found. 🎀",
    "Are you a magician? Because everyone else just disappeared. 🪄✨"
];

function getRandomCompliment() {
    const randomIndex = Math.floor(Math.random() * compliments.length);
    return compliments[randomIndex];
}