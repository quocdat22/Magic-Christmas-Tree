/**
 * @file main.js
 * @description Main application orchestrator
 * @dependencies All modules
 */

// Configuration
import { CONFIG } from './config.js';

// Scene setup
import { setupScene, createSkyDome, createTwinklingStars, createCloudLayer, updateCloudLayer, createShootingStar } from './scene/scene-setup.js';
import { setupLighting } from './scene/lighting.js';
import { setupCamera, setupControls, setupRenderer, onWindowResize } from './scene/camera.js';

// Entities
import { createOrnaments, updateOrnaments } from './entities/ornaments.js';
import { createTopStar, updateStar, createStarDust, updateStarDust } from './entities/star.js';
import { createSpiralRibbon, updateSpiralRibbon } from './entities/spiral-ribbon.js';
import { createSnowSystem, updateSnowSystem } from './entities/snow.js';

// Animations
import { scatterAll } from './animations/scatter.js';
import { transitionState } from './animations/transitions.js';

// Interactions
import { toggleHandTracking, handTrackingState } from './interactions/hand-tracking.js';

// Utils
import { createCloudTexture, createSnowTexture } from './utils/geometry-helpers.js';

// ============================================
// GLOBAL VARIABLES
// ============================================
let scene, camera, renderer, controls;
let ornaments = [];
let starDust, topStar, spiralRibbon;
let isGathered = { value: false }; // Object wrapper for pass-by-reference
let animationState = { animating: false };

// Snow System
let snowParticles = null;
let snowVelocities = [];
let snowSizes = [];

// Lighting
let starLight = null;

// Sky elements
let skyDome = null;
let skyMaterial = null;
let twinklingStars = null;
let shootingStars = [];
let shootingStarTimer = 0;
let cloudLayer = [];

// ============================================
// INITIALIZATION
// ============================================
function init() {
    // Scene
    scene = setupScene();

    // Camera
    camera = setupCamera();

    // Renderer
    const container = document.getElementById('canvas-container');
    renderer = setupRenderer(container);

    // Controls
    controls = setupControls(camera, renderer);

    // Lighting
    const lights = setupLighting(scene, CONFIG);
    starLight = lights.starLight;

    // Create sky dome first (renders behind everything)
    const skyObjects = createSkyDome(scene);
    skyDome = skyObjects.skyDome;
    skyMaterial = skyObjects.skyMaterial;

    twinklingStars = createTwinklingStars(scene);
    cloudLayer = createCloudLayer(scene, createCloudTexture);

    // Create all entities
    ornaments = createOrnaments(scene, CONFIG);
    starDust = createStarDust(scene, CONFIG);
    topStar = createTopStar(scene, CONFIG);
    spiralRibbon = createSpiralRibbon(scene, CONFIG);
    
    const snowSystem = createSnowSystem(scene, CONFIG, createSnowTexture);
    snowParticles = snowSystem.snowParticles;
    snowVelocities = snowSystem.snowVelocities;
    snowSizes = snowSystem.snowSizes;

    // Initial scatter state
    scatterAll(ornaments, topStar, spiralRibbon, starLight, CONFIG);

    // Event listeners
    window.addEventListener('resize', () => onWindowResize(camera, renderer));
    document.getElementById('toggleBtn').addEventListener('click', toggleState);
    document.getElementById('handTrackingBtn').addEventListener('click', () => {
        const dependencies = getDependencies();
        toggleHandTracking(dependencies);
    });

    // Hide loading
    document.getElementById('loading').style.display = 'none';

    // Start animation loop
    animate();
}

// ============================================
// GET DEPENDENCIES FOR HAND TRACKING
// ============================================
function getDependencies() {
    return {
        CONFIG,
        isGathered,
        animationState,
        ornaments,
        topStar,
        spiralRibbon,
        starLight,
        snowParticles,
        snowVelocities,
        snowCount: CONFIG.snowCount
    };
}

// ============================================
// TOGGLE STATE
// ============================================
function toggleState() {
    isGathered.value = !isGathered.value;
    transitionState(isGathered.value, ornaments, topStar, spiralRibbon, starLight, CONFIG, animationState);
}

// ============================================
// ANIMATION LOOP
// ============================================
function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    // Update sky dome aurora animation
    if (skyMaterial) {
        skyMaterial.uniforms.uTime.value = time;
    }

    // Update twinkling stars
    if (twinklingStars) {
        twinklingStars.material.uniforms.uTime.value = time;
    }

    // Shooting stars spawn
    shootingStarTimer += 0.016; // ~60fps
    const nextShootingStarTime = 3 + Math.random() * 3; // 3-6 seconds
    if (shootingStarTimer > nextShootingStarTime) {
        createShootingStar(scene, shootingStars);
        shootingStarTimer = 0;
    }

    // Update cloud layer
    updateCloudLayer(cloudLayer);

    // Update snow system
    updateSnowSystem(
        snowParticles, 
        snowVelocities, 
        CONFIG.snowCount, 
        handTrackingState.detected, 
        handTrackingState.position, 
        CONFIG
    );

    // Rotate ornaments
    updateOrnaments(ornaments);

    // Animate top star
    updateStar(topStar, time);

    // Animate star dust (subtle movement)
    updateStarDust(starDust, time);

    // Update spiral ribbon animation
    updateSpiralRibbon(spiralRibbon, time, CONFIG);

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);
}

// ============================================
// START
// ============================================
window.addEventListener('load', init);
