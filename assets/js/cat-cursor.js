/**
 * Walking Cat Cursor
 * Follows the typing cursor and flies around after typing completes
 */

(function() {
  'use strict';

  // Configuration
  const config = {
    catWidth: window.innerWidth <= 768 ? 48 : 64,
    catHeight: window.innerWidth <= 768 ? 48 : 64,
    updateInterval: 50, // ms between position updates
  };

  let cat = null;
  let typingWrapper = null;
  let typingText = null;
  let caretMarker = null;
  let isFlying = false;
  let lastCaretX = 0;
  let lastCaretY = 0;

  /**
   * Initialize the cat cursor
   */
  function init() {
    // Create cat element
    cat = document.createElement('div');
    cat.className = 'cat';
    cat.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cat);

    // Get typing elements
    typingWrapper = document.querySelector('.typing-wrapper');
    typingText = document.getElementById('typing-text');

    if (!typingWrapper || !typingText) {
      console.warn('Cat cursor: typing elements not found');
      return;
    }

    // Create caret marker element
    caretMarker = document.createElement('span');
    caretMarker.id = 'caret-marker';
    caretMarker.textContent = '';

    // Add cat-active class to hide default cursor
    typingWrapper.classList.add('cat-active');

    // Start tracking the caret
    startTracking();
  }

  /**
   * Start tracking the typing cursor position
   */
  function startTracking() {
    // Check if typing is complete periodically
    const trackingInterval = setInterval(() => {
      if (!typingText || isFlying) {
        clearInterval(trackingInterval);
        return;
      }

      updateCatPosition();

      // Check if typing is complete
      const typingCursor = document.querySelector('.typing-cursor');
      if (typingCursor && typingCursor.style.animation) {
        // Typing complete - switch to flying mode
        setTimeout(() => {
          startFlying();
        }, 1000);
        clearInterval(trackingInterval);
      }
    }, config.updateInterval);
  }

  /**
   * Update cat position to follow the caret
   */
  function updateCatPosition() {
    if (!typingText || !cat || isFlying) return;

    // Insert caret marker at the end of the text
    if (caretMarker.parentNode) {
      caretMarker.parentNode.removeChild(caretMarker);
    }
    typingText.appendChild(caretMarker);

    // Get the position of the caret marker
    const rect = caretMarker.getBoundingClientRect();
    const caretX = rect.left + window.scrollX;
    const caretY = rect.top + window.scrollY;

    // Position cat ON TOP of the text
    // Move cat to the left so it appears to be walking on/over the text
    const catX = caretX - (config.catWidth); // Center cat on the caret
    const catY = caretY - (config.catHeight); // Position cat above the text line

    // Only update if position changed significantly
    if (Math.abs(catX - lastCaretX) > 1 || Math.abs(catY - lastCaretY) > 1) {
      cat.style.left = `${catX}px`;
      cat.style.top = `${catY}px`;
      cat.style.transform = 'translate(0, 0)';
      
      lastCaretX = catX;
      lastCaretY = catY;

      // Add walking animation if not already present
      if (!cat.classList.contains('walking')) {
        cat.classList.add('walking');
      }

      // Make cat visible
      if (!cat.classList.contains('visible')) {
        cat.classList.add('visible');
      }
    }
  }

  /**
   * Switch cat to flying mode
   */
  function startFlying() {
    if (!cat || isFlying) return;

    isFlying = true;

    // Remove caret marker
    if (caretMarker && caretMarker.parentNode) {
      caretMarker.parentNode.removeChild(caretMarker);
    }

    // Get current position before switching to flying
    const currentLeft = parseFloat(cat.style.left) || lastCaretX;
    const currentTop = parseFloat(cat.style.top) || lastCaretY;

    // First walk to the right for a bit, then step down, then take off
    walkAndTakeOff(currentLeft, currentTop);
  }

  /**
   * Walk cat to the right, step down, then take off
   */
  function walkAndTakeOff(startX, startY) {
    const walkDistance = 60; // pixels to walk right
    const walkDuration = 400; // ms
    const stepDownDistance = 60; // pixels to step down
    const stepDuration = 400; // ms
    const walkStartTime = Date.now();

    function walkRight() {
      const elapsed = Date.now() - walkStartTime;
      
      if (elapsed < walkDuration) {
        // Walking to the right
        const progress = elapsed / walkDuration;
        const x = startX + (walkDistance * progress);
        cat.style.left = `${x}px`;
        cat.style.top = `${startY}px`;
        requestAnimationFrame(walkRight);
      } else {
        // Walk complete, now step down
        stepDown(startX + walkDistance, startY);
      }
    }

    function stepDown(x, y) {
      const stepStartTime = Date.now();

      function step() {
        const elapsed = Date.now() - stepStartTime;
        
        if (elapsed < stepDuration) {
          // Stepping down
          const progress = elapsed / stepDuration;
          const newY = y + (stepDownDistance * progress);
          cat.style.left = `${x}px`;
          cat.style.top = `${newY}px`;
          requestAnimationFrame(step);
        } else {
          // Step complete, switch to flying and take off to the right
          cat.classList.remove('walking');
          cat.classList.add('flying');
          takeOffRight(x, y + stepDownDistance);
        }
      }

      step();
    }

    walkRight();
  }

  /**
   * Animate cat taking off to the right and then flying around
   */
  function takeOffRight(startX, startY) {
    const flyDuration = 15000; // 15 seconds for full loop
    const startTime = Date.now();

    // Define flying path waypoints starting from take-off to the right
    const waypoints = [
      { x: startX, y: startY, rotate: 0 },
      { x: window.innerWidth + 100, y: startY - 100, rotate: 45 }, // Fly off to the right
      { x: window.innerWidth * 0.9, y: window.innerHeight * 0.3, rotate: 90 },
      { x: window.innerWidth * 0.5, y: window.innerHeight * 0.1, rotate: 135 },
      { x: window.innerWidth * 0.1, y: window.innerHeight * 0.3, rotate: 180 },
      { x: window.innerWidth * 0.1, y: window.innerHeight * 0.7, rotate: 225 },
      { x: window.innerWidth * 0.5, y: window.innerHeight * 0.9, rotate: 270 },
      { x: window.innerWidth * 0.9, y: window.innerHeight * 0.7, rotate: 315 }
    ];

    function updateFlyingPosition() {
      if (!isFlying || !cat) return;

      const elapsed = Date.now() - startTime;
      const progress = (elapsed % flyDuration) / flyDuration;
      const totalWaypoints = waypoints.length;
      const segmentProgress = progress * totalWaypoints;
      const currentSegment = Math.floor(segmentProgress);
      const segmentFraction = segmentProgress - currentSegment;

      // Get current and next waypoint
      const current = waypoints[currentSegment % totalWaypoints];
      const next = waypoints[(currentSegment + 1) % totalWaypoints];

      // Interpolate position
      const x = current.x + (next.x - current.x) * segmentFraction;
      const y = current.y + (next.y - current.y) * segmentFraction;
      const rotate = current.rotate + (next.rotate - current.rotate) * segmentFraction;

      cat.style.left = `${x}px`;
      cat.style.top = `${y}px`;
      cat.style.transform = `translate(-50%, -50%) rotate(${rotate}deg)`;

      requestAnimationFrame(updateFlyingPosition);
    }

    updateFlyingPosition();
  }

  /**
   * Expose method to manually trigger flying mode
   * Useful if you want to trigger it from external code
   */
  window.catCursor = {
    startFlying: startFlying,
    isFlying: () => isFlying
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
