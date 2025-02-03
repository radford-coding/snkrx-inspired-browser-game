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

const TAU = 2 * Math.PI;
const unitSize = 10;
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
        switch (type) {
            case 'Rogue':
                this.color = red;
                this.hp = 10;
                break;
            case 'Swordsman':
                this.color = yellow;
                this.hp = 30;
                break;
            case 'Ranger':
                this.color = green;
                this.hp = 20;
                break;
            case 'Wizard':
                this.color = blue;
                this.hp = 30;
                break;
            case 'Curser':
                this.color = purple;
                this.hp = 8;
                break;
            case 'Spawner':
                this.color = orange;
                this.hp = 8;
                break;
            case 'Vagrant':
                this.color = white;
                this.hp = 8;
                break;
            default:
                this.color = bg;
                console.log('invalid unit type'); //!
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
    };
    attack() {
        // periodically do stuff
    };
};

class Enemy extends Pip {
    constructor(xPos = width / 4, yPos = height / 4, size = 2 * unitSize, health = 10, fillColor = red, velo = 2, direction = 0, turningIncrement = 0.02) {
        super(xPos, yPos, size, health, fillColor, velo, direction, turningIncrement);
    };
};

class Snek extends Pip {
    constructor(xPos = width / 2, yPos = height / 2, size = unitSize, health = 100000, fillColor = white, velo = 3, direction = -0.1, turningIncrement = 0.07) {
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
        if (this.history.length > 100) {
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
        for (let i = 0; i < this.history.length; i += Math.floor((unitSize * .75))) {
            if (this.history[i] && game.snake[u]) {
                game.snake[u].drawUnit(this.history[i].x, this.history[i].y);
                u++;
            };
        };
    };
};



