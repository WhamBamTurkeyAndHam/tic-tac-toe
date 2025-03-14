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
});