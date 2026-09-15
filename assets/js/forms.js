/* ============================================================
   FORMS.JS — Client-Side Form Validation
   ============================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
  initLoginForm();
  initRegisterForm();
});

// ── Validators ─────────────────────────────────────────────
const validators = {
  required: (val) => val.trim() !== '' ? null : 'This field is required.',
  email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) ? null : 'Please enter a valid email address.',
  minLength: (min) => (val) => val.trim().length >= min ? null : `Must be at least ${min} characters.`,
  passwordMatch: (field) => (val) => val === field.value ? null : 'Passwords do not match.',
};

function validateField(input, rules) {
  const val = input.value;
  for (const rule of rules) {
    const error = rule(val);
    if (error) return error;
  }
  return null;
}

function setFieldState(input, errorMsg) {
  const group = input.closest('.form-group') || input.parentElement;
  const errEl = group.querySelector('.field-error');

  input.classList.remove('error', 'success');
  errEl?.classList.remove('visible');

  if (errorMsg) {
    input.classList.add('error');
    if (errEl) {
      errEl.textContent = errorMsg;
      errEl.classList.add('visible');
    }
    return false;
  } else {
    if (input.value.trim()) input.classList.add('success');
    return true;
  }
}

function attachLiveValidation(input, rules) {
  input.addEventListener('blur', () => {
    const err = validateField(input, rules);
    setFieldState(input, err);
  });

  input.addEventListener('input', () => {
    if (input.classList.contains('error')) {
      const err = validateField(input, rules);
      setFieldState(input, err);
    }
  });
}

// ── Contact Form ───────────────────────────────────────────
function initContactForm() {
  const form = document.querySelector('#contact-form');
  if (!form) return;

  const fields = {
    firstName: { rules: [validators.required] },
    lastName:  { rules: [validators.required] },
    email:     { rules: [validators.required, validators.email] },
    company:   { rules: [] },
    phone:     { rules: [] },
    service:   { rules: [] },
    message:   { rules: [validators.required, validators.minLength(20)] },
  };

  Object.entries(fields).forEach(([name, { rules }]) => {
    const input = form.elements[name];
    if (input && rules.length) attachLiveValidation(input, rules);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    Object.entries(fields).forEach(([name, { rules }]) => {
      const input = form.elements[name];
      if (!input || !rules.length) return;
      const err = validateField(input, rules);
      if (!setFieldState(input, err)) isValid = false;
    });

    if (isValid) {
      showFormSuccess(form, 'Thank you! We\'ll be in touch within 24 hours.');
      form.reset();
      form.querySelectorAll('.form-control').forEach(el => el.classList.remove('success'));
    }
  });
}

// ── Login Form ─────────────────────────────────────────────
function initLoginForm() {
  const form = document.querySelector('#login-form');
  if (!form) return;

  const email = form.elements['email'];
  const password = form.elements['password'];

  if (email) attachLiveValidation(email, [validators.required, validators.email]);
  if (password) attachLiveValidation(password, [validators.required, validators.minLength(8)]);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    if (email) { const err = validateField(email, [validators.required, validators.email]); if (!setFieldState(email, err)) isValid = false; }
    if (password) { const err = validateField(password, [validators.required, validators.minLength(8)]); if (!setFieldState(password, err)) isValid = false; }

    if (isValid) {
      showFormSuccess(form, 'Login successful! Redirecting...');
      setTimeout(() => window.location.href = 'index.html', 1800);
    }
  });

  // Toggle password visibility
  initPasswordToggle(form);
}

// ── Register Form ──────────────────────────────────────────
function initRegisterForm() {
  const form = document.querySelector('#register-form');
  if (!form) return;

  const name = form.elements['name'];
  const email = form.elements['email'];
  const password = form.elements['password'];
  const confirm = form.elements['confirmPassword'];
  const terms = form.elements['terms'];

  if (name) attachLiveValidation(name, [validators.required, validators.minLength(2)]);
  if (email) attachLiveValidation(email, [validators.required, validators.email]);
  if (password) attachLiveValidation(password, [validators.required, validators.minLength(8)]);
  if (confirm && password) attachLiveValidation(confirm, [validators.required, validators.passwordMatch(password)]);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    if (name) { const err = validateField(name, [validators.required, validators.minLength(2)]); if (!setFieldState(name, err)) isValid = false; }
    if (email) { const err = validateField(email, [validators.required, validators.email]); if (!setFieldState(email, err)) isValid = false; }
    if (password) { const err = validateField(password, [validators.required, validators.minLength(8)]); if (!setFieldState(password, err)) isValid = false; }
    if (confirm && password) { const err = validateField(confirm, [validators.required, validators.passwordMatch(password)]); if (!setFieldState(confirm, err)) isValid = false; }

    if (terms && !terms.checked) {
      const group = terms.closest('.checkbox-group') || terms.parentElement;
      let errEl = group.querySelector('.field-error');
      if (!errEl) {
        errEl = document.createElement('p');
        errEl.className = 'field-error visible';
        group.appendChild(errEl);
      }
      errEl.textContent = 'You must accept the Terms & Conditions.';
      errEl.classList.add('visible');
      isValid = false;
    } else {
      const group = terms?.closest('.checkbox-group');
      group?.querySelector('.field-error')?.classList.remove('visible');
    }

    if (isValid) {
      showFormSuccess(form, 'Account created! Redirecting to login...');
      setTimeout(() => window.location.href = 'login.html', 1800);
    }
  });

  initPasswordToggle(form);
}

// ── Password Toggle Visibility ─────────────────────────────
function initPasswordToggle(form) {
  form.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling || form.querySelector(`#${btn.getAttribute('data-target')}`);
      if (!input) return;
      const isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';
      const icon = btn.querySelector('i');
      if (icon) icon.className = isText ? 'ph ph-eye' : 'ph ph-eye-slash';
    });
  });
}

// ── Show Success Message ───────────────────────────────────
function showFormSuccess(form, message) {
  let successEl = form.querySelector('.form-success');
  if (!successEl) {
    successEl = document.createElement('div');
    successEl.className = 'form-success';
    form.appendChild(successEl);
  }
  successEl.textContent = message;
  successEl.classList.add('visible');
  successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

  setTimeout(() => successEl.classList.remove('visible'), 5000);
}
