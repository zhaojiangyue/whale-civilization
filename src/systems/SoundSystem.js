/* 🐋 Whale Civilization 3 — Sound System (Web Audio API whale calls) */

let audioCtx = null;

export function resumeAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

export function playWhaleCall(factionId) {
    if (!audioCtx) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const freqs = {
            blue_whale: 20, humpback: 80, sperm_whale: 40,
            orca: 150, beluga: 200, narwhal: 100,
        };

        osc.frequency.value = freqs[factionId] || 60;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);

        osc.start();
        osc.stop(audioCtx.currentTime + 1.5);
    } catch (e) { /* ignore audio errors */ }
}

export function playClick() {
    if (!audioCtx) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 440;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) { /* ignore */ }
}
