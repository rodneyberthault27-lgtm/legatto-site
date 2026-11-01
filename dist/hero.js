/* Hero da identidade 2026-11: progresso de saída (--hp) e abertura do
   cobalto (--hx). Só variáveis CSS lidas por transform/clip-path, um quadro
   por requestAnimationFrame e nada roda com o hero fora da tela. Sem JS, ou
   com movimento reduzido, o hero fica na composição estática completa. */
(() => {
  'use strict';
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const query = new URLSearchParams(location.search);
  const still = () => reduced.matches || query.get('reduce') === '1' || query.has('t');
  const clamp = v => Math.min(1, Math.max(0, v));
  const smooth = t => t * t * (3 - 2 * t);
  let visible = true;
  let frame = 0;

  function write() {
    frame = 0;
    if (still() || !visible) return;
    const box = hero.getBoundingClientRect();
    const hp = clamp(-box.top / Math.max(1, box.height));
    hero.style.setProperty('--hp', hp.toFixed(4));
    hero.style.setProperty('--hx', smooth(clamp((hp - .42) / .5)).toFixed(4));
  }
  const request = () => { if (!frame) frame = requestAnimationFrame(write); };

  function sync() {
    if (still()) {
      cancelAnimationFrame(frame); frame = 0;
      hero.classList.remove('is-opening');
      hero.style.removeProperty('--hp');
      hero.style.removeProperty('--hx');
      return;
    }
    request();
  }

  // Abertura uma vez, só quando o hero está na tela ao carregar.
  if (!still() && hero.getBoundingClientRect().top < innerHeight) {
    hero.classList.add('is-opening');
    hero.addEventListener('animationend', event => {
      if (event.target.closest('.hero-orbit-front')) hero.classList.remove('is-opening');
    });
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) request();
    }).observe(hero);
  }
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request);
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } });
  sync();
})();
