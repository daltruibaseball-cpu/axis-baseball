/**
 * The Blueprint — Book a Call landing page
 * Replace CALENDLY_URL with your Calendly scheduling link (e.g. https://calendly.com/your-username/30min)
 */
const CALENDLY_URL = 'https://calendly.com/andrew-theblueprinthitting';

const nav = document.getElementById('nav');
const navCta = document.getElementById('nav-cta');
const heroCta = document.getElementById('hero-cta');
const finalCtaBtn = document.getElementById('final-cta-btn');
const footerCta = document.getElementById('footer-cta');
const modal = document.getElementById('booking-modal');
const modalBackdrop = document.getElementById('modal-backdrop');
const modalClose = document.getElementById('modal-close');
const calendlyEmbed = document.getElementById('calendly-embed');

let calendlyInitialized = false;

function openModal() {
  modal.setAttribute('aria-hidden', 'false');
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  if (!calendlyInitialized && calendlyEmbed) {
    if (typeof window.Calendly !== 'undefined') {
      window.Calendly.initInlineWidget({
        url: CALENDLY_URL,
        parentElement: calendlyEmbed,
        prefill: {},
        utm: {},
        hideEventTypeDetails: true,
        hideLandingPageDetails: true,
        resize: true,
      });
    } else {
      var iframe = document.createElement('iframe');
      iframe.src = CALENDLY_URL;
      iframe.style.cssText = 'width:100%;height:630px;border:none;';
      iframe.title = 'Schedule a call';
      calendlyEmbed.appendChild(iframe);
    }
    calendlyInitialized = true;
  }
}

function closeModal() {
  modal.setAttribute('aria-hidden', 'true');
  modal.classList.remove('is-open');
  document.body.style.overflow = '';
}

function initNavScroll() {
  function updateNav() {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
}

function initCTAs() {
  [navCta, heroCta, finalCtaBtn, footerCta].forEach(function (el) {
    if (el) el.addEventListener('click', openModal);
  });
}

function initFooterYear() {
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function initModalClose() {
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
  if (modalClose) modalClose.addEventListener('click', closeModal);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

(function init() {
  initNavScroll();
  initCTAs();
  initModalClose();
  initSmoothScroll();
  initFooterYear();
})();
