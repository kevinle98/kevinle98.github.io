let grid;
let tetromino;
let completedRows = [];
let downKeyHeld = false;
let lastMoveTime = 0;
let gameIsOver = false;
let score = 0;

let totalLinesCleared = 0;
let currentLevel = 1;

let level = 1;
let linesCleared = 0;

const moveInterval = 30;
const flashingDuration = 600;
const blinkingFrequency = 200;

const tetrominoShapes = [
  {
    name: "O",
    matrix: [
      [1, 1],
      [1, 1],
    ],
    id: 1,
  },
  {
    name: "I",
    matrix: [
      [2, 2, 2, 2]
    ],
    id: 2,
  },

  {
    name: "Z",
    matrix: [
      [3, 3, 0],
      [0, 3, 3],
    ],
    id: 3,
  },
  {
    name: "S",
    matrix: [
      [0, 4, 4],
      [4, 4, 0],
    ],
    id: 4,
  },
  {
    name: "J",
    matrix: [
      [5, 0, 0],
      [5, 5, 5],
    ],
    id: 5,
  },
  {
    name: "L",
    matrix: [
      [0, 0, 6],
      [6, 6, 6],
    ],
    id: 6,
  },
  {
    name: "T",
    matrix: [
      [0, 7, 0],
      [7, 7, 7],
    ],
    id: 7,
  },
];

const colorMap = {
  0: [0, 0, 0], //Blank
  1: [250, 228, 102], // Yellow for O cell
  2: [87, 255, 252], // Teal for I shape
  3: [255, 87, 120], // Red for Z Block
  4: [134, 255, 107], // Green for S shape
  5: [101, 174, 252], // Blue for J shape
  6: [252, 157, 78], // Orange for L shape
  7: [175, 98, 252], // Purple for T shape
  // ... add more colors here
};

function getBlockColor(blockType) {
  return colorMap[blockType] || [255, 255, 255]; // Default to white
}

class TetrominoBag {
  constructor() {
    this.bag = this.shuffle(["I", "O", "T", "S", "Z", "J", "L"]);
  }

  // Fisher-Yates (aka Knuth) Shuffle
  shuffle(array) {
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  }

  getNextTetromino() {
    if (this.bag.length === 0) {
      this.bag = this.shuffle(["I", "O", "T", "S", "Z", "J", "L"]);
    }

    return this.bag.pop();
  }
}

// Usage
const tetrominoBag = new TetrominoBag();
console.log(tetrominoBag.getNextTetromino()); // Will give a random tetromino, but in a predictable pattern over 7 draws.

function setup() {
  let cnv = createCanvas(240, 480);
  cnv.parent('game-container'); // Make sure this id matches the container in your HTML
  grid = createEmptyGrid(10, 20);
  tetromino = new Tetromino();
  score = 0;
}

function draw() {
  background(20);
  if (!gameIsOver) {
    const now = millis();
    if (downKeyHeld && now - lastMoveTime > moveInterval) {
      tetromino.move(0, 1);
      lastMoveTime = now;
    }

    updateTetromino();
    checkForAndClearRows();
    drawGrid();
    drawGhostTetromino();
    drawTetromino();
    drawCompletedRows();
  } else {
    displayGameOver();
  }

  updateScore();
  positionScore();

}

function positionScore() {
  const canvasElem = document.querySelector('canvas');
  const scoreElem = document.getElementById('score');
  const scale = 1.25; // Your scale factor here

  const canvasRect = canvasElem.getBoundingClientRect();
  const scoreRect = scoreElem.getBoundingClientRect();

  // Compute the top position so that it's above the scaled canvas
  const topPosition = (canvasRect.top / scale) - scoreRect.height;

  // You can align the score to the center, left, or right as you prefer
  const leftPosition = canvasRect.left;

  // Update the score's position
  scoreElem.style.top = `${topPosition}px`;
  scoreElem.style.left = `${leftPosition}px`;
}


function updateScore() {
  document.getElementById("score").innerText = "Score: " + score;
  document.getElementById("level").innerText = "Level: " + level; // Assume you have an HTML element with id 'level'
}

function drawTetromino() {
  for (let y = 0; y < tetromino.shape.length; y++) {
    for (let x = 0; x < tetromino.shape[y].length; x++) {
      if (tetromino.shape[y][x]) {
        const color = getBlockColor(tetromino.shape[y][x]);
        fill(color[0], color[1], color[2]);
        rect((tetromino.x + x) * 24, (tetromino.y + y) * 24, 24, 24);
      }
    }
  }
}

