// Game Board
let board = [
  [null, null, null],
  [null, null, null],
  [null, null, null]
];

// Global Variables.
let crossWin = 0;
let circleWin = 0;
let roundCounter = 0;
let currentPiece = null;
let currentDragImage = null;
let pieces = {
  X: null,
  O: null
};

// Function to create drag image.
function createDragImage(type) {
  // Remove any existing drag image.
  removeDragImage();
  
  const dragImage = document.createElement('div');
  dragImage.textContent = type;
  dragImage.style.fontFamily = '"Permanent Marker", cursive';
  dragImage.style.fontSize = '7rem';
  dragImage.style.padding = '1rem';
  dragImage.style.color = type === 'X' ? 'var(--secondary-color)' : 'var(--tertiary-color)';
  dragImage.style.webkitTextStroke = '3px black';
  dragImage.style.position = 'fixed';
  dragImage.style.pointerEvents = 'none';
  dragImage.style.zIndex = '9999';
  dragImage.style.opacity = '0.7';
  dragImage.style.transform = 'translate(-50%, -50%)';
  dragImage.id = 'dragImage';
  
  document.body.appendChild(dragImage);

  // Store the image dimensions for centering.
  dragImage.centerX = dragImage.offsetWidth / 2;
  dragImage.centerY = dragImage.offsetHeight / 2;
  
  currentDragImage = dragImage;
  return dragImage;
}

// Function to remove the drag image from the DOM.
function removeDragImage() {
  if (currentDragImage && document.body.contains(currentDragImage)) {
    document.body.removeChild(currentDragImage);
    currentDragImage = null;
  }
}

// Handle mouse move during drag.
function handleMouseMove(e) {
  // Position the drag image at the mouse cursor using fixed positioning.
  if (currentDragImage) {
    currentDragImage.style.left = e.clientX + 'px';
    currentDragImage.style.top = e.clientY + 'px';
  }

  // Update cell highlighting based on mouse position.
  const cellUnderMouse = document.elementFromPoint(e.clientX, e.clientY);
  
  // Clear all cell highlights first.
  document.querySelectorAll('.cell').forEach(cell => {
    if (!board[parseInt(cell.dataset.row)][parseInt(cell.dataset.col)]) {
      cell.textContent = '';
      cell.classList.remove('highlight-cross', 'highlight-circle');
    }
  });
  
  // If mouse is over a cell, highlight it.
  if (cellUnderMouse && cellUnderMouse.classList.contains('cell')) {
    const row = parseInt(cellUnderMouse.dataset.row);
    const col = parseInt(cellUnderMouse.dataset.col);
    
    if (!board[row][col]) {
      cellUnderMouse.textContent = currentPiece;
      cellUnderMouse.classList.add(currentPiece === 'X' ? 'highlight-cross' : 'highlight-circle');
    }
  }
}

// Handle mouse up to complete drag.
function handleMouseUp(e) {
  const cellUnderMouse = document.elementFromPoint(e.clientX, e.clientY);
  const crossContainer = document.querySelector('.cross-left-card');
  const circleContainer = document.querySelector('.circle-right-card');
  
  // If dropped on a valid cell, place the piece.
  if (cellUnderMouse && cellUnderMouse.classList.contains('cell')) {
    const row = parseInt(cellUnderMouse.dataset.row);
    const col = parseInt(cellUnderMouse.dataset.col);
    
    if (!board[row][col]) {
      // Place the piece.
      cellUnderMouse.textContent = currentPiece;
      cellUnderMouse.classList.remove('highlight-cross', 'highlight-circle');
      cellUnderMouse.classList.add(currentPiece === 'X' ? 'x' : 'o');
      board[row][col] = currentPiece;
      
      // Remove a piece from the container.
      removePiece(currentPiece);
      
      // Switch turns.
      checkTurn(currentPiece === 'X');
      
      // Check for game end.
      checkGame();
    }
  }
  
  // Clean up all cell highlights.
  document.querySelectorAll('.cell').forEach(cell => {
    if (!board[parseInt(cell.dataset.row)][parseInt(cell.dataset.col)]) {
      cell.textContent = '';
      cell.classList.remove('highlight-cross', 'highlight-circle');
    }
  });
  
  // Remove drag image and clean up.
  removeDragImage();
  document.body.classList.remove('dragging');
  delete document.body.dataset.draggingPiece;
  currentPiece = null;
  
  // Remove event listeners.
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
}

