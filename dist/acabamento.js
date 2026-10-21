/* Native enhancements; static content and links remain the default. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const pending = new Set();
  document.querySelectorAll('.solution-card').forEach(card => {
    let frame = 0;
    let x = 0, y = 0;
    const cancel = () => { cancelAnimationFrame(frame); pending.delete(cancel); frame = 0; };
    card.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch' || reduced.matches || !finePointer.matches) return;
      const rect = card.getBoundingClientRect();
      x = event.clientX - rect.left; y = event.clientY - rect.top;
      if (frame) return;
      pending.add(cancel);
      frame = requestAnimationFrame(() => {
        card.style.setProperty('--spot-x', x + 'px');
        card.style.setProperty('--spot-y', y + 'px');
        frame = 0; pending.delete(cancel);
      });
    }, { passive: true });
    card.addEventListener('pointerleave', cancel);
    card.addEventListener('focusin', () => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--spot-x', rect.width / 2 + 'px');
      card.style.setProperty('--spot-y', rect.height * .65 + 'px');
    });
  });
  const cancelPending = () => pending.forEach(cancel => cancel());
  reduced.addEventListener('change', cancelPending);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancelPending(); });
  window.addEventListener('pagehide', cancelPending);

  const headings = [...document.querySelectorAll('main>section .section-heading')];
  const reveals = new Map();
  let revealObserver;
  const finishReveals = () => {
    [...reveals.values()].forEach(tween => { tween.progress(1); tween.kill(); });
  };
  if (window.gsap && 'IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      const node = entry.target;
      if (!entry.isIntersecting) {
        const tween = reveals.get(node);
        if (tween) { tween.progress(1); tween.kill(); }
        return;
      }
      if (reduced.matches || node.dataset.revealState) return;
      node.dataset.revealState = 'animating';
      node.style.willChange = 'transform,opacity';
      const tween = gsap.fromTo(node, { opacity: .85, y: 12 }, {
        opacity: 1, y: 0, duration: .5, ease: 'power2.out', clearProps: 'transform,opacity,willChange',
        onComplete: () => { node.dataset.revealState = 'complete'; reveals.delete(node); revealObserver.unobserve(node); }
      });
      reveals.set(node, tween);
    }), { threshold: .12 });
    if (!reduced.matches) headings.forEach(node => revealObserver.observe(node));
    reduced.addEventListener('change', () => {
      if (!reduced.matches) return;
      finishReveals(); revealObserver.disconnect();
      headings.forEach(node => { node.dataset.revealState = 'complete'; });
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) finishReveals(); });
    window.addEventListener('pagehide', finishReveals);
  }

  // Sample only near the footer. No graphics engine or permanent ticker.
  const word = document.querySelector('.particle-word');
  if (!word) return;
  const canvas = word.querySelector('canvas');
  const label = word.querySelector('.particle-label');
  const context = canvas.getContext('2d');
  if (!context || !('IntersectionObserver' in window)) {
    word.dataset.state = 'complete';
    return;
  }
  let points = [], width = 0, height = 0, elapsed = 0, previous = null, color = '#F2F2F3';
  let visible = false, complete = false, prepared = false, frame = 0, resizeFrame = 0;
  const duration = 1500;
  const seed = n => { const value = Math.sin(n * 12.9898) * 43758.5453; return value - Math.floor(value); };
  function stop() {
    cancelAnimationFrame(frame); frame = 0; previous = null;
    if (!complete && elapsed > 0) word.dataset.state = 'paused';
  }
  function finish() {
    if (complete) return;
    stop(); complete = true; word.dataset.state = 'complete';
    cancelAnimationFrame(resizeFrame); resizeFrame = 0;
    context.clearRect(0, 0, width, height);
    points = [];
  }
  function prepare() {
    const rect = word.getBoundingClientRect();
    width = Math.round(rect.width); height = Math.round(rect.height);
    if (!width || !height) return;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const sample = document.createElement('canvas');
    sample.width = width; sample.height = height;
    const ink = sample.getContext('2d');
    if (!ink) { finish(); return; }
    const style = getComputedStyle(label);
    color = style.color;
    ink.font = style.fontWeight + ' ' + style.fontSize + ' ' + style.fontFamily;
    ink.textAlign = 'center'; ink.textBaseline = 'middle'; ink.fillStyle = '#fff';
    // Match the final HTML tracking as well as the letter shapes.
    if ('letterSpacing' in ink) ink.letterSpacing = style.letterSpacing;
    ink.fillText(label.textContent, width / 2, height / 2);
    const pixels = ink.getImageData(0, 0, width, height).data;
    const candidates = [];
    const step = width < 600 ? 5 : 6;
    for (let y = 2; y < height; y += step) for (let x = 2; x < width; x += step) {
      if (pixels[(y * width + x) * 4 + 3] > 128) candidates.push({ x, y });
    }
    const cap = width < 600 ? 400 : 1000;
    points = candidates.filter((_, i) => i % Math.max(1, Math.ceil(candidates.length / cap)) === 0)
      .map((target, i) => ({ ...target, startX: seed(i + 1) * width, startY: seed(i + 997) * height }));
    prepared = true;
    if (!points.length) finish();
  }
  function draw(stamp) {
    frame = 0;
    if (!visible || document.hidden || reduced.matches || complete) return;
    if (previous !== null) elapsed += Math.min(64, stamp - previous);
    previous = stamp;
    const progress = Math.min(1, elapsed / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    context.clearRect(0, 0, width, height);
    context.fillStyle = color;
    context.globalAlpha = .3 + .7 * progress;
    context.beginPath();
    points.forEach(point => {
      const x = point.startX + (point.x - point.startX) * eased;
      const y = point.startY + (point.y - point.startY) * eased;
      context.moveTo(x + 1.1, y); context.arc(x, y, 1.1, 0, Math.PI * 2);
    });
    context.fill();
    if (progress >= 1) finish();
    else frame = requestAnimationFrame(draw);
  }
  function resume() {
    if (reduced.matches) { finish(); return; }
    if (!visible || document.hidden || complete || frame) return;
    if (!prepared) prepare();
    if (complete || !prepared) return;
    word.dataset.state = 'animating';
    frame = requestAnimationFrame(draw);
  }
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (!visible) { stop(); return; }
    if (document.fonts) document.fonts.ready.then(resume);
    else resume();
  }, { threshold: .1 });
  observer.observe(word);
  reduced.addEventListener('change', () => { if (reduced.matches) finish(); else resume(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else resume(); });
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', resume);
  if ('ResizeObserver' in window) new ResizeObserver(() => {
    if (!prepared || complete) return;
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => { if (!complete) { stop(); prepare(); resume(); } });
  }).observe(word);
})();
