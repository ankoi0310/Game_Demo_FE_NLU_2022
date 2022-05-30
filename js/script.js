import {LevelManagement} from './level.js';
import {SnakeTail} from "./snakeTail.js";
import {Block} from "./block.js";

//////////////////////////////////////////////////////////////

const layer1 = $('canvas#layer-1')[0];
const layer2 = $('canvas#layer-2')[0];
const ctx1 = layer1.getContext('2d');
const ctx2 = layer2.getContext('2d');
const WIDTH = layer1.width;
const HEIGHT = layer1.height;
const GRID_COUNT = 20; // DEFAULT, create a grid with 20x20 blocks
const GRID_SIZE = WIDTH / GRID_COUNT - 2; // 2px border around the canvas
const SPEED = 10;
const DEFAULT_TIMING = 2500; // milisecond
const LEVEL = LevelManagement.createLevel(); // static method from LevelManagement

let FPS; // GAME LOOP
let FOOD_TIMING; // FOOD DISSAPEAR AFTER 5 SECONDS
let BLOCK_DROPDOWN; // BLOCK DROPDOWN IN EVERY SECOND

let inputVelocity = { x: 0, y: 0, }; // velocity from keyboard, change when keydown, default is 0

//////////////////////////////////////////////////////////////

// Define a snake
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
        ctx1.fillStyle = 'green';

        for (let i = 0; i < this.tail.length; i++) {
            let part = this.tail[i];
            ctx1.fillRect(part.x * GRID_COUNT, part.y * GRID_COUNT, GRID_SIZE, GRID_SIZE);
        }

        this.tail.push(new SnakeTail(this.x, this.y));

        while (this.tail.length > this.length) this.tail.shift();

        ctx1.fillStyle = 'purple';
        ctx1.fillRect(this.x * GRID_COUNT, this.y * GRID_COUNT, GRID_SIZE, GRID_SIZE);
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
            score.value++;
            return true;
        }
        return false;
    },
    checkCollision: function() {
        if (snake.dx === 0 && snake.dy === 0) {
            return false;
        }

        // wall
        if (this.x < 0 || this.x === GRID_COUNT || this.y < 0 || this.y === GRID_COUNT) return true;

        // block
        if (block.isCollision(this.x, this.y)) {
            return true;
        }

        for (let i = 1; i < this.tail.length; i++) {
            let part = this.tail[i];
            if (part.x === this.x && part.y === this.y) {
                return true;
            }
        }

        return false;
    }
}

// Define a food
let food = {
    x: 0,
    y: 0,
    isGenerated: false,
    generate: function() {
        this.x = Math.floor(Math.random() * GRID_COUNT);
        this.y = Math.floor(Math.random() * GRID_COUNT);

        /*
        * If generate food has the same coordinates as the snake's body
        * or one of the blocks => regenerate food
        */
        while (snake.tail.find(part => part.x === this.x && part.y === this.y) ||
            block.list.find(item => item.x === this.x && item.y === this.y)) {
            this.x = Math.floor(Math.random() * GRID_COUNT);
            this.y = Math.floor(Math.random() * GRID_COUNT);
        }

        this.isGenerated = true;
        this.draw();

        if (LEVEL.get(game.level).hasFoodTiming === 1) {
            if (FOOD_TIMING) clearInterval(FOOD_TIMING);
            FOOD_TIMING = setInterval(() => {
                if (!snake.eat(this)) {
                    ctx1.clearRect(this.x * GRID_COUNT, this.y * GRID_COUNT, GRID_SIZE, GRID_SIZE);
                    this.generate();
                }
            }, DEFAULT_TIMING);
        }
    },
    draw: function() {
        ctx1.fillStyle = 'red';
        ctx1.fillRect(this.x * GRID_COUNT, this.y * GRID_COUNT, GRID_SIZE, GRID_SIZE);
    }
}

