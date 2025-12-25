/**
 * @file camera.js
 * @description Camera and controls setup
 * @dependencies None
 */

/**
 * Setup perspective camera
 * @returns {THREE.PerspectiveCamera} Configured camera
 */
export function setupCamera() {
    const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 40);
    
    return camera;
}

/**
 * Setup orbit controls
 * @param {THREE.Camera} camera - Three.js camera
 * @param {THREE.WebGLRenderer} renderer - Three.js renderer
 * @returns {THREE.OrbitControls} Configured controls
 */
export function setupControls(camera, renderer) {
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.minDistance = 20;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI * 0.85;
    
    return controls;
}

/**
 * Setup WebGL renderer
 * @param {HTMLElement} container - DOM container element
 * @returns {THREE.WebGLRenderer} Configured renderer
 */
export function setupRenderer(container) {
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    
    return renderer;
}

/**
 * Handle window resize
 * @param {THREE.Camera} camera - Three.js camera
 * @param {THREE.WebGLRenderer} renderer - Three.js renderer
 */
export function onWindowResize(camera, renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
