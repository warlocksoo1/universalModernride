// ===== STRICT MODE & POLYFILLS =====
'use strict';

// RequestAnimationFrame polyfill
(function() {
  let lastTime = 0;
  const vendors = ['ms', 'moz', 'webkit', 'o'];
  for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[`${vendors[x]}RequestAnimationFrame`];
    window.cancelAnimationFrame = 
      window[`${vendors[x]}CancelAnimationFrame`] || 
      window[`${vendors[x]}CancelRequestAnimationFrame`];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      const currTime = new Date().getTime();
      const timeToCall = Math.max(0, 16 - (currTime - lastTime));
      const id = window.setTimeout(() => {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
})();

// ===== GLOBAL CONSTANTS =====
const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200
};

// ===== MAIN APPLICATION CLASS =====
class VehicleShowcase {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initComponents();
    this.checkViewport();
    this.setupIntersectionObserver();
  }

  // ===== CORE FUNCTIONALITY =====
  setupEventListeners() {
    // Window events
    window.addEventListener('resize', this.debounce(this.checkViewport.bind(this), 100));
    window.addEventListener('scroll', this.debounce(this.handleScroll.bind(this), 16));

    // DOMContentLoaded fallback
    if (document.readyState !== 'loading') {
      this.onDOMReady();
    } else {
      document.addEventListener('DOMContentLoaded', this.onDOMReady.bind(this));
    }
  }

  initComponents() {
    this.components = {
      mobileMenu: new MobileMenu(),
      smoothScroll: new SmoothScroll(),
      vehicleShowroom: new VehicleShowroom(),
      customization: new Customization(),
      modals: new ModalSystem(),
      forms: new FormHandler(),
      animations: new ScrollAnimations()
    };
  }

  // ===== PERFORMANCE HELPERS =====
  debounce(func, wait, immediate) {
    let timeout;
    return function() {
      const context = this, args = arguments;
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function() {
      const context = this;
      const args = arguments;
      if (!lastRan) {
        func.apply(context, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(function() {
          if ((Date.now() - lastRan) >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  }

  // ===== VIEWPORT HANDLING =====
  checkViewport() {
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      isMobile: window.innerWidth < BREAKPOINTS.mobile,
      isTablet: window.innerWidth >= BREAKPOINTS.mobile && 
                window.innerWidth < BREAKPOINTS.desktop,
      isDesktop: window.innerWidth >= BREAKPOINTS.desktop
    };
    
    document.documentElement.classList.toggle(
      'is-mobile', this.viewport.isMobile
    );
    document.documentElement.classList.toggle(
      'is-tablet', this.viewport.isTablet
    );
    document.documentElement.classList.toggle(
      'is-desktop', this.viewport.isDesktop
    );
  }

  // ===== SCROLL HANDLING =====
  handleScroll() {
    const scrollY = window.scrollY;
    this.toggleHeaderEffects(scrollY);
    this.components.animations.checkElements(scrollY);
  }

  toggleHeaderEffects(scrollY) {
    const header = document.querySelector('.header');
    if (!header) return;
    
    if (scrollY > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  // ===== INTERSECTION OBSERVER =====
  setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          this.observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -100px 0px',
      threshold: 0.1
    });

    document.querySelectorAll('.observe').forEach(el => {
      this.observer.observe(el);
    });
  }

  // ===== DOM READY HANDLER =====
  onDOMReady() {
    // Initialize all components that need DOM to be ready
    this.components.mobileMenu.init();
    this.components.smoothScroll.init();
    this.components.vehicleShowroom.init();
    this.components.customization.init();
    this.components.modals.init();
    this.components.forms.init();
    this.components.animations.init();

    // Additional initialization
    this.setupLazyLoading();
    this.setupAccessibility();
  }

  // ===== LAZY LOADING =====
  setupLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) {
      // Native lazy loading supported
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      lazyImages.forEach(img => {
        img.src = img.dataset.src;
      });
    } else {
      // Fallback lazy loading
      const lazyLoader = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            lazyLoader.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        lazyLoader.observe(img);
      });
    }
  }

  // ===== ACCESSIBILITY =====
  setupAccessibility() {
    // Focus styles for keyboard navigation
    document.addEventListener('keyup', (e) => {
      if (e.key === 'Tab') {
        document.documentElement.classList.add('keyboard-nav');
      }
    });

    // Skip to content link
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(skipLink.getAttribute('href'));
        if (target) {
          target.setAttribute('tabindex', '-1');
          target.focus();
          setTimeout(() => target.removeAttribute('tabindex'), 1000);
        }
      });
    }
  }
}

