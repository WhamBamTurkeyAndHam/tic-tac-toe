// // Handle Header and Footer Animation.
document.addEventListener('DOMContentLoaded', function() {
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
        // The interval should be slightly longer than the animation duration plus the longest delay.
        // 1.2s animation + (0.1s * number of letters) for max delay.
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

  let currentPiece = null;
  
  // Set up drag events for all X pieces.
  const xPieces = document.querySelectorAll('.cross');
  xPieces.forEach(piece => {
    piece.addEventListener('dragstart', (e) => {
      // Create a custom drag image that matches your styling.
      const dragImage = document.createElement('div');
      dragImage.textContent = 'X';
      dragImage.style.fontFamily = '"Permanent Marker", cursive';
      dragImage.style.fontSize = '7rem';
      dragImage.style.padding = '1rem'
      dragImage.style.color = 'var(--secondary-color)';
      dragImage.style.webkitTextStroke = '3px black';
      dragImage.style.position = 'absolute';
      document.body.appendChild(dragImage);
      
      // Use this custom element as the drag image.
      e.dataTransfer.setDragImage(dragImage, 25, 25);
      currentPiece = 'X';
      
      // Store for cleanup.
      e.target.dragImage = dragImage;

      piece.addEventListener('dragend', (e) => {
        if (e.target.dragImage) {
          document.body.removeChild(e.target.dragImage);
          delete e.target.dragImage;
        }
      });
    });
  });
  
  // Set up drag events for all O pieces.
  const oPieces = document.querySelectorAll('.circle');
  oPieces.forEach(piece => {
    piece.addEventListener('dragstart', (e) => {
      // Create a custom drag image that matches your styling.
      const dragImage = document.createElement('div');
      dragImage.textContent = 'O';
      dragImage.style.fontFamily = '"Permanent Marker", cursive';
      dragImage.style.fontSize = '7rem';
      dragImage.style.padding = '1rem'
      dragImage.style.color = 'var(--tertiary-color)';
      dragImage.style.webkitTextStroke = '3px black';
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-1000px'
      document.body.appendChild(dragImage);
      
      // Use this custom element as the drag image.
      e.dataTransfer.setDragImage(dragImage, 25, 25);
      currentPiece = 'O';
      
      // Store for cleanup.
      e.target.dragImage = dragImage;
  
      piece.addEventListener('dragend', (e) => {
        if (e.target.dragImage) {
          document.body.removeChild(e.target.dragImage);
          delete e.target.dragImage;
        }
      });
    });
  });
  
  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
  
    // Update cell display based on board state.
    // Shows X/O or empty.
    cell.textContent = board[row][col] || '';
  
    // Add highlight.
    cell.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!board[row][col] && currentPiece === 'X') {
        cell.textContent = 'X';
        cell.classList.add('highlight-cross');
      } else if (!board[row][col] && currentPiece === 'O') {
        cell.textContent = 'O';
        cell.classList.add('highlight-circle');
      }
    });
    
    // Remove highlight when drag leaves.
    cell.addEventListener('dragleave', () => {
      if (cell.classList.contains('highlight-cross') || cell.classList.contains('highlight-circle'))
      cell.textContent = '';
      cell.classList.remove('highlight-cross', 'highlight-circle');
    });

    // Handle drop.
    cell.addEventListener('drop', (e) => {
      e.preventDefault();

      cell.textContent = '';
      cell.classList.remove('highlight-cross', 'highlight-circle');
      
      // Only act on empty cells.
      if (!board[row][col] && currentPiece) {
        cell.textContent = currentPiece;
        cell.classList.add(currentPiece === 'X' ? 'x' : 'o');
        board[row][col] = currentPiece;
      }
    });
  });
});

// Game Board.
let board = [
  [null, null, null],
  [null, null, null],
  [null, null, null]
];