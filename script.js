const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const ROW = 20;
const COL = 10;
const SQ = 30;
const VACANT = 'BLACK';
let board = [];
for (let r = 0; r < ROW; r++) {
  board[r] = [];
  for (let c = 0; c < COL; c++) {
    board[r][c] = VACANT;
  }
}
function drawSquare(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * SQ, y * SQ, SQ, SQ);
  ctx.strokeStyle = '#111';
  ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
}
function drawBoard() {
  for (let r = 0; r < ROW; r++) {
    for (let c = 0; c < COL; c++) {
      drawSquare(c, r, board[r][c]);
    }
  }
}
const SHAPES = [
  [[1,1,1,1]],
  [[1,1,1],[1,0,0]],
  [[1,1,1],[0,0,1]],
  [[1,1],[1,1]],
  [[0,1,1],[1,1,0]],
  [[1,1,1],[0,1,0]],
  [[1,1,0],[0,1,1]]
];
const COLORS = [
  'cyan',
  'orange',
  'blue',
  'yellow',
  'green',
  'purple',
  'red'
];
function rotate(matrix) {
  const R = matrix.length;
  const C = matrix[0].length;
  const result = [];
  for (let c = 0; c < C; c++) {
    result[c] = [];
    for (let r = 0; r < R; r++) {
      result[c][r] = matrix[R - 1 - r][c];
    }
  }
  return result;
}
function randomPiece() {
  let r = Math.floor(Math.random() * SHAPES.length);
  return new Piece(SHAPES[r], COLORS[r]);
}
function Piece(shape, color) {
  this.shape = shape;
  this.color = color;
  this.activeShape = shape;
  this.x = 3;
  this.y = -2;
}
Piece.prototype.fill = function(color) {
  for (let r = 0; r < this.activeShape.length; r++) {
    for (let c = 0; c < this.activeShape[r].length; c++) {
      if (this.activeShape[r][c]) {
        drawSquare(this.x + c, this.y + r, color);
      }
    }
  }
};
Piece.prototype.draw = function() {
  this.fill(this.color);
};
Piece.prototype.unDraw = function() {
  this.fill(VACANT);
};
Piece.prototype.moveDown = function() {
  if (!this.collision(0, 1, this.activeShape)) {
    this.unDraw();
    this.y++;
    this.draw();
  } else {
    this.lock();
    p = randomPiece();
  }
};
Piece.prototype.moveLeft = function() {
  if (!this.collision(-1, 0, this.activeShape)) {
    this.unDraw();
    this.x--;
    this.draw();
  }
};
Piece.prototype.moveRight = function() {
  if (!this.collision(1, 0, this.activeShape)) {
    this.unDraw();
    this.x++;
    this.draw();
  }
};
Piece.prototype.rotate = function() {
  let next = rotate(this.activeShape);
  let kick = 0;
  if (this.collision(0, 0, next)) {
    kick = this.x < COL / 2 ? 1 : -1;
  }
  if (!this.collision(kick, 0, next)) {
    this.unDraw();
    this.x += kick;
    this.activeShape = next;
    this.draw();
  }
};
Piece.prototype.collision = function(x, y, shape) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        let newX = this.x + c + x;
        let newY = this.y + r + y;
        if (newX < 0 || newX >= COL || newY >= ROW) {
          return true;
        }
        if (newY >= 0 && board[newY][newX] !== VACANT) {
          return true;
        }
      }
    }
  }
  return false;
};
Piece.prototype.lock = function() {
  for (let r = 0; r < this.activeShape.length; r++) {
    for (let c = 0; c < this.activeShape[r].length; c++) {
      if (!this.activeShape[r][c]) continue;
      if (this.y + r < 0) {
        gameOver = true;
        alert('Game Over');
        return;
      }
      board[this.y + r][this.x + c] = this.color;
    }
  }
  for (let r = 0; r < ROW; r++) {
    let full = true;
    for (let c = 0; c < COL; c++) {
      if (board[r][c] === VACANT) {
        full = false;
        break;
      }
    }
    if (full) {
      board.splice(r, 1);
      board.unshift(new Array(COL).fill(VACANT));
      score += 10;
    }
  }
  updateScore();
  drawBoard();
};
let p = randomPiece();
let dropStart = Date.now();
let gameOver = false;
let score = 0;
const scoreElement = document.getElementById('score');
function updateScore() {
  scoreElement.innerText = 'Score: ' + score;
}
document.addEventListener('keydown', event => {
  if (event.keyCode === 37) {
    p.moveLeft();
  } else if (event.keyCode === 38) {
    p.rotate();
  } else if (event.keyCode === 39) {
    p.moveRight();
  } else if (event.keyCode === 40) {
    p.moveDown();
  }
});
drawBoard();
function drop() {
  let now = Date.now();
  let delta = now - dropStart;
  if (delta > 1000) {
    p.moveDown();
    dropStart = now;
  }
  if (!gameOver) {
    requestAnimationFrame(drop);
  }
}
drop();