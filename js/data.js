/*-------------- Constants -------------*/

const canvas = document.getElementById('game-area');
const width = canvas.width = canvas.clientWidth;
const height = canvas.height = canvas.clientHeight;
const context = canvas.getContext('2d');

let audio = {
    nCopies: 10,
    bounce: {
        index: 0,
        sounds: [],
    },
    kill: {
        index: 0,
        sounds: [],
    },
    dmg: {
        index: 0,
        sounds: [],
    },
};

const deployedAudioPath = 'https://github.com/radford-coding/snkrx-inspired-browser-game/blob/main/audio/';

const lossAudio = new Audio(deployedAudioPath + 'loss.mp3' + '?raw=true');
const startAudio = new Audio(deployedAudioPath + 'start.mp3' + '?raw=true');
const upgradeAudio = new Audio(deployedAudioPath + 'upgrade.mp3' + '?raw=true');


const bgAudioVolume = 0.7;
const bgQuieterAudioVolume = 0.2;

const bgAudio1 = new Audio(deployedAudioPath + 'bg1.mp3' + '?raw=true');
const bgAudio2 = new Audio(deployedAudioPath + 'bg2.mp3' + '?raw=true');
const bgAudio3 = new Audio(deployedAudioPath + 'bg3.mp3' + '?raw=true');
const bgAudio4 = new Audio(deployedAudioPath + 'bg4.mp3' + '?raw=true');
const bgAudio = [bgAudio1, bgAudio2, bgAudio3, bgAudio4];
let bgIndex = bgAudio.length - 1;

// const wallAudio = new Audio('../audio/wall-bounce.mp3');
// const wallAudio = new Audio('https://github.com/radford-coding/snkrx-inspired-browser-game/blob/main/audio/wall-bounce.mp3?raw=true');
const wallAudio = new Audio(deployedAudioPath + 'wall-bounce.mp3' + '?raw=true');
const killAudio = new Audio(deployedAudioPath + 'kill.mp3' + '?raw=true');
const dmgAudio = new Audio(deployedAudioPath + 'dmg.mp3' + '?raw=true');

[...Array(audio.nCopies)].map(() => {
    audio.bounce.sounds.push(wallAudio.cloneNode());
    audio.kill.sounds.push(killAudio.cloneNode());
    audio.dmg.sounds.push(dmgAudio.cloneNode());
});


const difficultyColors = [
    'lightgreen',
    'darkgreen',
    'yellowgreen',
    'goldenrod',
    'yellow',
    'lightorange',
    'darkorange',
    'red',
    'darkred'
];



const spawnFrac = 1 / 5;
const spawnPoints = [
    { x: width * spawnFrac, y: height * spawnFrac },
    { x: width * (1 - spawnFrac), y: height * spawnFrac },
    { x: width / 2, y: height / 2 },
    { x: width * spawnFrac, y: height * (1 - spawnFrac) },
    { x: width * (1 - spawnFrac), y: height * (1 - spawnFrac) }
];
const spawnDuration = 100;

const TAU = 2 * Math.PI;
const EPSILON = 0.001;
const unitSize = 20;
const baseSpeed = 3;
let baseCooldown = 100;
let currentCooldown = 100;
const baseProjSpeed = 7;
const baseProjSize = 7;
const winningArena = 5
const bg = '#303030';
const gray = '#4B4B4B';
const red = '#E91E39';
const orange = '#F06F22';
const yellow = '#FACF00';
const green = '#8BBF40';
const blue = '#009BD6';
const purple = '#8E559E';
const white = '#DADADA';

/*-------------- Functions -------------*/

const calcDist = function (a1, b1, a2, b2) {
    return Math.sqrt(((a1 - a2) * (a1 - a2)) + ((b1 - b2) * (b1 - b2)));
};

const calcChaseIncrement = function (meX, meY, meAngle, targetX, targetY, inc) {
    let angBtw = Math.atan2(targetY - meY, targetX - meX);
    let diff = angBtw - meAngle;
    if (diff > Math.PI || (diff < 0 && diff > -Math.PI)) {
        return -inc;
    } else {
        return inc;
    };
};

const playBackgroundMusic = function () {
    if (bgAudio[bgIndex].paused) {
        bgIndex = (bgIndex + 1) % bgAudio.length;
        bgAudio[bgIndex].volume = bgAudioVolume;
        bgAudio[bgIndex].play();
    };
};

const playAudio = function (noise) {
    audio[noise].sounds[audio[noise].index].play();
    audio[noise].index = (audio[noise].index + 1) % audio.nCopies;
};

