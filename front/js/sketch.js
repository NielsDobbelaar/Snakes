// constants setup
let canvasWidth = 750;
let canvasHeight = 750;

const gameWidth = 100;
const gameHeight = 75;

let cellWidth;
let cellHeight;

// colors
let backgroundColor = 0;
const gridColor = 240;
const borderColor = 40;
let headColor = 0;

let socketHandler;

// game variables
let myID;
let myName;
let mySnake;
let snakes = [];

// dom handles
let nameInput;
let startButton;

let doDrawScore = false;

function setup() {
  // determine if the game should be displayed in full screen
  windowHeight = window.innerHeight;
  windowWidth = window.innerWidth;
  // console.log("aspect ratio", windowWidth / windowHeight);
  //
  // if (windowHeight > windowWidth) {
  //   canvasWidth = windowWidth;
  //   canvasHeight = windowWidth;
  // } else {
  //   canvasWidth = windowHeight;
  //   canvasHeight = windowHeight;
  // }

  let tileSize = window.innerHeight / 75;
  cellWidth = tileSize;
  cellHeight = tileSize;
  let canvasWidth = 100 * tileSize;

  if (canvasWidth > window.innerWidth) {
    tileSize = window.innerWidth / 100;
    canvasWidth = 100 * tileSize;
  }

  canvasHeight = gameHeight * tileSize;

  // canvas setup
  let canvasHolder = document.getElementById("sketch-holder");
  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(canvasHolder);

  // dom setup
  nameInput = select("#name-input");
  startButton = select("#start-button");
  sketchOverlay = document.getElementById("sketch-overlay");
  nameWarningP = document.getElementById("name-warning-p");

  startButton.mousePressed(() => {
    let nameValue = nameInput.value();

    if (nameValue === "") {
      nameWarningP.style.display = "block";
      return;
    }
    socketHandler.sendStart(nameValue, sketchOverlay, nameWarningP);
  });

  // cell size setup
  cellWidth = canvasWidth / gameWidth;
  cellHeight = canvasHeight / gameHeight;

  // additional color setup
  backgroundColor = color(255, 0, 100);
  headColor = color("#121212");

  myID = generateUUID();
  socketHandler = new SocketHandler(
    "ws://snakes-production.up.railway.app/ws",
    myID,
  );
  // socketHandler = new SocketHandler("ws://localhost:8080/ws", myID);
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

    fill(headColor);
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
    textAlign(LEFT, TOP);
    textAlign(CENTER, CENTER);
    text(
      snake.name,
      head.x * cellWidth + cellWidth / 2,
      head.y * cellHeight - cellHeight - 5,
    );
  });
}

function drawScore() {
  textStyle(NORMAL);
  textSize(20);
  textAlign(CENTER, CENTER);
  textAlign(LEFT, TOP);
  if (mySnake === null || mySnake === undefined) {
    return;
  }

  let tWidth = textWidth("color:  " + mySnake.score.toString());
  fill(color("rgba(0, 0, 0, 0.5)"));
  rect(0, 0, tWidth + 20, 40);

  fill(255);
  text("Score: " + mySnake.score, 10, 10);
}

function drawMySnake() {
  if (mySnake === null || mySnake === undefined) {
    return;
  }

  fill(color("#a7c957"));
  mySnake.tail.forEach((cell) => {
    rect(cell.x * cellWidth, cell.y * cellHeight, cellWidth, cellHeight);
  });

  fill(headColor);
  rect(
    mySnake.tail[0].x * cellWidth,
    mySnake.tail[0].y * cellHeight,
    cellWidth,
    cellHeight,
  );
}
