/*-------------- Variables -------------*/

let now = Date.now();
let then = Date.now();
let elapsed = 0;
let fpsInterval = 1000 / 65;

let snek = new Snek();

/*-------------- Constants -------------*/

const game = {
    difficulty: 1,
    isPlaying: true,
    spawnCountdown: 0,
    spawnPoint: spawnPoints[0],
    audioMuted: false,
    mouseControl: false,
    choiceMade: true,
    choices: [],
    arena: 1,
    wave: 0,
    snake: [],
    enemies: [],
};

const unitChoices = [
    new Unit('Rogue'),
    new Unit('Ranger'),
    new Unit('Trapper'),
    new Unit('Sprayer'),
    new Unit('Vagrant'),
    new Unit('Fighter'),
    new Unit('Enchanter')
];

/*---------- Variables (state) ---------*/

let rightPressed = false;
let leftPressed = false;
const mouse = { x: 100, y: 100 };

/*----- Cached Element References  -----*/

const playBtn = document.getElementById('begin');

const settingsIcon = document.getElementById('settings');
const mouseIcon = document.getElementById('mouse-icon');
const keyboardIcon = document.getElementById('keyboard-icon');
mouseIcon.style.filter = 'invert(30%)';
const audioOnEl = document.getElementById('sound-on');
const audioOffEl = document.getElementById('sound-off');
audioOffEl.style.filter = 'invert(30%)';
const difficultyMinus = document.getElementById('difficulty-minus');
const difficultyPlus = document.getElementById('difficulty-plus');
const difficultyLevel = document.getElementById('difficulty-level');

const gameContainerEl = document.querySelector('.game-wrapper');
const arenaNumEl = document.getElementById('arena');
const waveNumEl = document.getElementById('wave');
const enemiesLeftEl = document.getElementById('enemies-left');
const showShopEl = document.getElementById('show-shop');
const hpEls = document.querySelectorAll('#hp > div');
const hpCounter = hpEls.length;

const shopCurrentUnits = document.querySelectorAll('.current-unit');
const shopCurrentUnitExplanations = document.querySelectorAll('.current-unit-explanation');
const nextArenaButton = document.querySelector('.next-arena-btn');
const shopEl = document.querySelector('.shop');
const choiceEls = document.querySelectorAll('.choice');
const explanationEls = document.querySelectorAll('.explanation');
const choiceConfirmationEl = document.getElementById('choice-confirmation');
const labelCurrentUnitsEl = document.getElementById('current-units-label');

const lossEl = document.querySelector('.loss');
const winEl = document.querySelector('.win');
const lossButtonReplay = document.getElementById('replay-loss');
const lossButtonReplayEasier = document.getElementById('replay-easier');
const winButtonReplay = document.getElementById('replay-win');
const winButtonReplayHarder = document.getElementById('replay-harder');
const showLossEl = document.getElementById('show-loss');
const showWinEl = document.getElementById('show-win');

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
    } else if (e.key === ' ' && game.choiceMade && !game.isPlaying) {
        handleNextArena();
    };
};

const showDifficulty = function () {
    game.difficulty = Math.max(1, Math.min(10, game.difficulty));
    difficultyLevel.innerText = game.difficulty;
    difficultyLevel.style.color = difficultyColors[game.difficulty - 1];
    gameContainerEl.style.backgroundColor = difficultyColors[game.difficulty - 1];
};
showDifficulty();

const handleMouseMove = function (e) {
    if (game.mouseControl) {
        mouse.x = e.clientX - canvas.getBoundingClientRect().left;
        mouse.y = e.clientY - canvas.getBoundingClientRect().top;
    };
};

const handleDriving = function () {
    if (!game.mouseControl) {
        if (rightPressed) {
            snek.angle += snek.turn;
        } else if (leftPressed) {
            snek.angle -= snek.turn;
        };
    } else {
        snek.angle += calcChaseIncrement(snek.x, snek.y, snek.angle, mouse.x, mouse.y, snek.turn);
    };
};

const init = function () {
    chooseRandomUnitUpgrades();
    game.snake = [];
    let r1 = Math.floor(Math.random() * 2);
    let r2 = Math.floor(Math.random() * 3) + 2;
    game.snake.push(unitChoices[r1], unitChoices[r2]);
    document.querySelector('body').style.setProperty('--btn-hover-color', difficultyColors[game.difficulty - 1]);
};
init();



