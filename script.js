const gameContainer = document.getElementById('game-container');
const gameWorld = document.getElementById('game-world');
const sarahElement = document.getElementById('sarah');
const changbinElement = document.getElementById('changbin'); // Changbin's element
const dialogueBox = document.getElementById('dialogue-box');
const dialogueText = document.getElementById('dialogue-text');
const choicesContainer = document.getElementById('choices-container');
const nextButton = document.getElementById('next-button');
const leftArrow = document.getElementById('left-arrow');
const rightArrow = document.getElementById('right-arrow');

// --- Game State ---
let sarahX = 20; // Sarah's horizontal position relative to game-world (in %)
let sarahSpeed = 0.5; // Movement speed in % per frame
let movingLeft = false;
let movingRight = false;
let dialogueActive = false; // Flag to pause movement during dialogue

let currentSceneIndex = 0;
let currentDialogueSequence = 0; // For scenes with multiple dialogue lines

// --- Game World Dimensions ---
const CONTAINER_WIDTH = 960; // Matches max-width in CSS
const SARAH_WIDTH_PERCENT = 10; // Approx width of Sarah for collision (adjust)

// --- Story Data ---
// Now, story segments are 'scenes' which might contain 'areas'
const gameStory = [
    {
        id: 'library_entrance',
        backgrounds: ['bg-library.jpg', 'bg-library.jpg'], // Can be multiple segments for a long level
        characters: [
            { name: 'changbin', x: 80, hidden: true } // Changbin starts hidden until Sarah reaches him
        ],
        triggers: [
            {
                type: 'dialogue',
                x: 30, // Trigger when Sarah's X is 30% into the level
                once: true, // Only trigger once
                dialogue: [
                    { speaker: 'Sarah', text: "Okay, I'm here at the library. Changbin should be around here somewhere." },
                    { speaker: 'Sarah', text: "I need to find him without looking too obvious." }
                ]
            },
            {
                type: 'encounter',
                x: 75, // Trigger when Sarah is near Changbin's position
                once: true,
                action: () => {
                    // This function will be called when Sarah reaches this point
                    displayCharacter('changbin', 80); // Show Changbin
                    startDialogueSequence('changbin_encounter'); // Start a specific dialogue sequence
                }
            }
        ]
    },
    {
        id: 'changbin_encounter', // This is not a "navigable" scene, but a dialogue sequence
        type: 'dialogue_sequence', // New type for dialogue blocks triggered by events
        dialogue: [
            { speaker: 'Sarah', text: "(Muttering) Oh, there he is! Near the astrophysics section. What do I do?" },
            { speaker: 'Changbin', text: "..." }, // Changbin is engrossed
        ],
        choices: [
            { text: "Walk directly to him.", nextScene: 'approach_direct' },
            { text: "Browse books nearby.", nextScene: 'approach_browse' }
        ]
    },
    {
        id: 'approach_direct',
        backgrounds: ['bg-library.jpg', 'bg-library.jpg'], // Remain in library
        characters: [
            { name: 'changbin', x: 80, hidden: false } // Changbin already visible
        ],
        triggers: [
            {
                type: 'dialogue',
                x: 80, // Sarah reaches Changbin's spot
                once: true,
                dialogue: [
                    { speaker: 'Sarah', text: "Hi, Changbin! I'm Sarah, from your chemistry class." },
                    { speaker: 'Changbin', text: "Oh, hi Sarah. Fancy meeting you here." }
                ],
                // After this dialogue, perhaps transition to another scene or allow more movement
                onComplete: () => { console.log("Direct approach dialogue done."); loadScene('classroom_first_day'); } // Example
            }
        ]
    },
    {
        id: 'classroom_first_day',
        backgrounds: ['bg-classroom.jpg'], // A new, shorter scene
        characters: [
            { name: 'changbin', x: 50, hidden: false },
            { name: 'sarah', x: 20, hidden: false }
        ],
        triggers: [
            {
                type: 'dialogue',
                x: 20, // Autoplay dialogue at start of new scene
                once: true,
                dialogue: [
                    { speaker: 'Narrator', text: "Days later, in chemistry class..." },
                    { speaker: 'Changbin', text: "So, about that experiment..." },
                    { speaker: 'Sarah', text: "Oh, it was a disaster for me! How about you?" }
                ],
                 onComplete: () => { displayChoices([
                    { text: "Offer to study together.", nextScene: 'study_offer' },
                    { text: "Ask about his weekend.", nextScene: 'weekend_chat' }
                 ]); }
            }
        ]
    },
    // ... many more scenes for different locations and story branches ...
    {
        id: 'game_end_marriage',
        backgrounds: ['bg-park.jpg'], // or bg-wedding.jpg
        characters: [{ name: 'sarah', x: 30, hidden: false }, { name: 'changbin', x: 70, hidden: false }],
        triggers: [
            {
                type: 'dialogue',
                x: 50,
                once: true,
                dialogue: [{ speaker: 'Narrator', text: "Through many adventures, Sarah and Changbin's bond grew stronger. And finally..." }],
                onComplete: () => {
                    displayDialogue("Narrator", "They lived happily ever after! The end.");
                    sarahElement.style.display = 'none'; // Hide controls at end
                    changbinElement.style.display = 'none';
                    nextButton.style.display = 'none';
                    // Show a "Play Again?" button
                }
            }
        ]
    }
];