// ===== COMPONENT CLASSES =====
class MobileMenu {
  constructor() {
    this.menuBtn = document.querySelector('.mobile-menu-btn');
    this.navLinks = document.querySelector('.nav-links');
    this.header = document.querySelector('.header');
  }

  init() {
    if (!this.menuBtn || !this.navLinks) return;

    this.menuBtn.addEventListener('click', this.toggleMenu.bind(this));
    
    // Close menu when clicking on links
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', this.closeMenu.bind(this));
    });
  }

  toggleMenu() {
    this.navLinks.classList.toggle('active');
    this.menuBtn.classList.toggle('active');
    this.header.classList.toggle('menu-open');
    
    // Toggle aria-expanded attribute
    const isExpanded = this.menuBtn.getAttribute('aria-expanded') === 'true';
    this.menuBtn.setAttribute('aria-expanded', !isExpanded);
    
    // Toggle body scroll
    document.body.style.overflow = this.navLinks.classList.contains('active') ? 'hidden' : '';
  }

  closeMenu() {
    this.navLinks.classList.remove('active');
    this.menuBtn.classList.remove('active');
    this.header.classList.remove('menu-open');
    this.menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
}

class SmoothScroll {
  init() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', this.handleClick.bind(this));
    });
  }

  handleClick(e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (!targetElement) return;
    
    const headerHeight = document.querySelector('.header').offsetHeight;
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }
}

class VehicleShowroom {
  constructor() {
    this.vehicleOptions = document.querySelectorAll('.vehicle-option');
    this.vehicleViewer = document.querySelector('.vehicle-viewer');
    this.specValues = {
      'sports-car': { speed: '320', acceleration: '3.2', horsepower: '650', range: '420' },
      'suv': { speed: '250', acceleration: '4.5', horsepower: '500', range: '380' },
      'hyper-car': { speed: '400', acceleration: '2.5', horsepower: '1200', range: '350' }
    };
    this.currentVehicle = 'sports-car';
  }

  init() {
    if (!this.vehicleOptions.length || !this.vehicleViewer) return;

    this.vehicleOptions.forEach(option => {
      option.addEventListener('click', this.handleVehicleChange.bind(this));
    });

    // Initialize first vehicle
    if (this.vehicleOptions[0]) {
      this.vehicleOptions[0].click();
    }

    // Initialize 3D viewer if available
    if (typeof THREE !== 'undefined') {
      this.initThreeJS();
    }
  }

  handleVehicleChange(e) {
    const option = e.currentTarget;
    
    // Update active state
    this.vehicleOptions.forEach(opt => opt.classList.remove('active'));
    option.classList.add('active');
    
    // Get vehicle type
    this.currentVehicle = option.dataset.vehicle;
    
    // Update viewer
    this.updateViewer();
    this.updateVehicleSpecs();
  }

  updateViewer() {
    // In a real implementation, this would swap 3D models
    this.vehicleViewer.style.backgroundImage = `url('assets/vehicles/${this.currentVehicle}-preview.jpg')`;
  }

  updateVehicleSpecs() {
    const specs = this.specValues[this.currentVehicle];
    if (!specs) return;
    
    document.querySelector('.spec-speed .spec-value').textContent = specs.speed;
    document.querySelector('.spec-acceleration .spec-value').textContent = specs.acceleration;
    document.querySelector('.spec-horsepower .spec-value').textContent = specs.horsepower;
    document.querySelector('.spec-range .spec-value').textContent = specs.range;
  }

  initThreeJS() {
    // Placeholder for Three.js initialization
    // This would be replaced with actual 3D model loading and rendering
    console.log('Three.js is available - initialize 3D viewer here');
  }
}

class Customization {
  constructor() {
    this.colorOptions = document.querySelectorAll('.color-option');
    this.wheelOptions = document.querySelectorAll('.wheel-option');
    this.interiorOptions = document.querySelectorAll('.interior-option');
    this.previewImage = document.querySelector('.customization-preview');
  }

