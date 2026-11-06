const slides = Array.from(document.querySelectorAll('.slide'));
const previousButton = document.querySelector('#previous');
const nextButton = document.querySelector('#next');
const progress = document.querySelector('#progress');
const slideCount = document.querySelector('#slide-count');
const fullscreenButton = document.querySelector('#fullscreen');
let currentSlide = 0;
let zoom = 1;

function showSlide(index) {
  currentSlide = Math.max(0, Math.min(index, slides.length - 1));
  slides.forEach((slide, slideIndex) => {
    const active = slideIndex === currentSlide;
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', String(!active));
  });

  const displayIndex = String(currentSlide + 1).padStart(2, '0');
  const displayTotal = String(slides.length).padStart(2, '0');
  slideCount.textContent = `${displayIndex} / ${displayTotal}`;
  progress.style.width = `${((currentSlide + 1) / slides.length) * 100}%`;
  previousButton.disabled = currentSlide === 0;
  nextButton.disabled = currentSlide === slides.length - 1;
  const activeSlide = slides[currentSlide];
  if (activeSlide.id) {
    history.replaceState(null, '', `#${activeSlide.id}`);
  } else {
    history.replaceState(null, '', `#diapositiva-${currentSlide + 1}`);
  }
}

function setZoom(nextZoom) {
  zoom = Math.max(0.85, Math.min(1.2, nextZoom));
  document.documentElement.style.setProperty('--zoom', zoom.toFixed(2));
}

previousButton.addEventListener('click', () => showSlide(currentSlide - 1));
nextButton.addEventListener('click', () => showSlide(currentSlide + 1));
document.querySelector('#zoom-in').addEventListener('click', () => setZoom(zoom + 0.05));
document.querySelector('#zoom-out').addEventListener('click', () => setZoom(zoom - 0.05));

fullscreenButton.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.querySelector('.deck').requestFullscreen();
    }
  } catch (error) {
    console.error('No se pudo cambiar a pantalla completa.', error);
  }
});

document.addEventListener('fullscreenchange', () => {
  fullscreenButton.setAttribute('aria-label', document.fullscreenElement ? 'Salir de pantalla completa' : 'Ver en pantalla completa');
});

document.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;

  if (['ArrowRight', 'PageDown', ' '].includes(event.key)) {
    event.preventDefault();
    showSlide(currentSlide + 1);
  } else if (['ArrowLeft', 'PageUp'].includes(event.key)) {
    event.preventDefault();
    showSlide(currentSlide - 1);
  } else if (event.key === 'Home') {
    showSlide(0);
  } else if (event.key === 'End') {
    showSlide(slides.length - 1);
  } else if (event.key.toLowerCase() === 'f') {
    fullscreenButton.click();
  } else if (event.key === '+' || event.key === '=') {
    setZoom(zoom + 0.05);
  } else if (event.key === '-') {
    setZoom(zoom - 0.05);
  }
});

let touchStartX = 0;
document.querySelector('.slides').addEventListener('touchstart', (event) => {
  touchStartX = event.changedTouches[0].screenX;
}, { passive: true });

document.querySelector('.slides').addEventListener('touchend', (event) => {
  const deltaX = event.changedTouches[0].screenX - touchStartX;
  if (Math.abs(deltaX) > 60) showSlide(currentSlide + (deltaX < 0 ? 1 : -1));
}, { passive: true });

showSlide(0);
