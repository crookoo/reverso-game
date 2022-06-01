import './style.scss';

const n = 8;
const GREEN = 1;
const RED = 2;
const DELAY_BETWEEN_PLAYERS = 500;

let matrix = [];
let historyData = [];
let rememberPossibleMovesSingleField = [];
let redIsOn = true;
let blocked = false;
let pointsGreen = 2;
let pointsRed = 2;
let countRounds = 0;

let pointsGreenDiv = document.getElementById("points-green");
let pointsRedDiv = document.getElementById("points-red");

const create2dArray = (rows, columns) =>
  [...Array(rows)].map(() => Array(columns).fill(null));

function initPanel() {
  var grid = document.getElementById("grid");

  // create and init data structure
  matrix = create2dArray(n, n);
  matrix[3][3] = 2;
  matrix[3][4] = 2;
  //matrix[3][5] = 2;
  matrix[4][3] = 1;
  matrix[4][4] = 1;
  console.clear();
  console.table(matrix);

  // draw game
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      grid.appendChild(createField(i, j));
    }
  }
}

function initCockpit() {
  initPlayerStats();

  var cockpit = document.getElementById("cockpit");
  var cockpitButtons = cockpit.getElementsByTagName("button");

  var buttonPlayerToogle = cockpitButtons[0];
  buttonPlayerToogle.addEventListener("click", () => {
    togglePlayer();
  });

  var buttonGoBack = cockpitButtons[1];
  buttonGoBack.addEventListener("click", () => {
    stepBack();
  });

  var buttonResetGame = cockpitButtons[2];
  buttonResetGame.addEventListener("click", () => {
    resetPanel();
    initPlayerStats();
  });

  var buttonBotMove = cockpitButtons[3];
  buttonBotMove.addEventListener("click", () => {
    makeBotMoveAndChangePlayer();
  });

  var buttonBotGame = cockpitButtons[4];
  buttonBotGame.addEventListener("click", () => {
    resetPanel();
    initPlayerStats();
    autoGame();
  });
}

function initPlayerStats() {
  redIsOn = true;
  pointsRedDiv.classList.add("active");
  pointsGreenDiv.classList.remove("active");

  pointsGreen = 2;
  pointsRed = 2;
  updatePoints();

  countRounds = 0;
  updateCounter();
}

function resetPanel() {
  // reset model
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      matrix[i][j] = null;
    }
  }

  // init model
  matrix[3][3] = 2;
  matrix[3][4] = 2;
  matrix[4][3] = 1;
  matrix[4][4] = 1;

  console.clear();
  console.table(matrix);

  // update view
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      drawFieldReset(i, j);
    }
  }
}

function drawFieldReset(i, j) {
  let element = getElementByCoord(i, j);
  if (matrix[i][j] === GREEN) {
    element.classList.add("green");
    element.classList.remove("red");
  } else if (matrix[i][j] === RED) {
    element.classList.add("red");
    element.classList.remove("green");
  } else {
    element.classList.remove("red");
    element.classList.remove("green");
  }
}

function createField(i, j) {
  let child = document.createElement("div");
  child.id = `${i}${j}`;

  // // print i,j into fields
  // let coordString = i + "," + j;
  // let childContentDiv = document.createElement("div");
  // childContentDiv.classList.add("content");
  // let childTextNode = document.createTextNode(coordString);
  // childContentDiv.appendChild(childTextNode);
  // child.appendChild(childContentDiv);

  if (matrix[i][j] === GREEN) {
    child.classList.add("green");
  } else if (matrix[i][j] === RED) {
    child.classList.add("red");
  }

  child.addEventListener("click", () => {
    checkAndMakeMove(i, j);
  });
  return child;
}

function togglePlayer() {
  if (redIsOn) {
    redIsOn = false;
    pointsGreenDiv.classList.add("active");
    pointsRedDiv.classList.remove("active");
  } else {
    redIsOn = true;
    pointsGreenDiv.classList.remove("active");
    pointsRedDiv.classList.add("active");
  }
  countRounds++;
  updateCounter();
}

