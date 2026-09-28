'use strict';

/* ========================================================================
   PERSONALIZE AQUI — dados públicos da empresa, nunca chaves ou segredos.
   Deixe os campos vazios durante a montagem. Nenhum contato fictício é usado.
   WhatsApp: só dígitos, código do país + DDD + número (ex.: 55DD9XXXXXXXX).
   Endereço: inclua rua, número, bairro, cidade, estado, CEP e país para o mapa.
   Não há servidor, armazenamento de dados nem confirmação automática de visita.
   ======================================================================== */
const CONFIG = Object.freeze({
  marca: 'Fabrica de Móveis Cascavel',
  whatsapp: '556984498240',                   // Mantido exatamente como informado.
  telefoneExibicao: '+55 69 8449-8240',
  email: 'fabricademoveiscascavel@hotmail.com',
  endereco: 'Av. Fortaleza, 4250 - Centro, Rolim de Moura - RO, 76940-000',
  // Referência dos sábados: 03/10/2026 fechado; 10/10/2026 aberto.
  horario: 'Funcionamento: das 07h às 18h.\nApresentação de projetos: somente à tarde, das 13h30 às 18h.\nSábados alternados: 03/10/2026 fechado e 10/10/2026 aberto, seguindo a alternância semanal.',
  mensagemInicial: 'Olá! Gostaria de conversar sobre móveis planejados.'
});

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// 1. Dados da empresa. textContent evita tratar configuração como HTML.
$$('[data-brand]').forEach(element => { element.textContent = CONFIG.marca; });
$('.brand').setAttribute('aria-label', `${CONFIG.marca}, início`);
document.title = `${CONFIG.marca} — Móveis planejados em Rolim de Moura`;
$('#year').textContent = new Date().getFullYear();
const companyPhoneReady = /^[1-9]\d{9,14}$/.test(CONFIG.whatsapp);
if (companyPhoneReady) {
  const phoneLink = $('[data-phone-link]');
  phoneLink.textContent = CONFIG.telefoneExibicao || `+${CONFIG.whatsapp}`;
  phoneLink.href = `tel:+${CONFIG.whatsapp}`;
  const floating = $('#whatsapp-float');
  floating.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.mensagemInicial)}`;
  floating.target = '_blank';
  floating.rel = 'noopener noreferrer';
}
if (CONFIG.email) {
  $('[data-email-link]').textContent = CONFIG.email;
  $('[data-email-link]').href = `mailto:${CONFIG.email}`;
}
$$('[data-hours]').forEach(element => {
  element.hidden = !CONFIG.horario;
  if (CONFIG.horario) element.textContent = CONFIG.horario;
});
if (CONFIG.endereco) {
  $('[data-address]').textContent = CONFIG.endereco;
  const map = $('#location-map');
  map.src = `https://www.google.com/maps?q=${encodeURIComponent(CONFIG.endereco)}&output=embed`;
  map.hidden = false;
  $('#map-placeholder').hidden = true;
}

// 2. Imagens: reserva de espaço sem ícones de ficheiro partido.
// Ao colocar uma foto válida no src, ela cobre automaticamente o placeholder.
$$('.image-frame img').forEach(img => {
  const updateImage = () => {
    img.hidden = !img.naturalWidth;
    img.closest('.image-frame').classList.toggle('has-image', !!img.naturalWidth);
  };
  img.addEventListener('error', updateImage);
  img.addEventListener('load', updateImage);
  if (img.complete) updateImage();
});

