function generateCutenessScore() {
    const min = 92;
    const max = 99;
    
    if (Math.random() > 0.9) return 100;
    
    return Math.floor(Math.random() * (max - min + 1)) + min;
}