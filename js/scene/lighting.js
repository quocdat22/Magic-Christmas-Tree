/**
 * @file lighting.js
 * @description Three.js lighting setup
 * @dependencies None
 */

/**
 * Setup all lighting for the scene
 * @param {THREE.Scene} scene - Three.js scene
 * @param {Object} CONFIG - Configuration object
 * @returns {Object} Object containing light references
 */
export function setupLighting(scene, CONFIG) {
    // Ambient light with slight aurora tint
    const ambientLight = new THREE.AmbientLight(0x506070, 0.5);
    scene.add(ambientLight);

    // Main point light at star position (will change color based on state)
    const starLight = new THREE.PointLight(0xFFD700, 2, 50);
    starLight.position.set(0, CONFIG.treeHeight / 2 + 2, 0);
    starLight.castShadow = true;
    scene.add(starLight);

    // Winter directional light (ice blue from 45 degree angle)
    const winterLight = new THREE.DirectionalLight(0xB3E5FC, 0.3);
    winterLight.position.set(10, 10, 10);
    scene.add(winterLight);

    // Additional colored lights
    const redLight = new THREE.PointLight(0xD42426, 1, 30);
    redLight.position.set(-10, 5, 10);
    scene.add(redLight);

    const greenLight = new THREE.PointLight(0x1B5E20, 1, 30);
    greenLight.position.set(10, 5, -10);
    scene.add(greenLight);

    // Hemisphere light for natural feel
    const hemiLight = new THREE.HemisphereLight(0xB3E5FC, 0x1B3A52, 0.3);
    scene.add(hemiLight);
    
    return {
        ambientLight,
        starLight,
        winterLight,
        redLight,
        greenLight,
        hemiLight
    };
}
