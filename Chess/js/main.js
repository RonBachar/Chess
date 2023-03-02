"use strict";

// Pieces Types
const KING_WHITE = "♔";
const QUEEN_WHITE = "♕";
const ROOK_WHITE = "♖";
const BISHOP_WHITE = "♗";
const KNIGHT_WHITE = "♘";
const PAWN_WHITE = "♙";
const KING_BLACK = "♚";
const QUEEN_BLACK = "♛";
const ROOK_BLACK = "♜";
const BISHOP_BLACK = "♝";
const KNIGHT_BLACK = "♞";
const PAWN_BLACK = "♟";

var gBoard;
var gSelectedElCell = null;
let intervalId;
let startTime;
let elapsedTime = 0;

const display = document.querySelector(".timer-display");
const startButton = document.querySelector(".start-button");
const stopButton = document.querySelector(".stop-button");
const resetButton = document.querySelector(".reset-button");

function restartGame() {
  gBoard = buildBoard();
  renderBoard(gBoard);
}

function buildBoard() {
  var board = [];
  for (var i = 0; i < 8; i++) {
    board[i] = [];
    for (var j = 0; j < 8; j++) {
      var piece = "";
      if (i === 1) piece = PAWN_BLACK;
      if (i === 6) piece = PAWN_WHITE;
      board[i][j] = piece;
    }
  }

  board[0][0] = board[0][7] = ROOK_BLACK;
  board[0][1] = board[0][6] = KNIGHT_BLACK;
  board[0][2] = board[0][5] = BISHOP_BLACK;
  board[0][3] = QUEEN_BLACK;
  board[0][4] = KING_BLACK;

  board[7][0] = board[7][7] = ROOK_WHITE;
  board[7][1] = board[7][6] = KNIGHT_WHITE;
  board[7][2] = board[7][5] = BISHOP_WHITE;
  board[7][3] = QUEEN_WHITE;
  board[7][4] = KING_WHITE;

  // TODO: build the board 8 * 8
  console.table(board);
  return board;
}

function renderBoard(board) {
  var strHtml = "";
  for (var i = 0; i < board.length; i++) {
    var row = board[i];
    strHtml += "<tr>";
    for (var j = 0; j < row.length; j++) {
      var cell = row[j];
      // figure class name
      var className = (i + j) % 2 === 0 ? "white" : "black";
      var tdId = `cell-${i}-${j}`;

      strHtml += `<td id="${tdId}" class="${className}" onclick="cellClicked(this)">
                            ${cell}
                        </td>`;
    }
    strHtml += "</tr>";
  }
  var elMat = document.querySelector(".game-board");
  elMat.innerHTML = strHtml;
}

function cellClicked(elCell) {
  // if the target is marked - move the piece!
  if (elCell.classList.contains("mark")) {
    movePiece(gSelectedElCell, elCell);
    cleanBoard();
    return;
  }

  cleanBoard();

  elCell.classList.add("selected");
  gSelectedElCell = elCell;

  // console.log('elCell.id: ', elCell.id);
  var cellCoord = getCellCoord(elCell.id);
  var piece = gBoard[cellCoord.i][cellCoord.j];

  var possibleCoords = [];
  switch (piece) {
    case ROOK_BLACK:
    case ROOK_WHITE:
      possibleCoords = getAllPossibleCoordsRook(cellCoord);
      break;
    case BISHOP_BLACK:
    case BISHOP_WHITE:
      possibleCoords = getAllPossibleCoordsBishop(cellCoord);
      break;
    case KNIGHT_BLACK:
    case KNIGHT_WHITE:
      possibleCoords = getAllPossibleCoordsKnight(cellCoord);
      break;
    case PAWN_BLACK:
    case PAWN_WHITE:
      possibleCoords = getAllPossibleCoordsPawn(
        cellCoord,
        piece === PAWN_WHITE
      );
      break;
    case KING_BLACK:
    case KING_WHITE:
      possibleCoords = getAllPossibleCoordsKing(cellCoord);
      break;
    case QUEEN_BLACK:
    case QUEEN_WHITE:
      possibleCoords = getAllPossibleCoordsQueen(cellCoord);
      break;
  }
  markCells(possibleCoords);
}

function movePiece(elFromCell, elToCell) {
  var fromCoord = getCellCoord(elFromCell.id);
  var toCoord = getCellCoord(elToCell.id);

  // update the MODEl
  var piece = gBoard[fromCoord.i][fromCoord.j];
  gBoard[fromCoord.i][fromCoord.j] = "";
  gBoard[toCoord.i][toCoord.j] = piece;
  // update the DOM
  elFromCell.innerText = "";
  elToCell.innerText = piece;
}

function markCells(coords) {
  for (var i = 0; i < coords.length; i++) {
    var coord = coords[i];
    var elCell = document.querySelector(`#cell-${coord.i}-${coord.j}`);
    elCell.classList.add("mark");
  }
}

// Gets a string such as:  'cell-2-7' and returns {i:2, j:7}
function getCellCoord(strCellId) {
  var parts = strCellId.split("-");
  var coord = { i: +parts[1], j: +parts[2] };
  return coord;
}

function cleanBoard() {
  var elTds = document.querySelectorAll(".mark, .selected");
  for (var i = 0; i < elTds.length; i++) {
    elTds[i].classList.remove("mark", "selected");
  }
}

function getSelector(coord) {
  return "#cell-" + coord.i + "-" + coord.j;
}

function isEmptyCell(coord) {
  return gBoard[coord.i][coord.j] === "";
}

