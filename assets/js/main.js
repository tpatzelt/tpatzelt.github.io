/**
 * Lightweight Typing Effect
 * Single-pass animation for the typing text
 */

(function() {
  'use strict';

  const typingElement = document.getElementById('typing-text');
  const text = window.typingText || 'Machine Learning Engineer';
  let charIndex = 0;
  const typingSpeed = 80; // ms per character

  const reduceMotionQuery = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };

  function finishTyping() {
    // Remove cursor animation after typing completes
    const cursor = document.querySelector('.typing-cursor');
    if (cursor) {
      cursor.style.animation = 'blink 1s step-end infinite';
    }

    // Notify cat cursor so it stays in sync with the final caret position
    if (window.catCursor && window.catCursor.updatePosition) {
      window.catCursor.updatePosition();
    }

    // Trigger cat flying mode immediately without delay
    if (window.catCursor && window.catCursor.startFlying) {
      window.catCursor.startFlying();
    }
  }

  function typeInstant() {
    if (!typingElement) {
      finishTyping();
      return;
    }
    typingElement.textContent = text;
    charIndex = text.length;
    finishTyping();
  }

  function type() {
    if (!typingElement) {
      return;
    }
    if (charIndex < text.length) {
      typingElement.textContent += text.charAt(charIndex);
      charIndex++;

      // Notify cat cursor to update position
      if (window.catCursor && window.catCursor.updatePosition) {
        window.catCursor.updatePosition();
      }

      setTimeout(type, typingSpeed);
    } else {
      finishTyping();
    }
  }

  // Start typing after a short delay for dramatic effect
  function init() {
    if (reduceMotionQuery.matches) {
      setTimeout(typeInstant, 800);
      return;
    }

    setTimeout(type, 800);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
