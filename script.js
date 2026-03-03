// Navigation functionality (hamburger menu removed)

// Prefetch all same-origin HTML pages reachable from the current page (runs when idle)
(function prefetchNavigablePages() {
    function run() {
        var origin = location.origin;
        var currentPath = location.pathname.replace(/\/$/, '') || '/index.html';
        var urls = new Set();
        document.querySelectorAll('a[href]').forEach(function (a) {
            var href = (a.getAttribute('href') || '').trim();
            if (!href || href === '#' || href.indexOf('#') === 0) return;
            try {
                var url = new URL(href, location.href);
                if (url.origin !== origin) return;
                var path = url.pathname.replace(/\/$/, '') || '/index.html';
                if (path === currentPath) return;
                if (!/\.html$|\/$/.test(url.pathname)) return;
                urls.add(url.href);
            } catch (e) {}
        });
        urls.forEach(function (href) {
            var link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = href;
            document.head.appendChild(link);
        });
    }
    if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(run, { timeout: 2000 });
    } else {
        setTimeout(run, 500);
    }
})();

// Navbar logo link - redirect to home, do nothing if already on home page
const navLogoLink = document.getElementById('nav-logo-link');
if (navLogoLink) {
    navLogoLink.addEventListener('click', function(e) {
        const currentPage = window.location.pathname;
        const isHomePage = currentPage === '/' || currentPage.endsWith('index.html') || currentPage.endsWith('/');
        
        if (isHomePage) {
            e.preventDefault();
            // Optionally scroll to top if already on home page
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
        // If not on home page, allow default navigation
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Pathway button handler: scroll to quiz only for #contact; otherwise allow navigation. Any hero button click disables free-program popup.
let freeProgramPopupTimeoutId = null;

function disableFreeProgramPopup() {
    sessionStorage.setItem('freeProgramPopupShown', 'true');
    if (freeProgramPopupTimeoutId != null) {
        clearTimeout(freeProgramPopupTimeoutId);
        freeProgramPopupTimeoutId = null;
    }
}

document.querySelectorAll('.pathway-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
        disableFreeProgramPopup();
        const href = this.getAttribute('href') || '';
        if (href === '#contact') {
            e.preventDefault();
            const contactSection = document.querySelector('#contact');
            if (contactSection) {
                const offsetTop = contactSection.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                setTimeout(() => {
                    const firstOption = document.querySelector('#quiz-wrapper .quiz-slide[data-step="1"] .quiz-option');
                    if (firstOption) firstOption.focus({ preventScroll: true });
                }, 800);
            }
        }
    });
});

// Nav "Get Started" button: same popup-disabling behavior as hero buttons
const navGetStarted = document.querySelector('.nav-btn-primary');
if (navGetStarted) {
    navGetStarted.addEventListener('click', function () {
        disableFreeProgramPopup();
    });
}

// Navbar shadow and darkening on scroll
function updateNavbar() {
    const navbar = document.querySelector('.navbar');
    // Check for both home page hero and landing page hero
    const hero = document.querySelector('.hero') || document.querySelector('.lp-hero');
    const heroPathways = document.querySelector('.hero-pathways');
    
    if (!hero) return;
    
    const navbarBottom = window.scrollY + navbar.offsetHeight;
    const heroContent = document.querySelector('.hero-content');
    const heroContentBottom = heroContent ? heroContent.offsetTop + heroContent.offsetHeight : 0;
    
    // Add shadow and blur when scrolling
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        navbar.style.backdropFilter = 'blur(10px)';
        navbar.style.webkitBackdropFilter = 'blur(10px)';
    } else {
        navbar.style.boxShadow = 'none';
        navbar.style.backdropFilter = 'none';
        navbar.style.webkitBackdropFilter = 'none';
    }
    
    // Darken navbar when over white backgrounds:
    // 1. When over pathway cards (within hero section) - home page only
    // 2. When past the entire hero section
    // 3. When scrolling starts on free program page (lp-hero)
    let shouldDarken = false;
    
    // For free program page, darken when scrolling starts
    if (hero.classList.contains('lp-hero')) {
        if (window.scrollY > 50) {
            shouldDarken = true;
        }
    } else if (heroPathways) {
        // Home page: check pathway cards
        const pathwaysTop = heroPathways.offsetTop;
        const pathwaysBottom = pathwaysTop + heroPathways.offsetHeight;
        // Check if navbar is over the pathway cards area
        if (navbarBottom > pathwaysTop && window.scrollY < pathwaysBottom) {
            shouldDarken = true;
        }
    }
    
    // Also darken when past the entire hero section
    const heroBottom = hero.offsetTop + hero.offsetHeight;
    if (navbarBottom > heroBottom) {
        shouldDarken = true;
    }
    
    if (shouldDarken) {
        navbar.classList.add('darkened');
    } else {
        navbar.classList.remove('darkened');
    }
}

