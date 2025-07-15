const backgroundElement = document.getElementById('background');
const sarahElement = document.getElementById('sarah');
const changbinElement = document.getElementById('changbin');
const dialogueBox = document.getElementById('dialogue-box');
const dialogueText = document.getElementById('dialogue-text');
const choicesContainer = document.getElementById('choices-container');
const nextButton = document.getElementById('next-button');

// --- Game State ---
let currentSceneIndex = 0;
let currentDialogueIndex = 0;

// --- Story Data ---
// This is just a small example. You'll expand this significantly!
const gameStory = [
    {
        type: 'dialogue',
        background: 'bg-library.jpg',
        characters: ['sarah'], // Characters visible in this scene
        speaker: 'Sarah',
        text: "Oh, it's Changbin! I need to find a way to talk to him. This library is the perfect place.",
        choices: null // No choices in this segment
    },
    {
        type: 'dialogue',
        speaker: 'Changbin',
        text: "Hmm, this book on astrophysics is quite interesting...",
        choices: null
    },
    {
        type: 'choice',
        speaker: 'Sarah',
        text: "What should I do?",
        choices: [
            { text: "Approach him directly.", nextScene: 'approachChangbin' },
            { text: "Pretend to need a book nearby.", nextScene: 'bookStrategy' }
        ]
const backgroundElement = document.getElementById('background');
const sarahElement = document.getElementById('sarah');
const changbinElement = document.getElementById('changbin');
const dialogueBox = document.getElementById('dialogue-box');
const dialogueText = document.getElementById('dialogue-text');
const choicesContainer = document.getElementById('choices-container');
const nextButton = document.getElementById('next-button');

// --- Game State ---
let currentSceneIndex = 0;
let currentDialogueIndex = 0;

// --- Story Data ---
// This is just a small example. You'll expand this significantly!
const gameStory = [
    {
        type: 'dialogue',
        background: 'bg-library.jpg',
        characters: ['sarah'], // Characters visible in this scene
        speaker: 'Sarah',
        text: "Oh, it's Changbin! I need to find a way to talk to him. This library is the perfect place.",
        choices: null // No choices in this segment
    },
    {
        type: 'dialogue',
        speaker: 'Changbin',
        text: "Hmm, this book on astrophysics is quite interesting...",
        choices: null
    },
    {
        type: 'choice',
        speaker: 'Sarah',
        text: "What should I do?",
        choices: [
            { text: "Approach him directly.", nextScene: 'approachChangbin' },
            { text: "Pretend to need a book nearby.", nextScene: 'bookStrategy' }
        ]
    },
    // --- Define more scenes here with unique identifiers ---
    {
        id: 'approachChangbin',
        type: 'dialogue',
        background: 'bg-library.jpg', // Can be same or different
        characters: ['sarah', 'changbin'],
        speaker: 'Sarah',
        text: "Excuse me, Changbin? I'm Sarah, from your chemistry class.",
        choices: null
    },
    {
        id: 'bookStrategy',
        type: 'dialogue',
        background: 'bg-library.jpg',
        characters: ['sarah', 'changbin'],
        speaker: 'Sarah',
        text: "(Picks up a random book) Oh, excuse me! I didn't see you there, Changbin.",
        choices: null
    },
    // ... many, many more scenes ...
    {
        type: 'dialogue',
        background: 'bg-park.jpg',
        characters: ['sarah', 'changbin'],
        speaker: 'Narrator',
        text: "Years passed, and their love blossomed. Now, the big day is here!",
        choices: null
    },
    {
        type: 'ending', // A special type for game endings
        background: 'bg-wedding.jpg', // You'd need this image!
        characters: ['sarah', 'changbin'],
        text: "And so, Sarah and Changbin lived happily ever after! Congratulations on helping Sarah marry her true love!",
        choices: null
    }
];

// --- Game Logic ---

function loadScene(scene) {
    if (scene.background) {
        backgroundElement.src = scene.background;
    }

    // Show/hide characters based on the scene's 'characters' array
    sarahElement.style.display = scene.characters && scene.characters.includes('sarah') ? 'block' : 'none';
    changbinElement.style.display = scene.characters && scene.characters.includes('changbin') ? 'block' : 'none';

    dialogueText.textContent = `${scene.speaker ? scene.speaker + ': ' : ''}${scene.text}`;

    // Handle choices or next button
    if (scene.type === 'choice' && scene.choices) {
        nextButton.style.display = 'none'; // Hide next button during choices
        choicesContainer.innerHTML = ''; // Clear previous choices
        scene.choices.forEach(choice => {
            const button = document.createElement('button');
            button.textContent = choice.text;
            button.onclick = () => handleChoice(choice.nextScene);
            choicesContainer.appendChild(button);
        });
        choicesContainer.style.display = 'flex';
    } else {
        choicesContainer.style.display = 'none';
        nextButton.style.display = 'block'; // Show next button for dialogue
    }

    if (scene.type === 'ending') {
        nextButton.style.display = 'none'; // No "next" after an ending
        // Perhaps add a "Play Again" button or redirect
    }
}

function nextDialogue() {
    const currentScene = gameStory[currentSceneIndex];

    if (currentScene.type === 'dialogue' || currentScene.type === 'ending') {
        // If it's a dialogue, just advance to the next story segment
        currentSceneIndex++;
        if (currentSceneIndex < gameStory.length) {
            loadScene(gameStory[currentSceneIndex]);
        } else {
            console.log("Game Over - End of story!");
            // Handle game over (e.g., show "The End" screen, restart button)
        }
    } else {
        // This case should ideally not be reached if 'next' is hidden for choices
        console.warn("Attempted to advance dialogue during a choice.");
    }
}

function handleChoice(nextSceneId) {
    // Find the scene with the matching ID
    const nextScene = gameStory.find(scene => scene.id === nextSceneId);
    if (nextScene) {
        currentSceneIndex = gameStory.indexOf(nextScene);
        loadScene(nextScene);
    } else {
        console.error("Next scene not found for choice:", nextSceneId);
    }
}

// --- Event Listeners ---
nextButton.addEventListener('click', nextDialogue);

// --- Initialize Game ---
// Start the game with the first scene
loadScene(gameStory[currentSceneIndex]);