// Setup piece drag events.
function setupPieceDragEvents(pieceType) {
  const elements = pieceType === 'X' ? pieces.X : pieces.O;
  const crossContainer = document.querySelector('.cross-left-card');
  const circleContainer = document.querySelector('.circle-right-card');
  
  elements.forEach(piece => {
    piece.addEventListener('mousedown', (e) => {
      e.preventDefault();
      
      // Only allow if it's this piece's turn.
      if ((pieceType === 'X' && crossContainer.classList.contains('disabled')) ||
          (pieceType === 'O' && circleContainer.classList.contains('disabled'))) {
        return;
      }
      
      // Set current piece type.
      currentPiece = pieceType;
      
      // Create drag image for ghost effect.
      const dragImage = createDragImage(pieceType);
      
      // Add dragging class to body for cursor changes.
      document.body.classList.add('dragging');
      document.body.dataset.draggingPiece = pieceType;
      
      // Setup move and up events
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    });
  });
}

// Setup game pieces.
function setupGamePieces() {
  // Get fresh references to all pieces.
  pieces = {
    X: document.querySelectorAll('.cross'),
    O: document.querySelectorAll('.circle')
  };
  
  // Set up event listeners for both piece types.
  setupPieceDragEvents('X');
  setupPieceDragEvents('O');
}

// Remove piece from container.
function removePiece(piece) {
  if (piece === 'X') {
    const crossCard = document.querySelector('.cross-left-card');
    const lastCrossPiece = crossCard.querySelector(':last-child');
    if (lastCrossPiece) {
      lastCrossPiece.remove();
    }
  } else {
    const circleCard = document.querySelector('.circle-right-card');
    const lastCirclePiece = circleCard.querySelector(':last-child');
    if (lastCirclePiece) {
      lastCirclePiece.remove();
    }
  }
}

// Check whose turn it is.
function checkTurn(value) {
  const crossTurn = value === true ? true : false;

  const crossContainer = document.querySelector('.cross-left-card');
  const circleContainer = document.querySelector('.circle-right-card');

  if (!crossTurn) {
    circleContainer.classList.add('disabled');
    crossContainer.classList.remove('disabled');
  } else {
    crossContainer.classList.add('disabled');
    circleContainer.classList.remove('disabled');
  }
}

// Check if line has a winner.
function checkLine(a, b, c) {
  if (a !== null && a === b && b === c) {
    const crossContainer = document.querySelector('.cross-left-card');
    const circleContainer = document.querySelector('.circle-right-card');
    
    crossContainer.classList.add('disabled');
    circleContainer.classList.add('disabled');
    showWinnerModal(a);
    return a;
  }
  return null;
}

// Check game state for win or tie.
function checkGame() {
  let winner;

  for (let i = 0; i < 3; i++) {
    // Check if the board has a match in each row, column, and then diagonal. Otherwise, return false.
    //
    // Check Rows.
    winner = checkLine(board[i][0], board[i][1], board[i][2]);
    if (winner) return winner;
    // Check Column.
    winner = checkLine(board[0][i], board[1][i], board[2][i]);
    if (winner) return winner;
  }

  // Check Diagonal.
  winner = checkLine(board[0][0], board[1][1], board[2][2]);
  if (winner) return winner;
  winner = checkLine(board[0][2], board[1][1], board[2][0]);
  if (winner) return winner;

  // Check for tie (board is full).
  let isBoardFull = true;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] === null) {
        isBoardFull = false;
        break;
      }
    }
    if (!isBoardFull) break;
  }
  
  if (isBoardFull) {
    // Handle tie game.
    const crossContainer = document.querySelector('.cross-left-card');
    const circleContainer = document.querySelector('.circle-right-card');
    
    crossContainer.classList.add('disabled');
    circleContainer.classList.add('disabled');
    showWinnerModal('tie');
    return 'tie';
  }

  return false;
}