// Define a block
let block = {
    dx: 0,
    dy: 0,
    list: [],
    isGenerated: false,
    generate: function() {
        if (LEVEL.get(game.level).hasBlockDropdown === 1) {
            for (let i = 0; i < Math.floor(LEVEL.get(game.level).blockRate * GRID_COUNT); i++) {
                let x = Math.floor(Math.random() * GRID_COUNT);

                while (this.list.find(item => item.x === x)) {
                    x = Math.floor(Math.random() * GRID_COUNT);
                }

                let y = -1 - i;

                this.list.push(new Block(x, y));
            }
            return;
        }
        if (this.list.length === 0) {
            for (let i = 0; i < Math.floor(LEVEL.get(game.level).blockRate * GRID_COUNT); i++) {
                let x = Math.floor(Math.random() * GRID_COUNT);
                let y = Math.floor(Math.random() * GRID_COUNT);

                /*
                * If generate block has the same coordinates as the snake's body
                * or existed block
                * or existed food => regenerate current block
                */
                while (this.list.find(item => (item.x === x && item.y === y) ||
                    snake.tail.find(part => (item.x === part.x && item.y === part.y)) ||
                    (item.x === food.x && item.y === food.y))) {
                    x = Math.floor(Math.random() * GRID_COUNT);
                    y = Math.floor(Math.random() * GRID_COUNT);
                }

                this.list.push(new Block(x, y));
            }
            this.isGenerated = true;
        }

        this.draw();
    },
    draw: function() {
        ctx1.fillStyle = 'white';

        for (let i = 0; i < this.list.length; i++) {
            let part = this.list[i];
            ctx1.fillRect(part.x * GRID_COUNT, part.y * GRID_COUNT, GRID_SIZE, GRID_SIZE);
        }
    },
    dropdown: function() {
        if (BLOCK_DROPDOWN) return;

        BLOCK_DROPDOWN = setInterval(function () {
            ctx2.fillStyle = 'white';
            for (let i = 0; i < block.list.length; i++) {
                let part = block.list[i];

                ctx2.clearRect(part.x * GRID_COUNT, part.y * GRID_COUNT, GRID_SIZE, GRID_SIZE);

                part.y = part.y === GRID_COUNT ? 1 : part.y + 1;

                ctx2.fillRect(part.x * GRID_COUNT, part.y * GRID_COUNT, GRID_SIZE, GRID_SIZE);

                block.list[i] = part;
            }
        }, 1000);
    },
    isCollision: function(x, y) {
        for (let i = 0; i < this.list.length; i++) {
            let part = this.list[i];
            if (part.x === x && part.y === y) return true;
        }
        return false;
    }
}

// define score
let score = {
    value: 0,
    draw: function() {
        ctx1.fillStyle = 'white';
        ctx1.font = '10px Arial';
        ctx1.fillText('Score: ' + this.value, WIDTH - 70, 20);
    }
}

let game = {
    level: 1,
    isPause: false,
    isReset: false,
    isOver: false,
    init: function() {
        snake.generate();
        if (!food.isGenerated) food.generate();
        if (block.list.length === 0) block.generate();
    },
    start: function() {
        this.init();
        this.update();
    },
    update: function() {
        updateScreen();
    },
    isLose: function () {
        return snake.checkCollision();
    },
    isWin: function () {
        return this.isFinishLevel() && this.level === LEVEL.size;
    },
    isFinishLevel: function() {
        return score.value === LEVEL.get(this.level).point;
    }
}

/* FUNCTIONS */
function showResult(resultType) {
    // ctx1.fillStyle = 'white';

    let gradient = ctx1.createLinearGradient(0, 0, WIDTH, 0);
    gradient.addColorStop(0, "magenta");
    gradient.addColorStop(0.5, "blue");
    gradient.addColorStop(1.0, "red");

    ctx1.fillStyle = gradient;

    switch (resultType) {
        case 'level-complete':
            ctx1.font = '20px Verdana';
            ctx1.fillText(`Level ${++game.level}`, WIDTH / 2.3, HEIGHT / 2);
            ctx1.font = '20px Verdana';
            ctx1.fillText('Press "ENTER" to continue', WIDTH / 5.5, HEIGHT / 2 + 50);
            break;
        case 'win':
            ctx1.font = '30px Verdana';
            ctx1.fillText('You are a winner !', WIDTH / 6.5, HEIGHT / 2);
            break;
        case 'lose':
            ctx1.font = '50px Verdana';
            ctx1.fillText('Game Over!', WIDTH / 6.5, HEIGHT / 2);
            ctx1.font = '20px Verdana';
            ctx1.fillText('Press "SPACEBAR" to restart', WIDTH / 5.5, HEIGHT / 2 + 50);
            break;
    }
}

