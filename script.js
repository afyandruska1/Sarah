let affection = 0;
let currentScene = 0;

const scenes = [
  {
    bg: "bg-library.jpg",
    sarahVisible: true,
    changbinVisible: true,
    text: "Sarah spots Changbin reading alone in the library.",
    choices: [
      { text: "Approach him with a smile", affection: 2 },
      { text: "Sit near him silently", affection: 1 },
      { text: "Leave him alone", affection: -1 }
    ]
  },
  {
    bg: "bg-classroom.jpg",
    text: "Later, you both end up in the same music class.",
    choices: [
      { text: "Compliment his skills", affection: 2 },
      { text: "Stay quiet but watch", affection: 1 },
      { text: "Yawn loudly", affection: -2 }
    ]
  },
  {
    bg: "bg-park.jpg",
    text: "After school, you meet him at the park.",
    choices: [
      { text: "Offer to walk home together", affection: 2 },
      { text: "Talk about music", affection: 1 },
      { text: "Say you’re busy", affection: -1 }
    ]
  },
  {
    bg: "bg-park.jpg",
    text: "Final scene...",
    choices: []
  }
];

function showScene() {
  const scene = scenes[currentScene];
  document.getElementById("background").src = scene.bg;
  document.getElementById("sarah").style.display = scene.sarahVisible !== false ? 'block' : 'none';
  document.getElementById("changbin").style.display = scene.changbinVisible !== false ? 'block' : 'none';
  
  const dialogue = document.getElementById("dialogue-text");
  dialogue.textContent = scene.text;

  const choiceBox = document.getElementById("choice-box");
  choiceBox.innerHTML = '';

  if (currentScene === scenes.length - 1) {
    let result = affection >= 5
      ? "❤️ Changbin blushes. 'I think I like you too, Sarah.'"
      : affection >= 2
      ? "🙂 Changbin smiles. 'Let’s be good friends.'"
      : "💔 He nods. 'See you around.'";
    dialogue.textContent = result;
    return;
  }

  scene.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice.text;
    btn.onclick = () => {
      affection += choice.affection;
      currentScene++;
      showScene();
    };
    choiceBox.appendChild(btn);
  });
}

window.onload = showScene;
