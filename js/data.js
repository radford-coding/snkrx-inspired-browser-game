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



const TAU = 2 * Math.PI;
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

const calcChaseIncrement = function(meX, meY, meAngle, targetX, targetY, inc) {
    let angBtw = Math.atan2(targetY - meY, targetX - meX);
    let diff = angBtw - meAngle;
    if (diff > Math.PI || (diff < 0 && diff > -Math.PI)) {
        return -inc;
    } else {
        return inc;
    };
};

const bounceWall = function() {
    wallBounceMP3s[wbIndex].play();
    wbIndex = (wbIndex + 1) % audioCopies;
};

const clearCanvas = function() {
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
    constructor(xPos, yPos, size, health = 10, fillColor = red, velo = 3, direction = 0, turningIncrement = 0.02) {
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


class Snek extends Pip {
    constructor(xPos = width/2, yPos = height/2, size = 10, health = 100000, fillColor = white, velo = 3, direction = 0, turningIncrement = 0.07) {
        super (xPos, yPos, size, health, fillColor, velo, direction, turningIncrement);
        this.history = [{x: xPos, y: yPos}];
    };
    move() {
        let dx = this.speed * Math.cos(this.angle);        
        let dy = this.speed * Math.sin(this.angle);
        if (this.y + dy < this.radius || this.y + dy > canvas.height - this.radius) {
            this.angle *= -1;
            dy = this.speed * Math.sin(this.angle);
            if(!audioMuted) {
                bounceWall();
            };
        } else if (this.x + dx < this.radius || this.x + dx > canvas.width - this.radius) {
            this.angle = Math.PI - this.angle;
            dx = this.speed * Math.cos(this.angle);
            if(!audioMuted) {
                bounceWall();
            };
        };
        
        this.angle = keepWithinPiOf0(this.angle);
        this.x += dx;
        this.y += dy;
    };
};



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