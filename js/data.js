/*-------------- Constants -------------*/

const canvas = document.getElementById('game-area');
const width = canvas.width = canvas.clientWidth;
const height = canvas.height = canvas.clientHeight;
const context = canvas.getContext('2d');

const audioCopies = 10;
const wallAudio = new Audio('../audio/test.mp3');
const wallBounceMP3s = [];
for (let i = 0; i < audioCopies; i++) {
    wallBounceMP3s.push(wallAudio.cloneNode());
};
let wbIndex = 0;

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

const TAU = 2 * Math.PI;
const EPSILON = 0.01;
const unitSize = 20;
const baseSpeed = 3;
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

const bounceWall = function () {
    wallBounceMP3s[wbIndex].play();
    wbIndex = (wbIndex + 1) % audioCopies;
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

const generateWave = function () {
    if (game.enemies.length === 0 && game.wave < 2 + game.arena) {
        let n = game.arena * 2 + game.difficulty * 2 + game.wave + Math.floor(Math.random() * 5);
        // console.log(`${n} enemies`);
        let spawn = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
        for (let i = 0; i < n; i++) {
            game.enemies.push(new Enemy(spawn.x, spawn.y));
        };
        game.wave++;
        waveNumEl.innerText = `wave ${game.wave}/${2 + game.arena}`;
        return;
    } else if (game.enemies.length === 0 && game.wave === 2 + game.arena && game.arena === winningArena) {
        console.log('you win!');
    } else if (game.enemies.length === 0 && game.wave === 2 + game.arena) {
        game.isPlaying = false;
        arenaNumEl.innerText = `arena ${game.arena} cleared!`;
        waveNumEl.innerText = '';
        showShopEl.checked = true;
        setTimeout(() => shopEl.classList.remove('entry-active'), 1000);
        setTimeout(() => shopEl.classList.add('exit-active'), 1000);
    };

};

const showShopCurrentUnits = function () {
    for (let i = 0; i < game.snake.length; i++) {
        shopCurrentUnits[i].style.backgroundColor = shopCurrentUnitExplanations[i].style.backgroundColor = game.snake[i].color;
        shopCurrentUnits[i].style.display = 'flex';
        shopCurrentUnitExplanations[i].style.opacity = 0.25;
        shopCurrentUnits[i].innerText = game.snake[i].level;
        shopCurrentUnitExplanations[i].innerText = game.snake[i].description;
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
            explanationEls[i].innerText = game.choices[i].name;
        };
    };

};

const showShop = function () {
    game.choiceMade = false;
    choiceConfirmationEl.innerText = 'choose an upgrade!';
    labelCurrentUnitsEl.innerText = 'current units';
    showShopCurrentUnits();
    chooseRandomUnitUpgrades();
};

const handleNextArena = function () {
    if (game.choiceMade && !game.isPlaying) {
        game.choices = [];
        snek.speed = baseSpeed;
        snek.speed = game.snake.map(u => u.speedFactor).reduce((accumulator, x) => accumulator * x, baseSpeed);
        showShopEl.checked = false;
        game.arena++;
        arenaNumEl.innerText = `arena ${game.arena}`;
        game.wave = 0;
        waveNumEl.innerText = `wave ${game.wave}/${2 + game.arena}`;
        game.isPlaying = true;
        draw(); //! unsure if needed
        setTimeout(() => shopEl.classList.remove('exit-active'), 1000);
        setTimeout(() => shopEl.classList.add('entry-active'), 1000);
    } else {
        nextArenaButton.innerHTML = 'choose first!';
    };
    console.log(snek.speed);
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
        switch (type) {
            case 'Rogue':
                this.color = red;
                this.hp = 10;
                this.speedFactor = 1.2;
                break;
            case 'Fighter':
                this.color = yellow;
                this.hp = 30;
                this.speedFactor = 0.8;
                break;
            case 'Ranger':
                this.color = green;
                this.hp = 20;
                this.speedFactor = 1.2;
                break;
            case 'Wizard':
                this.color = blue;
                this.hp = 30;
                this.speedFactor = 1;
                break;
            case 'Curser':
                this.color = purple;
                this.hp = 8;
                this.speedFactor = 0.8;
                break;
            case 'Spawner':
                this.color = orange;
                this.hp = 8;
                this.speedFactor = 0.9;
                break;
            case 'Vagrant':
                this.color = white;
                this.hp = 8;
                this.speedFactor = 1.1;
                break;
            default:
                this.color = bg;
                console.log('invalid unit type'); //! remove
        };
    };
    attack() {
        //based on level
    };
    levelUp() {
        this.level++;
        this.hp *= 2; // double hp
    };
    drawUnit(x, y) { //! probably need separate unit classes for each one...
        context.beginPath();
        context.arc(x, y, this.radius, 0, TAU, false);
        context.fillStyle = this.color;
        context.fill();
        context.closePath();
        this.x = x;
        this.y = y;
    };
    attack() {
        // periodically do stuff
    };
};

class Enemy extends Pip {
    constructor(xPos = width / 4, yPos = height / 4, size = 2 * unitSize, health = 10, fillColor = red, velo = baseSpeed * 0.7, direction = 0, turningIncrement = 0.02) {
        super(xPos, yPos, size, health, fillColor, velo, direction, turningIncrement);
        this.jitter = 20 * this.turn;
        this.bounceable = 101;
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
        } else if (game.snake.map(u => calcDist(this.x + dx, this.y + dy, u.x, u.y) < this.radius + u.radius).some(x => x === true)) { // if this enemy's movement will make it touch any unit in the snake, then...
            // return; //! freeze!
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
                this.angle = Math.PI - this.angle;
                this.bounceable = 0;
                // this.x = Math.cos(d);
                // console.log('boinggggg');
            };
        };
    };
    remove() {
        let index = game.enemies.indexOf(this);
        game.enemies.splice(index, 1);
    };
    render() {
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
    constructor(xPos = width / 2, yPos = height / 2, size = unitSize, health = 100000, fillColor = white, velo = baseSpeed, direction = -0.1, turningIncrement = 0.07) {
        super(xPos, yPos, size, health, fillColor, velo, direction, turningIncrement);
        this.history = [{ x: xPos, y: yPos }];
    };
    move() {
        let dx = this.speed * Math.cos(this.angle);
        let dy = this.speed * Math.sin(this.angle);
        if (this.y + dy < this.radius || this.y + dy > canvas.height - this.radius) {
            this.angle *= -1;
            dy = this.speed * Math.sin(this.angle);
            if (!game.audioMuted) {
                bounceWall();
            };
        } else if (this.x + dx < this.radius || this.x + dx > canvas.width - this.radius) {
            this.angle = Math.PI - this.angle;
            dx = this.speed * Math.cos(this.angle);
            if (!game.audioMuted) {
                bounceWall();
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
    drawTrail() { // TODO: remove
        context.fillStyle = yellow;
        this.history.forEach((h) => {
            context.fillRect(h.x, h.y, 2, 2);
        });
    };
    draw() {
        let u = 0;
        let spacingFactor = 0.75 * (baseSpeed / this.speed);
        for (let i = 0; i < this.history.length; i += Math.floor((unitSize * spacingFactor))) {
            if (this.history[i] && game.snake[u]) {
                game.snake[u].drawUnit(this.history[i].x, this.history[i].y);
                u++;
            };
        };
    };
    render() {
        this.move();
        this.draw();
        // this.drawTrail();
    };
};



