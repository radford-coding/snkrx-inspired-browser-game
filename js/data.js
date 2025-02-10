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
    hit: {
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
    shoot1: {
        index: 0,
        sounds: [],
    },
    shoot2: {
        index: 0,
        sounds: [],
    },
    shoot3: {
        index: 0,
        sounds: [],
    },
    shoot4: {
        index: 0,
        sounds: [],
    },
};

const deployedAudioPath = 'https://github.com/radford-coding/snkrx-inspired-browser-game/blob/main/audio/';

const lossAudio = new Audio(deployedAudioPath + 'loss.mp3' + '?raw=true');
const winAudio = new Audio(deployedAudioPath + 'win.mp3' + '?raw=true');
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

const wallAudio = new Audio(deployedAudioPath + 'wall-bounce.mp3' + '?raw=true');
const hitAudio = new Audio(deployedAudioPath + 'hit.mp3' + '?raw=true');
const killAudio = new Audio(deployedAudioPath + 'kill.mp3' + '?raw=true');
const dmgAudio = new Audio(deployedAudioPath + 'dmg.mp3' + '?raw=true');
const shoot1Audio = new Audio(deployedAudioPath + 'shoot1.mp3' + '?raw=true');
const shoot2Audio = new Audio(deployedAudioPath + 'shoot2.mp3' + '?raw=true');
const shoot3Audio = new Audio(deployedAudioPath + 'shoot3.mp3' + '?raw=true');
const shoot4Audio = new Audio(deployedAudioPath + 'shoot4.mp3' + '?raw=true');

[...Array(audio.nCopies)].map(() => {
    audio.bounce.sounds.push(wallAudio.cloneNode());
    audio.hit.sounds.push(hitAudio.cloneNode());
    audio.kill.sounds.push(killAudio.cloneNode());
    audio.dmg.sounds.push(dmgAudio.cloneNode());
    audio.shoot1.sounds.push(shoot1Audio.cloneNode());
    audio.shoot2.sounds.push(shoot2Audio.cloneNode());
    audio.shoot3.sounds.push(shoot3Audio.cloneNode());
    audio.shoot4.sounds.push(shoot4Audio.cloneNode());
});

const difficultyColors = [
    '#8FF9D5',
    '#72F6DB',
    '#56F1E6',
    '#39E1EC',
    '#1DC1E5',
    '#009BDE',
    '#00B1C5',
    '#00AA97',
    '#008E5F',
    '#007132'
];

const spawnFrac = 1 / 5;
const spawnPoints = [
    { x: width * spawnFrac, y: height * spawnFrac },
    { x: width * (1 - spawnFrac), y: height * spawnFrac },
    { x: width / 2, y: height / 2 },
    { x: width * spawnFrac, y: height * (1 - spawnFrac) },
    { x: width * (1 - spawnFrac), y: height * (1 - spawnFrac) }
];

const TAU = 2 * Math.PI;
const EPSILON = 0.001;
const spawnDuration = 100;
let baseCooldown = 100;
let currentCooldown = 100;
const unitSize = width * 0.03;
let baseSpeed = width * 0.0045;
const baseProjSpeed = baseSpeed * 2.25;
const baseProjSize = unitSize * .3;
const bounceableDelay = 75;
const winningArena = 5;
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
    if (!game.audioMuted && bgAudio[bgIndex].paused && game.isPlaying) {
        bgIndex = (bgIndex + 1) % bgAudio.length;
        bgAudio[bgIndex].volume = bgAudioVolume;
        bgAudio[bgIndex].play();
    };
};

const playAudio = function (noise) {
    if (!game.audioMuted) {
        audio[noise].sounds[audio[noise].index].play();
        audio[noise].index = (audio[noise].index + 1) % audio.nCopies;
    };
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
    context.font = `bold ${width / 10}px sans-serif`;
    context.fillText('X', game.spawnPoint.x, game.spawnPoint.y);
};

const damageEnemy = function (enemy, unit) {
    playAudio('hit');
    enemy.takeHit(unit.damage * Math.pow(unit.level, 1.1));
};

