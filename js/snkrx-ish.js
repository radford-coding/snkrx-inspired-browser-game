

/*-------------- Constants -------------*/

const canvas = document.getElementById('game-area');
const context = canvas.getContext('2d');

/*---------- Variables (state) ---------*/

let audioMuted = false;
let mouseControl = false;
let isPlaying = true;
let difficulty = 1;
const mouse = {x: 100, y: 100};

/*----- Cached Element References  -----*/

const settingsIcon = document.getElementById('settings');

const mouseIcon = document.getElementById('mouse-icon');
const keyboardIcon = document.getElementById('keyboard-icon');
mouseIcon.style.filter = 'invert(30%)'; // initial

const audioOn = document.getElementById('sound-on');
const audioOff = document.getElementById('sound-off');
audioOff.style.filter = 'invert(30%)'; // initial

const difficultyMinus = document.getElementById('difficulty-minus');
const difficultyPlus = document.getElementById('difficulty-plus');
const difficultyLevel = document.getElementById('difficulty-level');

const gameContainer = document.querySelector('.game-area');


/*-------------- Functions -------------*/

const showDifficulty = function() {
    difficulty = Math.max(1, Math.min(10, difficulty)); // 1-10
    difficultyLevel.innerText = difficulty;
    difficultyLevel.style.color = difficultyColors[difficulty - 1];
    gameContainer.style.backgroundColor = difficultyColors[difficulty - 1];
};
showDifficulty();

const handleMouseMove = function(e) {
    if (mouseControl) {
        mouse.x = e.clientX - canvas.getBoundingClientRect().left;
        mouse.y = e.clientY - canvas.getBoundingClientRect().top;
        console.log(mouse.x, mouse.y);
    };
};

/*----------- Event Listeners ----------*/

[mouseIcon, keyboardIcon].forEach(b => b.addEventListener('click', (e) => {
    if (mouseControl) {
        keyboardIcon.style.filter = 'invert(100%)';
        mouseIcon.style.filter = 'invert(30%)';
        mouseControl = false;
    } else {
        mouseIcon.style.filter = 'invert(100%)';
        keyboardIcon.style.filter = 'invert(30%)';
        mouseControl = true;
    };
}));

[audioOn, audioOff].forEach(b => b.addEventListener('click', (e) => {
    if (audioMuted) {
        audioOn.style.filter = 'invert(100%)';
        audioOff.style.filter = 'invert(30%)';
        audioMuted = false;
    } else {
        audioOff.style.filter = 'invert(100%)';
        audioOn.style.filter = 'invert(30%)';
        audioMuted = true;
    };
}));

difficultyMinus.addEventListener('click', () => {
    difficulty--;
    showDifficulty();
});

difficultyPlus.addEventListener('click', () => {
    difficulty++;
    showDifficulty();
});

canvas.addEventListener('mousemove', handleMouseMove);

settingsIcon.addEventListener('click', () => isPlaying = !isPlaying);




