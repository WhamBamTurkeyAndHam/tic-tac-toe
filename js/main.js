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
let maxRounds = 0;
let currentPiece = null;
let currentDragImage = null;
let aiDifficulty = 'medium';
let pieces = {
  X: null,
  O: null
};
let player1Name;
let player2Name;
let player1;
let player2;
let player1IsAI = false; // Added to track AI state.
let player2IsAI = false; // Added to track AI state.
let overallGameFlag = false;
let canMakeMove = false;

// Validate to make sure rounds are between and including 1 - 10, and aren't words.
function validateRound(inputElement) {
  inputBox = document.querySelector('#rounds');
  maxRounds = parseInt(inputElement.value);
  if (maxRounds < 1 || maxRounds > 10) {
    inputBox.classList.add('error');
  } else {
    inputBox.classList.remove('error');
  };
}

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
  };
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
    };
  })
  
  // If mouse is over a cell, highlight it.
  if (cellUnderMouse && cellUnderMouse.classList.contains('cell')) {
    const row = parseInt(cellUnderMouse.dataset.row);
    const col = parseInt(cellUnderMouse.dataset.col);
    
    if (!board[row][col]) {
      cellUnderMouse.textContent = currentPiece;
      cellUnderMouse.classList.add(currentPiece === 'X' ? 'highlight-cross' : 'highlight-circle');
    }
  };
}

// Handle mouse up to complete drag.
function handleMouseUp(e) {
  const cellUnderMouse = document.elementFromPoint(e.clientX, e.clientY);
  
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
      const gameResult = checkGame();
      
      // If game is not over, check if AI should move next.
      if (!gameResult) {
        checkAIMove(); // Check if AI should move after player's turn.
      }
    };
  }
  
  // Clean up all cell highlights.
  document.querySelectorAll('.cell').forEach(cell => {
    if (!board[parseInt(cell.dataset.row)][parseInt(cell.dataset.col)]) {
      cell.textContent = '';
      cell.classList.remove('highlight-cross', 'highlight-circle');
    };
  })
  
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
    })
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
    const lastCrossPiece = crossCard.querySelector('.cross:last-child');
    if (lastCrossPiece) {
      lastCrossPiece.remove();
    }
  } else {
    const circleCard = document.querySelector('.circle-right-card');
    const lastCirclePiece = circleCard.querySelector('.circle:last-child');
    if (lastCirclePiece) {
      lastCirclePiece.remove();
    }
  };
}