window.addEventListener('scroll', updateNavbar);
// Check on page load
window.addEventListener('load', updateNavbar);
// Check immediately in case page is already loaded
if (document.readyState === 'complete') {
    updateNavbar();
} else {
    document.addEventListener('DOMContentLoaded', updateNavbar);
}

// Stripe Configuration - Inline Payment Element
// Get your publishable key from: https://dashboard.stripe.com/apikeys
// Set STRIPE_SECRET_KEY in Netlify: Site settings > Environment variables
const STRIPE_CONFIG = {
    publishableKey: 'pk_test_51SwUOZABjYMF0pjPeLcxesR0sFQPFseqy09Jr9KL80eAT8nqlqOEEdKUo4aoHpGnXsUpQeb0mXwTks4fXkEBUJxr00RaL57ssM' // Replace with your Stripe publishable key
};

// Get Started Quiz: state and DOM (6 steps; step 6 = Calendly)
const QUIZ_STEPS = 6;
const CALENDLY_BASE_URL = 'https://calendly.com/daltruibaseball/30min?hide_event_type_details=1&hide_gdpr_banner=1&primary_color=1a5195';
const quizWrapper = document.getElementById('quiz-wrapper');
const quizProgressText = document.getElementById('quiz-progress-text');
const quizProgressFill = document.getElementById('quiz-progress-fill');
const q2Label = document.getElementById('q2-label');
const q3Label = document.getElementById('q3-label');
const q5Label = document.getElementById('q5-label');
const quizNameLabel = document.getElementById('quiz-name-label');
const quizAthleteNameWrap = document.getElementById('quiz-athlete-name-wrap');
const quizNextStep5 = document.getElementById('quiz-next-step5');

let quizState = {
    step: 1,
    isParent: false,
    role: '',
    level: '',
    focus: [],  // array for multi-select (step 3)
    name: '',
    athleteName: '',
    email: '',
    phone: '',
    readiness: ''
};

function getQuizSlides() {
    return quizWrapper ? Array.from(quizWrapper.querySelectorAll('.quiz-slide')) : [];
}

function showQuizStep(step) {
    const slides = getQuizSlides();
    slides.forEach(slide => {
        const s = parseInt(slide.getAttribute('data-step'), 10);
        if (s === step) {
            slide.removeAttribute('hidden');
            slide.setAttribute('aria-current', 'step');
        } else {
            slide.setAttribute('hidden', '');
            slide.removeAttribute('aria-current');
        }
    });
    if (quizProgressText) quizProgressText.textContent = step + ' of ' + QUIZ_STEPS;
    if (quizProgressFill) quizProgressFill.style.width = (step / QUIZ_STEPS * 100) + '%';
}

function updateParentWording() {
    if (quizState.isParent) {
        if (q2Label) q2Label.textContent = 'What is the athlete\'s level of play?';
        if (q3Label) q3Label.textContent = 'What do you want your athlete to work on?';
        if (q5Label) q5Label.textContent = 'How ready is your athlete to commit to training?';
        if (quizNameLabel) quizNameLabel.textContent = 'Your name (parent)';
        if (quizAthleteNameWrap) {
            quizAthleteNameWrap.removeAttribute('hidden');
            const inp = document.getElementById('quiz-athlete-name');
            if (inp) inp.setAttribute('required', '');
        }
    } else {
        if (q2Label) q2Label.textContent = 'What is your level of play?';
        if (q3Label) q3Label.textContent = 'What do you need to work on?';
        if (q5Label) q5Label.textContent = 'How ready are you to commit to training?';
        if (quizNameLabel) quizNameLabel.textContent = 'Your name';
        if (quizAthleteNameWrap) {
            quizAthleteNameWrap.setAttribute('hidden', '');
            const inp = document.getElementById('quiz-athlete-name');
            if (inp) inp.removeAttribute('required');
        }
    }
}

