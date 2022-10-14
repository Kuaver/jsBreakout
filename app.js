// Initializing canvas objects
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Size of the canvas
canvas.width = 480;
canvas.height = 960;

// Parameters for the ball
const ballRadius = 10;
const ballBaseX = canvas.width / 2;
const ballBaseY = canvas.height - 30 - 5;
let x = ballBaseX;
let y = ballBaseY;
let xLeftEdge = x - 10;
let xRightEdge = x + 10;
let yTopEdge = y - 10;
let yBotEdge = y + 10;
let dx = 2;
let dy = -2;
let ballColor = "#0095dd";

// Parameters for the paddle
const paddleHeight = 10;
const paddleWidth = 75;
const paddleSpeed = 3;
const paddleBottomOffset = -10;
let paddleX = (canvas.width - paddleWidth) / 2;
const paddleY = canvas.height - paddleHeight + paddleBottomOffset;
let paddleColor = "#0095dd";

// Parameters for the bricks
const brickRowCount = 5;
const brickColumnCount = 10;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 4;
const brickWidth =
    canvas.height / brickColumnCount -
    (brickPadding * brickColumnCount - 1) / brickColumnCount;
let brickColor = "#0095dd";

const bricks = [];
for (let column = 0; column < brickColumnCount; column++) {
    bricks[column] = [];
    for (let row = 0; row < brickRowCount; row++) {
        bricks[column][row] = { x: 0, y: 0, status: 1 };
    }
}

// Scorekeeping
let score = 0;
let scoreColor = "#0095dd";

// Lives
let lives = 3;
let livesColor = "#0095dd";

// Framerate
const frameRate = 90;
const timeInterval = (100 / frameRate) * 10;

// Variables for player input
let rightPressed = false;
let leftPressed = false;

// Taking user input
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

// Function for drawing the ball on the canvas
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = ballColor;
    ctx.fill();
    ctx.closePath();
}

// Function for drawing the paddle on the canvas
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, paddleY, paddleWidth, paddleHeight);
    ctx.fillStyle = paddleColor;
    ctx.fill();
    ctx.closePath();
}

// Function for drawing the bricks on the canvas
function drawBricks() {
    for (let column = 0; column < brickColumnCount; column++) {
        for (let row = 0; row < brickRowCount; row++) {
            if (bricks[column][row].status === 1) {
                const brickX =
                    column * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY =
                    row * (brickHeight + brickPadding) + brickOffsetTop;

                bricks[column][row].x = brickX;
                bricks[column][row].y = brickY;

                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = brickColor;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// Function for managing the state and positions inside of the canvas
function draw() {
    // Clearing the canvas between repeats
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Simplifying the name of the ball's edges(for ease of writing)
    xLeftEdge = x - ballRadius;
    xRightEdge = x + ballRadius;
    yTopEdge = y - ballRadius;
    yBotEdge = y + ballRadius;

    updateEdges();

    // Drawing game objects
    drawBall();
    drawPaddle();
    drawBricks();

    // Drawing game text
    drawScore();
    drawLives();

    // Handling collisions between game objects
    brickCollisionDetection();
    paddleCollisionDetection();

    // Making the ball bounce on the edges of the canvas
    edgeCollisionDetection();

    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        lives--;
        if (!lives) {
            alert("GAME OVER");
            document.location.reload();
            // clearInterval(interval); // Needed for Chrome to end the game
        } else {
            x = ballBaseX;
            y = ballBaseY;
            dx = 2;
            dy = -2;
            // paddleX = (canvas.width - paddleWidth) / 2;
        }
    }

    if (rightPressed) {
        paddleX = Math.min(paddleX + paddleSpeed, canvas.width - paddleWidth);
    } else if (leftPressed) {
        paddleX = Math.max(paddleX - paddleSpeed, 0);
    }

    x += dx;
    y += dy;

    requestAnimationFrame(draw);
}

// Function for managing down-press actions on keypresses
function keyDownHandler(keyPressed) {
    if (keyPressed.key === "Right" || keyPressed.key === "ArrowRight") {
        rightPressed = true;
    } else if (keyPressed.key === "Left" || keyPressed.key === "ArrowLeft") {
        leftPressed = true;
    }
}

// Function for managing up-press actions on keypresses
function keyUpHandler(keyPressed) {
    if (keyPressed.key === "Right" || keyPressed.key === "ArrowRight") {
        rightPressed = false;
    } else if (keyPressed.key === "Left" || keyPressed.key === "ArrowLeft") {
        leftPressed = false;
    }
}

// Function for handling mouse movement and paddle positioning
function mouseMoveHandler(mousePosition) {
    const relativeX = mousePosition.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
    }
}

// Function for handling collision detection between the ball and the bricks.
function brickCollisionDetection() {
    for (let column = 0; column < brickColumnCount; column++) {
        for (let row = 0; row < brickRowCount; row++) {
            const brick = bricks[column][row];

            if (brick.status === 1) {
                if (
                    xLeftEdge <= brick.x + brickWidth &&
                    xRightEdge >= brick.x &&
                    yTopEdge <= brick.y + brickHeight &&
                    yBotEdge >= brick.y
                ) {
                    if (
                        xLeftEdge < brick.x + brickWidth &&
                        xRightEdge > brick.x
                    ) {
                        dy = -dy;
                    } else if (
                        yTopEdge < brick.y + brickHeight &&
                        yBotEdge > brick.y
                    ) {
                        dx = -dx;
                    }

                    brick.status = 0;
                    score++;
                    if (score === brickRowCount * brickColumnCount) {
                        alert("You win, congratulations!");
                        document.location.reload();
                        // clearInterval(interval); // Needed for Chrome to end the game
                    }
                }
            }
        }
    }
}

// Function for handling collision detection between the ball and the paddle.
function paddleCollisionDetection() {
    if (
        xLeftEdge <= paddleX + paddleWidth &&
        xRightEdge >= paddleX &&
        yTopEdge <= paddleY + paddleHeight &&
        yBotEdge >= paddleY
    ) {
        if (xLeftEdge < paddleX + paddleWidth && xRightEdge > paddleX) {
            dy = -dy;
        } else if (yTopEdge < paddleY + paddleHeight && yBotEdge > paddleY) {
            dx = -dx;
        }
    }
}

// Function for handling collision between the ball and the edges of the canvas
function edgeCollisionDetection() {
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
}

// Function for drawing the score text to the canvas
function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = scoreColor;
    ctx.fillText(`Score: ${score}`, 8, 20);
}

// Function for drawing the lives text to the canvas
function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = livesColor;
    ctx.fillText(`Lives: ${lives}`, canvas.width - 65, 20);
}

function updateEdges() {
    ball.leftEdge.x = ball.x - ball.radius;
    ball.leftEdge.y = ball.y;
    ball.rightEdge.x = ball.x + ball.radius;
    ball.rightEdge.y = ball.y;
    ball.topEdge.x = ball.x;
    ball.topEdge.y = ball.y - ball.radius;
    ball.bottomEdge.x = ball.x;
    ball.bottomEdge.y = ball.y - ball.radius;

    // console.log(ball.pos.x, ball.pos.y)
}

// Running the game based on the interval generated from the entered framerate
// const interval = setInterval(draw, timeInterval);
draw();
