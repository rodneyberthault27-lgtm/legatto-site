/* Motion direction informed by iart-ai/web-animation-skills.
   GSAP is local and optional: absent JS/library => complete static content. */
(() => {
  'use strict';
  const gsap = window.gsap;
  if (!gsap || !document.querySelector('.protection-journey')) return;
  const query = new URLSearchParams(location.search);
  const time = query.has('t') ? Number(query.get('t')) : null;
  const frozen = time !== null && Number.isFinite(time) && time >= 0;
  const motion = { ready: false };
  window.LegattoMotion = motion;

  function init() {
    const preferences = gsap.matchMedia();
    preferences.add({ normal: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)' }, context => {
      const reduced = context.conditions.reduced || query.get('reduce') === '1';
      const hero = gsap.timeline({ paused: frozen, defaults: { ease: 'power3.out', duration: reduced ? .15 : .65 } });
      const items = document.querySelectorAll('.hero-copy>h1,.hero-description,.hero-actions,.hero-note');
      hero.fromTo(items, { opacity: reduced ? 1 : 0, y: reduced ? 0 : 14 }, { opacity: 1, y: 0, stagger: reduced ? 0 : .08, clearProps: 'transform,opacity' });
      hero.fromTo('.hero-visual', { opacity: reduced ? 1 : 0 }, { opacity: 1, clearProps: 'opacity' }, reduced ? 0 : .2);

      const canvas = document.querySelector('.journey-canvas');
      const journey = gsap.timeline({
        id: 'legatto-protection', paused: true,
        onStart: () => canvas.classList.add('is-animating'),
        onComplete: () => { canvas.classList.remove('is-animating'); gsap.set('.journey-trace', { clearProps: 'transform' }); }
      });
      if (!reduced) {
        journey.fromTo('.journey-trace', { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, force3D: true, duration: 1.4, ease: 'power2.inOut' });
        journey.fromTo('.journey-areas>a', { opacity: .6 }, { opacity: 1, duration: .4, stagger: .18 }, .1);
      } else {
        // Keep the whole connection and all information present, without displacement.
        gsap.set('.journey-trace', { scaleX: 1, transformOrigin: '0% 50%' });
        gsap.set('.journey-areas>a', { opacity: 1 });
      }
      motion.seek = seconds => {
        hero.progress(1).pause();
        journey.pause().time(Math.max(0, seconds));
      };
      motion.ready = true;
      if (frozen) { hero.pause().time(time); journey.pause().time(time); }

      const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          if (!frozen) journey.play();
          observer.unobserve(entry.target);
        });
      }, { threshold: .25 }) : null;
      if (observer) observer.observe(canvas);
      else if (!frozen) journey.progress(1);
      return () => { if (observer) observer.disconnect(); canvas.classList.remove('is-animating'); };
    });
  }
  // No text splitting: wait for fonts to avoid movement caused by font swaps.
  if (document.fonts) document.fonts.ready.then(init);
  else init();
})();
