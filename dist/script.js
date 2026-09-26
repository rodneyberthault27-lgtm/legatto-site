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

document.querySelectorAll('.accordion details').forEach((detail) => {
  detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    document.querySelectorAll('.accordion details').forEach((other) => {
      if (other !== detail) other.open = false;
    });
  });
});

document.querySelector('#year').textContent = new Date().getFullYear();
