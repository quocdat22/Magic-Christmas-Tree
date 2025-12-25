/**
 * @file spiral-ribbon.js
 * @description Spiral ribbon around tree
 * @dependencies config.js
 */

/**
 * Create spiral ribbon around tree
 * @param {THREE.Scene} scene - Three.js scene
 * @param {Object} CONFIG - Configuration object
 * @returns {THREE.Points} Spiral ribbon points object
 */
export function createSpiralRibbon(scene, CONFIG) {
    const points = [];
    const H = CONFIG.treeHeight;
    const R_base = CONFIG.treeBaseRadius;
    const turns = 5; // Number of spiral turns

    for (let i = 0; i < CONFIG.spiralDotCount; i++) {
        const t = i / CONFIG.spiralDotCount;
        const y_local = t * H;
        const y = y_local - H / 2; // Center vertically
        const r = R_base * (1 - y_local / H) * 0.9; // Slightly inside the tree
        const theta = t * turns * Math.PI * 2;
        
        const x = r * Math.cos(theta);
        const z = r * Math.sin(theta);
        
        points.push(new THREE.Vector3(x, y, z));
    }

    // Create geometry from points
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    const material = new THREE.PointsMaterial({
        color: CONFIG.colors.gold,
        size: 0.15,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
    });

    const spiralRibbon = new THREE.Points(geometry, material);
    spiralRibbon.userData = {
        treePositions: geometry.attributes.position.array.slice(),
        visible: false
    };
    spiralRibbon.visible = false;
    scene.add(spiralRibbon);
    
    return spiralRibbon;
}
