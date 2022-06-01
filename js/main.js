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
const DEFAULT_TIMING = 2500; // milisecond
const LEVEL = LevelManagement.createLevel(); // static method from LevelManagement

let FPS; // GAME LOOP
let FOOD_TIMING; // FOOD DISSAPEAR AFTER 2.5 SECONDS
let BLOCK_DROPDOWN; // BLOCK DROPDOWN IN EVERY SECOND
let SPEED = 10;
let SCORE = 0;

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
        snake.x = GRID_COUNT / 2;
        snake.y = GRID_COUNT / 2;
        snake.dx = 0;
        snake.dy = 0;
        snake.tail = [];
        snake.length = 2;
        snake.draw();
    },
    draw: function() {
        ctx1.fillStyle = 'green';

        for (let i = 0; i < snake.tail.length; i++) {
            let part = snake.tail[i];
            ctx1.fillRect(part.x * GRID_COUNT, part.y * GRID_COUNT, GRID_SIZE, GRID_SIZE);
        }

        snake.tail.push(new SnakeTail(snake.x, snake.y));

        while (snake.tail.length > snake.length) snake.tail.shift();

        ctx1.fillStyle = 'purple';
        ctx1.fillRect(snake.x * GRID_COUNT, snake.y * GRID_COUNT, GRID_SIZE, GRID_SIZE);
    },
    move: function() {
        snake.x += snake.dx;
        snake.y += snake.dy;
    },
    changeDirection: function(dx, dy) {
        snake.dx = dx;
        snake.dy = dy;
        snake.move();
    },
    eat: function(food) {
        if (snake.x === food.x && snake.y === food.y) {
            snake.length++;
            SCORE++;
            return true;
        }
        return false;
    },
    checkCollision: function() {
        if (snake.dx === 0 && snake.dy === 0) {
            return false;
        }

        // wall
        if (snake.x < 0 || snake.x === GRID_COUNT || snake.y < 0 || snake.y === GRID_COUNT) return true;

        // block
        if (block.isCollision(snake.x, snake.y)) {
            return true;
        }

        for (let i = 1; i < snake.tail.length; i++) {
            let part = snake.tail[i];
            if (part.x === snake.x && part.y === snake.y) {
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
        food.x = Math.floor(Math.random() * GRID_COUNT);
        food.y = Math.floor(Math.random() * GRID_COUNT);

        /*
        * If generate food has the same coordinates as the snake's body
        * or one of the blocks => regenerate food
        */
        while (snake.tail.find(part => part.x === food.x && part.y === food.y) ||
            block.list.find(item => item.x === food.x && item.y === food.y)) {
            food.x = Math.floor(Math.random() * GRID_COUNT);
            food.y = Math.floor(Math.random() * GRID_COUNT);
        }

        food.isGenerated = true;
        food.draw();

        if (LEVEL.get(game.level).hasFoodTiming === 1) {
            if (FOOD_TIMING) {
                clearInterval(FOOD_TIMING);
            }
            FOOD_TIMING = setInterval(() => {
                ctx1.clearRect(food.x * GRID_COUNT, food.y * GRID_COUNT, GRID_SIZE, GRID_SIZE);
                food.generate();
            }, DEFAULT_TIMING);
        }
    },
    draw: function() {
        ctx1.fillStyle = 'red';
        ctx1.fillRect(food.x * GRID_COUNT, food.y * GRID_COUNT, GRID_SIZE, GRID_SIZE);
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

                while (block.list.find(item => item.x === x)) {
                    x = Math.floor(Math.random() * GRID_COUNT);
                }

                let y = -1 - i;

                block.list.push(new Block(x, y));
            }
        } else {
            for (let i = 0; i < Math.floor(LEVEL.get(game.level).blockRate * GRID_COUNT); i++) {
                let x = Math.floor(Math.random() * GRID_COUNT);
                let y = Math.floor(Math.random() * GRID_COUNT);

                /*
                * If generate block has the same coordinates as the snake's body
                * or existed block
                * or existed food => regenerate current block
                */
                while (block.list.find(item => (item.x === x && item.y === y) ||
                    snake.tail.find(part => (item.x === part.x && item.y === part.y)) ||
                    (item.x === food.x && item.y === food.y))) {
                    x = Math.floor(Math.random() * GRID_COUNT);
                    y = Math.floor(Math.random() * GRID_COUNT);
                }

                block.list.push(new Block(x, y));
            }
        }

        block.isGenerated = true;
        block.draw();
    },
    draw: function() {
        ctx1.fillStyle = 'white';

        for (let i = 0; i < block.list.length; i++) {
            let part = block.list[i];
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
        for (let i = 0; i < block.list.length; i++) {
            let part = block.list[i];
            if (part.x === x && part.y === y) return true;
        }
        return false;
    }
}

