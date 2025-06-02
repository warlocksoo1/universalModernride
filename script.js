// ===== MAIN APPLICATION =====
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all modules
  initMobileMenu();
  init3DShowroom();
  initCustomization();
  initTestDrive();
  initNewsletter();
  setCurrentYear();
});

// ===== MOBILE MENU =====
function initMobileMenu() {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', !isExpanded);
    navLinks.classList.toggle('active');
    document.body.style.overflow = isExpanded ? 'auto' : 'hidden';
  });

  // Close menu when clicking on links
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = 'auto';
    });
  });
}

// ===== 3D SHOWROOM =====
function init3DShowroom() {
  // Only initialize if container exists
  const container = document.getElementById('3d-container');
  if (!container) return;

  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a1a);
  
  // Camera
  const camera = new THREE.PerspectiveCamera(
    75, 
    container.clientWidth / container.clientHeight, 
    0.1, 
    1000
  );
  camera.position.z = 5;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  // Controls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Vehicle loader
  const loader = new THREE.GLTFLoader();
  const dracoLoader = new THREE.DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
  loader.setDRACOLoader(dracoLoader);

  let currentVehicle = null;
  const vehicleModels = {
    car: 'assets/models/car.glb',
    bike: 'assets/models/bike.glb',
    vtol: 'assets/models/vtol.glb',
    solar: 'assets/models/solar.glb'
  };

  // Load initial vehicle
  loadVehicle('car');

  // Vehicle selector
  document.querySelectorAll('.vehicle-option').forEach(option => {
    option.addEventListener('click', () => {
      document.querySelector('.vehicle-option.active').classList.remove('active');
      option.classList.add('active');
      loadVehicle(option.dataset.model);
    });
  });

  // Control buttons
  document.getElementById('rotate-btn').addEventListener('click', () => {
    controls.autoRotate = !controls.autoRotate;
  });

  document.getElementById('interior-btn').addEventListener('click', () => {
    // Implementation for interior view
    camera.position.set(0, 0.5, 2);
  });

  // VR/AR setup
  if ('xr' in navigator) {
    setupXR();
  } else {
    document.getElementById('vr-btn').style.display = 'none';
    document.getElementById('ar-btn').style.display = 'none';
  }

  // Window resize handler
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // Helper functions
  function loadVehicle(modelType) {
    const loaderElement = document.querySelector('.vehicle-viewer .loader');
    loaderElement.style.display = 'block';

    loader.load(vehicleModels[modelType], (gltf) => {
      if (currentVehicle) scene.remove(currentVehicle);
      
      currentVehicle = gltf.scene;
      scene.add(currentVehicle);
      
      // Center and scale vehicle
      const box = new THREE.Box3().setFromObject(currentVehicle);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      currentVehicle.position.sub(center);
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;
      currentVehicle.scale.set(scale, scale, scale);
      
      loaderElement.style.display = 'none';
    }, undefined, (error) => {
      console.error('Error loading model:', error);
      loaderElement.style.display = 'none';
    });
  }

  function setupXR() {
    // VR Button
    const vrButton = document.getElementById('vr-btn');
    vrButton.addEventListener('click', () => {
      if (renderer.xr.isPresenting) {
        renderer.xr.getSession().end();
      } else {
        renderer.xr.setSession(VRButton.createButton(renderer));
      }
    });

    // AR Button
    const arButton = document.getElementById('ar-btn');
    arButton.addEventListener('click', () => {
      renderer.xr.setReferenceSpaceType('local');
      renderer.xr.setSession(ARButton.createButton(renderer, { 
        requiredFeatures: ['hit-test'] 
      }));
    });
  }
});

// ===== VEHICLE CUSTOMIZATION =====
function initCustomization() {
  const container = document.getElementById('custom-3d-container');
  if (!container) return;

  // Scene setup would be similar to 3D showroom
  // This is a simplified version for demonstration
  let currentColor = '0x3498db';
  
  document.querySelectorAll('[data-color]').forEach(button => {
    button.addEventListener('click', function() {
      document.querySelector('[data-color].active').classList.remove('active');
      this.classList.add('active');
      currentColor = this.dataset.color;
      updateVehicleColor();
    });
  });

  function updateVehicleColor() {
    // In a real implementation, this would update the 3D model's material
    console.log('Updated vehicle color to:', currentColor);
  }
}

// ===== TEST DRIVE BOOKING =====
function initTestDrive() {
  const testDriveButtons = document.querySelectorAll('.test-drive-card .cta-button');
  
  testDriveButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const card = this.closest('.test-drive-card');
      const type = card.querySelector('h3').textContent;
      
      // Show booking modal
      showBookingModal(type);
    });
  });

  function showBookingModal(type) {
    // Implementation would show a modal with a booking form
    console.log('Booking test drive:', type);
    alert(`Booking ${type} test drive - form would appear here`);
  }
}

// ===== NEWSLETTER FORM =====
function initNewsletter() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    
    // In a real app, you would send this to your backend
    console.log('Subscribed email:', email);
    this.reset();
    
    // Show success message
    alert('Thank you for subscribing!');
  });
}

// ===== UTILITY FUNCTIONS =====
function setCurrentYear() {
  document.getElementById('current-year').textContent = new Date().getFullYear();
}

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
  console.error('Uncaught error:', e.error);
  // In production, you might want to log this to an error tracking service
});

// ===== PERFORMANCE OPTIMIZATIONS =====
// Debounce resize events
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // Handle responsive adjustments
  }, 100);
});

// Intersection Observer for lazy loading
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Lazy load content
        entry.target.classList.add('loaded');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('[data-lazy]').forEach(el => observer.observe(el));
}
