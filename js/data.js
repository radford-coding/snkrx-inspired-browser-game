/*-------------- Constants -------------*/

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
    constructor(xPos, yPos, size, direction = 0, fillColor = red, velo = 3, turningIncrement = 0.05) {
        this.x = xPos;
        this.y = yPos;
        this.radius = size;
        this.angle = direction;
        this.color = fillColor;
        this.speed = velo;
        this.turn = turningIncrement;
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

class Unit extends Pip {
    constructor(xPos, yPos, size, direction, fillColor, velo, turningIncrement, unitType) {
        super(xPos, yPos, size, direction, fillColor, velo, turningIncrement);
        this.class = unitType;
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