// Check whose turn it is.
function checkTurn(value) {
  const crossTurn = value === true ? true : false;

  const crossContainer = document.querySelector('.cross-left-card');
  const circleContainer = document.querySelector('.circle-right-card');

  const player1ThinkingContainer = document.querySelector('.player1-thinking-container');
  const player2ThinkingContainer = document.querySelector('.player2-thinking-container');

  const player1ThinkingElements = document.querySelectorAll('.player1-thinking-text span');
  const player2ThinkingElements = document.querySelectorAll('.player2-thinking-text span');

  if (!crossTurn) {
    // Add disabled to the circle side...
    circleContainer.classList.add('disabled');
    player2ThinkingContainer.classList.add('disabled');

    // ...make player 1 text animate...
    player1ThinkingElements.forEach(span => {
      span.classList.add('thinking-text-waving-animation');
    });

    // ...remove player 1 related classes and stop animating player 2.
    crossContainer.classList.remove('disabled');
    player1ThinkingContainer.classList.remove('disabled');
    player2ThinkingElements.forEach(span => {
      span.classList.remove('thinking-text-waving-animation');
    });
  } else {
    // Add disabled to the cross side...
    crossContainer.classList.add('disabled');
    player1ThinkingContainer.classList.add('disabled');

    // ...make player 2 text animate...
    player2ThinkingElements.forEach(span => {
      span.classList.add('thinking-text-waving-animation');
    });

    // ...remove player 2 related classes and stop animating player 1.
    circleContainer.classList.remove('disabled');
    player2ThinkingContainer.classList.remove('disabled');
    player1ThinkingElements.forEach(span => {
      span.classList.remove('thinking-text-waving-animation');
    })
  };
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
    };
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

  canMakeMove = false;

  resultsModal.style.opacity = '0';
  resultsModal.showModal();
  resultsModal.classList.remove('fade-out');

  void resultsModal.offsetWidth;

  resultsModal.style.opacity = '1';
  document.body.style.overflow = 'hidden';
  resultsModal.style.display = 'grid';

  let player1NameText = player1Name.textContent;
  let player2NameText = player2Name.textContent;

  if (winner === 'X') {
    resultsModal.classList.add('win-x');
    resultsModal.style.border = 'outset var(--secondary-color) 5px';
    textModal.textContent = `${player1NameText} is the Winner.`;
  } else if (winner === 'O') {
    resultsModal.classList.add('win-o');
    resultsModal.style.border = 'outset var(--tertiary-color) 5px';
    textModal.textContent = `${player2NameText} is the Winner.`;
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
    if (resultsModal.classList.contains('win-x')) {
      winner = 'X';
    } else if (resultsModal.classList.contains('win-o')) {
      winner = 'O';
    }

    // Remove all winner classes when closing modal.
    resultsModal.classList.remove('win-x', 'win-o', 'tie');

    // Add fade out class.
    resultsModal.classList.add('fade-out');

    // Remove any existing transitionend listeners first
    const existingHandlers = resultsModal._transitionHandlers || [];
    existingHandlers.forEach(handler => {
      resultsModal.removeEventListener('transitionend', handler);
    });

    // Create a new handler
    const transitionEndHandler = (e) => {
      // Only process the opacity transition if multiple properties are transitioning.
      if (e.propertyName === 'opacity' || e.propertyName === 'transform') {
        // Hide visibility and close dialog.
        resultsModal.close();
        // Reset styles and cleanup.
        resultsModal.style.border = '';
        resultsModal.style.display = '';
        document.body.style.overflow = '';
        
        // Score the game and handle the end-of-game sequence.
        if (winner && overallGameFlag === false) {
          scoreGame(winner);
          checkRound();
        } else if (overallGameFlag === true) {
          // For game end, reset everything here instead of in checkRound.
          setTimeout(() => {
            // Reset game state.
            crossWin = 0;
            circleWin = 0;
            roundCounter = 0;
            maxRounds = '?';
            
            // Update displays.
            document.querySelector('#odometer-cross').textContent = crossWin;
            document.querySelector('#odometer-circle').textContent = circleWin;
            document.querySelector('#odometer-round').textContent = roundCounter;
            document.querySelector('.round-max-amount').textContent = maxRounds;
            document.querySelector('.overall-score').textContent = '';
            
            // Now show init modal after ensuring results modal is gone.
            showInitModal();
          }, 500); // Small delay to ensure modal is fully closed.
        };
      };
    }

    // Store the handler for potential future removal.
    resultsModal._transitionHandlers = [transitionEndHandler];
    
    // Add the event listener with once: true.
    resultsModal.addEventListener('transitionend', transitionEndHandler, { once: true })
  };

  // Reset the board.
  resetBoard();
}