const clearCanvas = function () {
    context.clearRect(0, 0, canvas.width, canvas.height);
};

const keepWithinPiOf0 = function (a) {
    while (a < -Math.PI || a > Math.PI) {
        if (a > 0) {
            a -= TAU;
        } else {
            a += TAU;
        };
    };
    return a;
};

const canvasText = function (str, x, y) {
    context.fillText(str, x, y);
};

const showSpawnLocation = function () {
    context.fillStyle = red;
    // context.fillRect(game.spawnPoint.x, game.spawnPoint.y, 10, 10);
    context.font = `bold ${width / 10}px sans-serif`;
    context.fillText('X', game.spawnPoint.x, game.spawnPoint.y);

};

const generateWave = function () {
    if (game.enemies.length === 0 && game.wave < 1 + game.arena) {
        game.spawnCountdown = 0;
        let n = game.arena * 2 + game.difficulty * 2 + game.wave + Math.floor(Math.random() * 5);
        // console.log(`${n} enemies`);
        for (let i = 0; i < n; i++) {
            game.enemies.push(new Enemy(game.spawnPoint.x, game.spawnPoint.y));
        };
        game.wave += 1;
        waveNumEl.innerText = `wave ${game.wave}/${1 + game.arena}`;
        game.spawnPoint = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
        return;
    } else if (game.enemies.length === 0 && game.wave === 1 + game.arena && game.arena === winningArena) {
        console.log('you win!'); //!
    };
};

const showShopCurrentUnits = function () {
    for (let i = 0; i < game.snake.length; i++) {
        shopCurrentUnits[i].style.backgroundColor = shopCurrentUnitExplanations[i].style.color = game.snake[i].color;
        shopCurrentUnits[i].style.display = 'flex';
        shopCurrentUnits[i].innerText = game.snake[i].level;
        shopCurrentUnitExplanations[i].innerHTML = `${game.snake[i].name}:<br>level ${game.snake[i].level}<br>${game.snake[i].description}`;
        nextArenaButton.style.setProperty('--nab-hover-color', difficultyColors[game.difficulty - 1]);
    };
};

const chooseRandomUnitUpgrades = function () {
    if (game.choices.length === 0) {
        //! there may be a better way to choose 3 distinct random units
        let selection = unitChoices[Math.floor(Math.random() * unitChoices.length)];
        game.choices.push(selection);
        while (game.choices.includes(selection)) {
            selection = unitChoices[Math.floor(Math.random() * unitChoices.length)];
        };
        game.choices.push(selection);
        while (game.choices.includes(selection)) {
            selection = unitChoices[Math.floor(Math.random() * unitChoices.length)];
        };
        game.choices.push(selection);
        for (let i = 0; i < 3; i++) {
            choiceEls[i].style.backgroundColor = game.choices[i].color;
            explanationEls[i].innerHTML = `${game.choices[i].name}<br>${game.choices[i].description}`;
        };
    };

};

const recalculateSnakeSpeed = function () {
    snek.speed = baseSpeed;
    snek.speed = game.snake.map(u => u.speedFactor).reduce((accumulator, x) => accumulator * x, baseSpeed);
};

const showShop = function () {
    game.isPlaying = false;
    arenaNumEl.innerText = `arena ${game.arena} cleared!`;
    waveNumEl.innerText = '';
    showShopEl.checked = true;
    setTimeout(() => shopEl.classList.remove('entry-active'), 1000);
    setTimeout(() => shopEl.classList.add('exit-active'), 1000);
    game.choiceMade = false; //! perhaps duplicated from handleNextArena
    choiceConfirmationEl.innerText = 'choose an upgrade!';
    labelCurrentUnitsEl.innerText = 'current units';
    showShopCurrentUnits();
    game.choices = [];
    chooseRandomUnitUpgrades();
};

const handleNextArena = function () {
    if (game.choiceMade && !game.isPlaying) {
        game.choices = [];
        recalculateSnakeSpeed();
        showShopEl.checked = false;
        game.arena++;
        arenaNumEl.innerText = `arena ${game.arena}`;
        game.wave = 0;
        waveNumEl.innerText = `wave ${game.wave}/${1 + game.arena}`;
        game.isPlaying = true;
        game.choiceMade = false;
        startAudio.play();
        draw(); //! unsure if needed
        setTimeout(() => shopEl.classList.remove('exit-active'), 1000);
        setTimeout(() => shopEl.classList.add('entry-active'), 1000);
    } else {
        nextArenaButton.innerHTML = 'choose first';
    };
};