let game = {
    level: 1,
    isPause: false,
    isReset: false,
    isOver: false,
    init: function() {
        $('#level').text(game.level);
        $('#level-score').text(LEVEL.get(game.level).point);
        $('#speed').text(SPEED);

        snake.generate();
        if (!food.isGenerated) food.generate();
        if (!block.isGenerated) block.generate();
    },
    start: function() {
        game.init();
        game.update();
    },
    update: function() {
        updateScreen();
    },
    isLose: function () {
        return snake.checkCollision();
    },
    isWin: function () {
        return game.isFinishLevel() && game.level === LEVEL.size;
    },
    isFinishLevel: function() {
        return SCORE === LEVEL.get(game.level).point;
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
            ++game.level;
            ctx1.font = '30px Games';
            ctx1.fillText(`Level completed !`, WIDTH / 6.5, HEIGHT / 2);
            ctx1.font = '20px Games';
            ctx1.fillText('Press "ENTER" to continue', WIDTH / 5.5, HEIGHT / 2 + 50);
            break;
        case 'win':
            ctx1.font = '30px Games';
            ctx1.fillText('You are a winner !', WIDTH / 6.5, HEIGHT / 2);
            break;
        case 'lose':
            ctx1.font = '50px Games';
            ctx1.fillText('Game Over!', WIDTH / 6.5, HEIGHT / 2);
            ctx1.font = '20px Games';
            ctx1.fillText('Press "SPACEBAR" to restart', WIDTH / 8, HEIGHT / 2 + 50);
            break;
    }
}

function clearAllScreen() {
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
        clearTimeout(FPS);
        clearInterval(FOOD_TIMING);
        clearInterval(BLOCK_DROPDOWN);

        block.list = [];
        block.isGenerated = false;

        food.isGenerated = false;

        if (game.isWin()) {
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
        food.generate();
    } else food.draw();

    if (LEVEL.get(game.level).hasBlockDropdown === 1) {
        block.dropdown();
    } else block.draw();

    $('#score').text(SCORE);

    FPS = setTimeout(updateScreen, 1000 / SPEED);
}

function reset() {
    clearTimeout(FPS);
    clearInterval(FOOD_TIMING);
    clearInterval(BLOCK_DROPDOWN);

    clearAllScreen();

    BLOCK_DROPDOWN = null;

    inputVelocity.x = 0;
    inputVelocity.y = 0;

    SCORE = 0;

    food.isGenerated = false;

    block.list = [];
    block.isGenerated = false;

    game.level = 1;
    game.isPause = false;
    game.isReset = false;
    game.isOver = false;
}

/* ACTIONS */
let $gameArea = $('#game-area');

$(function () {
    // Default settings
    $('.level[data-level="1"]').addClass('active bg-info');
    $('#current-level').text(game.level);

    $('#current-speed').text(SPEED);
    $('#speed-input').val(SPEED);
});

$('html').keydown(function (e) {
    switch (e.which) {
        case 13: // enter => next game
            if (game.isOver) {
                return;
            }

            if (game.isFinishLevel()) {
                inputVelocity.x = 0;
                inputVelocity.y = 0;

                SCORE = 0;

                game.start();
            }
            break;
        case 27: // esc => pause
            if ($('#game-area').hasClass('d-flex')) {
                $('#pause-modal').modal('show');
            }

            if (game.isOver) return;

            game.isPause = !game.isPause;

            if (game.isPause) {
                clearInterval(FOOD_TIMING);
                clearInterval(BLOCK_DROPDOWN);

                BLOCK_DROPDOWN = null;

                ctx1.fillStyle = 'white';
                ctx1.font = '50px Games';
                ctx1.fillText('Paused', WIDTH / 3.5, HEIGHT / 2);
            } else {
                if (FOOD_TIMING) {
                    FOOD_TIMING = setInterval(food.generate, DEFAULT_TIMING);
                }

                updateScreen();
            }
            break;
        case 32: // spacebar => reset
            game.isReset = true;

            if (game.isReset) {
                reset();

                $('#level').val(1)
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

$('#btnStart').click(function () {
    $('.menu').addClass('d-none');

    $gameArea.removeClass('d-none');
    $gameArea.addClass('d-flex');

    reset();
    game.start();
});

$('#home').click(function () {
    $('#home-modal').modal('show');
});

$('#homeBtn').click(function () {
    $('#home-modal').modal('hide');
    $gameArea.removeClass('d-flex');
    $gameArea.addClass('d-none');

    $('.menu').removeClass('d-none');

    reset();
});

$('#closeTabBtn').click(function () {
    window.close();
});

$('#resume').click(function () {
    $('#pause-modal').modal('hide');
    game.isPause = false;
    updateScreen();
});

$('#level-modal .level').click(function () {
    $(this).addClass('active bg-info').siblings().removeClass('active bg-info');
});

$('#submitLevelBtn').click(function () {
    $('.menu').addClass('d-none');

    $gameArea.removeClass('d-none');
    $gameArea.addClass('d-flex');

    let level = parseInt($('.level.active').attr('data-level'));

    $('#level').val(level);
    $('#current-level').text(level);

    reset();

    game.level = level;
    game.start();
});

$('#changeSpeedBtn').click(function () {
    SPEED = parseInt($('#speed-input').val());
    $('#current-speed').text(SPEED);
    $('#speed').text(SPEED);

    $('#toast-form .toast-body').text('Speed changed to ' + SPEED);
    $('#toast-form').toast('show');

    // clearTimeout(FPS);
    // game.isPause = false;
    // updateScreen();
})
