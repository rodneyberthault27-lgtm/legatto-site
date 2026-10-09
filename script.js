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
let scrollFrame = false;
function updateProgress() {
  const range = document.documentElement.scrollHeight - innerHeight;
  progressBar.style.width = Math.min(100, Math.max(0, range > 0 ? scrollY / range * 100 : 0)) + '%';
  scrollFrame = false;
}
window.addEventListener('scroll', () => {
  if (scrollFrame) return;
  scrollFrame = true;
  requestAnimationFrame(updateProgress);
}, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();

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