const showLossMessage = function () {
    lossAudio.play();
    lossEl.style.display = 'grid';
};

const showWinMessage = function () {
    winEl.style.display = 'grid';
};

const resetGame = function (diff) {
    clearCanvas();
    snek = new Snek();
    game.difficulty = diff;
    if (game.difficulty < 1) {
        game.difficulty = 1;
    } else if (game.difficulty > 10) {
        game.difficulty = 10;
    };
    game.isPlaying = true;
    game.spawnCountdown = 0;
    game.choiceMade = true;
    game.arena = 1;
    game.wave = 0;
    game.snake = [unitChoices[Math.floor(Math.random() * unitChoices.length)]];
    game.enemies = [];
    bgAudio[bgIndex].volume = bgAudioVolume;
    bgAudio[bgIndex].play();
    showShopEl.checked = false;
    showLossEl.checked = false;
    showWinEl.checked = false;
};

/*--------------- Classes --------------*/

class Pip {
    constructor(xPos, yPos, size = unitSize, health = 10, fillColor = red, velo = 3, direction = 0, turningIncrement = 0.02) {
        this.x = xPos;
        this.y = yPos;
        this.radius = size;
        this.angle = direction;
        this.color = fillColor;
        this.speed = velo;
        this.turn = turningIncrement;
        this.hp = health;
    };

    draw() {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, TAU, false);
        context.fillStyle = this.color;
        context.fill();
        context.closePath();
    };

    move() {
        let dx = this.speed * Math.cos(this.angle);
        let dy = this.speed * Math.sin(this.angle);
        if (this.y + dy < this.radius || this.y + dy > canvas.height - this.radius) {
            this.angle *= -1;
            dy = this.speed * Math.sin(this.angle);
        } else if (this.x + dx < this.radius || this.x + dx > canvas.width - this.radius) {
            this.angle = Math.PI - this.angle;
            dx = this.speed * Math.cos(this.angle);
        };
        this.angle = keepWithinPiOf0(this.angle);
        this.x += dx;
        this.y += dy;
    };

};