const spawnNormalWave = function () {
    game.spawnCountdown = 0;
    let n = game.arena * 2 + game.difficulty * 2 + game.wave + Math.floor(Math.random() * 5);
    for (let i = 0; i < n; i++) {
        if (Math.random() <= game.difficulty / 10) {
            game.enemies.push(new Enemy(game.spawnPoint.x, game.spawnPoint.y, 2 * unitSize, (1 + game.difficulty) * unitSize, 'spawner', purple, baseSpeed / 2));
        } else {
            game.enemies.push(new Enemy(game.spawnPoint.x, game.spawnPoint.y, size = 1.25 * unitSize + Math.random() * unitSize, unitSize * (1 + (game.arena - 1) / winningArena)));
        };
    };
    game.wave += 1;
    waveNumEl.innerText = `wave ${game.wave}/${1 + game.arena}`;
    game.spawnPoint = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
};

const generateWave = function () {
    if (game.enemies.length === 0 && game.wave <= game.arena) {
        baseSpeed *= (game.difficulty + 9) / 10;
        spawnNormalWave();
    };
};

const showShopCurrentUnits = function () {
    for (let i = 0; i < game.snake.length; i++) {
        shopCurrentUnits[i].style.backgroundColor = shopCurrentUnitExplanations[i].style.color = game.snake[i].color;
        shopCurrentUnits[i].style.display = 'flex';
        shopCurrentUnits[i].innerText = game.snake[i].level;
        shopCurrentUnitExplanations[i].innerHTML = `${game.snake[i].name}:<br>level ${game.snake[i].level}<br>${game.snake[i].description}`;
        document.querySelector('body').style.setProperty('--btn-hover-color', difficultyColors[game.difficulty - 1]);
    };
};

const clearShopCurrentUnits = function () {
    for (let i = 0; i < 8; i++) {
        shopCurrentUnits[i].style.display = 'none';
    };
};

const chooseRandomUnitUpgrades = function () {
    if (game.choices.length === 0) {
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
    snek.speed = game.snake.map(u => Math.pow(u.speedFactor, u.level)).reduce((accumulator, x) => accumulator * x, baseSpeed);
};

const showShop = function () {
    game.isPlaying = false;
    arenaNumEl.innerText = `arena ${game.arena} cleared!`;
    waveNumEl.innerText = '';
    showShopEl.checked = true;
    setTimeout(() => shopEl.classList.remove('entry-active'), 1000);
    setTimeout(() => shopEl.classList.add('exit-active'), 1000);
    game.choiceMade = false;
    choiceConfirmationEl.innerText = 'choose an upgrade!';
    labelCurrentUnitsEl.innerText = 'current units';
    showShopCurrentUnits();
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
        if (!game.audioMuted) {
            startAudio.play();
        };
        game.snake.forEach((u) => {
            u.projectiles = [];
        });
        draw();
        setTimeout(() => {
            shopEl.classList.remove('exit-active');
            shopEl.classList.add('entry-active');
            game.choices = [];
            chooseRandomUnitUpgrades();
        }, 1500);
    } else {
        nextArenaButton.innerHTML = 'choose first';
    };
};

const showLossMessage = function () {
    lossButtonReplayEasier.style.setProperty('--btn-hover-easier', difficultyColors[Math.max(game.difficulty - 2, 0)]);
    lossButtonReplay.style.setProperty('--btn-hover-same', difficultyColors[game.difficulty - 1]);
    if (!game.audioMuted) {
        lossAudio.play();
    };
    game.isPlaying = false;
    lossEl.style.display = 'grid';
    showLossEl.checked = false;
};

