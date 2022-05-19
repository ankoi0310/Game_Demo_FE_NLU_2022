const canvas = $('canvas')[0];
const ctx = canvas.getContext('2d');
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GRID_COUNT = 20;
const GRID_SIZE = WIDTH / GRID_COUNT - 2;
const LIST_POINT_PER_LEVEL = [0, 5, 10, 15, 20, 25]
const BLOCK_RATE_PER_LEVEL = [0, 0, 0.2, 0.2, 0.3]
const LEVEL = [

]

let FPS;
let SPEED = 10;

let inputVelocity = {
    x: 0,
    y: 0,
}

class Block {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class SnakeTail {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

// define a snake
let snake = {
    x: GRID_COUNT / 2,
    y: GRID_COUNT / 2,
    dx: 0,
    dy: 0,
    tail: [],
    length: 2,
    generate: function () {
        this.x = GRID_COUNT / 2;
        this.y = GRID_COUNT / 2;
        this.dx = 0;
        this.dy = 0;
        this.tail = [];
        this.length = 2;
        this.draw();
    },
    draw: function() {
        ctx.fillStyle = 'green';
        for (let i = 0; i < this.tail.length; i++) {
            let part = this.tail[i];
            ctx.fillRect(part.x * GRID_COUNT, part.y * GRID_COUNT, GRID_SIZE, GRID_SIZE);
        }

        this.tail.push(new SnakeTail(this.x, this.y));

        while (this.tail.length > this.length) {
            this.tail.shift();
        }

        ctx.fillStyle = 'purple';
        ctx.fillRect(this.x * GRID_COUNT, this.y * GRID_COUNT, GRID_SIZE, GRID_SIZE);
    },
    move: function() {
        this.x += this.dx;
        this.y += this.dy;
    },
    changeDirection: function(dx, dy) {
        this.dx = dx;
        this.dy = dy;
        this.move();
    },
    eat: function(food) {
        if (this.x === food.x && this.y === food.y) {
            this.length++;
            score.value += food.point;
            return true;
        } else {
            return false;
        }
    },
    checkCollision: function() {
        if (snake.dx === 0 && snake.dy === 0) {
            return 'none';
        }

        if (this.x < 0 || this.x === GRID_COUNT || this.y < 0 || this.y === GRID_COUNT) {
            return 'wall';
        }

        for (let i = 0; i < this.tail.length; i++) {
            let part = this.tail[i];
            if (part.x === this.x && part.y === this.y) {
                return 'self';
            }
        }

        return 'none';
    }
}

// define a food
let food = {
    x: 0,
    y: 0,
    point: 1,
    countForExtraPoint: 0,
    generate: function() {
        this.x = Math.floor(Math.random() * GRID_COUNT);
        this.y = Math.floor(Math.random() * GRID_COUNT);
        this.draw();
    },
    draw: function() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x * GRID_COUNT, this.y * GRID_COUNT, GRID_SIZE, GRID_SIZE);
    }
}

// define a block
let block = {
    list: [],
    generate: function() {
        let x = Math.floor(Math.random() * GRID_COUNT);
        let y = Math.floor(Math.random() * GRID_COUNT);

        this.list.push(new Block(x, y));

        this.draw();
    },
    draw: function() {
        ctx.fillStyle = 'white';

        switch (game.level) {
            case 1:
                break;
            case 2:

                break;
            case 3:
                break;
            case 4:
                break;
            case 5:
                break;
        }

        for (let i = 0; i < this.list.length; i++) {
            let part = this.list[i];
            ctx.fillRect(part.x * GRID_COUNT, part.y * GRID_COUNT, GRID_SIZE, GRID_SIZE);
        }
    },
    move: function() {
    },
}

// define score
let score = {
    value: 0,
    draw: function() {
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.fillText('Score: ' + this.value, WIDTH - 70, 20);
    }
}