// Show winner modal.
function showWinnerModal(winner) {
  const resultsModal = document.querySelector('.modal-result');
  const textModal = document.querySelector('.modal-text');
  const continueButtonModal = document.querySelector('.continue-button-modal');

  resultsModal.style.opacity = '0';
  resultsModal.showModal();
  resultsModal.classList.remove('fade-out');

  void resultsModal.offsetWidth;

  resultsModal.style.opacity = '1';
  document.body.style.overflow = 'hidden';
  resultsModal.style.display = 'grid';

  if (winner === 'X') {
    resultsModal.classList.add('win-x');
    resultsModal.style.border = 'outset var(--secondary-color) 5px';
    textModal.textContent = 'X is the Winner.';
  } else if (winner === 'O') {
    resultsModal.classList.add('win-o');
    resultsModal.style.border = 'outset var(--tertiary-color) 5px';
    textModal.textContent = 'O is the Winner.';
  } else if (winner === 'tie') {
    resultsModal.classList.add('tie');
    resultsModal.style.border = 'outset var(--main-color) 5px';
    textModal.textContent = 'Tie. No Winner.';
  }

  continueButtonModal.removeEventListener('click', handleContinueClick);
  continueButtonModal.addEventListener('click', handleContinueClick);

  // Handle continue button click.
  function handleContinueClick(e) {
    e.preventDefault();

    const resultsModal = document.querySelector('.modal-result');

    // Get the winner from the modal class.
    let winner = null;
    if (resultsModal.classList.contains('win-x')) {
      winner = 'X';
    } else if (resultsModal.classList.contains('win-o')) {
      winner = 'O';
    }

    // Remove all winner classes when closing modal.
    resultsModal.classList.remove('win-x', 'win-o', 'tie');

    // Add fade out class.
    resultsModal.classList.add('fade-out');

    // After fade out transition completes.
    resultsModal.addEventListener('transitionend', () => {
        // Hide visibility and close dialog
        resultsModal.close();
        // Reset styles and cleanup
        resultsModal.style.border = '';
        resultsModal.style.display = '';
        document.body.style.overflow = '';
    }, { once: true });
  }

  board = [
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ];
  
  document.querySelectorAll('.cell').forEach(cell =>{
    cell.textContent = '';
    cell.classList.remove('x', 'o');
  });

  const crossCard = document.querySelector('.cross-left-card');
  const crossCount = crossCard.children.length;

  const circleCard = document.querySelector('.circle-right-card');
  const circleCount = circleCard.children.length;

  for (let i = crossCount; i < 5; i++) {
    const cross = document.createElement('div');
    cross.textContent = 'X';
    cross.classList.add('cross');
    cross.setAttribute('draggable', true);
    crossCard.appendChild(cross);
  }

  for (let i = circleCount; i < 4; i++) {
    const circle = document.createElement('div');
    circle.textContent = 'O';
    circle.classList.add('circle');
    circle.setAttribute('draggable', true);
    circleCard.appendChild(circle);
  }

  // After creating new pieces.
  setupGamePieces();

  crossCard.classList.remove('disabled');
  circleCard.classList.remove('disabled');
  checkTurn(false);
  
  // Pass the correct winner value.
  if (winner) {
    scoreGame(winner);
    // Check Round.
    checkRound();
  }
}

// Update score.
function scoreGame(winner) {
  const crossScore = document.querySelector('#odometer-cross');
  const circleScore = document.querySelector('#odometer-circle');

  if (winner === 'X') {
    crossWin++;
    crossScore.textContent = crossWin;
  } else if (winner === 'O') {
    circleWin++;
    circleScore.textContent = circleWin;
  }
}

// Initialize the game when DOM is loaded.
function initGame() {
  // Initialize pieces references.
  pieces = {
    X: document.querySelectorAll('.cross'),
    O: document.querySelectorAll('.circle')
  };
  
  // Set up event listeners for both piece types.
  setupPieceDragEvents('X');
  setupPieceDragEvents('O');
  
  // Initialize game board display.
  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    
    // Update cell display based on board state.
    cell.textContent = board[row][col] || '';
  });
  
  // Start with X's turn.
  checkTurn(false);
}