function getAllPossibleCoordsPawn(pieceCoord, isWhite) {
  var res = [];

  var diff = isWhite ? -1 : 1;
  var nextCoord = { i: pieceCoord.i + diff, j: pieceCoord.j };
  if (isEmptyCell(nextCoord)) res.push(nextCoord);
  else return res;

  if ((pieceCoord.i === 1 && !isWhite) || (pieceCoord.i === 6 && isWhite)) {
    diff *= 2;
    nextCoord = { i: pieceCoord.i + diff, j: pieceCoord.j };
    if (isEmptyCell(nextCoord)) res.push(nextCoord);
  }
  return res;
}

function getAllPossibleCoordsRook(pieceCoord) {
  var res = [];
  for (var i = pieceCoord.i + 1; i < gBoard.length; i++) {
    var nextCoord = { i: i, j: pieceCoord.j };
    if (isEmptyCell(nextCoord)) res.push(nextCoord);
    else break;
  }
  for (var i = pieceCoord.i - 1; i >= 0; i--) {
    var nextCoord = { i: i, j: pieceCoord.j };
    if (isEmptyCell(nextCoord)) res.push(nextCoord);
    else break;
  }
  for (var j = pieceCoord.j - 1; j >= 0; j--) {
    var nextCoord = { i: pieceCoord.i, j: j };
    if (isEmptyCell(nextCoord)) res.push(nextCoord);
    else break;
  }
  for (var j = pieceCoord.j + 1; j < gBoard.length; j++) {
    var nextCoord = { i: pieceCoord.i, j: j };
    if (isEmptyCell(nextCoord)) res.push(nextCoord);
    else break;
  }

  return res;
}

function getAllPossibleCoordsBishop(pieceCoord) {
  var res = [];
  var i = pieceCoord.i - 1;
  for (var idx = pieceCoord.j + 1; i >= 0 && idx < 8; idx++) {
    var coord = { i: i--, j: idx };
    if (!isEmptyCell(coord)) break;
    res.push(coord);
  }
  i = pieceCoord.i - 1;
  for (var idx = pieceCoord.j - 1; i >= 0 && idx < 8; idx--) {
    var coord = { i: i--, j: idx };
    if (!isEmptyCell(coord)) break;
    res.push(coord);
  }

  i = pieceCoord.i + 1;
  for (var idx = pieceCoord.j - 1; i < 8 && idx >= 0; idx--) {
    var coord = { i: i++, j: idx };
    if (!isEmptyCell(coord)) break;
    res.push(coord);
  }

  i = pieceCoord.i + 1;
  for (var idx = pieceCoord.j + 1; i < 8 && idx < 8; idx++) {
    var coord = { i: i++, j: idx };
    if (!isEmptyCell(coord)) break;
    res.push(coord);
  }

  return res;
}

function getAllPossibleCoordsKing(cellCoord) {
  var res = [];
  // debugger
  for (var i = cellCoord.i - 1; i <= cellCoord.i + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue;
    for (var j = cellCoord.j - 1; j <= cellCoord.j + 1; j++) {
      if (j < 0 || j >= gBoard[0].length) continue;
      if (i === cellCoord.i && j === cellCoord.j) continue;
      var coord = { i: i, j: j };
      if (isEmptyCell(coord)) res.push(coord);
    }
  }
  // console.log(res)
  return res;
}

function getAllPossibleCoordsQueen(cellCoord) {
  var bishop = getAllPossibleCoordsBishop(cellCoord);
  var rook = getAllPossibleCoordsRook(cellCoord);

  var res = [...bishop, ...rook];

  return res;
}

function getAllPossibleCoordsKnight(cellCoord) {
  var i = cellCoord.i;
  var j = cellCoord.j;

  var res = [];

  if (i - 2 >= 0 && j - 1 >= 0) res.push({ i: i - 2, j: j - 1 });
  if (i - 2 >= 0 && j + 1 < 8) res.push({ i: i - 2, j: j + 1 });
  if (i + 2 < 8 && j - 1 >= 0) res.push({ i: i + 2, j: j - 1 });
  if (i + 2 < 8 && j + 1 < 8) res.push({ i: i + 2, j: j + 1 });
  // 2 steps left/right
  if (i - 1 >= 0 && j - 2 >= 0) res.push({ i: i - 1, j: j - 2 });
  if (i + 1 < 8 && j - 2 >= 0) res.push({ i: i + 1, j: j - 2 });
  if (i - 1 >= 0 && j + 2 < 8) res.push({ i: i - 1, j: j + 2 });
  if (i + 1 < 8 && j + 2 < 8) res.push({ i: i + 1, j: j + 2 });

  return res;
}

function startTimer() {
  startTime = Date.now() - elapsedTime;
  intervalId = setInterval(updateTimer, 10);
}

function stopTimer() {
  clearInterval(intervalId);
  elapsedTime = Date.now() - startTime;
}

function resetTimer() {
  clearInterval(intervalId);
  elapsedTime = 0;
  updateDisplay();
}

function updateTimer() {
  elapsedTime = Date.now() - startTime;
  updateDisplay();
}

function updateDisplay() {
  const hours = Math.floor(elapsedTime / 3600000);
  const minutes = Math.floor((elapsedTime - hours * 3600000) / 60000);
  const seconds = Math.floor(
    (elapsedTime - hours * 3600000 - minutes * 60000) / 1000
  );
  const milliseconds = elapsedTime % 1000;
  const formattedTime = `${formatNumber(hours)}:${formatNumber(
    minutes
  )}:${formatNumber(seconds)}.${formatMilliseconds(milliseconds)}`;
  display.textContent = formattedTime;
}

function formatNumber(number) {
  return number.toString().padStart(2, "0");
}

function formatMilliseconds(milliseconds) {
  return Math.floor(milliseconds / 10)
    .toString()
    .padStart(2, "0");
}

startButton.addEventListener("click", startTimer);
stopButton.addEventListener("click", stopTimer);
resetButton.addEventListener("click", resetTimer);
