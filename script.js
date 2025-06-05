// Main JavaScript for Universal Modern Ride Website

// DOM Elements
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');
const vehicleOptions = document.querySelectorAll('.vehicle-option');
const optionButtons = document.querySelectorAll('.option-button');
const testDriveButtons = document.querySelectorAll('.test-drive-btn');
const rotateBtn = document.getElementById('rotate-btn');
const interiorBtn = document.getElementById('interior-btn');
const vrBtn = document.getElementById('vr-btn');
const arBtn = document.getElementById('ar-btn');
const modal = document.getElementById('xr-modal');
const closeModal = document.querySelector('.close-modal');
const xrContainer = document.getElementById('xr-container');
const newsletterForm = document.querySelector('.newsletter-form');

// Three.js variables
let scene, camera, renderer, vehicle, controls;
let rotateEnabled = false;
let currentView = 'exterior';

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Initialize 3D viewer
    init3DViewer();
    
    // Initialize event listeners
    initEventListeners();
    
    // Hide loaders after content is loaded
    setTimeout(() => {
        document.querySelectorAll('.loader').forEach(loader => {
            loader.style.display = 'none';
        });
    }, 1500);
});

// Initialize 3D Viewer
function init3DViewer() {
    const container = document.getElementById('3d-container');
    
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Add a simple placeholder vehicle
    createVehicle();
    
    // Add orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = false;
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        if (rotateEnabled) {
            vehicle.rotation.y += 0.005;
        }
        
        controls.update();
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// Create a simple vehicle
function createVehicle(color = 0x3498db) {
    if (vehicle) scene.remove(vehicle);
    
    // Main body
    const bodyGeometry = new THREE.BoxGeometry(2, 0.8, 4);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    
    // Cabin
    const cabinGeometry = new THREE.BoxGeometry(1.8, 0.7, 1.8);
    const cabinMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xaaaaaa,
        transparent: true,
        opacity: 0.7
    });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.y = 0.4;
    cabin.position.z = -0.5;
    
    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 32);
    const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    
    const wheel1 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel1.rotation.z = Math.PI / 2;
    wheel1.position.set(-1, -0.5, 1.5);
    
    const wheel2 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel2.rotation.z = Math.PI / 2;
    wheel2.position.set(1, -0.5, 1.5);
    
    const wheel3 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel3.rotation.z = Math.PI / 2;
    wheel3.position.set(-1, -0.5, -1.5);
    
    const wheel4 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel4.rotation.z = Math.PI / 2;
    wheel4.position.set(1, -0.5, -1.5);
    
    // Group everything together
    vehicle = new THREE.Group();
    vehicle.add(body);
    vehicle.add(cabin);
    vehicle.add(wheel1);
    vehicle.add(wheel2);
    vehicle.add(wheel3);
    vehicle.add(wheel4);
    
    scene.add(vehicle);
}

// Initialize event listeners
function initEventListeners() {
    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', function() {
        const expanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !expanded);
        navLinks.classList.toggle('active');
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (navLinks.classList.contains('active')) {
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                    navLinks.classList.remove('active');
                }
            }
        });
    });
    
    // Vehicle selector functionality
    vehicleOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            vehicleOptions.forEach(opt => {
                opt.classList.remove('active');
                opt.setAttribute('aria-selected', 'false');
            });
            
            // Add active class to clicked option
            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');
            
            // Change vehicle based on selection
            changeVehicle(this.dataset.model);
        });
    });
    
    // Customization buttons functionality
    optionButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons in this group
            const parentFieldset = this.closest('fieldset');
            parentFieldset.querySelectorAll('.option-button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Handle the customization change
            if (this.dataset.color) {
                updateVehicleColor(parseInt(this.dataset.color));
            } else if (this.dataset.interior) {
                console.log('Interior changed to:', this.dataset.interior);
                // In a real implementation, you would update the interior materials
            } else if (this.dataset.performance) {
                console.log('Performance changed to:', this.dataset.performance);
                // In a real implementation, you might change the vehicle model
            }
        });
    });
    
    // Test drive buttons
    testDriveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.test-drive-card');
            const title = card.querySelector('h3').textContent;
            alert(`Booking ${title} - This would open a booking form in a real implementation`);
        });
    });
    
    // Rotate button
    rotateBtn.addEventListener('click', function() {
        rotateEnabled = !rotateEnabled;
        this.classList.toggle('active');
        this.textContent = rotateEnabled ? 'Stop Rotation' : 'Rotate';
    });
    
    // Interior view button
    interiorBtn.addEventListener('click', function() {
        if (currentView === 'exterior') {
            // Move camera inside
            camera.position.set(0, 0.5, 0.5);
            camera.lookAt(0, 0.5, 0);
            currentView = 'interior';
            this.textContent = 'Exterior View';
        } else {
            // Move camera outside
            camera.position.set(0, 1, 5);
            camera.lookAt(0, 0, 0);
            currentView = 'exterior';
            this.textContent = 'Interior View';
        }
    });
    
    // VR button
    vrBtn.addEventListener('click', function() {
        openModal('VR Experience');
    });
    
    // AR button
    arBtn.addEventListener('click', function() {
        openModal('AR Preview');
    });
    
    // Close modal
    closeModal.addEventListener('click', closeModalFunc);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModalFunc();
        }
    });
    
    // Newsletter form
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            alert(`Thank you for subscribing with ${email}!`);
            this.reset();
        });
    }
}

// Change vehicle based on selection
function changeVehicle(model) {
    let color;
    
    switch(model) {
        case 'car':
            color = 0x3498db; // Blue
            break;
        case 'bike':
            color = 0xe74c3c; // Red
            break;
        case 'vtol':
            color = 0x2c3e50; // Dark blue
            break;
        case 'solar':
            color = 0xf1c40f; // Yellow
            break;
        default:
            color = 0x3498db;
    }
    
    createVehicle(color);
}

// Update vehicle color
function updateVehicleColor(color) {
    vehicle.traverse(function(child) {
        if (child.isMesh && child.material && child !== vehicle.children[1]) { // Skip cabin
            child.material.color.setHex(color);
        }
    });
}

// Open modal with specific content
function openModal(mode) {
    xrContainer.innerHTML = `
        <h3>${mode}</h3>
        <p>This would launch the ${mode.toLowerCase()} in a real implementation.</p>
        <div class="placeholder-xr" style="height: 400px; background: #222; display: flex; justify-content: center; align-items: center; margin: 1rem 0; border-radius: 8px;">
            <p style="color: #666;">${mode} would appear here</p>
        </div>
        <button class="cta-button" style="margin: 0 auto; display: block;">Launch ${mode}</button>
    `;
    modal.style.display = 'block';
}

// Close modal
function closeModalFunc() {
    modal.style.display = 'none';
}
