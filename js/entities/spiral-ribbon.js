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
    
    // Create size and opacity arrays for individual point animation
    const sizes = new Float32Array(CONFIG.spiralDotCount);
    const alphas = new Float32Array(CONFIG.spiralDotCount);
    for (let i = 0; i < CONFIG.spiralDotCount; i++) {
        sizes[i] = 0.5;
        alphas[i] = 0.5; // Visible by default
    }
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    
    // Custom shader material for per-particle opacity
    const material = new THREE.ShaderMaterial({
        uniforms: {
            color: { value: new THREE.Color(CONFIG.colors.gold) }
        },
        vertexShader: `
            attribute float size;
            attribute float alpha;
            varying float vAlpha;
            void main() {
                vAlpha = alpha;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            varying float vAlpha;
            void main() {
                float dist = length(gl_PointCoord - vec2(0.5));
                if (dist > 0.5) discard;
                float strength = 1.0 - (dist * 2.0);
                gl_FragColor = vec4(color, vAlpha * strength);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
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

/**
 * Update spiral ribbon animation - light running from top to bottom
 * @param {THREE.Points} spiralRibbon - Spiral ribbon points
 * @param {number} time - Current time in seconds
 * @param {Object} CONFIG - Configuration object
 */
export function updateSpiralRibbon(spiralRibbon, time, CONFIG) {
    if (!spiralRibbon.visible) return;
    
    const geometry = spiralRibbon.geometry;
    const sizes = geometry.attributes.size.array;
    const alphas = geometry.attributes.alpha.array;
    const positions = geometry.attributes.position.array;
    
    const H = CONFIG.treeHeight;
    const speed = 0.8; // Slow speed
    const waveLength = 5; // Length of the light wave
    
    // Calculate wave position (from top to bottom, repeating)
    const wavePosition = ((time * speed) % (H + waveLength)) - H / 2 - waveLength;
    
    for (let i = 0; i < CONFIG.spiralDotCount; i++) {
        const y = positions[i * 3 + 1]; // Get y coordinate
        
        // Calculate distance from wave center
        const distance = Math.abs(y - wavePosition);
        
        // Create smooth falloff for the light effect
        let intensity;
        if (distance < waveLength / 2) {
            intensity = 1 - (distance / (waveLength / 2));
            intensity = Math.pow(intensity, 3); // Stronger curve for more contrast
        } else {
            intensity = 0;
        }
        
        // Set size and opacity based on intensity
        sizes[i] = 0.5 + intensity * 2.5; // 0.5 to 3.0
        alphas[i] = 0.5 + intensity * 0.5; // 0.5 to 1.0
    }
    
    geometry.attributes.size.needsUpdate = true;
    geometry.attributes.alpha.needsUpdate = true;
}