  init() {
    if (!this.previewImage) return;

    this.colorOptions.forEach(opt => {
      opt.addEventListener('click', this.handleColorChange.bind(this));
    });

    this.wheelOptions.forEach(opt => {
      opt.addEventListener('click', this.handleWheelChange.bind(this));
    });

    this.interiorOptions.forEach(opt => {
      opt.addEventListener('click', this.handleInteriorChange.bind(this));
    });

    // Initialize first options
    if (this.colorOptions[0]) this.colorOptions[0].click();
    if (this.wheelOptions[0]) this.wheelOptions[0].click();
    if (this.interiorOptions[0]) this.interiorOptions[0].click();
  }

  handleColorChange(e) {
    this.colorOptions.forEach(opt => opt.classList.remove('active'));
    e.currentTarget.classList.add('active');
    this.previewImage.style.backgroundColor = e.currentTarget.dataset.color;
  }

  handleWheelChange(e) {
    this.wheelOptions.forEach(opt => opt.classList.remove('active'));
    e.currentTarget.classList.add('active');
    document.querySelector('.vehicle-wheels').style.backgroundImage = `url('${e.currentTarget.dataset.image}')`;
  }

  handleInteriorChange(e) {
    this.interiorOptions.forEach(opt => opt.classList.remove('active'));
    e.currentTarget.classList.add('active');
    document.querySelector('.vehicle-interior').style.backgroundColor = e.currentTarget.dataset.color;
  }
}

class ModalSystem {
  constructor() {
    this.modals = document.querySelectorAll('.modal');
    this.openButtons = document.querySelectorAll('[data-modal]');
    this.closeButtons = document.querySelectorAll('.close-modal');
  }

  init() {
    if (!this.modals.length) return;

    this.openButtons.forEach(btn => {
      btn.addEventListener('click', this.openModal.bind(this));
    });

    this.closeButtons.forEach(btn => {
      btn.addEventListener('click', this.closeModal.bind(this));
    });

    this.modals.forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(e);
        }
      });
    });

    // Close with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });
  }

  openModal(e) {
    const modalId = e.currentTarget.dataset.modal;
    const modal = document.querySelector(`#${modalId}`);
    if (!modal) return;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    modal.setAttribute('aria-hidden', 'false');
  }

  closeModal(e) {
    const modal = e.currentTarget.closest('.modal');
    if (!modal) return;

    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    modal.setAttribute('aria-hidden', 'true');
  }

  closeAllModals() {
    this.modals.forEach(modal => {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    });
    document.body.style.overflow = 'auto';
  }
}

class FormHandler {
  constructor() {
    this.forms = document.querySelectorAll('form');
  }

  init() {
    if (!this.forms.length) return;

    this.forms.forEach(form => {
      form.addEventListener('submit', this.handleSubmit.bind(this));
    });
  }

  async handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Processing...';

    try {
      const formData = new FormData(form);
      const response = await this.submitForm(form.action, formData, form.method);

      if (response.ok) {
        this.showSuccess(form);
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      this.showError(form, error);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }

  async submitForm(url, data, method = 'POST') {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real implementation, you would use fetch()
    // return fetch(url, { method, body: data });
    return { ok: true };
  }

  showSuccess(form) {
    const successMsg = document.createElement('div');
    successMsg.className = 'form-success';
    successMsg.innerHTML = `
      <svg viewBox="0 0 24 24" width="64" height="64">
        <path fill="var(--success)" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      <h3>Success!</h3>
      <p>Your submission has been received.</p>
      <button type="button" class="btn btn-primary" onclick="this.closest('.form-container').querySelector('form').reset(); this.closest('.form-success').remove();">
        Submit Another
      </button>
    `;

    form.parentNode.insertBefore(successMsg, form.nextSibling);
    form.reset();
  }

  showError(form, error) {
    const errorElement = form.querySelector('.error-message') || document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = 'There was an error submitting your form. Please try again.';
    errorElement.style.color = 'var(--error)';
    errorElement.style.marginTop = '1rem';

    if (!form.querySelector('.error-message')) {
      form.appendChild(errorElement);
    }
  }
}

class ScrollAnimations {
  constructor() {
    this.animatedElements = document.querySelectorAll('.animate-on-sc