// Vídeo decorativo: pausa acessível, respeito a movimento reduzido e fallback.
const heroVideo = $('#hero-video');
const videoToggle = $('#video-toggle');
if (heroVideo && videoToggle) {
let videoWanted = !reducedMotion.matches;
let heroInView = true;
heroVideo.muted = true;
heroVideo.autoplay = videoWanted;
if (!videoWanted) heroVideo.pause();
function updateVideoLabel() {
  videoToggle.textContent = heroVideo.paused ? 'Reproduzir vídeo' : 'Pausar vídeo';
}
function syncVideoPlayback() {
  if (videoWanted && heroInView && !document.hidden && !heroVideo.error) {
    // Autoplay pode ser bloqueado pelo navegador. O controle manual permanece.
    heroVideo.play().catch(updateVideoLabel);
  } else {
    heroVideo.pause();
  }
  updateVideoLabel();
}
function videoUnavailable() {
  heroVideo.pause();
  heroVideo.hidden = true;
  videoToggle.hidden = true;
}
function videoReady() {
  heroVideo.hidden = false;
  videoToggle.hidden = false;
  syncVideoPlayback();
}
heroVideo.addEventListener('canplay', videoReady);
heroVideo.addEventListener('play', updateVideoLabel);
heroVideo.addEventListener('pause', updateVideoLabel);
heroVideo.addEventListener('error', videoUnavailable);
$('source', heroVideo).addEventListener('error', videoUnavailable);
if (heroVideo.error || heroVideo.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) videoUnavailable();
else if (heroVideo.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) videoReady();
videoToggle.addEventListener('click', () => {
  videoWanted = heroVideo.paused;
  syncVideoPlayback();
});
reducedMotion.addEventListener('change', event => {
  if (event.matches) {
    videoWanted = false;
    heroVideo.autoplay = false;
    syncVideoPlayback();
  }
});
document.addEventListener('visibilitychange', syncVideoPlayback);
if ('IntersectionObserver' in window) {
  const videoObserver = new IntersectionObserver(entries => {
    heroInView = entries[0].isIntersecting;
    syncVideoPlayback();
  });
  videoObserver.observe(heroVideo.closest('.hero-visual'));
}

}