let game = {
    level: 1,
    isPause: false,
    isReset: false,
    init: function() {
        snake.generate();
        food.generate();
        block.generate();
    },
    start: function() {
        this.init();
        this.update();
    },
    update: function() {
        updateScreen();
    },
    isFinish: function() {
        // ctx.fillStyle = 'white';

        let gradient = ctx.createLinearGradient(0, 0, WIDTH, 0);
        gradient.addColorStop(0, "magenta");
        gradient.addColorStop(0.5, "blue");
        gradient.addColorStop(1.0, "red");

        ctx.fillStyle = gradient;

        if (score.value === LIST_POINT_PER_LEVEL[this.level]) {
            ctx.font = '20px Verdana';
            ctx.fillText(`Level ${++this.level}`, WIDTH / 2.3, HEIGHT / 2);
            ctx.font = '20px Verdana';
            ctx.fillText('Press "ENTER" to continue', WIDTH / 5.5, HEIGHT / 2 + 50);
            return true;
        }

        switch (snake.checkCollision()) {
            case 'wall':
                ctx.font = '50px Verdana';
                ctx.fillText('Game Over!', WIDTH / 6.5, HEIGHT / 2);
                ctx.font = '20px Verdana';
                ctx.fillText('Press "SPACEBAR" to restart', WIDTH / 5.5, HEIGHT / 2 + 50);
                return true;
            case 'self':
                ctx.font = '50px Verdana';
                ctx.fillText('Game Over!', WIDTH / 6.5, HEIGHT / 2);
                ctx.font = '20px Verdana';
                ctx.fillText('Press "SPACEBAR" to restart', WIDTH / 5.5, HEIGHT / 2 + 50);
                return true;
            case 'block':
                ctx.fillText('Game Over!', WIDTH / 6.5, HEIGHT / 2);
                ctx.font = '20px Verdana';
                ctx.fillText('Press "SPACEBAR" to restart', WIDTH / 5.5, HEIGHT / 2 + 50);
                return true;
            default:
                return false;
        }

    }
}

/* FUNCTIONS */
function clearScreen() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function updateScreen() {
    if (game.isPause || game.isReset) return;

    snake.changeDirection(inputVelocity.x, inputVelocity.y);

    if (game.isFinish()) return;

    clearScreen();

    food.draw();

    block.draw();

    if (snake.eat(food)) food.generate();

    snake.draw();

    score.draw();

    FPS = setTimeout(updateScreen, 1000 / SPEED);
}

/* ACTIONS */
$(function () {
    $('html').keydown(function (e) {
        switch (e.which) {
            case 13:
                game.isPause = !game.isPause;
                break;
            case 27: // pause
                game.isPause = !game.isPause;

                if (game.isPause) {
                    ctx.fillStyle = 'white';
                    ctx.font = '50px Verdana';
                    ctx.fillText('Paused', WIDTH / 3.5, HEIGHT / 2);
                } else {
                    updateScreen();
                }
                break;
            case 32: // reset
                game.isReset = true;

                if (game.isReset) {
                    clearTimeout(FPS);

                    clearScreen();

                    inputVelocity.x = 0;
                    inputVelocity.y = 0;

                    score.value = 0;

                    block.list = [];

                    game.level = 1;
                    game.isPause = false;
                    game.isReset = false;
                    game.start();
                }
                break;
            case 37: case 65:
                if (inputVelocity.x === 1) break;
                inputVelocity.x = -1;
                inputVelocity.y = 0;
                break;
            case 38: case 87:
                if (inputVelocity.y === 1) break;
                inputVelocity.x = 0;
                inputVelocity.y = -1;
                break;
            case 39: case 68:
                if (inputVelocity.x === -1) break;
                inputVelocity.x = 1;
                inputVelocity.y = 0;
                break;
            case 40: case 83:
                if (inputVelocity.y === -1) break;
                inputVelocity.x = 0;
                inputVelocity.y = 1;
                break;
        }
    });
})

game.start();
