/* 🐋 Whale Civilization 3 — Tutorial System */

let tutorialStep = 0;
let tutorialActive = false;

const TUTORIAL_STEPS = [
    { text: '🐋 Welcome to Whale Civilization 3! Click on a whale to select it.', highlight: 'unit' },
    { text: '👆 Great! Now click a highlighted hex to move your whale there.', highlight: 'move' },
    { text: '🍽️ Move to a tile with resources and click Feed to gather food!', highlight: 'feed' },
    { text: '🎵 Try clicking Sing to earn Song points for cultural victory!', highlight: 'sing' },
    { text: '⏭️ Click Next Turn when all whales have acted. Good luck! 🌊', highlight: 'next-turn' },
];

export function startTutorial() {
    if (localStorage.getItem('whale_civ3_tutorial_done')) return;
    tutorialStep = 0;
    tutorialActive = true;
    showTutorialStep();
}

function showTutorialStep() {
    if (tutorialStep >= TUTORIAL_STEPS.length) {
        tutorialActive = false;
        localStorage.setItem('whale_civ3_tutorial_done', 'true');
        return;
    }

    const step = TUTORIAL_STEPS[tutorialStep];
    showToast(step.text, 8000);
}

export function advanceTutorial(action) {
    if (!tutorialActive) return;
    const step = TUTORIAL_STEPS[tutorialStep];
    if ((action === 'select' && step.highlight === 'unit') ||
        (action === 'move' && step.highlight === 'move') ||
        (action === 'feed' && step.highlight === 'feed') ||
        (action === 'sing' && step.highlight === 'sing') ||
        (action === 'next-turn' && step.highlight === 'next-turn')) {
        tutorialStep++;
        showTutorialStep();
    }
}

function showToast(text, duration = 5000) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = text;
    toast.classList.remove('hidden');
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hidden');
    }, duration);
}
