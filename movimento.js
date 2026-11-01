/* Movimento pela página: cada seção ganha um gesto diferente, todos ligados
   à rolagem (não ao relógio), para a página responder à mão de quem lê.
   - subir   cartões sobem e endireitam em sequência
   - deriva  fotos andam um pouco mais devagar que o texto (profundidade)
   - panorama a foto do especialista corre na horizontal com a rolagem
   - traço   os traços lime do método se desenham
   - crescer o título do fecho cresce até o tamanho final e para
   - frase   a citação se compõe palavra a palavra, uma vez
   - faixa   as marcas correm em faixa contínua (CSS)
   Cada elemento recebe --mv (0 entrando, 1 assentado) e --mvc (-1 a 1, a
   posição do centro na tela). O CSS lê só transform-like e opacity. Sem JS
   ou com movimento reduzido, nada disso roda e tudo aparece no estado final. */
(() => {
  'use strict';
  const query = new URLSearchParams(location.search);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || query.get('reduce') === '1' || query.has('t')) return;

  const devices = [
    ['.solution-card', 'subir'],
    ['.confidence-grid article', 'subir'],
    ['.guide-card', 'subir'],
    ['.method-steps li', 'traco'],
    ['.pillars > div', 'subir'],
    ['.solution-card figure', 'deriva'],
    ['.story-copy', 'deriva'],
    ['.specialist-photo', 'panorama'],
    ['.final-cta h2', 'crescer'],
  ];
  const items = [];
  devices.forEach(([selector, kind]) => {
    document.querySelectorAll(selector).forEach(el => {
      // Itens irmãos entram em cascata: cada um começa um pouco depois.
      const siblings = [...el.parentElement.children].filter(n => n.matches(selector));
      const order = Math.max(0, siblings.indexOf(el));
      el.dataset.mv = kind;
      items.push({ el, kind, lag: Math.min(order % 3, 3) * .12 });
    });
  });
  document.documentElement.classList.add('mv-on');

  const visible = new Set();
  let frame = 0;
  const clamp = v => Math.min(1, Math.max(0, v));
  const ease = t => 1 - Math.pow(1 - t, 3);

  function write() {
    frame = 0;
    const vh = innerHeight;
    visible.forEach(item => {
      const box = item.el.getBoundingClientRect();
      // 0 quando o topo encosta na base da tela, 1 quando chega a 55% dela.
      const raw = (vh - box.top) / (vh * .45);
      const mv = ease(clamp(raw - item.lag));
      const mvc = Math.max(-1, Math.min(1, ((box.top + box.height / 2) - vh / 2) / vh));
      item.el.style.setProperty('--mv', mv.toFixed(3));
      item.el.style.setProperty('--mvc', mvc.toFixed(3));
    });
  }
  const request = () => { if (!frame) frame = requestAnimationFrame(write); };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const item = items.find(i => i.el === entry.target);
      if (entry.isIntersecting) visible.add(item);
      else visible.delete(item);
    });
    request();
  }, { rootMargin: '10% 0px 10% 0px' });
  items.forEach(item => observer.observe(item.el));
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request);

  // A citação do especialista se compõe palavra a palavra quando aparece.
  const quote = document.querySelector('.specialist blockquote');
  if (quote) {
    const words = [];
    quote.childNodes.forEach(node => {
      if (node.nodeType !== 3) return;
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(part => {
        if (!part.trim()) { frag.append(part); return; }
        const span = document.createElement('span');
        span.className = 'mv-word';
        span.textContent = part;
        span.style.setProperty('--i', words.length);
        words.push(span);
        frag.append(span);
      });
      node.replaceWith(frag);
    });
    quote.classList.add('mv-quote');
    new IntersectionObserver((entries, obs) => {
      if (!entries[0].isIntersecting) return;
      quote.classList.add('is-in');
      obs.disconnect();
    }, { threshold: .6 }).observe(quote);
  }

  // Faixa de marcas: duplica cada grupo (cópia escondida de leitores de tela)
  // para a faixa correr sem emenda.
  document.querySelectorAll('.brand-grid').forEach((grid, i) => {
    const track = document.createElement('div');
    track.className = 'mv-track';
    track.style.setProperty('--dir', i % 2 ? 'reverse' : 'normal');
    const copy = grid.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.querySelectorAll('img').forEach(img => img.setAttribute('alt', ''));
    const rail = document.createElement('div');
    rail.className = 'mv-rail';
    grid.replaceWith(rail);
    rail.append(track);
    track.append(grid, copy);
  });

  reduced.addEventListener('change', () => { if (reduced.matches) location.reload(); });
})();