function clearAll() {
    clearSnakeScreen();
    // clearFoodScreen();
    clearBlockScreen();
}

function clearSnakeScreen() {
    ctx1.fillStyle = 'black';
    ctx1.fillRect(0, 0, WIDTH, HEIGHT);
}

function clearBlockScreen() {
    ctx2.clearRect(0, 0, WIDTH, HEIGHT);
}

function updateScreen() {
    if (game.isPause || game.isReset) return;

    snake.changeDirection(inputVelocity.x, inputVelocity.y);

    if (game.isFinishLevel()) {
        clearInterval(FOOD_TIMING);

        block.list = [];
        block.isGenerated = false;

        food.isGenerated = false;

        if (game.isWin()) {
            clearInterval(FOOD_TIMING);
            clearInterval(BLOCK_DROPDOWN);

            showResult('win');
            return;
        }

        showResult('level-complete');
        return;
    }

    if (game.isLose()) {
        clearInterval(FOOD_TIMING);
        clearInterval(BLOCK_DROPDOWN);

        game.isOver = true;

        showResult('lose');
        return;
    }

    clearSnakeScreen();

    snake.draw();

    if (snake.eat(food)) {
        clearInterval(FOOD_TIMING);
        food.generate();
    } else food.draw();

    if (LEVEL.get(game.level).hasBlockDropdown === 1) block.dropdown(); else block.draw();

    score.draw();

    FPS = setTimeout(updateScreen, 1000 / SPEED);
}

/* ACTIONS */
$(function () {
    $('html').keydown(function (e) {
        switch (e.which) {
            case 13: // enter => next game
                if (game.isOver) {
                    return;
                }

                if (game.isFinishLevel()) {
                    clearTimeout(FPS);

                    inputVelocity.x = 0;
                    inputVelocity.y = 0;

                    score.value = 0;

                    game.start();
                }
                break;
            case 27: // esc => pause
                if (game.isOver) return;

                game.isPause = !game.isPause;

                if (game.isPause) {
                    ctx1.fillStyle = 'white';
                    ctx1.font = '50px Verdana';
                    ctx1.fillText('Paused', WIDTH / 3.5, HEIGHT / 2);
                } else {
                    updateScreen();
                }
                break;
            case 32: // spacebar => reset
                game.isReset = true;

                if (game.isReset) {
                    clearTimeout(FPS);
                    clearInterval(FOOD_TIMING);
                    clearInterval(BLOCK_DROPDOWN);

                    clearAll();

                    inputVelocity.x = 0;
                    inputVelocity.y = 0;

                    score.value = 0;

                    food.isGenerated = false;

                    block.list = [];
                    block.isGenerated = false;

                    game.level = 1;
                    game.isPause = false;
                    game.isReset = false;
                    game.isOver = false;
                    game.start();
                }
                break;
            case 37: case 65:
                if (inputVelocity.x === 1 || game.isPause) break;
                inputVelocity.x = -1;
                inputVelocity.y = 0;
                break;
            case 38: case 87:
                if (inputVelocity.y === 1 || game.isPause) break;
                inputVelocity.x = 0;
                inputVelocity.y = -1;
                break;
            case 39: case 68:
                if (inputVelocity.x === -1 || game.isPause) break;
                inputVelocity.x = 1;
                inputVelocity.y = 0;
                break;
            case 40: case 83:
                if (inputVelocity.y === -1 || game.isPause) break;
                inputVelocity.x = 0;
                inputVelocity.y = 1;
                break;
        }
    });
})

game.start();