class Unit {
    constructor(type) {
        this.level = 1;
        this.radius = unitSize;
        this.x;
        this.y;
        this.name = type;
        this.attackCounter = 0;
        this.projectiles = [];
        switch (type) {
            case 'Rogue':
                this.color = red;
                this.hp = 10;
                this.speedFactor = 1.23;
                this.damage = 5;
                this.projectileLifespanFactor = 0.5;
                this.attackCooldown = baseCooldown / this.speedFactor;
                this.projSize = baseProjSize / this.speedFactor;
                this.projSpeed = baseProjSpeed * this.speedFactor;
                this.projectileLifespan = this.projectileLifespanFactor * width / (this.projSpeed + EPSILON);
                this.description = 'fast move speed<br>ranged attack<br>low hp';
                break;
            case 'Fighter':
                this.color = yellow;
                this.hp = 30;
                this.speedFactor = 0.59;
                this.damage = 10;
                this.projectileLifespanFactor = EPSILON / 35;
                this.attackCooldown = baseCooldown / this.speedFactor;
                this.projSize = baseProjSize * 30;
                this.projSpeed = 0;
                this.projectileLifespan = this.projectileLifespanFactor * width / (this.projSpeed + EPSILON);
                this.description = 'slow move speed<br>short-range, heavy attack<br>high hp';
                break;
            case 'Ranger':
                this.color = green;
                this.hp = 20;
                this.speedFactor = 1.11;
                this.damage = 5;
                this.projectileLifespanFactor = 1;
                this.attackCooldown = baseCooldown / this.speedFactor;
                this.projSize = baseProjSize / this.speedFactor;
                this.projSpeed = baseProjSpeed * this.speedFactor;
                this.projectileLifespan = this.projectileLifespanFactor * width / (this.projSpeed + EPSILON);
                this.description = 'good move speed<br>piercing ranged attack<br>mid hp';
                break;
            case 'Enchanter':
                this.color = blue;
                this.hp = 10;
                this.speedFactor = 0.9;
                // baseCooldown *= 0.85;
                this.description = 'no attack<br>buffs allies\' attack speed<br>low hp';
                break;
            case 'Curser':
                this.color = purple;
                this.hp = 8;
                this.speedFactor = 0.8;
                this.damage = 15;
                this.projectileLifespanFactor = 0.5;
                this.attackCooldown = baseCooldown / this.speedFactor;
                this.projSize = baseProjSize / this.speedFactor;
                this.projSpeed = baseProjSpeed * this.speedFactor;
                this.projectileLifespan = this.projectileLifespanFactor * width / (this.projSpeed + EPSILON);
                this.description = 'slow move speed<br>landmine attack<br>low hp';
                break;
            case 'Sprayer':
                this.color = orange;
                this.hp = 8;
                this.speedFactor = 0.72;
                this.damage = 2;
                this.projectileLifespanFactor = 0.8;
                this.attackCooldown = baseCooldown / this.speedFactor / 10;
                this.projSize = baseProjSize / 2;
                this.projSpeed = baseProjSpeed * this.speedFactor / 3;
                this.projectileLifespan = this.projectileLifespanFactor * width / (this.projSpeed + EPSILON);
                this.description = 'low move speed<br>fast spray attack<br>low hp';
                break;
            case 'Vagrant':
                this.color = white;
                this.hp = 15;
                this.speedFactor = 1.12;
                this.damage = 5;
                this.projectileLifespanFactor = 0.5;
                this.attackCooldown = baseCooldown / this.speedFactor;
                this.projSize = baseProjSize / this.speedFactor;
                this.projSpeed = baseProjSpeed * this.speedFactor;
                this.projectileLifespan = this.projectileLifespanFactor * width / (this.projSpeed + EPSILON);
                this.description = 'fast move speed<br>orbital attack<br>mid hp';
                break;
            default:
                break;
        };
    };
    levelUp() {
        this.level++;
        this.hp *= 2; // double hp
    };
    calcAttackSpeed() {
        if (this.name !== 'Sprayer') {
            this.attackCooldown = currentCooldown / this.speedFactor;
        } else {
            this.attackCooldown = currentCooldown / this.speedFactor / 10;
        };
    };
    drawUnit(x, y) {
        context.beginPath();
        context.arc(x, y, this.radius, 0, TAU, false);
        context.fillStyle = this.color;
        context.fill();
        context.closePath();
        this.x = x;
        this.y = y;
        this.attackCounter++;
        this.drawProjectiles();
    };
    drawProjectiles() {
        if (this.name !== 'Enchanter') {
            this.projectiles.forEach((p) => {
                p.lifespan++;
                if (p.x < 0 || p.y < 0 || p.x > width || p.y > height || p.lifespan > this.projectileLifespan) {
                    this.projectiles.splice(this.projectiles.indexOf(p), 1);
                };
                p.x += this.projSpeed * Math.cos(p.angle);
                p.y += this.projSpeed * Math.sin(p.angle);
                context.globalAlpha = 0.5;
                // if (p.lifespan % 8 !== 0) {
                //     context.beginPath();
                //     context.arc(p.x, p.y, this.projSize, 0, TAU, false);
                //     context.fillStyle = this.color;
                //     context.fill();
                //     context.closePath();
                // };
                context.beginPath();
                context.arc(p.x, p.y, this.projSize, 0, TAU, false);
                context.fillStyle = this.color;
                context.fill();
                context.closePath();
                context.globalAlpha = 0.92;
                game.enemies.forEach((e) => {
                    if (calcDist(p.x, p.y, e.x, e.y) <= e.radius + this.projSize) {
                        if (this.name !== 'Ranger') {
                            this.projectiles.splice(this.projectiles.indexOf(p), 1);
                        };
                        e.takeHit(this.damage * this.level);
                        // console.log(`${e.x}, ${e.y} hit`);
                        // e.remove();
                    }
                });
            });
        } else {
            game.snake.forEach(u => u.calcAttackSpeed());
        };

    };
    attack() {
        if (game.enemies.length > 0 && this.attackCounter > this.attackCooldown) {
            let target = game.enemies[Math.floor(Math.random() * game.enemies.length)];
            if (this.name === 'Enchanter') {
                currentCooldown = baseCooldown * Math.pow(this.speedFactor, this.level);
            } else if (this.name !== 'Sprayer') {
                this.projectiles.push({ x: this.x, y: this.y, angle: Math.atan2(target.y - this.y, target.x - this.x), lifespan: 0 });
            } else {
                this.projectiles.push({ x: this.x, y: this.y, angle: Math.atan2(target.y - this.y, target.x - this.x) + (Math.random() * Math.PI) - Math.PI / 2, lifespan: 0 });
            };
            // console.log(this.attackCounter, this.attackCooldown);
            this.attackCounter = 0;
        };
    };
};