function initCalendlyWithPrefill(fullName, email, phone) {
    const container = document.getElementById('quiz-calendly-container');
    if (!container) return;
    container.innerHTML = '';
    const name = (fullName || '').trim();
    const emailVal = (email || '').trim();
    const phoneVal = (phone || '').trim();
    const parts = name ? name.split(/\s+/) : [];
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    const prefill = {
        name: name,
        email: emailVal
    };
    if (firstName) prefill.firstName = firstName;
    if (lastName) prefill.lastName = lastName;

    let url = CALENDLY_BASE_URL;
    if (phoneVal) {
        const sep = url.indexOf('?') >= 0 ? '&' : '?';
        url = url + sep + 'location=' + encodeURIComponent(phoneVal);
    }

    function tryInit() {
        if (typeof window.Calendly === 'undefined') {
            setTimeout(tryInit, 150);
            return;
        }
        window.Calendly.initInlineWidget({
            url: url,
            parentElement: container,
            prefill: prefill,
            utm: {}
        });
    }
    tryInit();
}

if (quizWrapper) {
    const slides = getQuizSlides();

    // Step 3 is multi-select; others are single-select with optional auto-advance
    const slide3 = document.getElementById('quiz-slide-3');
    const step3Options = slide3 ? slide3.querySelectorAll('.quiz-option[data-value]') : [];

    step3Options.forEach(opt => {
        opt.addEventListener('click', function () {
            this.classList.toggle('selected');
            const selected = slide3.querySelectorAll('.quiz-option.selected');
            quizState.focus = Array.from(selected).map(o => o.getAttribute('data-value'));
        });
    });

    function advanceToNextStep() {
        if (quizState.step >= QUIZ_STEPS) return;
        quizState.step++;
        showQuizStep(quizState.step);
        const nextSlide = slides.find(s => parseInt(s.getAttribute('data-step'), 10) === quizState.step);
        if (nextSlide) {
            const backBtn = nextSlide.querySelector('.quiz-back');
            if (backBtn) backBtn.disabled = quizState.step === 1;
        }
    }

    slides.forEach(slide => {
        const step = parseInt(slide.getAttribute('data-step'), 10);
        if (step === 3) return; // handled above as multi-select
        const options = slide.querySelectorAll('.quiz-option[data-value]');
        options.forEach(opt => {
            opt.addEventListener('click', function () {
                options.forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
                const val = this.getAttribute('data-value');
                if (step === 1) {
                    quizState.role = val;
                    quizState.isParent = val === 'parent';
                    updateParentWording();
                } else if (step === 2) quizState.level = val;
                else if (step === 4) quizState.readiness = val;

                // Auto-advance for single-choice questions (1, 2, 4 = readiness)
                if (step === 1 || step === 2 || step === 4) {
                    setTimeout(advanceToNextStep, 400);
                }
            });
        });
    });

    // Back buttons
    quizWrapper.querySelectorAll('.quiz-back').forEach(btn => {
        btn.addEventListener('click', function () {
            if (quizState.step <= 1) return;
            quizState.step--;
            showQuizStep(quizState.step);
            const slide = slides.find(s => parseInt(s.getAttribute('data-step'), 10) === quizState.step);
            if (slide) {
                const backBtn = slide.querySelector('.quiz-back');
                if (backBtn) backBtn.disabled = quizState.step === 1;
            }
        });
    });

    // Next buttons (with required validation per step)
    quizWrapper.querySelectorAll('.quiz-next').forEach(btn => {
        btn.addEventListener('click', async function () {
            if (quizState.step === 1 && !quizState.role) return;
            if (quizState.step === 2 && !quizState.level) return;
            if (quizState.step === 3) {
                if (!quizState.focus || quizState.focus.length === 0) {
                    const slide3El = document.getElementById('quiz-slide-3');
                    if (slide3El) slide3El.querySelector('.quiz-options')?.focus();
                    return;
                }
            }
            if (quizState.step === 4 && !quizState.readiness) return;

            if (quizState.step === 5) {
                const nameEl = document.getElementById('quiz-name');
                const emailEl = document.getElementById('quiz-email');
                if (nameEl) quizState.name = nameEl.value.trim();
                if (emailEl) quizState.email = emailEl.value.trim();
                const phoneEl = document.getElementById('quiz-phone');
                const athleteEl = document.getElementById('quiz-athlete-name');
                if (phoneEl) quizState.phone = phoneEl.value.trim();
                if (athleteEl) quizState.athleteName = athleteEl.value.trim();
                if (!quizState.name || !quizState.email) {
                    if (!quizState.name && nameEl) nameEl.focus();
                    else if (!quizState.email && emailEl) emailEl.focus();
                    return;
                }
                const nextBtn = this;
                const originalText = nextBtn.textContent;
                nextBtn.textContent = 'Saving...';
                nextBtn.disabled = true;
                const params = new URLSearchParams();
                params.set('form-name', 'get-started-quiz');
                params.set('role', quizState.role || '');
                params.set('level', quizState.level || '');
                params.set('focus', Array.isArray(quizState.focus) ? quizState.focus.join(', ') : (quizState.focus || ''));
                params.set('name', quizState.name || '');
                params.set('email', quizState.email || '');
                params.set('phone', quizState.phone || '');
                params.set('readiness', quizState.readiness || '');
                if (quizState.athleteName) params.set('athlete-name', quizState.athleteName);
                try {
                    const response = await fetch('/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: params.toString()
                    });
                    if (!response.ok) throw new Error('Form submission failed');
                } catch (err) {
                    alert('There was an error saving your information. Please try again.');
                    nextBtn.textContent = originalText;
                    nextBtn.disabled = false;
                    return;
                }
                nextBtn.textContent = originalText;
                nextBtn.disabled = false;
                quizState.step = 6;
                showQuizStep(6);
                const slide6 = slides.find(s => parseInt(s.getAttribute('data-step'), 10) === 6);
                if (slide6) {
                    const backBtn = slide6.querySelector('.quiz-back');
                    if (backBtn) backBtn.disabled = false;
                }
                initCalendlyWithPrefill(quizState.name, quizState.email, quizState.phone);
                return;
            }

            if (quizState.step >= QUIZ_STEPS) return;
            quizState.step++;
            showQuizStep(quizState.step);
            const nextSlide = slides.find(s => parseInt(s.getAttribute('data-step'), 10) === quizState.step);
            if (nextSlide) {
                const backBtn = nextSlide.querySelector('.quiz-back');
                if (backBtn) backBtn.disabled = quizState.step === 1;
            }
        });
    });

    showQuizStep(1);
    const firstBack = quizWrapper.querySelector('.quiz-slide[data-step="1"] .quiz-back');
    if (firstBack) firstBack.disabled = true;
}