function toggleColor(element, i, j) {
  if (matrix[i][j] === RED) {
    matrix[i][j] = GREEN; // change to green
    pointsGreen++;
    pointsRed--;
    element.classList.remove("red");
    element.classList.add("green");
    historyData.push({ i: i, j: j, state: RED });
  } else if (matrix[i][j] === GREEN) {
    matrix[i][j] = RED; // change to red
    pointsGreen--;
    pointsRed++;
    element.classList.remove("green");
    element.classList.add("red");
    historyData.push({ i: i, j: j, state: GREEN });
  } else if (matrix[i][j] === null) {
    if (redIsOn) {
      matrix[i][j] = RED;
      pointsRed++;
      element.classList.add("red");
      historyData.push({ i: i, j: j, state: null });
    } else {
      matrix[i][j] = GREEN;
      pointsGreen++;
      element.classList.add("green");
      historyData.push({ i: i, j: j, state: null });
    }
  }

  updatePoints();
  console.clear();
  console.table(matrix);
}

async function checkAndMakeMove(i, j) {
  if (!blocked && matrix[i][j] === null) {
    let possibleMovesSingleField = checkForNeighbor(i, j);
    if (possibleMovesSingleField.length > 0) {
      if (possibleMovesSingleField.length === 1) {
        let chosenMove = possibleMovesSingleField[0];
        makeChosenMove(chosenMove);
        togglePlayer();
        await sleep(DELAY_BETWEEN_PLAYERS);
        makeBotMoveAndChangePlayer();
      } else {
        blocked = true;
        for (let k = 0; k < possibleMovesSingleField.length; k++) {
          let iCurrent = possibleMovesSingleField[k][1].i;
          let jCurrent = possibleMovesSingleField[k][1].j;
          let element = getElementByCoord(iCurrent, jCurrent);
          element.classList.add("marked");
        }
        rememberPossibleMovesSingleField = possibleMovesSingleField;
      }
    } else {
      console.log("No move possible here.");
    }
  } else if (blocked) {
    for (let k = 0; k < rememberPossibleMovesSingleField.length; k++) {
      if (rememberPossibleMovesSingleField[k][1].i === i && rememberPossibleMovesSingleField[k][1].j === j) {
        blocked = false;
        for (let k = 0; k < rememberPossibleMovesSingleField.length; k++) {
          let iCurrent = rememberPossibleMovesSingleField[k][1].i;
          let jCurrent = rememberPossibleMovesSingleField[k][1].j;
          let element = getElementByCoord(iCurrent, jCurrent);
          element.classList.remove("marked");
        }
        let chosenMove = rememberPossibleMovesSingleField[k];
        makeChosenMove(chosenMove);
        togglePlayer();
        await sleep(DELAY_BETWEEN_PLAYERS);
        makeBotMoveAndChangePlayer();
      }
    }
  } else {
    console.log("This field is already occupied.");
  }
}

async function makeBotMoveAndChangePlayer() {
  let possibleMoves = getPossibleMoves();

  if (possibleMoves.length > 0) {
    // sort possible moves: longest paths are at the end of the array
    possibleMoves.sort();

    // collect the longest possible moves in an array
    let longestPossibleMoves = [];
    let k = 1;
    while (possibleMoves.length >= k && possibleMoves[possibleMoves.length - k].length === possibleMoves[possibleMoves.length - 1].length) {
      longestPossibleMoves.push(possibleMoves[possibleMoves.length - k]);
      k++;
    }

    // randomly choose one of the longest paths
    let chosenMove = longestPossibleMoves[Math.floor(Math.random() * longestPossibleMoves.length)];
    makeChosenMove(chosenMove);
  } else {
    console.log("No moves possible");
  }
  togglePlayer();
  await sleep(DELAY_BETWEEN_PLAYERS);
}

// make move: toggle fields along path
function makeChosenMove(chosenMove) {
  for (let k = 0; k < chosenMove.length; k++) {
    let iCurrent = chosenMove[k].i;
    let jCurrent = chosenMove[k].j;
    let element = getElementByCoord(iCurrent, jCurrent);
    toggleColor(element, iCurrent, jCurrent);
  }
}

async function autoGame() {
  for (let k = 0; k < 60; k++) {
    makeBotMoveAndChangePlayer();
    await sleep(100);
  }
}