// Reset the game board for a new round.
function resetBoard() {
  board = [
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ];

  overallGameFlag = false;
    
  document.querySelectorAll('.cell').forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('x', 'o');
  });

  const crossCard = document.querySelector('.cross-left-card');
  const crossCount = crossCard.querySelectorAll('.cross').length;

  const circleCard = document.querySelector('.circle-right-card');
  const circleCount = circleCard.querySelectorAll('.circle').length;

  const player1ThinkingContainer = document.querySelector('.player1-thinking-container');
  const player2ThinkingContainer = document.querySelector('.player2-thinking-container');

  const player1ThinkingElements = document.querySelectorAll('.player1-thinking-text span');
  const player2ThinkingElements = document.querySelectorAll('.player2-thinking-text span');

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
  circleCard.classList.add('disabled');  // X always goes first.

  // Reset Player 1 to be enabled.
  player1ThinkingContainer.classList.remove('disabled');
  player1ThinkingElements.forEach(span => {
    span.classList.add('thinking-text-waving-animation');
  });

  // Reset Player 2 to be disabled.
  player2ThinkingContainer.classList.add('disabled');
    player2ThinkingElements.forEach(span => {
    span.classList.remove('thinking-text-waving-animation');
  });

  // Check if AI should make a move (for X).
  setTimeout(() => {
    checkAIMove();
  }, 500);
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
  };
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

  canMakeMove = true;
  
  // Start with X's turn.
  checkTurn(false);
}

function showInitModal() {
  const initGameModal = document.querySelector('.modal-init-game');
  const submitButton = document.querySelector('.submit-btn');
  const player1AI = document.querySelector('#checkbox-player-1');
  const player2AI = document.querySelector('#checkbox-player-2');

  canMakeMove = false;
  
  // Initialize checkbox states.
  player1IsAI = false;
  player2IsAI = false;
  player1AI.checked = false;
  player2AI.checked = false;

  document.body.style.overflow = 'hidden';
  initGameModal.showModal();
  
  // Set up AI checkbox event listeners.
  player1AI.addEventListener('change', () => {
    player1IsAI = player1AI.checked;
    if (player1IsAI) {
      player2AI.checked = false;
      player2IsAI = false;
    }
    updatePlayerPlaceholders();
  });
  
  player2AI.addEventListener('change', () => {
    player2IsAI = player2AI.checked;
    if (player2IsAI) {
      player1AI.checked = false;
      player1IsAI = false;
    }
    updatePlayerPlaceholders();
  });
  
  function updatePlayerPlaceholders() {
    const player1Input = document.querySelector('#player-1');
    const player2Input = document.querySelector('#player-2');

    player1Input.placeholder = player1AI.checked ? "Enter A.I's Name" : "Enter Your Name";
    player2Input.placeholder = player2AI.checked ? "Enter A.I's Name" : "Enter Your Name";
  };
  
  // Remove previous event listener if exists.
  submitButton.removeEventListener('click', handleSumbit);
  submitButton.addEventListener('click', handleSumbit);
  
  function handleSumbit(e) {
    player1 = document.querySelector('#player-1').value || "Player 1";
    player2 = document.querySelector('#player-2').value || "Player 2";
    maxRounds = parseInt(document.querySelector('#rounds').value) || 5;

    if (maxRounds >= 1 && maxRounds <= 10) {
      e.preventDefault();

      inputBox.classList.remove('error');
      // Store AI states from checkboxes.
      player1IsAI = player1AI.checked;
      player2IsAI = player2AI.checked;
      
      player1Name = document.querySelector('.player-one-name');
      player1Name.textContent = player1;

      player2Name = document.querySelector('.player-two-name');
      player2Name.textContent = player2;

      maxRoundsAmount = document.querySelector('.round-max-amount');
      maxRoundsAmount.textContent = maxRounds;
      
      checkFontSize(player1Name);
      checkFontSize(player2Name);
      
      // First, clear any existing transition handlers.
      if (initGameModal._transitionHandler) {
        initGameModal.removeEventListener('transitionend', initGameModal._transitionHandler);
        delete initGameModal._transitionHandler;
      }
      
      // Create and store a single handler.
      const transitionEndHandler = function() {
        // Hide visibility and close dialog.
        initGameModal.close();
        // Allow scrolling.
        document.body.style.overflow = '';
        initGameModal.classList.remove('fade-out');
        
        // Check the round and initialize the game.
        checkRound();
        initGame();
        
        // Remove the listener since we're done.
        initGameModal.removeEventListener('transitionend', transitionEndHandler);
      };
      
      // Store the handler reference.
      initGameModal._transitionHandler = transitionEndHandler;
      
      // Add the transition class to trigger animation.
      initGameModal.classList.add('fade-out');
      
      // Add the event listener.
      initGameModal.addEventListener('transitionend', transitionEndHandler, { once: true });
    }
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
  };
}

