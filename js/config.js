/**
 * @file config.js
 * @description Configuration constants for the Magic Christmas Tree application
 * @dependencies None
 */

/**
 * Application configuration object
 * @type {Object}
 */
export const CONFIG = {
    // Particle counts
    ornamentCount: 400,
    starDustCount: 1000,
    spiralDotCount: 200,
    snowCount: 700,
    
    // Tree parameters (Cone shape)
    treeHeight: 20,
    treeBaseRadius: 8,
    
    // Scatter sphere radius
    scatterRadius: 50,
    
    // Animation
    animationDuration: 1.8,
    animationEase: "back.out(1.2)",
    
    // Colors
    colors: {
        red: 0xD42426,
        green: 0x1B5E20,
        gold: 0xFFD700,
        brown: 0x4E342E,
        white: 0xFFFFFF
    },
    
    // Hand tracking settings
    handTracking: {
        gestureDebounceTime: 1000, // ms between gesture triggers
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5,
        maxNumHands: 1,
        modelComplexity: 1
    },
    
    // Snow interaction
    snowInteractionRadius: 5,
    snowWaveRadius: 15,
    snowSpiralRadius: 8
};