function showInitModal() {
  const initGameModal = document.querySelector('.modal-init-game');
  const submitButton = document.querySelector('.submit-btn');
  
  document.body.style.overflow = 'hidden';
  initGameModal.showModal();

  submitButton.removeEventListener('click', handleSumbit);
  submitButton.addEventListener('click', handleSumbit);

  function handleSumbit(e) {
    e.preventDefault();

    player1 = document.querySelector('#player-1').value;
    player2 = document.querySelector('#player-2').value;
    maxRounds = document.querySelector('#rounds').value;

    player1Name = document.querySelector('.player-one-name');
    player1Name.textContent = player1;

    player2Name = document.querySelector('.player-two-name');
    player2Name.textContent = player2;

    maxRoundsAmount = document.querySelector('.round-max-amount');
    maxRoundsAmount.textContent = maxRounds;

    checkFontSize(player1Name);
    checkFontSize(player2Name);

    // Add fade out class.
    initGameModal.classList.add('fade-out');

    // After fade out transition completes.
    initGameModal.addEventListener('transitionend', () => {
      // Hide visibility and close dialog
      initGameModal.close();
      // Allow scrolling.
      document.body.style.overflow = '';
      initGameModal.classList.remove('fade-out');
      
      checkRound(maxRounds);
      initGame();
    }, { once: true });
  };
}

function checkFontSize(player) {
  if (player.textContent.length >= 10 && player.textContent.length < 15) {
    player.style.fontSize = '3rem';
    player.style.textShadow = player === player1Name ? '4px 4px 0 var(--secondary-color)' : '3px 3px 0 var(--tertiary-color)';
  } else if (player.textContent.length >= 15 && player.textContent.length <= 20) {
    player.style.fontSize = '2rem';
    player.style.textShadow = player === player1Name ? '3px 3px 0 var(--secondary-color)' : '3px 3px 0 var(--tertiary-color)';
  } else if (player.textContent.length > 20) {
    player.style.fontSize = '1.5rem';
    player.style.textShadow = player === player1Name ? '2px 2px 0 var(--secondary-color)' : '2px 2px 0 var(--tertiary-color)';
  }
}

function checkRound(roundAmount) {
  const roundCounterAmount = document.querySelector('#odometer-round');

  setTimeout(() => {
    roundCounter++;
    roundCounterAmount.textContent = roundCounter;
  }, 500);

  if (roundCounter > roundAmount) return announceWinner();
}

// DOM Content Loaded event handler.
document.addEventListener('DOMContentLoaded', function() {
  // Handle Header and Footer Animation.
  const waveTextElements = document.querySelectorAll('.wave-text');

  waveTextElements.forEach(waveText => {
    const spans = waveText.querySelectorAll('span');
    let animationInterval = null;
    let isAnimating = false;

    function startAnimation() {
      // Only start a new animation if we're not already animating.
      if (!isAnimating) {
        isAnimating = true;
  
        spans.forEach(span => {
          span.classList.remove('text-waving-animation');
        });
        
        // Force a reflow to ensure animations reset properly.
        void waveText.offsetWidth;
        
        // Add the animation class to start a fresh animation cycle.
        spans.forEach(span => {
          span.classList.add('text-waving-animation');
        });
        
        // Set up an interval to restart the animation cycle.
        const maxDelay = 0.1 * spans.length;
        const animationDuration = 1.2;
        const totalCycleDuration = (animationDuration + maxDelay) * 1000;
        
        // Reset the isAnimating flag when the full animation completes.
        setTimeout(() => {
          isAnimating = false;
          // If mouse is still over element, start another cycle.
          if (animationInterval) {
            startAnimation();
          }
        }, totalCycleDuration);
      }
    }
  
    // Mouse enter - start animation cycle.
    waveText.addEventListener('mouseenter', function() {
      // Set flag to indicate we want animation running.
      if (animationInterval === null) {
        animationInterval = true;
        startAnimation();
      }
    });
    
    // Mouse leave - stop animation cycles.
    waveText.addEventListener('mouseleave', function() {
      // Set flag to stop animation cycles.
      animationInterval = null;
    });
  });

  showInitModal();
  // Initialize the game.
  initGame();
});