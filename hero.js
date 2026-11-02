/* Hero em filme: o motor scroll-craft (scrollcraft.js, sem alterações) faz o
   vídeo andar com a rolagem. Aqui só decidimos quando montá-lo e trocamos as
   cores do texto quando o azul toma o quadro. Sem JS, com movimento reduzido
   ou com ?t=/?reduce=1, o hero fica no pôster estático, sem rolagem extra. */
(() => {
  'use strict';
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;
  // Enquanto o botão de WhatsApp do hero está na tela, o flutuante sai de
  // cena no celular: dois botões iguais disputando o mesmo quadro sobrava.
  const cta = hero.querySelector('.hero-actions .button');
  if (cta && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      document.body.classList.toggle('hero-cta-visivel', entry.isIntersecting);
    }).observe(cta);
  }

  const query = new URLSearchParams(location.search);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const still = reduced.matches || query.get('reduce') === '1' || query.has('t');
  if (still || !window.ScrollCraft) return;

  // Telas em pé acima de 860px (tablet vertical) também recebem o filme
  // vertical: o motor só troca de clipe por largura.
  const video = hero.querySelector('video[data-sc-scrub]');
  if (matchMedia('(min-width: 861px) and (max-aspect-ratio: 1/1)').matches) {
    video.setAttribute('data-sc-src', video.getAttribute('data-sc-src-mobile'));
  }
  hero.classList.add('is-film');
  window.ScrollCraft.mount(hero.parentElement);

  // O cobalto ocupa o quadro a partir de 4,4 s do filme (de 8 s). O motor
  // posiciona o vídeo por seek; cada seek concluído atualiza as cores.
  const flood = () => hero.classList.toggle('is-flooded', video.currentTime >= 4.6);
  video.addEventListener('seeked', flood);
  video.addEventListener('timeupdate', flood);

  // Mudar a preferência durante a visita: recarregar deixa o hero estático.
  reduced.addEventListener('change', () => { if (reduced.matches) location.reload(); });
})();