// check for neighbor field with opponent color
function checkForNeighbor(i, j) {
  let moveCollections = []; // this is where all possible moves from field i,j are stored
  let neighborCoords = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1]
  ];

  let opponentColor = RED;
  let selfColor = GREEN;
  if (redIsOn) {
    opponentColor = GREEN;
    selfColor = RED;
  }

  for (let k = 0; k < neighborCoords.length; k++) {
    let neighborRow = i + neighborCoords[k][0];
    let neighborColumn = j + neighborCoords[k][1];
    let allowedMove = [];

    // check if neighbor coordinates are within the grid AND if field has opponent color
    if (
      0 <= neighborRow &&
      neighborRow <= n - 1 &&
      0 <= neighborColumn &&
      neighborColumn <= n - 1 &&
      matrix[neighborRow][neighborColumn] === opponentColor
    ) {
      allowedMove = checkIfMoveAllowed(
        i,
        j,
        neighborRow,
        neighborColumn,
        neighborCoords[k][0],
        neighborCoords[k][1],
        selfColor,
        opponentColor
      );
      // evaluates to false if allowedMove is null
      if (allowedMove) moveCollections.push(allowedMove);
    }
  }
  return moveCollections;
}

// check along direction of neighbor if and when own color occurs
function checkIfMoveAllowed(
  i,
  j,
  neighborRow,
  neighborColumn,
  iSign,
  jSign,
  selfColor,
  opponentColor
) {
  // fill moveCollection initially with own field and found opponent neighbor field
  var moveCollection = [
    { i: i, j: j },
    { i: neighborRow, j: neighborColumn }
  ];
  // muliplier checkCount starts with 2 because neighbor was already found
  let checkCount = 2;
  let nextRowToCheck = calculateNextCoord(i, iSign, checkCount);
  let nextColToCheck = calculateNextCoord(j, jSign, checkCount);

  while (
    0 <= nextRowToCheck &&
    nextRowToCheck <= n - 1 &&
    0 <= nextColToCheck &&
    nextColToCheck <= n - 1
  ) {
    if (matrix[nextRowToCheck][nextColToCheck] === selfColor) {
      return moveCollection; // return moveCollection because own color was found
    } else if (matrix[nextRowToCheck][nextColToCheck] === opponentColor) {
      moveCollection.push({ i: nextRowToCheck, j: nextColToCheck }); // remember + keep checking
    } else if (matrix[nextRowToCheck][nextColToCheck] === null) {
      break; // because no selfColor before, otherwise it would have gone to break/return before
    }
    checkCount++;
    nextRowToCheck = calculateNextCoord(i, iSign, checkCount);
    nextColToCheck = calculateNextCoord(j, jSign, checkCount);
  }
  return null;
}

function getPossibleMoves() {
  let possibleMoves = [];
  // iterate over game board
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      // if field is empty
      if (matrix[i][j] === null) {
        // check for possible moves on field
        // checkForNeighbor returns an array of arrays with coordinate objects of of allowed move
        var possibleMovesSingleField = checkForNeighbor(i, j);
        // if move was found -> put into array of possible moves
        if (possibleMovesSingleField.length > 0) {
          for (let k = 0; k < possibleMovesSingleField.length; k++) {
            possibleMoves.push(possibleMovesSingleField[k]);
          }
        }
      }
    }
  }
  return possibleMoves;
}

// one step back in game history
function stepBack() {
  if (historyData.length) {
    let lastStep = historyData.pop();
    let i = lastStep.i;
    let j = lastStep.j;
    let lastState = lastStep.state;
    let currentState = matrix[i][j];

    matrix[i][j] = lastState;
    console.clear();
    console.table(matrix);

    let lastElementId = `${i}${j}`;
    let lastElement = document.getElementById(lastElementId);

    if (lastState === null) {
      if (currentState === GREEN) {
        lastElement.classList.remove("green");
        pointsGreen--;
      } else if (currentState === RED) {
        lastElement.classList.remove("red");
        pointsRed--;
      }
    } else if (lastState === GREEN) {
      lastElement.classList.remove("red");
      lastElement.classList.add("green");
      pointsRed--;
      pointsGreen++;
    } else if (lastState === RED) {
      lastElement.classList.remove("green");
      lastElement.classList.add("red");
      pointsGreen--;
      pointsRed++;
    }
    updatePoints();
  } else {
    console.log("No history data to go back to.");
  }
}

// start game board for the first time
initPanel();
initCockpit();

/* Helper methods */

function updateCounter() {
  let countRoundsDiv = document.getElementById("count-rounds");
  countRoundsDiv.innerHTML = countRounds;
}

function updatePoints() {
  pointsGreenDiv.innerHTML = pointsGreen;
  pointsRedDiv.innerHTML = pointsRed;
}

function getElementByCoord(i, j) {
  let elementId = `${i}${j}`;
  return document.getElementById(elementId);
}

function calculateNextCoord(startCoord, sign, multiplier) {
  return startCoord + sign * multiplier;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