// Landing page opt-in form handler
const lpOptinForm = document.querySelector('#lp-optin-form');
if (lpOptinForm) {
    lpOptinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(lpOptinForm);
        const submitButton = lpOptinForm.querySelector('.lp-form-submit');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        
        try {
            // Submit to Netlify Forms
            const response = await fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            });
            
            if (response.ok) {
                // Store form data for pre-filling upsell form
                sessionStorage.setItem('freeProgramName', formData.get('name') || '');
                sessionStorage.setItem('freeProgramEmail', formData.get('email') || '');
                sessionStorage.setItem('freeProgramPhone', formData.get('phone') || '');
                // Redirect to upsell page
                window.location.href = 'inseason-power-program.html';
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            alert('There was an error submitting your form. Please try again.');
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });
}

// Show mockup or input fields based on whether visitor came from free program
const upsellInputFields = document.getElementById('upsell-input-fields');
const upsellMockupContainer = document.getElementById('upsell-mockup-container');
const hasFreeProgramData = sessionStorage.getItem('freeProgramName') && sessionStorage.getItem('freeProgramEmail');

// Pre-fill upsell form from sessionStorage (always populate hidden inputs, even when mockup is shown)
const upsellNameInput = document.getElementById('upsell-name');
const upsellEmailInput = document.getElementById('upsell-email');
const upsellPhoneInput = document.getElementById('upsell-phone');

if (upsellNameInput && sessionStorage.getItem('freeProgramName')) {
    upsellNameInput.value = sessionStorage.getItem('freeProgramName');
}
if (upsellEmailInput && sessionStorage.getItem('freeProgramEmail')) {
    upsellEmailInput.value = sessionStorage.getItem('freeProgramEmail');
}
if (upsellPhoneInput && sessionStorage.getItem('freeProgramPhone')) {
    upsellPhoneInput.value = sessionStorage.getItem('freeProgramPhone');
}

