// constants setup
const canvasWidth = 1000;
const canvasHeight = 700;

const gameWidth = 100;
const gameHeight = 70;

let cellWidth;
let cellHeight;

// colors
let backgroundColor = 0;
const gridColor = 240;
const borderColor = 40;

let socketHandler;

// game variables
let myID;
let myName;
let mySnake;
let snakes = [];

// dom handles
let nameInput;
let startButton;
let nameInputSection;
// let highScore = 0;

function setup() {
  // canvas setup
  let canvasHolder = document.getElementById("sketch-holder");
  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(canvasHolder);

  nameInput = select("#name-input");
  startButton = select("#start-button");
  nameInputSection = document.getElementById("hide-input-section");

  startButton.mousePressed(() => {
    let nameValue = nameInput.value();

    if (nameValue === "") {
      alert("Please enter a name");
      return;
    }
    socketHandler.sendStart(nameValue, nameInputSection);
  });

  // cell size setup
  cellWidth = canvasWidth / gameWidth;
  cellHeight = canvasHeight / gameHeight;

  // additional color setup
  backgroundColor = color(255, 0, 100);

  myID = generateUUID();
  socketHandler = new SocketHandler("ws://localhost:42069/ws", myID);
}

function draw() {
  background(backgroundColor);
  drawGrid();
  checkKey();
  drawSnakes();
  drawMySnake();
  drawScore();
}

drawGrid = () => {
  stroke(borderColor);
  strokeWeight(0.25);
  fill(gridColor);

  for (let i = 0; i < gameWidth; i++) {
    for (let j = 0; j < gameHeight; j++) {
      rect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
    }
  }
};

function checkKey() {
  keyPressed = undefined;
  if (keyIsDown(RIGHT_ARROW)) {
    keyPressed = 2;
  }
  if (keyIsDown(LEFT_ARROW)) {
    keyPressed = 4;
  }
  if (keyIsDown(UP_ARROW)) {
    keyPressed = 1;
  }
  if (keyIsDown(DOWN_ARROW)) {
    keyPressed = 3;
  }

  if (keyPressed !== undefined) {
    socketHandler.sendDirection(keyPressed);
  }
}

function getSnakes(mSnake, allSnakes) {
  mySnake = mSnake;
  snakes = allSnakes;
}

function drawSnakes() {
  if (snakes.length === 0) {
    return;
  }

  snakes.forEach((snake) => {
    fill(255, 0, 0);
    snake.tail.forEach((cell) => {
      rect(cell.x * cellWidth, cell.y * cellHeight, cellWidth, cellHeight);
    });

    let head = snake.tail[0];

    fill(0);
    rect(head.x * cellWidth, head.y * cellHeight, cellWidth, cellHeight);

    // display snakes name
    textStyle(NORMAL);

    // size of underlay for readability
    let textW = textWidth(snake.name);
    let textH = textAscent() + textDescent();

    let rectX = head.x * cellWidth + cellWidth / 2 - textW / 2;
    let rectY = head.y * cellHeight - textH / 2;

    fill(100, 100, 100, 200);
    rect(rectX, rectY - textH / 2 - 5, textW, textH);

    fill(255);
    textSize(12.5);
    textAlign(CENTER, CENTER);
    text(
      snake.name,
      head.x * cellWidth + cellWidth / 2,
      head.y * cellHeight - cellHeight - 5,
    );
  });
}

function drawScore() {
  fill(0);
  textSize(20);
  textAlign(LEFT, TOP);
  // text("Highscore: " + highScore, 10, 30);
  if (mySnake === null || mySnake === undefined) {
    text("Score: 0", 10, 10);
    return;
  }
  text("Score: " + mySnake.score, 10, 10);
}

function drawMySnake() {
  if (mySnake === null || mySnake === undefined) {
    return;
  }

  fill(0, 255, 0);
  mySnake.tail.forEach((cell) => {
    rect(cell.x * cellWidth, cell.y * cellHeight, cellWidth, cellHeight);
  });

  fill(0);
  rect(
    mySnake.tail[0].x * cellWidth,
    mySnake.tail[0].y * cellHeight,
    cellWidth,
    cellHeight,
  );
}
