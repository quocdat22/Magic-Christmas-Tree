/**
 * @file scatter.js
 * @description Scatter animation - disperse into chaos
 * @dependencies config.js, ornaments.js
 */

import { calculateScatterPosition } from '../entities/ornaments.js';

/**
 * Animate all elements to scatter into chaos
 * @param {Array<THREE.Mesh>} ornaments - Ornament meshes
 * @param {THREE.Mesh} topStar - Top star mesh
 * @param {THREE.Points} spiralRibbon - Spiral ribbon points
 * @param {THREE.PointLight} starLight - Star light reference
 * @param {Object} CONFIG - Configuration object
 * @returns {Promise} Resolves when animation completes
 */
export function scatterAll(ornaments, topStar, spiralRibbon, starLight, CONFIG) {
    return new Promise((resolve) => {
        // Change star light to ice blue
        if (starLight) {
            gsap.to(starLight.color, {
                r: 0xE1 / 255,
                g: 0xF5 / 255,
                b: 0xFE / 255,
                duration: 0.5
            });
        }

        // Generate new scatter positions and animate
        ornaments.forEach((mesh, index) => {
            // Generate new random scatter position
            mesh.userData.scatterPosition = calculateScatterPosition(CONFIG);
            
            const delay = index * 0.002;
            
            gsap.to(mesh.position, {
                x: mesh.userData.scatterPosition.x,
                y: mesh.userData.scatterPosition.y,
                z: mesh.userData.scatterPosition.z,
                duration: CONFIG.animationDuration,
                delay: delay,
                ease: CONFIG.animationEase
            });
        });

        // Animate top star up
        gsap.to(topStar.position, {
            y: topStar.userData.scatterY,
            duration: CONFIG.animationDuration,
            ease: CONFIG.animationEase
        });

        // Hide spiral ribbon
        gsap.to(spiralRibbon.material, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                spiralRibbon.visible = false;
                resolve();
            }
        });
    });
}
