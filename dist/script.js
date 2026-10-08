const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const header = document.querySelector('.site-header');
const progressBar = document.querySelector('.scroll-progress span');

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
  navigation.classList.remove('open');
  document.body.classList.remove('menu-open');
}

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'Abrir menu' : 'Fechar menu');
  navigation.classList.toggle('open', !open);
  document.body.classList.toggle('menu-open', !open);
});

navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((item) => revealObserver.observe(item));

let scrollFrame;
function updateScrollEffects() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  header.classList.toggle('scrolled', window.scrollY > 42);
  scrollFrame = undefined;
}

window.addEventListener('scroll', () => {
  if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollEffects);
}, { passive: true });
updateScrollEffects();

const ambient = document.querySelector('.ambient');
if (ambient && window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('pointermove', (event) => {
    ambient.style.left = `${event.clientX}px`;
    ambient.style.top = `${event.clientY}px`;
  });
}

document.querySelectorAll('.accordion details').forEach((detail) => {
  detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    document.querySelectorAll('.accordion details').forEach((other) => {
      if (other !== detail) other.open = false;
    });
  });
});

document.querySelector('#year').textContent = new Date().getFullYear();

const priorityCopy = {
  familia: {
    text: 'Quando a renda sustenta os planos da família, olhar para a continuidade é uma forma de cuidado. Uma conversa pode ajudar a dimensionar esse cenário.',
    message: 'Olá, quero conversar sobre proteção financeira para minha família e minha renda.'
  },
  patrimonio: {
    text: 'Patrimônio também carrega escolhas, relações e futuro. Planejar proteção e sucessão com antecedência traz mais clareza para cada próximo passo.',
    message: 'Olá, quero conversar sobre proteção do meu patrimônio e planejamento sucessório.'
  },
  saude: {
    text: 'Saúde pede previsibilidade: rede, cobertura e custo precisam fazer sentido para a rotina de quem depende dessa escolha.',
    message: 'Olá, quero conversar sobre plano ou seguro saúde para a minha família.'
  },
  empresa: {
    text: 'Quando o negócio envolve pessoas e responsabilidades, proteção também é uma decisão de continuidade — para a operação e para quem a faz acontecer.',
    message: 'Olá, quero conversar sobre proteção, saúde e benefícios para a minha empresa.'
  }
};

const priorityResult = document.querySelector('#priority-result');
const priorityLink = document.querySelector('#priority-link');
document.querySelectorAll('[data-priority]').forEach((button) => {
  button.addEventListener('click', () => {
    const choice = priorityCopy[button.dataset.priority];
    document.querySelectorAll('[data-priority]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    priorityResult.textContent = choice.text;
    priorityLink.href = `https://wa.me/5511971371823?text=${encodeURIComponent(choice.message)}`;
    priorityLink.classList.add('active');
  });
});
