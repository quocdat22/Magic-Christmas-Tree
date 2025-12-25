/**
 * @file gather.js
 * @description Gather animation - form the Christmas tree
 * @dependencies config.js
 */

/**
 * Animate all elements to gather into tree formation
 * @param {Array<THREE.Mesh>} ornaments - Ornament meshes
 * @param {THREE.Mesh} topStar - Top star mesh
 * @param {THREE.Points} spiralRibbon - Spiral ribbon points
 * @param {THREE.PointLight} starLight - Star light reference
 * @param {Object} CONFIG - Configuration object
 * @returns {Promise} Resolves when animation completes
 */
export function gatherAll(ornaments, topStar, spiralRibbon, starLight, CONFIG) {
    return new Promise((resolve) => {
        // Change star light back to gold
        if (starLight) {
            gsap.to(starLight.color, {
                r: 0xFF / 255,
                g: 0xD7 / 255,
                b: 0x00 / 255,
                duration: 0.5
            });
        }

        // Animate ornaments to tree positions
        ornaments.forEach((mesh, index) => {
            const delay = index * 0.002; // Stagger effect
            
            gsap.to(mesh.position, {
                x: mesh.userData.treePosition.x,
                y: mesh.userData.treePosition.y,
                z: mesh.userData.treePosition.z,
                duration: CONFIG.animationDuration,
                delay: delay,
                ease: CONFIG.animationEase
            });
        });

        // Animate top star
        gsap.to(topStar.position, {
            y: topStar.userData.originalY,
            duration: CONFIG.animationDuration,
            ease: CONFIG.animationEase
        });

        gsap.to(topStar.rotation, {
            y: Math.PI * 4,
            duration: CONFIG.animationDuration,
            ease: "power2.out"
        });

        // Show spiral ribbon
        setTimeout(() => {
            spiralRibbon.visible = true;
            spiralRibbon.material.opacity = 0;
            gsap.to(spiralRibbon.material, {
                opacity: 0.9,
                duration: 0.5,
                onComplete: resolve
            });
        }, CONFIG.animationDuration * 500);
    });
}
