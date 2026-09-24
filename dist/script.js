const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');

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

const ambient = document.querySelector('.ambient');
if (window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('pointermove', (event) => {
    ambient.style.left = `${event.clientX}px`;
    ambient.style.top = `${event.clientY}px`;
  });
}

const quiz = document.querySelector('.quiz');
const steps = [...document.querySelectorAll('.quiz-step')];
const progress = document.querySelector('.quiz-progress span');
const answers = [];

function showStep(index) {
  steps.forEach((step) => step.classList.remove('active'));
  steps[index].classList.add('active');
  quiz.dataset.step = String(index + 1);
  progress.style.width = index === 3 ? '100%' : `${((index + 1) / 3) * 100}%`;
}

document.querySelectorAll('.quiz-options button').forEach((button) => {
  button.addEventListener('click', () => {
    const currentStep = steps.findIndex((step) => step.classList.contains('active'));
    answers[currentStep] = button.dataset.value;
    if (currentStep < 2) {
      showStep(currentStep + 1);
      return;
    }
    const result = `${answers[0]} está no centro da sua decisão. O melhor ponto de partida é ${answers[1].toLowerCase()}, com uma abordagem ${answers[2].toLowerCase()}.`;
    document.querySelector('#result-text').textContent = 'Uma conversa consultiva pode transformar essas prioridades em um mapa claro de proteção.';
    document.querySelector('#result-summary').textContent = result;
    showStep(3);
  });
});

document.querySelector('.restart').addEventListener('click', () => {
  answers.length = 0;
  showStep(0);
});

document.querySelector('.copy-result').addEventListener('click', async (event) => {
  const button = event.currentTarget;
  const text = `Diagnóstico inicial Legatto\n• Foco: ${answers[0]}\n• Prioridade: ${answers[1]}\n• Preferência: ${answers[2]}`;
  try {
    await navigator.clipboard.writeText(text);
    button.firstChild.textContent = 'Resumo copiado ';
  } catch {
    button.firstChild.textContent = 'Selecione o resumo acima ';
  }
  setTimeout(() => { button.firstChild.textContent = 'Copiar resumo '; }, 2200);
});

document.querySelectorAll('.accordion details').forEach((detail) => {
  detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    document.querySelectorAll('.accordion details').forEach((other) => {
      if (other !== detail) other.open = false;
    });
  });
});

document.querySelector('#year').textContent = new Date().getFullYear();
