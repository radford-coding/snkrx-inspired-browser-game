

class Pip {
    constructor(xPos, yPos, size, direction, fillColor, velo) {
        this.radius = size;
        this.x = xPos;
        this.y = yPos;
        this.angle = direction;
        this.color = fillColor;
        this.speed = velo;
    };
};

class Unit extends Pip {
    constructor(xPos, yPos, size, direction, fillColor, velo, unitType) {
        super(xPos, yPos, size, direction, fillColor, velo);
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