function checkRound() {
  const roundCounterAmount = document.querySelector('#odometer-round');
  const finalScoreModal = document.querySelector('.overall-score');

  // Check Round.
  if (roundCounter === maxRounds) {
    const winner = 
    (crossWin > circleWin) ? 'X' :
    (crossWin < circleWin) ? 'O' :
                            "tie";
    
    // Show game end modal
    showWinnerModal(winner);
    overallGameFlag = true;
    finalScoreModal.textContent = `${crossWin} - ${circleWin}`;
    canMakeMove = false;
    bigConfetti();
  } else {
    canMakeMove = true;
    setTimeout(() => {
      checkAIMove(); // Check AI setup and move if needed.
      roundCounter++;
      roundCounterAmount.textContent = roundCounter;
    }, 500);
  };
}

// Check if AI should make a move.
function checkAIMove() {
  // Use the saved state variables instead of accessing the checkboxes directly.
  // This ensures the AI state is preserved between rounds.
  const isXAI = player1IsAI;
  const isOAI = player2IsAI;
  
  const crossContainer = document.querySelector('.cross-left-card');
  const circleContainer = document.querySelector('.circle-right-card');

  if ((isXAI && !crossContainer.classList.contains('disabled')) || 
      (isOAI && !circleContainer.classList.contains('disabled'))) {
    const aiPiece = isXAI ? 'X' : 'O';
    // Add a slight delay so the AI looks like it is 'thinking'.
    setTimeout(() => {
      aiMove(aiPiece);
    }, Math.max(500, Math.random() * 2500)); // Randomise the time it 'thinks' so it doesn't look like the same amount of 'thinking'.
  };
}

function aiMove(playerAI) {
  if (canMakeMove) {
    const aiPiece = playerAI;
    const humanPiece = aiPiece === 'X' ? 'O' : 'X';

    function wouldBeWin(row, col, piece) {
      // Create a temporary board copy
      const tempBoard = board.map(arr => [...arr]);
      tempBoard[row][col] = piece;
      
      // Check rows
      for (let i = 0; i < 3; i++) {
        if (tempBoard[i][0] === piece && tempBoard[i][1] === piece && tempBoard[i][2] === piece) {
          return true;
        }
      }
      
      // Check columns
      for (let i = 0; i < 3; i++) {
        if (tempBoard[0][i] === piece && tempBoard[1][i] === piece && tempBoard[2][i] === piece) {
          return true;
        }
      }
      
      // Check diagonals
      if (tempBoard[0][0] === piece && tempBoard[1][1] === piece && tempBoard[2][2] === piece) {
        return true;
      }
      if (tempBoard[0][2] === piece && tempBoard[1][1] === piece && tempBoard[2][0] === piece) {
        return true;
      }
      
      return false;
    };

    // Firstly find every empty cell.
    const emptyCells = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === null) {
          emptyCells.push([i, j]);
        };
      };
    }

    // Secondly try to win.
    for (const [row, col] of emptyCells) {
      if (wouldBeWin(row, col, aiPiece)) {
        return makeMove(row, col);
      };
    }

    // Then, try block the player from winning.
    for (const [row, col] of emptyCells) {
      if (wouldBeWin(row, col, humanPiece)) {
        return makeMove(row, col);
      };
    }

    // What the A.I will do between a selection of Easy, Medium or Hard.
    function chooseRandomCell(cells) {
      const [row, col] = cells[Math.floor(Math.random() * cells.length)];
      return makeMove(row, col);
    }

    // Function to choose a move based on difficulty.
    function chooseDifficulty() {
      if (emptyCells.length > 0) {
        // (Easy) If all else fails in making a strategic move, choose a random empty cell.
        if (aiDifficulty === 'easy') {
          return chooseRandomCell(emptyCells);
        }
    
        // (Medium) Try to take corners first.
        const corners = [[0, 0], [0, 2], [2, 0], [2, 2]];
        const availableCorners = corners.filter(([row, col]) => board[row][col] === null);
    
        if (aiDifficulty === 'medium') {
          return availableCorners.length > 0 ? chooseRandomCell(availableCorners) : chooseRandomCell(emptyCells);
        }
    
        // (Hard) Use Easy and Medium and Try to take the center.
        if (aiDifficulty === 'hard') {
          if (board[1][1] === null) return makeMove(1, 1);
          return availableCorners.length > 0 ? chooseRandomCell(availableCorners) : chooseRandomCell(emptyCells);
        };
      };
    }

    // Call the difficulty selection method
    return chooseDifficulty();

    // Function to help the AI make moves
    function makeMove(row, col) {
      const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);

      cell.textContent = aiPiece;
      cell.classList.add(aiPiece === 'X' ? 'x' : 'o');
      board[row][col] = aiPiece;

      // Remove a piece from the container
      removePiece(aiPiece);

      // Switch turns
      const isXTurn = aiPiece === 'X';
      checkTurn(isXTurn);
      
      // Check for game end
      const gameResult = checkGame();
      
      // If game is not over, check if AI should move next 
      // (if both players are AI)
      if (!gameResult) {
        if ((player1IsAI && player2IsAI)) {
          setTimeout(() => {
            checkAIMove();
          }, 750);
        };
      };
    };
  };
}

