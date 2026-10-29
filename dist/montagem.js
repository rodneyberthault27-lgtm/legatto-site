/* Montagem: progresso de rolagem para os planos do hero e para o encaixe
   das quatro fotos. Só transform/opacity via variáveis CSS, um quadro por
   requestAnimationFrame, nada roda fora da tela. Sem script: tudo montado. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const query = new URLSearchParams(location.search);
  const forcedReduce = query.get('reduce') === '1';
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const span = (p, from, to) => clamp((p - from) / (to - from));

  const stage = document.querySelector('.hero-stage');
  const assembly = document.querySelector('[data-assembly]');
  const sticky = assembly && assembly.querySelector('.assembly-sticky');
  const visible = new Set();
  let frame = 0;

  // The sticky stage only goes live when its content fits the viewport;
  // otherwise the frame would scroll away half-assembled.
  function fits() {
    if (!sticky) return false;
    const was = assembly.classList.contains('is-live');
    assembly.classList.remove('is-live');
    const need = sticky.scrollHeight;
    if (was) assembly.classList.add('is-live');
    return need + 40 <= innerHeight;
  }

  function write() {
    frame = 0;
    if (stage && visible.has(stage)) {
      stage.style.setProperty('--hp', clamp(scrollY / innerHeight).toFixed(4));
    }
    if (assembly && assembly.classList.contains('is-live') && visible.has(assembly)) {
      const box = assembly.getBoundingClientRect();
      const p = clamp(-box.top / Math.max(1, box.height - innerHeight));
      // 0-.15 parado e solto (silêncio), .15-.72 encaixa, depois segura montado.
      assembly.style.setProperty('--e', ease(span(p, .15, .72)).toFixed(4));
      assembly.style.setProperty('--b', ease(span(p, .55, .8)).toFixed(4));
      assembly.style.setProperty('--o', span(p, .72, .84).toFixed(4));
    }
  }
  const request = () => { if (!frame) frame = requestAnimationFrame(write); };

  function sync() {
    const still = reduced.matches || forcedReduce;
    if (assembly) {
      const live = !still && fits();
      assembly.classList.toggle('is-live', live);
      if (!live) ['--e', '--b', '--o'].forEach(name => assembly.style.removeProperty(name));
    }
    if (stage && still) stage.style.removeProperty('--hp');
    if (!still) request();
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
      request();
    });
    [stage, assembly].filter(Boolean).forEach(el => observer.observe(el));
  } else {
    [stage, assembly].filter(Boolean).forEach(el => visible.add(el));
  }

  addEventListener('scroll', () => { if (!reduced.matches && !forcedReduce) request(); }, { passive: true });
  let resizeTimer = 0;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(sync, 120); });
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } });
  if (document.fonts) document.fonts.ready.then(sync);
  sync();
})();
