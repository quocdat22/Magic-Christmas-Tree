/**
 * @file ornaments.js
 * @description Ornament creation and update logic
 * @dependencies config.js, geometry-helpers.js
 */

/**
 * Calculate position on tree cone
 * @param {number} index - Ornament index
 * @param {number} total - Total ornament count
 * @param {Object} CONFIG - Configuration object
 * @returns {THREE.Vector3} Position on tree
 */
export function calculateTreePosition(index, total, CONFIG) {
    const H = CONFIG.treeHeight;
    const R_base = CONFIG.treeBaseRadius;
    
    // Normalize index to [0, 1]
    const t = index / total;
    
    // Use power function to bias distribution towards bottom
    // Power 1.7 pushes more particles to the lower part
    const t_weighted = Math.pow(t, 1.7);
    
    // Height: distribute from bottom to top with weighted bias
    const y_local = t_weighted * H;
    
    // Center the tree vertically (offset by -H/2)
    const y = y_local - H / 2;
    
    // Radius decreases linearly with height (cone shape preserved)
    const r_at_y = R_base * (1 - y_local / H);
    
    // Random angle for this particle
    const theta = Math.random() * Math.PI * 2;
    
    // Adjust randomness based on height for better distribution
    let r_random;
    if (y < -5) {
        // Bottom: wider spread for fuller look
        r_random = r_at_y * (0.7 + Math.random() * 0.5);
    } else if (y > 5) {
        // Top: tighter for elegant look
        r_random = r_at_y * (0.85 + Math.random() * 0.3);
    } else {
        // Middle: standard spread
        r_random = r_at_y * (0.8 + Math.random() * 0.4);
    }
    
    // Convert to Cartesian coordinates
    const x = r_random * Math.cos(theta);
    const z = r_random * Math.sin(theta);
    
    return new THREE.Vector3(x, y, z);
}

/**
 * Calculate scatter position in sphere
 * @param {Object} CONFIG - Configuration object
 * @returns {THREE.Vector3} Random position in sphere
 */
export function calculateScatterPosition(CONFIG) {
    const radius = CONFIG.scatterRadius;
    
    // Random point in sphere using rejection sampling for uniform distribution
    let x, y, z;
    do {
        x = (Math.random() - 0.5) * 2 * radius;
        y = (Math.random() - 0.5) * 2 * radius;
        z = (Math.random() - 0.5) * 2 * radius;
    } while (x*x + y*y + z*z > radius * radius);
    
    return new THREE.Vector3(x, y, z);
}

/**
 * Create ornaments and add to scene
 * @param {THREE.Scene} scene - Three.js scene
 * @param {Object} CONFIG - Configuration object
 * @returns {Array<THREE.Mesh>} Array of ornament meshes
 */
export function createOrnaments(scene, CONFIG) {
    const ornaments = [];
    const colorArray = [
        CONFIG.colors.red,
        CONFIG.colors.green,
        CONFIG.colors.gold,
        CONFIG.colors.brown
    ];

    const H = CONFIG.treeHeight;
    const R_base = CONFIG.treeBaseRadius;

    for (let i = 0; i < CONFIG.ornamentCount; i++) {
        // Pre-calculate tree position to check if we should skip
        const treePos = calculateTreePosition(i, CONFIG.ornamentCount, CONFIG);
        const y = treePos.y;
        const y_normalized = (y + H / 2) / H; // 0 to 1
        
        // Skip 30% of ornaments in top quarter for sparse elegant look
        if (y_normalized > 0.75 && Math.random() < 0.3) {
            continue;
        }

        // Adjust size based on height - smaller at bottom to avoid clutter
        const sizeMultiplier = y < -5 ? 0.8 : 1.0;
        const baseSize = 0.3 + Math.random() * 0.4;
        const size = baseSize * sizeMultiplier;
        
        // Alternate between box and sphere
        const isBox = Math.random() > 0.5;
        
        let geometry;
        if (isBox) {
            geometry = new THREE.BoxGeometry(size, size, size);
        } else {
            geometry = new THREE.SphereGeometry(size * 0.5, 16, 16);
        }

        // Random color from palette
        const color = colorArray[Math.floor(Math.random() * colorArray.length)];
        
        const material = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.3,
            roughness: 0.4,
            emissive: color,
            emissiveIntensity: 0.2
        });

        const mesh = new THREE.Mesh(geometry, material);
        
        // Store rotation speed for animation
        mesh.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            },
            index: i,
            // Use pre-calculated tree position
            treePosition: treePos,
            // Pre-calculate scatter position
            scatterPosition: calculateScatterPosition(CONFIG)
        };

        // Start at scatter position
        mesh.position.copy(mesh.userData.scatterPosition);
        
        ornaments.push(mesh);
        scene.add(mesh);
    }

    // Add extra 100 ornaments at bottom third for denser look
    for (let i = 0; i < 100; i++) {
        // Force y in bottom third range
        const y = -H / 2 + Math.random() * (H / 3);
        const y_local = y + H / 2;
        
        // Calculate corresponding radius at this height
        const r_at_y = R_base * (1 - y_local / H);
        const theta = Math.random() * Math.PI * 2;
        const r_random = r_at_y * (0.7 + Math.random() * 0.5);
        
        const x = r_random * Math.cos(theta);
        const z = r_random * Math.sin(theta);
        
        // Smaller size for bottom density ornaments
        const size = (0.25 + Math.random() * 0.3) * 0.8;
        const isBox = Math.random() > 0.5;
        
        let geometry;
        if (isBox) {
            geometry = new THREE.BoxGeometry(size, size, size);
        } else {
            geometry = new THREE.SphereGeometry(size * 0.5, 16, 16);
        }

        const color = colorArray[Math.floor(Math.random() * colorArray.length)];
        
        const material = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.3,
            roughness: 0.4,
            emissive: color,
            emissiveIntensity: 0.2
        });

        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            },
            index: CONFIG.ornamentCount + i,
            treePosition: new THREE.Vector3(x, y, z),
            scatterPosition: calculateScatterPosition(CONFIG)
        };

        mesh.position.copy(mesh.userData.scatterPosition);
        
        ornaments.push(mesh);
        scene.add(mesh);
    }
    
    return ornaments;
}

/**
 * Update ornament rotations
 * @param {Array<THREE.Mesh>} ornaments - Array of ornament meshes
 */
export function updateOrnaments(ornaments) {
    ornaments.forEach(mesh => {
        mesh.rotation.x += mesh.userData.rotationSpeed.x;
        mesh.rotation.y += mesh.userData.rotationSpeed.y;
        mesh.rotation.z += mesh.userData.rotationSpeed.z;
    });
}