// 3. Header, menu móvel e âncoras. CSS cuida da rolagem suave e offset.
const header = $('.site-header');
const menuButton = $('.menu-toggle');
const navigation = $('#main-nav');
document.documentElement.classList.add('nav-enhanced');
const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 16);
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();
function closeMenu(restoreFocus = false) {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
  navigation.classList.remove('is-open');
  if (restoreFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  navigation.classList.toggle('is-open', open);
});
$$('a[href^="#"]').forEach(link => {
  link.addEventListener('click', () => {
    if (!link.getAttribute('href')?.startsWith('#')) return;
    closeMenu();
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    // Muda o foco junto com a navegação sem interferir no histórico da âncora.
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
document.addEventListener('click', event => {
  if (!header.contains(event.target)) closeMenu();
});
header.addEventListener('focusout', event => {
  if (event.relatedTarget && !header.contains(event.relatedTarget)) closeMenu();
});
window.matchMedia('(min-width: 1000px)').addEventListener('change', () => closeMenu());

// 4. Masonry estável: cada projeto ocupa linhas de 8px conforme sua altura.
const projectGrid = $('.portfolio-grid');
const projects = $$('.project');
function layoutMasonry() {
  const useMasonry = window.matchMedia('(min-width: 600px)').matches;
  projectGrid.classList.toggle('masonry-ready', useMasonry);
  projects.forEach(project => {
    if (project.hidden || !useMasonry) {
      project.style.removeProperty('grid-row-end');
      return;
    }
    const height = $('.project-open', project).getBoundingClientRect().height + 22;
    project.style.gridRowEnd = `span ${Math.ceil(height / 8)}`;
  });
}
let resizeFrame;
window.addEventListener('resize', () => {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(layoutMasonry);
}, { passive: true });
layoutMasonry();
$$('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    $$('[data-filter]').forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    const category = button.dataset.filter;
    projects.forEach(project => { project.hidden = category !== 'todos' && project.dataset.category !== category; });
    const count = projects.filter(project => !project.hidden).length;
    $('#filter-status').textContent = `${count} ${count === 1 ? 'projeto' : 'projetos'}`;
    layoutMasonry();
  });
});

// 5. Lightbox nativo: Escape, setas, foco restaurado e navegação no filtro atual.
const lightbox = $('#lightbox');
const lightboxImage = $('#lightbox-image');
let activeProject = 0;
let lastProjectButton = null;
const visibleProjects = () => projects.filter(project => !project.hidden);
function showProject(index) {
  const visible = visibleProjects();
  activeProject = (index + visible.length) % visible.length;
  const project = visible[activeProject];
  const source = $('img', project);
  const missing = source.complete && !source.naturalWidth;
  lightboxImage.hidden = missing;
  $('#lightbox-fallback').hidden = !missing;
  lightboxImage.alt = source.alt;
  if (missing) lightboxImage.removeAttribute('src');
  else lightboxImage.src = source.currentSrc || source.src;
  const title = $('figcaption > span', project).textContent.trim();
  $('#lightbox-caption').textContent = `${title} · ${activeProject + 1} / ${visible.length}`;
  const quoteLink = $('#lightbox-quote');
  const message = `Olá, vi o projeto ${title} e gostaria de um orçamento`;
  quoteLink.href = companyPhoneReady
    ? `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`
    : '#agendamento';
  quoteLink.target = companyPhoneReady ? '_blank' : '_self';
}
$('#lightbox-quote').addEventListener('click', () => {
  if (!companyPhoneReady) lightbox.close();
});
lightboxImage.addEventListener('error', () => {
  lightboxImage.hidden = true;
  $('#lightbox-fallback').hidden = false;
});
lightboxImage.addEventListener('load', () => {
  lightboxImage.hidden = false;
  $('#lightbox-fallback').hidden = true;
});
projects.forEach(project => {
  $('.project-open', project).addEventListener('click', event => {
    lastProjectButton = event.currentTarget;
    showProject(visibleProjects().indexOf(project));
    lightbox.showModal();
    document.body.classList.add('modal-open');
    $('.lightbox-close').focus();
  });
});
$('.lightbox-close').addEventListener('click', () => lightbox.close());
$('#lightbox-prev').addEventListener('click', () => showProject(activeProject - 1));
$('#lightbox-next').addEventListener('click', () => showProject(activeProject + 1));
lightbox.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showProject(activeProject + (event.key === 'ArrowLeft' ? -1 : 1));
  }
});
let backdropPointerDown = false;
lightbox.addEventListener('pointerdown', event => { backdropPointerDown = event.target === lightbox; });
lightbox.addEventListener('click', event => {
  if (event.target === lightbox && backdropPointerDown) lightbox.close();
});
lightbox.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  lastProjectButton?.focus();
});

// 6. Slider manual (sem autoplay): botões, teclado e gesto horizontal.
const slides = $$('.testimonial');
const slideDots = $$('[data-slide]');
let currentSlide = 0;
function setSlide(index, announce = true) {
  currentSlide = (index + slides.length) % slides.length;
  $('.slider-track').style.transform = `translateX(-${currentSlide * 100}%)`;
  slides.forEach((slide, i) => {
    slide.setAttribute('aria-hidden', String(i !== currentSlide));
    slide.inert = i !== currentSlide;
  });
  slideDots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === currentSlide)));
  if (announce) $('#slide-status').textContent = `Avaliação ${currentSlide + 1} de ${slides.length}`;
}
$('#slide-prev').addEventListener('click', () => setSlide(currentSlide - 1));
$('#slide-next').addEventListener('click', () => setSlide(currentSlide + 1));
slideDots.forEach(dot => dot.addEventListener('click', () => setSlide(Number(dot.dataset.slide))));
$('.slider').addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    setSlide(currentSlide + (event.key === 'ArrowLeft' ? -1 : 1));
  }
});
let touchStart = null;
$('.slider-viewport').addEventListener('touchstart', event => {
  touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
}, { passive: true });
$('.slider-viewport').addEventListener('touchend', event => {
  if (!touchStart) return;
  const dx = event.changedTouches[0].clientX - touchStart.x;
  const dy = event.changedTouches[0].clientY - touchStart.y;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) setSlide(currentSlide + (dx < 0 ? 1 : -1));
  touchStart = null;
}, { passive: true });
$('.slider-viewport').addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
setSlide(0, false);