function updateTetromino() {
  let framesPerDrop = Math.max(30 - level, 5);

  if (frameCount % framesPerDrop === 0) {
    if (!tetromino.move(0, 1)) {
      tetromino.addToGrid();
      tetromino = new Tetromino();

      if (!checkCollision(tetromino.x, tetromino.y, tetromino.shape)) {
        endGame();
        //return;
      }
    }
  }
}

function drawGhostTetromino() {
  push();  // Save the current drawing style
  fill(80);  // Use a gray color for the ghost tetromino
  for (let y = 0; y < tetromino.shape.length; y++) {
    for (let x = 0; x < tetromino.shape[y].length; x++) {
      if (tetromino.shape[y][x]) {
        rect((tetromino.x + x) * 24, (tetromino.ghostY + y) * 24, 24, 24);
      }
    }
  }
  pop();  // Restore the saved drawing style
}

function checkForAndClearRows() {
  let foundCompletedRow = false;

  for (let y = grid.length - 1; y >= 0; y--) {
    if (
      grid[y].every((cell) => cell !== 0) &&
      !completedRows.some((rowObj) => rowObj.index === y)
    ) {
      completedRows.push({ index: y, flashingStart: millis(), cleared: false });
      foundCompletedRow = true;
    }
  }

  if (foundCompletedRow) {
    completedRows.sort((a, b) => b.index - a.index); // Sort in reverse order
  }
}

function drawCompletedRows() {
  let anyCompleted = false;

  for (let rowObj of completedRows) {
    const y = rowObj.index;
    const flashingStart = rowObj.flashingStart;
    const flashingElapsed = millis() - flashingStart;
    const completed = rowObj.completed;

    if (!completed) {
      anyCompleted = true;

      if (flashingElapsed < flashingDuration) {
        if (flashingElapsed % blinkingFrequency < blinkingFrequency / 2) {
          // Blink effect
          for (let x = 0; x < grid[y].length; x++) {
            fill(0, 0, 0);
            rect(x * 24, y * 24, 24, 24);
          }
        }
      } else {
        rowObj.completed = true; // Mark the row as completed
      }
    }
  }

  if (!anyCompleted && completedRows.length > 0) {
    clearCompletedRows();
  }
}

function clearCompletedRows() {
  let numRowsCleared = completedRows.length; // Get the number of cleared rows

  if (numRowsCleared > 0) {

    linesCleared += numRowsCleared;
    level = Math.min(1 + Math.floor(linesCleared / 15), 15);

    // Update score based on number of rows cleared
    switch (numRowsCleared) {
      case 1:
        score += 100;
        break;
      case 2:
        score += 300;
        break;
      case 3:
        score += 500;
        break;
      case 4:
        score += 800;
        break;
      default:
        // Additional logic for more rows, if ever applicable
        break;
    }
  }

  // Get the indexes of the rows to keep
  let rowsToKeep = grid.map((_, index) => {
    return completedRows.every((rowObj) => rowObj.index !== index);
  });

  // Filter out the completed rows
  let newGrid = grid.filter((row, index) => rowsToKeep[index]);

  // Add new rows at the top to maintain the grid's size
  while (newGrid.length < 20) {
    newGrid.unshift(new Array(10).fill(0));
  }

  totalLinesCleared += numRowsCleared;
  currentLevel = Math.min(Math.floor(totalLinesCleared / 15), 15);

  grid = newGrid;
  completedRows = []; // Clear the completedRows array
}

function clearRow(row) {
  grid.splice(row, 1);
  grid.unshift(new Array(10).fill(0));
}

function keyPressed() {
  if (!gameIsOver) {
    if (keyCode === LEFT_ARROW || key === "A" || key === "a") {
      tetromino.move(-1, 0);
    } else if (keyCode === RIGHT_ARROW || key === "D" || key === "d") {
      tetromino.move(1, 0);
    } else if (keyCode === DOWN_ARROW || key === "S" || key === "s") {
      tetromino.move(0, 1);
      downKeyHeld = true; // If you have some logic related to the down key being held
    } else if (keyCode === UP_ARROW || key === "W" || key === "w") {
      tetromino.rotate(); // Assuming you have a rotate function for tetromino
    }
  }

  if (key === " ") {
    hardDrop();
  }

  if (key === "R" || key === "r") {
    restartGame(); // For restarting the game, as per your previous logic
  }
}

