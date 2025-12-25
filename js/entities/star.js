/**
 * @file star.js
 * @description Top star creation and animation
 * @dependencies config.js
 */

/**
 * Create a 5-pointed star geometry
 * @param {number} outerRadius - Outer radius of star
 * @param {number} innerRadius - Inner radius of star
 * @param {number} points - Number of points
 * @param {number} depth - Extrusion depth
 * @returns {THREE.ExtrudeGeometry} Star geometry
 */
export function createStarGeometry(outerRadius = 1.5, innerRadius = 0.75, points = 5, depth = 0.3) {
    const shape = new THREE.Shape();
    
    for (let i = 0; i <= points * 2; i++) {
        const angle = (i / (points * 2)) * Math.PI * 2;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        if (i === 0) {
            shape.moveTo(x, y);
        } else {
            shape.lineTo(x, y);
        }
    }
    
    const extrudeSettings = {
        depth: depth,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 2,
        bevelSize: 0.1,
        bevelThickness: 0.1
    };
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
}

/**
 * Create top star with glow
 * @param {THREE.Scene} scene - Three.js scene
 * @param {Object} CONFIG - Configuration object
 * @returns {THREE.Mesh} Top star mesh
 */
export function createTopStar(scene, CONFIG) {
    // Create 5-pointed star geometry
    const geometry = createStarGeometry(1.5, 0.75, 5, 0.3);
    
    const material = new THREE.MeshStandardMaterial({
        color: CONFIG.colors.gold,
        metalness: 0.8,
        roughness: 0.2,
        emissive: CONFIG.colors.gold,
        emissiveIntensity: 0.5
    });

    const topStar = new THREE.Mesh(geometry, material);
    topStar.position.set(0, CONFIG.treeHeight / 2 + 2, 0);
    topStar.userData = {
        originalY: CONFIG.treeHeight / 2 + 2,
        scatterY: 60
    };
    
    scene.add(topStar);

    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(2.5, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: CONFIG.colors.gold,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    topStar.add(glow);
    
    return topStar;
}

/**
 * Update star animation
 * @param {THREE.Mesh} topStar - Top star mesh
 * @param {number} time - Current time in seconds
 */
export function updateStar(topStar, time) {
    if (!topStar) return;
    
    topStar.rotation.y += 0.01;
    topStar.rotation.x = Math.sin(time) * 0.1;
}

/**
 * Create star dust particles
 * @param {THREE.Scene} scene - Three.js scene
 * @param {Object} CONFIG - Configuration object
 * @returns {THREE.Points} Star dust points object
 */
export function createStarDust(scene, CONFIG) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(CONFIG.starDustCount * 3);
    const colors = new Float32Array(CONFIG.starDustCount * 3);
    const sizes = new Float32Array(CONFIG.starDustCount);

    for (let i = 0; i < CONFIG.starDustCount; i++) {
        const i3 = i * 3;
        
        // Random position in a large sphere around tree area
        const radius = 30 + Math.random() * 40;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.cos(phi);
        positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

        // Yellow to white colors
        const brightness = 0.8 + Math.random() * 0.2;
        colors[i3] = brightness;
        colors[i3 + 1] = brightness;
        colors[i3 + 2] = brightness * 0.8;

        sizes[i] = Math.random() * 2 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: 0.3,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });

    const starDust = new THREE.Points(geometry, material);
    starDust.userData = { originalPositions: positions.slice() };
    scene.add(starDust);
    
    return starDust;
}

/**
 * Update star dust animation
 * @param {THREE.Points} starDust - Star dust points object
 * @param {number} time - Current time in seconds
 */
export function updateStarDust(starDust, time) {
    if (!starDust) return;
    
    const positions = starDust.geometry.attributes.position.array;
    const original = starDust.userData.originalPositions;
    
    for (let i = 0; i < positions.length; i += 3) {
        positions[i] = original[i] + Math.sin(time + i) * 0.5;
        positions[i + 1] = original[i + 1] + Math.cos(time + i) * 0.5;
        positions[i + 2] = original[i + 2] + Math.sin(time + i * 0.5) * 0.5;
    }
    starDust.geometry.attributes.position.needsUpdate = true;
}
