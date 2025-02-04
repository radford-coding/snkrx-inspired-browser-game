

/*-------------- Constants -------------*/

const snek = new Snek();

const game = {
    difficulty: 1,
    isPlaying: true,
    audioMuted: true,
    mouseControl: false,
    choiceMade: true,
    arena: 1,
    wave: 1, //! change to 0 for gameplay
    maxWave: 3,
    snake: [],
    enemies: [],
};

/*---------- Variables (state) ---------*/

let rightPressed = false;
let leftPressed = false;
const mouse = {x: 100, y: 100};

/*----- Cached Element References  -----*/

const settingsIcon = document.getElementById('settings');

const mouseIcon = document.getElementById('mouse-icon');
const keyboardIcon = document.getElementById('keyboard-icon');
mouseIcon.style.filter = 'invert(30%)'; // initial

const audioOn = document.getElementById('sound-on');
const audioOff = document.getElementById('sound-off');
audioOn.style.filter = 'invert(30%)'; //* initial state matches game.audioMuted

const difficultyMinus = document.getElementById('difficulty-minus');
const difficultyPlus = document.getElementById('difficulty-plus');
const difficultyLevel = document.getElementById('difficulty-level');

const gameContainer = document.querySelector('.game-area');

const arenaNum = document.getElementById('arena');
const waveNum = document.getElementById('wave');
const showShop = document.getElementById('show-shop');

const shopCurrentUnits = document.querySelectorAll('.current-unit');
const shopCurrentUnitExplanations = document.querySelectorAll('.current-unit-explanation');
const nextArenaButton = document.querySelector('.next-arena-btn');
const shop = document.querySelector('.shop');

/*-------------- Functions -------------*/

const handleKeyDown = function (e) {
    if (e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'd') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft' || e.key === 'a') {
        leftPressed = true;
    };
};

const handleKeyUp = function (e) {
    if (e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'd') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft' || e.key === 'a') {
        leftPressed = false;
    };
};

const showDifficulty = function() {
    game.difficulty = Math.max(1, Math.min(10, game.difficulty));
    difficultyLevel.innerText = game.difficulty;
    difficultyLevel.style.color = difficultyColors[game.difficulty - 1];
    gameContainer.style.backgroundColor = difficultyColors[game.difficulty - 1];
};
showDifficulty();

const handleMouseMove = function(e) {
    if (game.mouseControl) {
        mouse.x = e.clientX - canvas.getBoundingClientRect().left;
        mouse.y = e.clientY - canvas.getBoundingClientRect().top;
    };
};




game.snake.push(new Unit('Rogue'));
game.snake.push(new Unit('Wizard'));
game.snake.push(new Unit('Swordsman'));
game.snake.push(new Unit('Curser'));
game.snake.push(new Unit('Spawner'));
game.snake.push(new Unit('Ranger'));
game.snake.push(new Unit('Vagrant'));

const draw = function() {
    if (game.isPlaying) {
        clearCanvas();
        if (rightPressed) {
            snek.angle += snek.turn;
        } else if (leftPressed) {
            snek.angle -= snek.turn;
        };
        if (game.mouseControl) {
            snek.angle += calcChaseIncrement(snek.x, snek.y, snek.angle, mouse.x, mouse.y, snek.turn);
        };
        generateWave();
        for (let i = 0; i < game.enemies.length; i++) {
            let toCheck = [game.enemies.slice(i + 1), game.snake].flat();
            game.enemies[i].checkForCollisions(toCheck);
        };
        game.enemies.forEach(e => e.render());
        snek.render();
        requestAnimationFrame(draw); //! consider setInterval()
    } else if (showShop.checked === true) {
        showShopCurrentUnits();
    };
};
draw();


/*----------- Event Listeners ----------*/

[mouseIcon, keyboardIcon].forEach(b => b.addEventListener('click', (e) => {
    if (game.mouseControl) {
        keyboardIcon.style.filter = 'invert(80%)';
        mouseIcon.style.filter = 'invert(30%)';
        game.mouseControl = false;
    } else {
        mouseIcon.style.filter = 'invert(80%)';
        keyboardIcon.style.filter = 'invert(30%)';
        game.mouseControl = true;
    };
}));

[audioOn, audioOff].forEach(b => b.addEventListener('click', (e) => {
    if (game.audioMuted) {
        audioOn.style.filter = 'invert(80%)';
        audioOff.style.filter = 'invert(30%)';
        game.audioMuted = false;
    } else {
        audioOff.style.filter = 'invert(80%)';
        audioOn.style.filter = 'invert(30%)';
        game.audioMuted = true;
    };
}));

difficultyMinus.addEventListener('click', () => {
    game.difficulty--;
    showDifficulty();
});

difficultyPlus.addEventListener('click', () => {
    game.difficulty++;
    showDifficulty();
});

canvas.addEventListener('mousemove', handleMouseMove);

settingsIcon.addEventListener('click', () => {
    game.isPlaying = !game.isPlaying
    draw();
});

document.addEventListener('keydown', handleKeyDown, false);
document.addEventListener('keyup', handleKeyUp, false);

nextArenaButton.addEventListener('click', handleNextArena);