// Map of all dialogue sequences for easy lookup
const dialogueSequences = {};
gameStory.forEach(scene => {
    if (scene.type === 'dialogue_sequence') {
        dialogueSequences[scene.id] = scene;
    }
});

let currentLevelWidth = 0; // Total width of the current background segments
let gameWorldX = 0; // Current scroll position of the game-world

// --- Game Logic ---

function loadScene(sceneId) {
    const scene = gameStory.find(s => s.id === sceneId);
    if (!scene) {
        console.error("Scene not found:", sceneId);
        return;
    }

    // Clear previous backgrounds and characters
    gameWorld.innerHTML = '';
    changbinElement.classList.add('hidden'); // Hide Changbin by default

    // Add background images for the current scene
    scene.backgrounds.forEach(bgSrc => {
        const bgImg = document.createElement('img');
        bgImg.src = bgSrc;
        bgImg.classList.add('game-background');
        gameWorld.appendChild(bgImg);
    });

    currentLevelWidth = scene.backgrounds.length * CONTAINER_WIDTH;
    gameWorld.style.width = `${currentLevelWidth}px`;

    // Reset Sarah's position and game world scroll for new scene
    sarahX = 20; // Start Sarah at 20% of the first background
    sarahElement.style.left = `${sarahX}%`;
    gameWorldX = 0; // Reset scroll
    updateGameWorldScroll(); // Apply initial scroll

    // Place and show initial characters if defined in the scene
    scene.characters && scene.characters.forEach(char => {
        if (char.name === 'changbin') {
            changbinElement.style.left = `${char.x}%`;
            if (!char.hidden) {
                changbinElement.classList.remove('hidden');
            }
        }
        // Add logic for other characters if you introduce them
    });

    // Reset dialogue state
    hideDialogue();
    currentDialogueSequence = 0; // Reset dialogue index for new scene
    dialogueActive = false; // Ensure movement is enabled initially

    // If the scene has initial dialogue (e.g., at x: 20), trigger it
    const initialTrigger = scene.triggers.find(t => t.type === 'dialogue' && t.x === sarahX);
    if (initialTrigger) {
        initialTrigger.triggered = false; // Ensure it can be triggered
        // It will be triggered by the game loop's checkTriggers
    }

    currentSceneIndex = gameStory.indexOf(scene);
}

function updateGame() {
    if (!dialogueActive) {
        let newSarahX = sarahX;
        if (movingLeft) {
            newSarahX -= sarahSpeed;
        }
        if (movingRight) {
            newSarahX += sarahSpeed;
        }

        // Keep Sarah within bounds (e.g., 0% to 100% of the current game-world segment)
        // Or make her move across the entire game-world width
        const sarahPixelX = (newSarahX / 100) * currentLevelWidth;
        const maxSarahPixelX = currentLevelWidth - (SARAH_WIDTH_PERCENT / 100 * currentLevelWidth); // Don't let Sarah go off the right edge

        if (sarahPixelX >= 0 && sarahPixelX <= maxSarahPixelX) {
             sarahX = newSarahX;
             sarahElement.style.left = `${sarahX}%`;
        } else {
            // Optional: Prevent movement past bounds or trigger scene transition
        }

        updateGameWorldScroll();
        checkTriggers();
    }

    requestAnimationFrame(updateGame);
}

function updateGameWorldScroll() {
    // Calculate game world scroll to keep Sarah roughly centered
    // Sarah's position in pixels relative to the *entire* game world
    const sarahAbsolutePixelX = (sarahX / 100) * currentLevelWidth;

    // Desired camera position: Sarah is at 40% of the screen width from the left
    let cameraX = sarahAbsolutePixelX - (CONTAINER_WIDTH * 0.4);

    // Clamp camera to world boundaries
    if (cameraX < 0) cameraX = 0;
    const maxCameraX = currentLevelWidth - CONTAINER_WIDTH;
    if (cameraX > maxCameraX) cameraX = maxCameraX;

    gameWorld.style.transform = `translateX(${-cameraX}px)`;
}


function checkTriggers() {
    const currentScene = gameStory[currentSceneIndex];
    if (!currentScene || !currentScene.triggers) return;

    // Get Sarah's current position relative to the current visible part of the world
    const sarahCurrentPixelX = (sarahX / 100) * currentLevelWidth;

    currentScene.triggers.forEach(trigger => {
        if (!trigger.triggered && sarahCurrentPixelX >= (trigger.x / 100) * currentLevelWidth) {
            trigger.triggered = true; // Mark as triggered

            if (trigger.type === 'dialogue') {
                startDialogueSequence(trigger.dialogue); // Start direct dialogue
            } else if (trigger.type === 'encounter') {
                if (trigger.action) trigger.action(); // Perform custom action (e.g., show Changbin)
            }
        }
    });
}

