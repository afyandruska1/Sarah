let affection = 0;
let currentScene = 0;

const scenes = [
  {
    text: "You're Sarah, a student at Seoul Arts High. Changbin walks into the library. What do you do?",
    choices: [
      { text: "Smile at him shyly", affection: 1 },
      { text: "Ignore him", affection: 0 },
      { text: "Trip and fall near him on purpose", affection: 2 }
    ]
  },
  {
    text: "Changbin smiles back and sits near you. He asks what you're reading.",
    choices: [
      { text: "Something poetic, like love poems", affection: 2 },
      { text: "Just textbooks", affection: 1 },
      { text: "None of your business", affection: -1 }
    ]
  },
  {
    text: "He invites you to hang out after school.",
    choices: [
      { text: "Say yes enthusiastically", affection: 2 },
      { text: "Say yes calmly", affection: 1 },
      { text: "Make up an excuse", affection: -2 }
    ]
  },
  {
    text: "Final Result",
    choices: []
  }
];

function showScene() {
  const scene = scenes[currentScene];
  document.getElementById("scene-text").innerText = scene.text;
  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = '';

  if (currentScene === scenes.length - 1) {
    let ending = affection >= 5 ? "❤️ Changbin likes you back!" :
                 affection >= 2 ? "🙂 You're friends now." :
                                  "💔 He’s not interested.";
    choicesDiv.innerHTML = `<p>${ending}</p>`;
    return;
  }

  scene.choices.forEach((choice, index) => {
    const btn = document.createElement("button");
    btn.innerText = choice.text;
    btn.onclick = () => {
      affection += choice.affection;
      currentScene++;
      showScene();
    };
    choicesDiv.appendChild(btn);
  });
}

showScene();