const draw = function () {
    requestAnimationFrame(draw);
    now = Date.now();
    elapsed = now - then;
    playBackgroundMusic();
    if (game.isPlaying && elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);
        clearCanvas();
        handleDriving();
        if (game.enemies.length === 0 && game.arena === winningArena && game.wave === 1 + game.arena) {
            showWinMessage();
            game.isPlaying = false;
        } else if (game.enemies.length === 0 && game.wave === 1 + game.arena && game.arena < winningArena) {
            showShop();
        } else if (game.enemies.length === 0 && game.spawnCountdown < spawnDuration) {
            if (game.spawnCountdown % (spawnDuration / 2) < (spawnDuration / 4)) {
                showSpawnLocation();
            };
            game.spawnCountdown++;
        } else if (game.enemies.length === 0 && game.spawnCountdown >= spawnDuration) {
            generateWave();
        };
        for (let i = 0; i < game.enemies.length; i++) {
            let toCheck = [game.enemies.slice(i + 1), game.snake].flat();
            game.enemies[i].checkForCollisions(toCheck);
        };
        enemiesLeftEl.innerText = `enemies remaining: ${game.enemies.length}`;
        game.enemies.forEach(e => e.render());
        snek.render();
    } else if (showShopEl.checked === true && !game.choiceMade) {
        showShop();
    };
};


/*----------- Event Listeners ----------*/

document.getElementById('begin').addEventListener('click', () => {
    document.getElementById('show-start').checked = true;
    if (!game.audioMuted) {
        startAudio.play();
    };
    setTimeout(() => {
        document.querySelector('.welcome').style.display = 'none';
    }, 1000);
    setTimeout(draw, 1000);
});

lossButtonReplay.addEventListener('click', (e) => {
    showLossEl.checked = true;
    if (!game.audioMuted) {
        startAudio.play();
    };
    resetGame(game.difficulty);
    setTimeout(() => {
        lossEl.style.display = 'none';
    }, 1000);
    setTimeout(draw, 1000);
});

winButtonReplay.addEventListener('click', (e) => {
    showWinEl.checked = true;
    if (!game.audioMuted) {
        startAudio.play();
    };
    resetGame(game.difficulty);
    setTimeout(() => {
        winEl.style.display = 'none';
    }, 1000);
    setTimeout(draw, 1000);
});

lossButtonReplayEasier.addEventListener('click', (e) => {
    showLossEl.checked = true;
    if (!game.audioMuted) {
        startAudio.play();
    };
    resetGame(game.difficulty - 1);
    setTimeout(() => {
        lossEl.style.display = 'none';
    }, 1000);
    setTimeout(draw, 1000);
});

winButtonReplayHarder.addEventListener('click', (e) => {
    showWinEl.checked = true;
    if (!game.audioMuted) {
        startAudio.play();
    };
    resetGame(game.difficulty + 1);
    setTimeout(() => {
        winEl.style.display = 'none';
    }, 1000);
    setTimeout(draw, 1000);
});

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

[audioOnEl, audioOffEl].forEach(b => b.addEventListener('click', (e) => {
    if (game.audioMuted) {
        audioOnEl.style.filter = 'invert(80%)';
        audioOffEl.style.filter = 'invert(30%)';
        game.audioMuted = false;
        playBackgroundMusic();
    } else {
        audioOffEl.style.filter = 'invert(80%)';
        audioOnEl.style.filter = 'invert(30%)';
        game.audioMuted = true;
        bgAudio[bgIndex].pause();
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
    game.isPlaying = !game.isPlaying;
    if (bgAudio[bgIndex].volume < bgAudioVolume) {
        bgAudio[bgIndex].volume = bgAudioVolume;
    } else {
        bgAudio[bgIndex].volume = bgQuieterAudioVolume;
    };
    draw();
});

document.addEventListener('keydown', handleKeyDown, false);
document.addEventListener('keyup', handleKeyUp, false);

explanationEls.forEach(c => c.addEventListener('click', (e) => {
    if (!game.choiceMade) {
        let index = Number(e.target.id.slice(-1)) - 1;
        let chosenUnit = game.choices[index];
        if (game.snake.map(u => u.name).includes(chosenUnit.name)) {
            game.snake.find(u => u.name === chosenUnit.name).level++;
            snek.maxHP += chosenUnit.hp;
            snek.hp = snek.maxHP;
            if (chosenUnit.name === 'Enchanter') {
                baseCooldown *= 0.85;
            };
            if (!game.audioMuted) {
                upgradeAudio.play();
            };
            choiceConfirmationEl.innerText = `${chosenUnit.name} chosen!`;
        } else {
            game.snake.push(chosenUnit);
            snek.maxHP += chosenUnit.hp;
            snek.hp = snek.maxHP;
            if (chosenUnit.name === 'Enchanter') {
                baseCooldown *= 0.85;
            };
            if (!game.audioMuted) {
                upgradeAudio.play();
            };
            choiceConfirmationEl.innerText = `${chosenUnit.name} chosen!`;
        };
        game.choiceMade = true;
        for (let i = 0; i < 3; i++) {
            if (i !== index) {
                choiceEls[i].style.backgroundColor = 'black';
            };
        };
        nextArenaButton.innerHTML = 'next<br>arena<br>→';
        labelCurrentUnitsEl.innerText = 'spacebar to proceed';
        showShopCurrentUnits();
    };
}));

nextArenaButton.addEventListener('click', handleNextArena);