const showWinMessage = function () {
    winButtonReplayHarder.style.setProperty('--btn-hover-harder', difficultyColors[Math.min(difficultyColors.length - 1, game.difficulty)]);
    winButtonReplay.style.setProperty('--btn-hover-same', difficultyColors[game.difficulty - 1]);
    if (!game.audioMuted) {
        winAudio.play();
    };
    game.isPlaying = false;
    winEl.style.display = 'grid';
    showWinEl.checked = false;
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
    arenaNumEl.innerText = `arena ${game.arena}`;
    game.wave = 0;
    waveNumEl.innerText = `wave ${game.wave}/${1 + game.arena}`;
    init();
    game.enemies = [];
    clearShopCurrentUnits();
    bgAudio[bgIndex].volume = bgAudioVolume;
    if (!game.audioMuted) {
        bgAudio[bgIndex].play();
    };
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
        this.x = width / 2;
        this.y = height / 2;
        this.name = type;
        this.attackCounter = 0;
        this.projectiles = [];
        switch (type) {
            case 'Rogue':
                this.color = red;
                this.hp = unitSize;
                this.speedFactor = 1.23;
                this.damage = unitSize;
                this.projectileLifespanFactor = 0.5;
                this.attackCooldown = baseCooldown / this.speedFactor;
                this.projSize = baseProjSize / this.speedFactor;
                this.projSpeed = baseProjSpeed * this.speedFactor;
                this.projectileLifespan = this.projectileLifespanFactor * width / (this.projSpeed + EPSILON);
                this.description = 'fast move speed<br>ranged attack<br>low hp';
                break;
            case 'Fighter':
                this.color = yellow;
                this.hp = unitSize * 5;
                this.speedFactor = 0.6;
                this.damage = unitSize * 2;
                this.projectileLifespanFactor = EPSILON / 35;
                this.attackCooldown = baseCooldown / this.speedFactor;
                this.projSize = baseProjSize * 30;
                this.projSpeed = 0;
                this.projectileLifespan = this.projectileLifespanFactor * width / (this.projSpeed + EPSILON);
                this.description = 'slow move speed<br>short-range, heavy attack<br>high hp';
                break;
            case 'Ranger':
                this.color = green;
                this.hp = unitSize * 2;
                this.speedFactor = 1.11;
                this.damage = unitSize / 10;
                this.projectileLifespanFactor = 1;
                this.attackCooldown = baseCooldown / this.speedFactor;
                this.projSize = baseProjSize / this.speedFactor;
                this.projSpeed = baseProjSpeed * this.speedFactor * 3;
                this.projectileLifespan = this.projectileLifespanFactor * width / (this.projSpeed + EPSILON);
                this.description = 'good move speed<br>piercing ranged attack<br>mid hp';
                break;
            case 'Enchanter':
                this.color = blue;
                this.hp = unitSize;
                this.speedFactor = 0.9;
                this.description = 'no attack<br>buffs allies\' attack speed<br>low hp';
                break;
            case 'Trapper':
                this.color = purple;
                this.hp = unitSize;
                this.speedFactor = 1;
                this.damage = unitSize;
                this.projectileLifespanFactor = 2;
                this.attackCooldown = 2 * baseCooldown / this.speedFactor;
                this.projSize = baseProjSize / this.speedFactor;
                this.projSpeed = 0;
                this.projectileLifespan = this.projectileLifespanFactor * width / (this.projSpeed + EPSILON);
                this.description = 'mid move speed<br>landmine attack<br>low hp';
                break;
            case 'Sprayer':
                this.color = orange;
                this.hp = unitSize;
                this.speedFactor = 0.72;
                this.damage = unitSize / 5;
                this.projectileLifespanFactor = 0.8;
                this.attackCooldown = baseCooldown / this.speedFactor / 10;
                this.projSize = baseProjSize / 2;
                this.projSpeed = baseProjSpeed * this.speedFactor / 3;
                this.projectileLifespan = this.projectileLifespanFactor * width / (this.projSpeed + EPSILON);
                this.description = 'low move speed<br>fast spray attack<br>low hp';
                break;
            case 'Vagrant':
                this.color = white;
                this.hp = unitSize * 2;
                this.speedFactor = 1.12;
                this.damage = unitSize / 10;
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
    };
    drawProjectiles() {
        if (this.name !== 'Enchanter' && this.name !== 'Vagrant') {
            this.projectiles.forEach((p) => {
                p.lifespan++;
                if (p.x < 0 || p.y < 0 || p.x > width || p.y > height || p.lifespan > this.projectileLifespan) {
                    this.projectiles.splice(this.projectiles.indexOf(p), 1);
                };
                p.x += this.projSpeed * Math.cos(p.angle);
                p.y += this.projSpeed * Math.sin(p.angle);
                context.globalAlpha = 0.5;
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
                        damageEnemy(e, this);
                    }
                });
            });
        } else if (this.name === 'Vagrant') {
            if (this.projectiles.length !== this.level) {
                this.projectiles = [];
                for (let a = 0; a < this.level; a++) {
                    this.projectiles.push({ x: this.x + 8 * this.radius * Math.cos(a * TAU / this.level), y: this.y + 8 * this.radius * Math.sin(a * TAU / this.level), angle: a });
                };
            };
            this.projectiles.forEach((p) => {
                p.angle = (p.angle + (TAU / currentCooldown)) % TAU;
                p.x = this.x + 8 * this.radius * Math.cos(p.angle);
                p.y = this.y + 8 * this.radius * Math.sin(p.angle);
                context.globalAlpha = 0.5;
                context.beginPath();
                context.arc(p.x, p.y, this.projSize, 0, TAU);
                context.fillStyle = this.color;
                context.fill();
                context.closePath();
                context.globalAlpha = 0.92;
                game.enemies.forEach((e) => {
                    if (calcDist(p.x, p.y, e.x, e.y) <= e.radius + this.projSize) {
                        damageEnemy(e, this);
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
            } else if (this.name !== 'Sprayer' && this.name !== 'Vagrant') {
                playAudio('shoot1');
                this.projectiles.push({ x: this.x, y: this.y, angle: Math.atan2(target.y - this.y, target.x - this.x), lifespan: 0 });
            } else if (this.name !== 'Vagrant') {
                playAudio('shoot2');
                this.projectiles.push({ x: this.x, y: this.y, angle: Math.atan2(target.y - this.y, target.x - this.x) + (Math.random() * Math.PI) - Math.PI / 2, lifespan: 0 });
            };
            this.attackCounter = 0;
        };
    };
};

class Enemy extends Pip {
    constructor(xPos = width / 4, yPos = height / 4, size = 1.25 * unitSize + Math.random() * unitSize, health = unitSize, type = 'basic', fillColor = red, velo = baseSpeed / (size / unitSize), direction = Math.random() * TAU, turningIncrement = 0.02) {
        super(xPos, yPos, size, health, fillColor, velo, direction, turningIncrement);
        this.jitter = 20 * this.turn;
        this.bounceable = Math.random() * 2 * bounceableDelay;
        this.angle = Math.random() * TAU;
        this.counter = 0;
        this.type = type;
        this.hp = this.radius;
    };
    move() {
        if (Math.random() > 0.98) {
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
        } else if (game.snake.map(u => calcDist(this.x + dx, this.y + dy, u.x, u.y) < this.radius + u.radius).some(x => x === true)) {
            snek.hp -= this.hp / 4;
            playAudio('dmg');
            this.remove();
        };
        this.angle = keepWithinPiOf0(this.angle);
        this.x += dx;
        this.y += dy;
        if (this.type === 'spawner') {
            this.counter++;
            if (this.counter > baseCooldown * 6 * ((15 - game.difficulty) / (14))) {
                game.enemies.push(new Enemy(this.x, this.y, this.radius / 2, this.radius / 2, 'basic', purple, this.speed * 1.5, Math.random() * TAU, 0.02));
                this.counter = 0;
            };
        };
    };
    checkForCollisions(c = []) {
        for (let i = 0; i < c.length; i++) {
            let other = c[i];
            let d = calcDist(this.x, this.y, other.x, other.y);
            if (d < this.radius + other.radius && this.bounceable > bounceableDelay) {
                this.angle += (2 * Math.random() * this.jitter) - this.jitter;
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
    constructor(xPos = width / 2, yPos = height / 2, size = unitSize, health = unitSize, fillColor = white, velo = baseSpeed, direction = -0.1, turningIncrement = 0.07) {
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
        game.snake.forEach(u => u.drawProjectiles());
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