'use strict';

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
  navigation.classList.remove('open');
  document.body.classList.remove('menu-open');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  navigation.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 961px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

document.querySelectorAll('[data-whatsapp]').forEach(link => {
  link.href = 'https://wa.me/5511971371823?text=' + encodeURIComponent(link.dataset.whatsapp);
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.06 });
  document.documentElement.classList.add('motion-ready');
  document.querySelectorAll('.reveal').forEach(item => revealObserver.observe(item));
}
const progressBar = document.querySelector('.scroll-progress span');
// Onde o navegador tem scroll-driven animation, o CSS move a barra sozinho,
// fora da thread principal — nao registramos listener nenhum.
const progressoNativo = window.CSS
  && CSS.supports('animation-timeline: scroll()')
  && !reducedMotion.matches;
if (progressBar && !progressoNativo) {
  let scrollFrame = false;
  const updateProgress = () => {
    const range = document.documentElement.scrollHeight - innerHeight;
    const parte = range > 0 ? scrollY / range : 0;
    // transform em vez de width: o compositor resolve sem forcar layout
    progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, parte))})`;
    scrollFrame = false;
  };
  window.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = true;
    requestAnimationFrame(updateProgress);
  }, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
}

document.querySelectorAll('.accordion details').forEach(detail => {
  detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    document.querySelectorAll('.accordion details').forEach(other => {
      if (other !== detail) other.open = false;
    });
  });
});
document.querySelector('#year').textContent = new Date().getFullYear();

const priorityCopy = {
  auto: { text: 'Vamos conhecer seu veículo, seu perfil de uso e a proteção atual para comparar coberturas, franquias e assistências.', message: 'Olá, quero cotar ou renovar meu Seguro Auto com a Legatto.' },
  familia: { text: 'Vamos entender quem depende da sua renda, quais compromissos precisam continuar e o que você já tem protegido.', message: 'Olá, quero conversar sobre proteção financeira para minha família e minha renda.' },
  patrimonio: { text: 'Vamos conversar sobre seu patrimônio, seus objetivos de continuidade e as mudanças que podem pedir uma revisão.', message: 'Olá, quero conversar sobre proteção do meu patrimônio e planejamento sucessório.' },
  saude: { text: 'Vamos avaliar sua região, a rede que faz parte da sua rotina e as condições de um plano que atenda às suas necessidades.', message: 'Olá, quero conversar sobre plano ou seguro de saúde para minha família.' },
  empresa: { text: 'Vamos conhecer a operação, a equipe e as responsabilidades da empresa para organizar as prioridades de proteção e benefícios.', message: 'Olá, quero conversar sobre proteção, saúde e benefícios para minha empresa.' }
};
document.querySelectorAll('[data-priority]').forEach(button => {
  button.addEventListener('click', () => {
    const choice = priorityCopy[button.dataset.priority];
    document.querySelectorAll('[data-priority]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelector('#priority-result').textContent = choice.text;
    const link = document.querySelector('#priority-link');
    link.href = 'https://wa.me/5511971371823?text=' + encodeURIComponent(choice.message);
    link.classList.add('active');
  });
});

document.querySelectorAll('[data-guide]').forEach(button => {
  const dialog = document.getElementById(button.dataset.guide);
  button.addEventListener('click', () => {
    dialog.showModal();
    document.body.classList.add('dialog-open');
  });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    button.focus();
  });
});

/* === Web Interface Guidelines ===
   1. "URL reflects state" e "Deep-link all stateful UI": a prioridade
      escolhida e o guia aberto passam a viver na URL, entao o link pode
      ser compartilhado e o botao voltar funciona.
   2. O texto da secao promete "A escolha fica neste navegador", mas nada
      era guardado: recarregar perdia tudo. Agora guarda de verdade. */

(function () {
  var CHAVE = 'legatto:prioridade';

  function aplicarPrioridade(valor, comFoco) {
    var botao = document.querySelector('[data-priority="' + valor + '"]');
    if (!botao) return false;
    botao.click();
    if (comFoco) botao.focus({ preventScroll: true });
    return true;
  }

  // guarda a escolha e reflete na URL
  document.querySelectorAll('[data-priority]').forEach(function (botao) {
    botao.addEventListener('click', function () {
      var valor = botao.dataset.priority;
      try { sessionStorage.setItem(CHAVE, valor); } catch (e) {}
      var url = new URL(location.href);
      url.searchParams.set('prioridade', valor);
      history.replaceState(null, '', url);
    });
  });

  // restaura: a URL manda; sem ela, o que ficou guardado
  var daUrl = new URL(location.href).searchParams.get('prioridade');
  var guardado = null;
  try { guardado = sessionStorage.getItem(CHAVE); } catch (e) {}
  var restaurar = daUrl || guardado;
  if (restaurar) aplicarPrioridade(restaurar, false);

  /* O deep-link dos guias foi removido de proposito: abrir o dialogo a
     partir da URL o reabria a cada carregamento e deixava o evento close
     sem disparar, quebrando o retorno de foco. O ganho nao paga o risco. */
})();

/* === CORRECAO: a pagina parava de rolar depois de fechar um guia ===
   O handler original depende do evento 'close' do <dialog> para tirar
   .dialog-open do body. Medido no site no ar: esse evento nao dispara ao
   fechar pelo botao, entao a classe ficava e, com ela, overflow:hidden.
   Resultado: quem abrisse um guia e fechasse nao conseguia mais rolar a
   pagina ate recarregar.

   Em vez de depender do evento, a classe passa a ser derivada do estado
   real: existe algum <dialog> aberto ou nao. */
(function () {
  function sincronizar() {
    var algumAberto = !!document.querySelector('dialog[open]');
    document.body.classList.toggle('dialog-open', algumAberto);
  }

  document.querySelectorAll('dialog').forEach(function (dialogo) {
    dialogo.addEventListener('close', sincronizar);
    dialogo.addEventListener('cancel', function () { setTimeout(sincronizar, 0); });
    // rede de seguranca: qualquer clique dentro do dialogo (botao de
    // fechar ou fundo) revalida o estado logo depois
    dialogo.addEventListener('click', function () { setTimeout(sincronizar, 0); });
  });

  document.querySelectorAll('[data-guide]').forEach(function (botao) {
    botao.addEventListener('click', function () { setTimeout(sincronizar, 0); });
  });

  // o <dialog> nativo fecha com Escape sem passar por nenhum handler nosso
  document.addEventListener('keyup', function (e) {
    if (e.key === 'Escape') sincronizar();
  });
})();

/* === CAMADA DE MENSURACAO (brief 10) ===
   INERTE POR PADRAO. Nao envia nada, nao usa cookie, nao usa storage,
   nao carrega script de terceiro. Apenas acumula os eventos em memoria.

   Para ativar, e preciso DUAS acoes explicitas, feitas por quem tem
   autoridade para decidir sobre LGPD:
     window.LEGATTO_CONSENTIMENTO = true;
     window.LEGATTO_SINK = evento => { ... };   // onde enviar

   Sem as duas, os eventos ficam so em window.legattoEventos, acessiveis
   pelo console para conferencia, e somem ao fechar a aba. */
(function () {
  var MAX = 200;
  window.legattoEventos = [];

  function registrar(nome, dados) {
    var ev = Object.assign({ evento: nome, em: Date.now() }, dados || {});
    if (window.legattoEventos.length < MAX) window.legattoEventos.push(ev);
    var consentiu = window.LEGATTO_CONSENTIMENTO === true;
    var destino = typeof window.LEGATTO_SINK === 'function';
    if (consentiu && destino) {
      try { window.LEGATTO_SINK(ev); } catch (e) {}
    }
  }

  // origem de campanha, se vier na URL. Fica so em memoria.
  var p = new URLSearchParams(location.search);
  var origem = {};
  ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(function (k) {
    if (p.get(k)) origem[k] = p.get(k);
  });
  if (Object.keys(origem).length) registrar('origem_campanha', origem);

  // cliques em qualquer CTA marcado
  document.addEventListener('click', function (e) {
    var alvo = e.target.closest('[data-cta]');
    if (!alvo) return;
    registrar('clique_cta', {
      cta: alvo.dataset.cta,
      id: alvo.dataset.ctaId || alvo.dataset.service || null,
      whatsapp: /wa\.me/.test(alvo.getAttribute('href') || '')
    });
  }, { passive: true });

  // escolha de prioridade
  document.querySelectorAll('[data-priority]').forEach(function (b) {
    b.addEventListener('click', function () {
      registrar('prioridade_escolhida', { prioridade: b.dataset.priority });
    }, { passive: true });
  });

  // abertura de guia
  document.querySelectorAll('[data-guide]').forEach(function (b) {
    b.addEventListener('click', function () {
      registrar('guia_aberto', { guia: b.dataset.guide });
    }, { passive: true });
  });
})();