if (hasFreeProgramData) {
    // Hide input fields, show mockup
    if (upsellInputFields) upsellInputFields.style.display = 'none';
    if (upsellMockupContainer) upsellMockupContainer.style.display = 'block';
} else {
    // Show input fields, hide mockup
    if (upsellInputFields) upsellInputFields.style.display = 'flex';
    if (upsellMockupContainer) upsellMockupContainer.style.display = 'none';
}

// Full program form - Inline Stripe Payment Element (or full-power-checkout page)
const fullProgramForm = document.querySelector('#full-program-form');
const upgradeTriggerBtn = document.getElementById('upgrade-trigger-btn');
const upgradeTriggerBtnMockup = document.getElementById('upgrade-trigger-btn-mockup');
const fullPowerCheckoutBtn = document.getElementById('full-power-checkout-btn');
const stripePaymentExpander = document.getElementById('stripe-payment-expander');
const paymentElementContainer = document.getElementById('payment-element-container');
const linkAuthenticationElementContainer = document.getElementById('link-authentication-element-container');
const payButton = document.getElementById('pay-button');
const paymentMessage = document.getElementById('payment-message');
const isFullPowerCheckoutPage = !!fullPowerCheckoutBtn && !fullProgramForm;

let stripe = null;
let elements = null;
let paymentElement = null;
let linkAuthenticationElement = null;
let paymentElementReady = false;

function shouldPreloadPaymentElement() {
    if (isFullPowerCheckoutPage) return true;
    if (fullProgramForm && hasFreeProgramData && stripePaymentExpander && paymentElementContainer) return true;
    return false;
}

function getPaymentElementOptions() {
    var opts = { layout: 'tabs' };
    if (isFullPowerCheckoutPage) {
        opts.fields = { billingDetails: { name: 'auto', address: 'auto' } };
    }
    return opts;
}

function mountLinkAuthenticationElementIfNeeded() {
    if (!linkAuthenticationElementContainer || !elements) return;
    if (linkAuthenticationElement) {
        try { linkAuthenticationElement.unmount(); } catch (e) {}
        linkAuthenticationElement = null;
    }
    linkAuthenticationElement = elements.create('linkAuthentication');
    linkAuthenticationElement.mount('#link-authentication-element-container');
}

function maybePreloadPaymentElement() {
    if (!shouldPreloadPaymentElement()) return;
    if (!STRIPE_CONFIG.publishableKey || STRIPE_CONFIG.publishableKey === 'pk_test_YOUR_KEY') return;

    var preloadEmail = isFullPowerCheckoutPage ? '' : (sessionStorage.getItem('freeProgramEmail') || '');
    var preloadName = isFullPowerCheckoutPage ? '' : (sessionStorage.getItem('freeProgramName') || '');

    var baseUrl = window.location.origin;
    fetch(baseUrl + '/.netlify/functions/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: preloadEmail.trim(), name: preloadName.trim() })
    })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (data.error || !data.clientSecret) return;
            stripe = Stripe(STRIPE_CONFIG.publishableKey);
            var appearance = {
                theme: 'night',
                variables: {
                    colorPrimary: '#5BA3E8',
                    colorBackground: '#1a1a2e',
                    colorText: '#ffffff',
                    colorDanger: '#ff6b35',
                    borderRadius: '8px'
                }
            };
            elements = stripe.elements({ clientSecret: data.clientSecret, appearance });
            if (linkAuthenticationElementContainer) mountLinkAuthenticationElementIfNeeded();
            paymentElement = elements.create('payment', getPaymentElementOptions());
            paymentElement.mount('#payment-element-container');
            paymentElementReady = true;
        })
        .catch(function () { /* silent fail - user gets normal flow on click */ });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', maybePreloadPaymentElement);
} else {
    maybePreloadPaymentElement();
}

/**
 * Scrolls the payment terminal to the top of the viewport while the slide-down animation is happening.
 * Scrolls immediately so it animates in parallel with the dropdown expansion.
 */
function scheduleScrollToPaymentTerminal(expanderEl) {
    if (!expanderEl) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Use requestAnimationFrame to ensure the expanded class has been applied and browser has started the transition
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            expanderEl.scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
                block: 'start'
            });
        });
    });
}

