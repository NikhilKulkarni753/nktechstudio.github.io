'use strict';


// Subtle scroll effects and reveal animations. All content stays visible without JS.
document.documentElement.classList.add('js-motion');
const header = document.querySelector('.site-header');
const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 12);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const revealTargets = [
  '.intro h2', '.intro p', '.section-heading', '.service-card',
  '.about-graphic', '.about-copy', '.commitment .stars',
  '.commitment blockquote', '.commitment strong', '.growth h2',
  '.growth .section-shell > p', '.stat-card', '.contact-info',
  '.contact-form-card', '.policy-pill', '.policy-hero h1',
  '.policy-hero p', '.updated', '.policy-notice', '.policy-section'
].join(',');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = [...document.querySelectorAll(revealTargets)];
revealItems.forEach((element, index) => {
  element.classList.add('reveal');
  if (element.matches('.about-graphic, .contact-info')) element.classList.add('reveal-left');
  if (element.matches('.about-copy, .contact-form-card')) element.classList.add('reveal-right');
  if (element.matches('.service-card, .stat-card')) {
    const siblings = [...element.parentElement.children];
    element.style.setProperty('--reveal-delay', `${(siblings.indexOf(element) % 4) * 85}ms`);
  }
});
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach(element => element.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
  revealItems.forEach(element => revealObserver.observe(element));
}

// EmailJS settings copied from the original Flutter contact form.
const EMAILJS_SERVICE_ID = 'service_rbx2bx6';
const EMAILJS_TEMPLATE_ID = 'template_te8yhwc';
const EMAILJS_PUBLIC_KEY = 'SwGzHSgojFzNBompa';
const RECEIVER_EMAIL = 'nikhilkulkarni.devtech@gmail.com';

if (window.emailjs) {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuToggle?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
});
navLinks?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  if (menuToggle) menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
}));

const form = document.getElementById('contactForm');
const submitButton = document.getElementById('submitButton');
const formStatus = document.getElementById('formStatus');
const fields = {
  name: document.getElementById('name'),
  email: document.getElementById('email'),
  phone: document.getElementById('phone'),
  message: document.getElementById('message')
};
const errorElements = {
  name: document.getElementById('nameError'),
  email: document.getElementById('emailError'),
  phone: document.getElementById('phoneError'),
  message: document.getElementById('messageError')
};

function validateField(key) {
  const value = fields[key].value.trim();
  let error = '';
  if (key === 'name') {
    if (!value) error = 'Please enter your name.';
    else if (value.length < 2) error = 'Name must be at least 2 characters.';
    else if (value.length > 50) error = 'Name must be 50 characters or less.';
    else if (!/^[a-zA-Z][a-zA-Z .'-]*$/.test(value)) error = 'Please enter a valid name.';
  } else if (key === 'email') {
    if (!value) error = 'Please enter your email.';
    else if (value.length > 254 || !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(value)) error = 'Please enter a valid email address.';
  } else if (key === 'phone') {
    const digits = value.replace(/\D/g, '');
    if (!value) error = 'Please enter your phone number.';
    else if (value.length > 20 || !/^\+?[0-9][0-9 ()-]{6,18}[0-9]$/.test(value)) error = 'Please enter a valid phone number.';
    else if (digits.length < 8 || digits.length > 15) error = 'Phone number must contain 8–15 digits.';
  } else if (key === 'message') {
    if (!value) error = 'Please enter your message.';
    else if (value.length < 10) error = 'Message must be at least 10 characters.';
    else if (value.length > 2000) error = 'Message must be 2000 characters or less.';
  }
  errorElements[key].textContent = error;
  fields[key].closest('.input-wrap').classList.toggle('invalid', Boolean(error));
  return !error;
}

Object.keys(fields).forEach(key => {
  fields[key].addEventListener('blur', () => validateField(key));
  fields[key].addEventListener('input', () => {
    if (errorElements[key].textContent) validateField(key);
  });
});

form?.addEventListener('submit', async event => {
  event.preventDefault();
  formStatus.textContent = '';
  formStatus.className = 'form-status';
  const valid = Object.keys(fields).map(validateField).every(Boolean);
  if (!valid) {
    form.querySelector('.invalid input, .invalid textarea')?.focus();
    return;
  }
  if (!window.emailjs) {
    formStatus.textContent = 'Email service could not load. Please refresh the page and try again.';
    formStatus.classList.add('failure');
    return;
  }

  submitButton.disabled = true;
  submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Sending...</span>';
  try {
    // Variable names deliberately match the existing EmailJS template.
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      name: fields.name.value.trim(),
      email: fields.email.value.trim(),
      phone: fields.phone.value.trim(),
      message: fields.message.value.trim(),
      to_email: RECEIVER_EMAIL
    });
    form.reset();
    Object.values(errorElements).forEach(el => { el.textContent = ''; });
    form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
    formStatus.textContent = 'Message sent successfully. We will contact you soon!';
    formStatus.classList.add('success');
  } catch (error) {
    console.error('EmailJS send failed:', error);
    formStatus.textContent = 'Unable to send your message right now. Please check your connection and try again.';
    formStatus.classList.add('failure');
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = '<span>Send Message</span><i class="fa-solid fa-paper-plane"></i>';
  }
});