class Enemy extends Pip {
    constructor(xPos = width / 4, yPos = height / 4, size = 2 * unitSize, health = 10, fillColor = red, velo = baseSpeed * 0.7, direction = 0, turningIncrement = 0.02) {
        super(xPos, yPos, size, health, fillColor, velo, direction, turningIncrement);
        this.jitter = 20 * this.turn;
        this.bounceable = 101;
    };
    move() {
        if (Math.random() > 0.95) {
            this.angle += (2 * Math.random() * this.jitter) - this.jitter;
        };
        let dx = this.speed * Math.cos(this.angle);
        let dy = this.speed * Math.sin(this.angle);
        if (this.y + dy < this.radius || this.y + dy > canvas.height - this.radius) {
            this.angle *= -1;
            dy = this.speed * Math.sin(this.angle);
        } else if (this.x + dx < this.radius || this.x + dx > canvas.width - this.radius) {
            this.angle = Math.PI - this.angle;
            dx = this.speed * Math.cos(this.angle);
        } else if (game.snake.map(u => calcDist(this.x + dx, this.y + dy, u.x, u.y) < this.radius + u.radius).some(x => x === true)) { // if this enemy's movement will make it touch any unit in the snake, then...
            snek.hp -= this.hp / 2;
            playAudio('dmg');
            this.remove(); //! just move on lol
        };
        this.angle = keepWithinPiOf0(this.angle);
        this.x += dx;
        this.y += dy;
    };
    checkForCollisions(c = []) {
        for (let i = 0; i < c.length; i++) {
            let other = c[i];
            let d = calcDist(this.x, this.y, other.x, other.y);
            if (d < this.radius + other.radius && this.bounceable > 100) {
                // let r1 = Math.random() < 0.5 ? 1 : -1;
                // let r2 = Math.random() < 0.5 ? 1 : -1;
                // this.x += r1 * this.speed * 3;
                // this.y += r2 * this.speed * 3;
                this.angle = Math.PI - this.angle;
                this.bounceable = 0;
            };
        };
    };
    takeHit(dmg) {
        this.hp -= dmg;
    };
    remove() {
        let index = game.enemies.indexOf(this);
        game.enemies.splice(index, 1);
        playAudio('kill');
    };
    render() {
        if (this.hp <= 0) {
            this.remove();
        };
        if (Math.random() >= 0.95) {
            let temp = this.angle;
            this.angle += (Math.random() * 2 * this.jitter) - this.jitter;
        };
        this.angle += calcChaseIncrement(this.x, this.y, this.angle, snek.x, snek.y, this.turn);
        this.move();
        this.bounceable++;
        this.draw();
    };
};

class Snek extends Pip {
    constructor(xPos = width / 2, yPos = height / 2, size = unitSize, health = 10, fillColor = white, velo = baseSpeed, direction = -0.1, turningIncrement = 0.07) {
        super(xPos, yPos, size, health, fillColor, velo, direction, turningIncrement);
        this.history = [{ x: xPos, y: yPos }];
        this.maxHP = this.hp;
    };
    move() {
        let dx = this.speed * Math.cos(this.angle);
        let dy = this.speed * Math.sin(this.angle);
        if (this.y + dy < this.radius || this.y + dy > canvas.height - this.radius) {
            this.angle *= -1;
            dy = this.speed * Math.sin(this.angle);
            if (!game.audioMuted) {
                playAudio('bounce');
            };
        } else if (this.x + dx < this.radius || this.x + dx > canvas.width - this.radius) {
            this.angle = Math.PI - this.angle;
            dx = this.speed * Math.cos(this.angle);
            if (!game.audioMuted) {
                playAudio('bounce');
            };
        };
        this.angle = keepWithinPiOf0(this.angle);
        this.x += dx;
        this.y += dy;
        this.history.unshift({ x: this.x, y: this.y });
        if (this.history.length > unitSize * 8) {
            this.history.pop();
        };
    };
    draw() {
        if (this.hp <= 0) {
            game.isPlaying = false;
            bgAudio.forEach(a => a.volume = 0);
            showLossMessage();
        };
        let u = 0;
        let spacingFactor = 0.75 * (baseSpeed / this.speed);
        for (let i = 0; i < this.history.length; i += Math.floor((unitSize * spacingFactor))) {
            if (this.history[i] && game.snake[u]) {
                game.snake[u].drawUnit(this.history[i].x, this.history[i].y);
                game.snake[u].attack();
                u++;
            };
        };
        for (let h = 0; h < hpEls.length; h++) {
            if (snek.hp / snek.maxHP >= h / hpEls.length) {
                hpEls[h].style.backgroundColor = green;
            } else {
                hpEls[h].style.backgroundColor = red;
            };
        };
    };
    render() {
        this.move();
        this.draw();
    };
};