// 7. Formulário: validação de formato, não comprovação de existência dos contatos.
const form = $('#booking-form');
const fields = $$('input, select', form);
const touched = new Set();
function normalizePhone(raw) {
  // Exige formato internacional para não presumir o país do cliente.
  return raw.trim().replace(/[\s().-]/g, '').replace(/^\+/, '');
}
function phoneIsValid(raw) {
  if (!/^\+?[\d\s().-]+$/.test(raw.trim())) return false;
  const digits = normalizePhone(raw);
  if (!/^[1-9]\d{9,14}$/.test(digits)) return false;
  // Para Brasil, exige DDD e celular de nove dígitos começando por 9.
  if (digits.startsWith('55')) return /^55[1-9]\d9\d{8}$/.test(digits);
  // Para Portugal, exige número móvel de nove dígitos começando por 9.
  if (digits.startsWith('351')) return /^3519\d{8}$/.test(digits);
  return true;
}
function errorFor(field) {
  const value = field.value.trim();
  if (!value) return field.tagName === 'SELECT' ? 'Selecione uma opção.' : 'Preencha este campo.';
  if (field.id === 'nome' && value.length < 2) return 'Informe seu nome com pelo menos 2 caracteres.';
  if (field.id === 'telefone' && !phoneIsValid(value)) return 'Informe um celular válido com país e DDD. Ex.: +55 11 99999-9999.';
  if (field.id === 'localidade' && value.length < 2) return 'Informe seu bairro e sua cidade.';
  if (!field.validity.valid) return 'Revise o valor deste campo.';
  return '';
}
function validateForm(showAll = false) {
  let valid = true;
  fields.forEach(field => {
    const error = errorFor(field);
    if (error) valid = false;
    if (showAll || touched.has(field.id)) {
      $(`#${field.id}-error`).textContent = error;
      field.setAttribute('aria-invalid', String(!!error));
    }
  });
  $('#booking-submit').disabled = !valid;
  $('#form-helper').textContent = valid ? 'Tudo certo. Continue para revisar seu pedido no WhatsApp.' : 'Preencha todos os campos com dados válidos para continuar.';
  return valid;
}
fields.forEach(field => {
  field.addEventListener('blur', () => { touched.add(field.id); validateForm(); });
  field.addEventListener('input', () => { $('#form-status').textContent = ''; validateForm(); });
  field.addEventListener('change', () => { touched.add(field.id); validateForm(); });
});
window.addEventListener('pageshow', () => validateForm());
document.addEventListener('visibilitychange', () => { if (!document.hidden) validateForm(); });
validateForm();
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!validateForm(true)) {
    fields.find(field => errorFor(field))?.focus();
    return;
  }
  if (!companyPhoneReady) {
    $('#form-status').textContent = 'O agendamento online ainda não está disponível. É necessário configurar o WhatsApp da marcenaria no script.js.';
    return;
  }
  const values = Object.fromEntries(new FormData(form));
  const message = [
    `Olá, ${CONFIG.marca}! Gostaria de solicitar uma visita de medição sem compromisso.`,
    '', `Nome: ${values.nome.trim()}`, `WhatsApp: +${normalizePhone(values.telefone)}`,
    `Bairro / Cidade: ${values.localidade.trim()}`, `Ambiente: ${values.ambiente}`,
    '', 'Podemos combinar os detalhes e uma visita pelo WhatsApp?'
  ].join('\n');
  // Navegação na mesma aba evita bloqueio de popup. O usuário ainda deve enviar.
  $('#form-status').textContent = 'Abrindo o WhatsApp. Envie a mensagem para concluir o pedido; a visita ainda depende de confirmação.';
  window.location.assign(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`);
});

// 8. Fade-in progressivo: fallback visível quando a API não existe.
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -25px 0px' });
  $$('.reveal').forEach(element => observer.observe(element));
  document.documentElement.classList.add('reveal-ready');
}