async function initializeStripePayment() {
    // Get values from inputs or sessionStorage (for mockup view) - skip on full-power-checkout page
    let name = '';
    let email = '';
    if (!isFullPowerCheckoutPage) {
        const nameInput = document.getElementById('upsell-name');
        const emailInput = document.getElementById('upsell-email');

        if (nameInput && emailInput) {
            name = nameInput.value.trim();
            email = emailInput.value.trim();
        }

        // If inputs are hidden (mockup view), get from sessionStorage
        if (!name || !email) {
            name = sessionStorage.getItem('freeProgramName') || '';
            email = sessionStorage.getItem('freeProgramEmail') || '';
        }

        if (!name || !email) {
            if (fullProgramForm) {
                fullProgramForm.reportValidity();
            }
            return;
        }

        // Ensure hidden inputs have values for form submission
        if (nameInput) nameInput.value = name;
        if (emailInput) emailInput.value = email;
        const phoneInput = document.getElementById('upsell-phone');
        if (phoneInput && !phoneInput.value) {
            phoneInput.value = sessionStorage.getItem('freeProgramPhone') || '';
        }
    }

    if (!STRIPE_CONFIG.publishableKey || STRIPE_CONFIG.publishableKey === 'pk_test_YOUR_KEY') {
        if (stripePaymentExpander) {
            stripePaymentExpander.classList.add('expanded');
            stripePaymentExpander.setAttribute('aria-hidden', 'false');
            scheduleScrollToPaymentTerminal(stripePaymentExpander);
        }
        if (paymentMessage) paymentMessage.textContent = 'Payment system not configured. Please contact support.';
        if (paymentMessage) paymentMessage.classList.add('error');
        return;
    }

    const triggerBtn = upgradeTriggerBtn || upgradeTriggerBtnMockup || fullPowerCheckoutBtn;

    if (paymentElementReady && stripe && elements && stripePaymentExpander && payButton) {
        stripePaymentExpander.classList.add('expanded');
        stripePaymentExpander.setAttribute('aria-hidden', 'false');
        scheduleScrollToPaymentTerminal(stripePaymentExpander);
        payButton.disabled = false;
        if (paymentMessage) {
            paymentMessage.textContent = '';
            paymentMessage.classList.remove('error', 'success');
        }
        return;
    }

    if (triggerBtn) {
        triggerBtn.textContent = 'Loading...';
        triggerBtn.disabled = true;
    }

    try {
        const baseUrl = window.location.origin;
        const response = await fetch(`${baseUrl}/.netlify/functions/create-payment-intent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: isFullPowerCheckoutPage ? '' : email.trim(),
                name: isFullPowerCheckoutPage ? '' : name.trim()
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);
        if (!data.clientSecret) throw new Error('No client secret received');

        stripe = Stripe(STRIPE_CONFIG.publishableKey);
        const appearance = {
            theme: 'night',
            variables: {
                colorPrimary: '#5BA3E8',
                colorBackground: '#1a1a2e',
                colorText: '#ffffff',
                colorDanger: '#ff6b35',
                borderRadius: '8px'
            }
        };
        if (linkAuthenticationElement) {
            try { linkAuthenticationElement.unmount(); } catch (e) {}
            linkAuthenticationElement = null;
        }
        if (paymentElement) {
            try { paymentElement.unmount(); } catch (e) {}
            paymentElement = null;
        }
        elements = stripe.elements({ clientSecret: data.clientSecret, appearance });
        if (linkAuthenticationElementContainer) mountLinkAuthenticationElementIfNeeded();
        paymentElement = elements.create('payment', getPaymentElementOptions());
        paymentElement.mount('#payment-element-container');

        if (stripePaymentExpander) {
            stripePaymentExpander.classList.add('expanded');
            stripePaymentExpander.setAttribute('aria-hidden', 'false');
            scheduleScrollToPaymentTerminal(stripePaymentExpander);
        }
        payButton.disabled = false;
        paymentMessage.textContent = '';
        paymentMessage.classList.remove('error', 'success');
    } catch (err) {
        paymentMessage.textContent = err.message || 'Unable to load payment form. Please try again.';
        paymentMessage.classList.add('error');
    } finally {
        if (triggerBtn) {
            triggerBtn.textContent = 'Upgrade to Full Program - $27';
            triggerBtn.disabled = false;
        }
    }
}

async function confirmStripePayment() {
    if (!stripe || !elements) return;

    let name = '', email = '', phone = '';
    if (fullProgramForm) {
        const formData = new FormData(fullProgramForm);
        name = formData.get('name') || '';
        email = formData.get('email') || '';
        phone = formData.get('phone') || '';
    }

    sessionStorage.setItem('paymentPendingName', name);
    sessionStorage.setItem('paymentPendingEmail', email);
    sessionStorage.setItem('paymentPendingPhone', phone);
    sessionStorage.setItem('paymentPendingProgram', 'Full In-Season Power Program');

    payButton.disabled = true;
    paymentMessage.textContent = 'Processing...';
    paymentMessage.classList.remove('error', 'success');

    const returnUrl = new URL('payment-success.html', window.location.href).href;

    const confirmParams = { return_url: returnUrl };
    if (email) confirmParams.receipt_email = email;
    if (name || email || phone) {
        confirmParams.payment_method_data = {
            billing_details: {
                name: name || undefined,
                email: email || undefined,
                phone: phone || undefined
            }
        };
    }

    const { error } = await stripe.confirmPayment({
        elements,
        confirmParams
    });

    if (error) {
        paymentMessage.textContent = error.message || 'Payment failed. Please try again.';
        paymentMessage.classList.add('error');
        payButton.disabled = false;
    }
}

if (upgradeTriggerBtn) {
    upgradeTriggerBtn.addEventListener('click', initializeStripePayment);
}
if (upgradeTriggerBtnMockup) {
    upgradeTriggerBtnMockup.addEventListener('click', initializeStripePayment);
}
if (fullPowerCheckoutBtn) {
    fullPowerCheckoutBtn.addEventListener('click', initializeStripePayment);
}
if (payButton) {
    payButton.addEventListener('click', confirmStripePayment);
}

// Free Program Sending popup (decline upsell): show popup, no auto-close; user closes via X or click outside
const declineUpsellBtn = document.getElementById('decline-upsell');
const processingPopup = document.getElementById('free-program-processing-popup');
const processingPopupMessage = document.getElementById('processing-popup-message');
const processingPopupSpinner = document.getElementById('processing-popup-spinner');
const processingPopupCloseBtn = document.getElementById('processing-popup-close');

function showProcessingPopup(message, showSpinner = true) {
    if (processingPopupMessage) processingPopupMessage.textContent = message;
    if (processingPopupSpinner) {
        if (showSpinner) processingPopupSpinner.classList.remove('hidden');
        else processingPopupSpinner.classList.add('hidden');
    }
    if (processingPopup) {
        processingPopup.style.display = 'flex';
        processingPopup.classList.add('show');
        processingPopup.setAttribute('aria-hidden', 'false');
    }
}

function hideProcessingPopup() {
    if (processingPopup) {
        processingPopup.style.display = 'none';
        processingPopup.classList.remove('show');
        processingPopup.setAttribute('aria-hidden', 'true');
    }
}

function setupProcessingPopupClose() {
    if (processingPopupCloseBtn) {
        processingPopupCloseBtn.addEventListener('click', function () {
            hideProcessingPopup();
        });
    }
    if (processingPopup) {
        processingPopup.addEventListener('click', function (e) {
            if (e.target === processingPopup) hideProcessingPopup();
        });
    }
}

/** Purely UI: always shows the processing/upsell popup. No form submission, validation, or async coupling. */
function handleDeclineUpsellClick() {
    const defaultMessage = 'Your free primer is on the way. Make sure to check spam and promotions folders.';
    showProcessingPopup(defaultMessage, true);
}

if (processingPopup) {
    setupProcessingPopupClose();
}

if (declineUpsellBtn) {
    declineUpsellBtn.addEventListener('click', function () {
        handleDeclineUpsellClick();
    });
}

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe service cards, testimonial cards, pathway cards, and lp-cards (landing pages)
const cards = document.querySelectorAll('.service-card, .testimonial-card, .pathway-card, .lp-card');
cards.forEach((card) => {
    // Cards start hidden via CSS, no need to set inline styles
    const isMobile = window.innerWidth <= 768;
    if (card.classList.contains('pathway-featured') && isMobile) {
        card.style.transform = 'translateY(20px)';
    }
    observer.observe(card);
});

// Free Program Popup - Show after 10 seconds
const popup = document.getElementById('free-program-popup');
const popupClose = document.getElementById('popup-close');

if (popup && popupClose) {
    // Check if popup was already shown in this session
    const popupShown = sessionStorage.getItem('freeProgramPopupShown');
    
    if (!popupShown) {
        freeProgramPopupTimeoutId = setTimeout(() => {
            popup.classList.add('show');
            sessionStorage.setItem('freeProgramPopupShown', 'true');
            freeProgramPopupTimeoutId = null;
        }, 8000); // 8 seconds
    }
    
    // Close popup when X is clicked
    popupClose.addEventListener('click', () => {
        popup.classList.remove('show');
    });
    
    // Close popup when clicking outside
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.classList.remove('show');
        }
    });
    
    // Close popup with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popup.classList.contains('show')) {
            popup.classList.remove('show');
        }
    });
    
    // Handle popup form submission
    const popupForm = document.getElementById('popup-form');
    if (popupForm) {
        popupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(popupForm);
            const submitButton = popupForm.querySelector('.popup-btn');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            try {
                // Submit to Netlify Forms
                const response = await fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(formData).toString()
                });
                
                if (response.ok) {
                    // Store form data for pre-filling upsell form
                    const name = formData.get('name') || '';
                    const email = formData.get('email') || '';
                    const phone = formData.get('phone') || '';
                    
                    sessionStorage.setItem('freeProgramName', name);
                    sessionStorage.setItem('freeProgramEmail', email);
                    sessionStorage.setItem('freeProgramPhone', phone);
                    
                    // Redirect to paid program upsell page
                    window.location.href = 'inseason-power-program.html';
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                alert('There was an error submitting your form. Please try again.');
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        });
    }
}

// "See More" for pathway cards: featured = redirect to 1-on-1 page; others = toggle features. Any click disables popup.
document.querySelectorAll('.pathway-see-more').forEach(button => {
    button.addEventListener('click', function(e) {
        disableFreeProgramPopup();
        // Check if this button is in the featured card (1-on-1 coaching)
        const card = this.closest('.pathway-card');
        if (card && card.classList.contains('pathway-featured')) {
            // Redirect to one-on-one coaching page (same as mobile)
            e.preventDefault();
            window.location.href = 'one-on-one-coaching.html';
            return;
        }
        
        // For non-featured cards, toggle the dropdown
        const features = this.nextElementSibling;
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
            features.classList.remove('expanded');
            this.setAttribute('aria-expanded', 'false');
            this.textContent = 'See More';
        } else {
            features.classList.add('expanded');
            this.setAttribute('aria-expanded', 'true');
            this.textContent = 'See Less';
        }
    });
});

// Booking Calendar Modal
const bookingModal = document.getElementById('booking-modal');
const bookingModalClose = document.querySelector('.booking-modal-close');
const bookCallButtons = document.querySelectorAll('#book-call-btn, #book-call-btn-bottom');
const bookingCalendarIframe = document.getElementById('booking-calendar-iframe');

// Google Calendar booking URL - Replace with your actual Google Calendar appointment scheduling URL
// To get your URL: Google Calendar > Settings > Appointment schedules > Create or select schedule > Copy booking page link
const GOOGLE_CALENDAR_BOOKING_URL = 'https://calendar.google.com/calendar/appointments/schedules/YOUR_SCHEDULE_ID';

// Set iframe source
if (bookingCalendarIframe && GOOGLE_CALENDAR_BOOKING_URL !== 'https://calendar.google.com/calendar/appointments/schedules/YOUR_SCHEDULE_ID') {
    bookingCalendarIframe.src = GOOGLE_CALENDAR_BOOKING_URL;
}

// Open modal
bookCallButtons.forEach(button => {
    if (button) {
        button.addEventListener('click', function() {
            if (bookingModal) {
                bookingModal.style.display = 'flex';
                // Trigger reflow to enable transition
                void bookingModal.offsetWidth;
                bookingModal.classList.add('show');
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            }
        });
    }
});

// Close modal
function closeBookingModal() {
    if (bookingModal) {
        bookingModal.classList.remove('show');
        setTimeout(() => {
            bookingModal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
        }, 300); // Match transition duration
    }
}

if (bookingModalClose) {
    bookingModalClose.addEventListener('click', closeBookingModal);
}

// Close modal when clicking outside
if (bookingModal) {
    bookingModal.addEventListener('click', function(e) {
        if (e.target === bookingModal) {
            closeBookingModal();
        }
    });
}

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && bookingModal && bookingModal.classList.contains('show')) {
        closeBookingModal();
    }
});
