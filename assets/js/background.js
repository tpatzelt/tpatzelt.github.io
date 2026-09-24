/**
 * Generative ML-themed canvas background
 * Draws a drifting neural-net / latent-space motif (nodes + weighted edges)
 * using the accent colours defined as CSS custom properties.
 */

(function() {
  'use strict';

  var reduceMotionQuery = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };

  var canvas = document.createElement('canvas');
  canvas.id = 'bg-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.zIndex = '-1';
  canvas.style.pointerEvents = 'none';
  canvas.style.display = 'block';

  document.body.insertBefore(canvas, document.body.firstChild);

  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var width = 0;
  var height = 0;
  var nodes = [];
  var rafId = null;
  var maxLinkDistance = 150;

  function readColor(name, fallback) {
    var value = getComputedStyle(document.documentElement).getPropertyValue(name);
    return value && value.trim() ? value.trim() : fallback;
  }

  function getColors() {
    return {
      violet: readColor('--accent-violet', '#9d7bff'),
      cyan: readColor('--accent-cyan', '#4fd8e6'),
      pink: readColor('--accent-pink', '#ff6fb0')
    };
  }

  function nodeCount() {
    var isMobile = window.innerWidth <= 768;
    var byArea = Math.floor((window.innerWidth * window.innerHeight) / 16000);
    return Math.max(12, Math.min(isMobile ? 35 : 70, byArea));
  }

  function createNodes() {
    var count = nodeCount();
    var colors = getColors();
    var palette = [colors.violet, colors.cyan, colors.pink];
    nodes = [];
    for (var i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: 1.5 + Math.random() * 1.5,
        color: palette[i % palette.length]
      });
    }
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createNodes();
  }

  function drawFrame() {
    ctx.clearRect(0, 0, width, height);

    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var a = nodes[i];
        var b = nodes[j];
        var dx = a.x - b.x;
        var dy = a.y - b.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxLinkDistance) {
          var opacity = 1 - dist / maxLinkDistance;
          ctx.strokeStyle = a.color;
          ctx.globalAlpha = opacity * 0.35;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 0.85;
    for (var k = 0; k < nodes.length; k++) {
      var node = nodes[k];
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function step() {
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      node.x += node.vx;
      node.y += node.vy;

      if (node.x < 0 || node.x > width) {
        node.vx *= -1;
        node.x = Math.max(0, Math.min(width, node.x));
      }
      if (node.y < 0 || node.y > height) {
        node.vy *= -1;
        node.y = Math.max(0, Math.min(height, node.y));
      }
    }

    drawFrame();
    rafId = requestAnimationFrame(step);
  }

  function startAnimation() {
    if (rafId === null && !reduceMotionQuery.matches && !document.hidden) {
      rafId = requestAnimationFrame(step);
    }
  }

  function stopAnimation() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      stopAnimation();
    } else {
      startAnimation();
    }
  }

  var resizeTimeout = null;
  function handleResize() {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    resizeTimeout = setTimeout(function() {
      resize();
      if (reduceMotionQuery.matches) {
        drawFrame();
      }
    }, 150);
  }

  function init() {
    resize();
    drawFrame();

    if (reduceMotionQuery.matches) {
      // Static single frame only: no animation loop.
      return;
    }

    startAnimation();
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  window.addEventListener('resize', handleResize, { passive: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