// Setup difficulty selection event listeners.
function setupDifficultySelection() {
  const easyButton = document.querySelector('.easy');
  const mediumButton = document.querySelector('.medium');
  const hardButton = document.querySelector('.hard');

  // Remove previous event listeners to prevent multiple bindings.
  easyButton.removeEventListener('click', setDifficulty);
  mediumButton.removeEventListener('click', setDifficulty);
  hardButton.removeEventListener('click', setDifficulty);

  // Add new event listeners
  easyButton.addEventListener('click', setDifficulty);
  mediumButton.addEventListener('click', setDifficulty);
  hardButton.addEventListener('click', setDifficulty);

  // Add active class to default difficulty
  document.querySelectorAll('.easy, .medium, .hard').forEach(btn => {
    btn.classList.remove('active-difficulty');
  });
  
  if (aiDifficulty === 'easy') {
    easyButton.classList.add('active-difficulty');
  } else if (aiDifficulty === 'medium') {
    mediumButton.classList.add('active-difficulty');
  } else if (aiDifficulty === 'hard') {
    hardButton.classList.add('active-difficulty');
  }

  function setDifficulty(event) {
    // Remove active class from all buttons.
    [easyButton, mediumButton, hardButton].forEach(btn => 
      btn.classList.remove('active-difficulty')
    );

    // Add active class to clicked button.
    event.target.classList.add('active-difficulty');

    // Set the difficulty based on clicked button.
    aiDifficulty = event.target.classList.contains('easy') ? 'easy' :
                  event.target.classList.contains('medium') ? 'medium' : 'hard';
  };
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
      };
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

  // Add difficulty selection setup
  setupDifficultySelection();

  // Check A.I status.
  checkAIMove();
  
  // Show Modal at start.
  showInitModal();
});

// Confetti by catdad, see README for the link.
function bigConfetti() {
  var count = 300;
  var scalar = 2;
  var defaults = {
    origin: { y: 0.5 }
  };
  
  function fire(particleRatio, opts) {
    confetti({
      scalar,
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }
  
  fire(0.25, {
    spread: 60,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 80,
  });
  fire(0.35, {
    spread: 120,
    decay: 0.91,
    scalar: 0.8
  });
  fire(0.1, {
    spread: 160,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2
  });
  fire(0.1, {
    spread: 180,
    startVelocity: 45,
  });
}