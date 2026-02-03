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
  const root = document.documentElement;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let rafId = null;

  function type() {
    if (!typingElement) {
      return;
    }
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

  function animateBackground() {
    const dx = targetX - currentX;
    const dy = targetY - currentY;
    currentX += dx * 0.18;
    currentY += dy * 0.18;

    root.style.setProperty('--bg-x', `${currentX.toFixed(2)}px`);
    root.style.setProperty('--bg-y', `${currentY.toFixed(2)}px`);
    root.style.setProperty('--bg-rot', `${(currentX / 10).toFixed(2)}deg`);

    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
      rafId = requestAnimationFrame(animateBackground);
    } else {
      rafId = null;
    }
  }

  function handlePointerMove(event) {
    const { innerWidth, innerHeight } = window;
    const x = (event.clientX - innerWidth / 2) / innerWidth;
    const y = (event.clientY - innerHeight / 2) / innerHeight;
    targetX = x * 90;
    targetY = y * 70;

    if (!rafId) {
      rafId = requestAnimationFrame(animateBackground);
    }
  }

  function resetBackground() {
    targetX = 0;
    targetY = 0;
    if (!rafId) {
      rafId = requestAnimationFrame(animateBackground);
    }
  }

  // Start typing after a short delay for dramatic effect
  function init() {
    setTimeout(type, 800);
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('mouseleave', resetBackground);
    window.addEventListener('blur', resetBackground);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