function keyReleased() {
  if (keyCode === DOWN_ARROW || key === "S" || key === "s") {
    downKeyHeld = false; // End the logic related to the down key being held
  }
}

function hardDrop() {
  while (tetromino.move(0, 1)) {
    // Continuously move the tetromino down
  }

  // Once it can't move down anymore, add it to the grid
  tetromino.addToGrid();
  tetromino = new Tetromino();

  // Check if the newly spawned tetromino immediately collides
  if (!checkCollision(tetromino.x, tetromino.y, tetromino.shape)) {
    endGame();
  }
}

function displayGameOver() {
  const gameOverElement = document.getElementById("game-over");
  gameOverElement.style.display = "block";
}

function restartGame() {

  const gameOverElement = document.getElementById("game-over");
  gameOverElement.style.display = "none";

  grid = createEmptyGrid(10, 20);
  tetromino = new Tetromino();
  completedRows = [];
  downKeyHeld = false;
  lastMoveTime = 0;
  score = 0;
  level = 1;
  gameIsOver = false;
}

function drawGrid() {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const blockId = grid[y][x];
      if (blockId) {
        const color = getBlockColor(blockId);
        fill(color[0], color[1], color[2]);
        rect(x * 24, y * 24, 24, 24);
      }
    }
  }
}

function createEmptyGrid(cols, rows) {
  let emptyGrid = new Array(rows);
  for (let i = 0; i < rows; i++) {
    emptyGrid[i] = new Array(cols).fill(0);
  }
  return emptyGrid;
}

class Tetromino {
  constructor() {
    this.x = 4;
    this.y = 0;

    const nextTetrominoName = tetrominoBag.getNextTetromino();
    const nextShape = tetrominoShapes.find(shape => shape.name === nextTetrominoName);

    this.shape = nextShape.matrix;

    console.log(`Generated shape: ${nextShape.name}`);
    this.ghostY = this.y; // Initialize the ghost's y-position with the current y-position
    this.calculateGhostY(); // Calculate the initial ghost position
  }

  move(xOffset, yOffset) {
    // Move the tetromino if the new position is valid
    if (checkCollision(this.x + xOffset, this.y + yOffset, this.shape)) {
      this.x += xOffset;
      this.y += yOffset;
      this.ghostY = this.calculateGhostY(); // Moved inside the if block
      return true;
    }
    return false;
  }

  rotate() {
    // Rotate the tetromino
    const newShape = [];
    for (let i = 0; i < this.shape[0].length; i++) {
      newShape.push([]);
      for (let j = this.shape.length - 1; j >= 0; j--) {
        newShape[i].push(this.shape[j][i]);
      }
    }
    if (checkCollision(this.x, this.y, newShape)) {
      this.shape = newShape;
    }

    this.ghostY = this.calculateGhostY();
  }

  calculateGhostY() {
    let ghostYOffset = 0;
    while (checkCollision(this.x, this.y + ghostYOffset + 1, this.shape)) {
      ghostYOffset++;
    }
    return this.y + ghostYOffset;
  }
  addToGrid() {
    for (let y = 0; y < this.shape.length; y++) {
      for (let x = 0; x < this.shape[y].length; x++) {
        if (this.shape[y][x]) {
          const blockId = this.shape[y][x]; // get the block id
          grid[this.y + y][this.x + x] = blockId; // set the block id to grid
        }
      }
    }
  }
}

function checkCollision(x, y, shape) {
  for (let yIndex = 0; yIndex < shape.length; yIndex++) {
    for (let xIndex = 0; xIndex < shape[yIndex].length; xIndex++) {
      if (shape[yIndex][xIndex]) {
        const newX = x + xIndex;
        const newY = y + yIndex;

        if (
          newY < 0 ||
          newX < 0 ||
          newX >= (grid[0]?.length || 0) ||
          newY >= (grid?.length || 0) ||
          (grid[newY] && grid[newY][newX])
        ) {
          return false; // Returning `false` when there's a collision
        }
      }
    }
  }
  return true; // Returning `true` when there's no collision
}

function mergeTetromino() {
  for (let y = 0; y < tetromino.shape.length; y++) {
    for (let x = 0; x < tetromino.shape[y].length; x++) {
      if (tetromino.shape[y][x]) {
        grid[tetromino.y + y][tetromino.x + x] = 1;
      }
    }
  }
}

function endGame() {
  gameIsOver = true;
  grid = createEmptyGrid(10, 20);
}