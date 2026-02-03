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

  function type() {
    if (charIndex < text.length) {
      typingElement.textContent += text.charAt(charIndex);
      charIndex++;
      setTimeout(type, typingSpeed);
    } else {
      // Remove cursor animation after typing completes
      const cursor = document.querySelector('.typing-cursor');
      if (cursor) {
        cursor.style.animation = 'blink 1s step-end infinite';
      }
    }
  }

  // Start typing after a short delay for dramatic effect
  function init() {
    setTimeout(type, 800);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