function startDialogueSequence(dialogueDataOrId) {
    dialogueActive = true;
    dialogueBox.classList.remove('hidden');
    controls.classList.add('hidden'); // Hide movement controls during dialogue
    choicesContainer.innerHTML = '';
    nextButton.classList.remove('hidden'); // Show next button

    let sequence;
    if (typeof dialogueDataOrId === 'string') {
        sequence = dialogueSequences[dialogueDataOrId];
        if (!sequence) {
            console.error("Dialogue sequence not found:", dialogueDataOrId);
            hideDialogue();
            return;
        }
    } else {
        sequence = { dialogue: dialogueDataOrId }; // Passed directly
    }

    // Store the sequence so nextDialogue can continue it
    dialogueBox.currentDialogueSequence = sequence.dialogue;
    dialogueBox.currentSequenceIndex = 0;
    displayNextDialogueLine();
}


function displayNextDialogueLine() {
    const sequence = dialogueBox.currentDialogueSequence;
    const index = dialogueBox.currentSequenceIndex;

    if (sequence && index < sequence.length) {
        const line = sequence[index];
        dialogueText.textContent = `${line.speaker ? line.speaker + ': ' : ''}${line.text}`;
        dialogueBox.currentSequenceIndex++;
    } else {
        // End of sequence, check for choices or transition
        const currentSceneDefinition = gameStory[currentSceneIndex];
        let currentTrigger = currentSceneDefinition.triggers ? currentSceneDefinition.triggers.find(t => t.triggered) : null;
        if (currentTrigger && currentTrigger.onComplete) {
            currentTrigger.onComplete();
        } else if (dialogueSequences[currentSceneDefinition.id] && dialogueSequences[currentSceneDefinition.id].choices) {
            displayChoices(dialogueSequences[currentSceneDefinition.id].choices);
        } else {
            hideDialogue();
        }
    }
}


function displayChoices(choices) {
    nextButton.classList.add('hidden'); // Hide next button during choices
    choicesContainer.classList.remove('hidden');
    choicesContainer.innerHTML = '';
    choices.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice.text;
        button.onclick = () => handleChoice(choice.nextScene);
        choicesContainer.appendChild(button);
    });
}

function handleChoice(nextSceneId) {
    hideDialogue(); // Hide choices and dialogue box
    dialogueActive = false; // Re-enable movement
    controls.classList.remove('hidden'); // Show controls again
    loadScene(nextSceneId); // Load the new scene based on choice
}

function displayDialogue(speaker, text) {
    dialogueActive = true;
    dialogueBox.classList.remove('hidden');
    controls.classList.add('hidden'); // Hide controls during simple dialogue
    choicesContainer.classList.add('hidden'); // Ensure choices are hidden
    nextButton.classList.remove('hidden'); // Ensure next button is visible
    dialogueText.textContent = `${speaker ? speaker + ': ' : ''}${text}`;
    dialogueBox.currentDialogueSequence = null; // Mark as single line dialogue
}

function hideDialogue() {
    dialogueBox.classList.add('hidden');
    dialogueActive = false;
    controls.classList.remove('hidden'); // Re-enable controls
    choicesContainer.classList.add('hidden');
    nextButton.classList.add('hidden');
}

function displayCharacter(characterName, xPosition) {
    if (characterName === 'changbin') {
        changbinElement.classList.remove('hidden');
        changbinElement.style.left = `${xPosition}%`;
    }
    // Add logic for other characters
}


// --- Event Listeners ---
leftArrow.addEventListener('touchstart', (e) => { e.preventDefault(); movingLeft = true; }, { passive: false });
leftArrow.addEventListener('touchend', () => movingLeft = false);
leftArrow.addEventListener('mousedown', () => movingLeft = true);
leftArrow.addEventListener('mouseup', () => movingLeft = false);
leftArrow.addEventListener('mouseleave', () => movingLeft = false); // Important for mouse

rightArrow.addEventListener('touchstart', (e) => { e.preventDefault(); movingRight = true; }, { passive: false });
rightArrow.addEventListener('touchend', () => movingRight = false);
rightArrow.addEventListener('mousedown', () => movingRight = true);
rightArrow.addEventListener('mouseup', () => movingRight = false);
rightArrow.addEventListener('mouseleave', () => movingRight = false); // Important for mouse


nextButton.addEventListener('click', displayNextDialogueLine);


// --- Keyboard Controls (Optional, for testing on desktop) ---
document.addEventListener('keydown', (e) => {
    if (dialogueActive) {
        if (e.key === ' ' || e.key === 'Enter') {
            displayNextDialogueLine();
        }
        return;
    }
    if (e.key === 'ArrowLeft') movingLeft = true;
    if (e.key === 'ArrowRight') movingRight = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') movingLeft = false;
    if (e.key === 'ArrowRight') movingRight = false;
});


// --- Initialize Game ---
loadScene('library_entrance'); // Start the game
updateGame(); // Start the game loop
