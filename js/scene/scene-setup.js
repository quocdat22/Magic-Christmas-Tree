/**
 * @file scene-setup.js
 * @description Three.js scene initialization and background setup
 * @dependencies None
 */

/**
 * Create and configure Three.js scene with gradient background
 * @returns {THREE.Scene} Configured scene object
 */
export function setupScene() {
    const scene = new THREE.Scene();
    
    // Winter gradient background (top: #0A1628, bottom: #1B3A52)
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#0A1628');
    gradient.addColorStop(1, '#1B3A52');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2, 256);
    const texture = new THREE.CanvasTexture(canvas);
    scene.background = texture;
    
    scene.fog = new THREE.FogExp2(0x0A1628, 0.01);
    
    return scene;
}

/**
 * Create sky dome with aurora shader
 * @param {THREE.Scene} scene - Scene to add sky dome to
 * @returns {Object} Object containing skyDome mesh and material
 */
export function createSkyDome(scene) {
    const geometry = new THREE.SphereGeometry(150, 64, 64);
    
    // Invert normals by scaling negatively
    geometry.scale(-1, -1, -1);

    // Vertex Shader
    const vertexShader = `
        varying vec3 vPosition;
        varying vec2 vUv;
        
        void main() {
            vPosition = position;
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    // Fragment Shader
    const fragmentShader = `
        uniform float uTime;
        uniform vec3 uAuroraColor1;
        uniform vec3 uAuroraColor2;
        uniform vec3 uAuroraColor3;
        uniform vec3 uSkyColorBottom;
        uniform vec3 uSkyColorTop;
        
        varying vec3 vPosition;
        varying vec2 vUv;
        
        // Smooth step function for blending
        float smoothBlend(float edge0, float edge1, float x) {
            float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
            return t * t * (3.0 - 2.0 * t);
        }
        
        void main() {
            // Base gradient from horizon to zenith
            vec3 skyColor = mix(uSkyColorBottom, uSkyColorTop, vUv.y);
            
            // Aurora bands - only visible in upper hemisphere
            float auroraVisibility = smoothBlend(0.4, 0.6, vUv.y);
            
            if (auroraVisibility > 0.0) {
                // Layer 1: Green aurora
                float wave1 = sin(vUv.x * 3.0 + uTime * 0.5) * 0.5 + 0.5;
                wave1 = smoothBlend(0.3, 0.7, wave1);
                vec3 aurora1 = uAuroraColor1 * wave1 * 0.3;
                
                // Layer 2: Cyan aurora
                float wave2 = sin(vUv.x * 5.0 - uTime * 0.3 + 1.5) * 0.5 + 0.5;
                wave2 = smoothBlend(0.2, 0.8, wave2);
                vec3 aurora2 = uAuroraColor2 * wave2 * 0.25;
                
                // Layer 3: Magenta aurora
                float wave3 = sin(vUv.x * 7.0 + uTime * 0.7 + 3.0) * 0.5 + 0.5;
                wave3 = smoothBlend(0.25, 0.75, wave3);
                vec3 aurora3 = uAuroraColor3 * wave3 * 0.2;
                
                // Combine aurora layers
                vec3 aurora = (aurora1 + aurora2 + aurora3) * auroraVisibility;
                
                // Add some vertical variation
                float verticalVariation = sin(vUv.y * 8.0 + uTime * 0.2) * 0.5 + 0.5;
                aurora *= 0.5 + verticalVariation * 0.5;
                
                // Blend aurora with sky
                skyColor += aurora;
            }
            
            gl_FragColor = vec4(skyColor, 1.0);
        }
    `;

    // Shader Material
    const skyMaterial = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            uTime: { value: 0.0 },
            uAuroraColor1: { value: new THREE.Vector3(0.0, 1.0, 0.53) },
            uAuroraColor2: { value: new THREE.Vector3(0.38, 0.94, 1.0) },
            uAuroraColor3: { value: new THREE.Vector3(1.0, 0.0, 1.0) },
            uSkyColorBottom: { value: new THREE.Vector3(0.039, 0.086, 0.157) }, // #0A1628
            uSkyColorTop: { value: new THREE.Vector3(0.020, 0.020, 0.063) } // #000510
        },
        side: THREE.BackSide,
        depthWrite: false
    });

    const skyDome = new THREE.Mesh(geometry, skyMaterial);
    skyDome.renderOrder = -1; // Render first
    scene.add(skyDome);
    
    return { skyDome, skyMaterial };
}

/**
 * Create twinkling stars on sky dome
 * @param {THREE.Scene} scene - Scene to add stars to
 * @returns {THREE.Points} Stars points object
 */
export function createTwinklingStars(scene) {
    const starCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const phases = new Float32Array(starCount);
    const speeds = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
        // Random position on upper hemisphere of sphere (radius 149 to sit on sky dome)
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 0.5; // 0 to PI/2 for upper hemisphere
        const radius = 149;
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.cos(phi);
        positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

        // Random size with some prominent stars
        if (Math.random() < 0.05) {
            sizes[i] = 3.0 + Math.random() * 2.0; // Prominent stars
        } else {
            sizes[i] = 0.5 + Math.random() * 1.5; // Normal stars
        }

        // Random phase for twinkle offset
        phases[i] = Math.random() * Math.PI * 2;

        // 20% stars twinkle faster
        speeds[i] = Math.random() < 0.2 ? 2.0 : 1.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0.0 },
            uColor: { value: new THREE.Vector3(1.0, 1.0, 1.0) }
        },
        vertexShader: `
            attribute float size;
            attribute float phase;
            attribute float speed;
            uniform float uTime;
            varying float vOpacity;
            
            void main() {
                vOpacity = 0.3 + sin(uTime * 2.0 * speed + phase) * 0.7;
                vOpacity = clamp(vOpacity, 0.3, 1.0);
                
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 uColor;
            varying float vOpacity;
            
            void main() {
                float distance = length(gl_PointCoord - vec2(0.5));
                if (distance > 0.5) discard;
                
                float alpha = 1.0 - distance * 2.0;
                gl_FragColor = vec4(uColor, alpha * vOpacity);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const twinklingStars = new THREE.Points(geometry, material);
    scene.add(twinklingStars);
    
    return twinklingStars;
}

/**
 * Create cloud layer
 * @param {THREE.Scene} scene - Scene to add clouds to
 * @param {Function} createCloudTexture - Function to create cloud texture
 * @returns {Array<THREE.Mesh>} Array of cloud meshes
 */
export function createCloudLayer(scene, createCloudTexture) {
    const cloudCount = 25;
    const cloudLayer = [];

    for (let i = 0; i < cloudCount; i++) {
        // Create cloud texture using canvas
        const cloudTexture = createCloudTexture();
        
        const geometry = new THREE.PlaneGeometry(8 + Math.random() * 4, 5 + Math.random() * 3);
        const material = new THREE.MeshBasicMaterial({
            map: cloudTexture,
            transparent: true,
            opacity: 0.1 + Math.random() * 0.1,
            depthWrite: false,
            blending: THREE.NormalBlending
        });

        const cloud = new THREE.Mesh(geometry, material);
        
        // Random position
        cloud.position.set(
            (Math.random() - 0.5) * 160,
            30 + Math.random() * 10,
            (Math.random() - 0.5) * 160
        );

        // Random rotation
        cloud.rotation.z = Math.random() * Math.PI * 2;

        // Random drift velocity
        cloud.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.02,
            0,
            (Math.random() - 0.5) * 0.02
        );

        scene.add(cloud);
        cloudLayer.push(cloud);
    }
    
    return cloudLayer;
}

/**
 * Update cloud layer positions
 * @param {Array<THREE.Mesh>} cloudLayer - Array of cloud meshes
 */
export function updateCloudLayer(cloudLayer) {
    cloudLayer.forEach(cloud => {
        // Drift
        cloud.position.x += cloud.userData.velocity.x;
        cloud.position.z += cloud.userData.velocity.z;

        // Wrap around boundaries
        const boundary = 80;
        if (cloud.position.x > boundary) cloud.position.x = -boundary;
        if (cloud.position.x < -boundary) cloud.position.x = boundary;
        if (cloud.position.z > boundary) cloud.position.z = -boundary;
        if (cloud.position.z < -boundary) cloud.position.z = boundary;

        // Subtle rotation
        cloud.rotation.z += 0.0002;
    });
}

/**
 * Create shooting star
 * @param {THREE.Scene} scene - Scene to add shooting star to
 * @param {Array<THREE.Mesh>} shootingStars - Array tracking active shooting stars
 */
export function createShootingStar(scene, shootingStars) {
    if (shootingStars.length >= 3) return; // Max 3 at once

    // Random position on edge of view
    const side = Math.floor(Math.random() * 4);
    const startPos = new THREE.Vector3();
    const endPos = new THREE.Vector3();

    switch(side) {
        case 0: // Top
            startPos.set((Math.random() - 0.5) * 100, 60, (Math.random() - 0.5) * 100);
            endPos.set(startPos.x - 30, startPos.y - 40, startPos.z - 30);
            break;
        case 1: // Right
            startPos.set(60, (Math.random() - 0.5) * 60 + 30, (Math.random() - 0.5) * 100);
            endPos.set(startPos.x - 40, startPos.y - 30, startPos.z - 30);
            break;
        case 2: // Left
            startPos.set(-60, (Math.random() - 0.5) * 60 + 30, (Math.random() - 0.5) * 100);
            endPos.set(startPos.x + 40, startPos.y - 30, startPos.z - 30);
            break;
        case 3: // Back
            startPos.set((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 60 + 40, 60);
            endPos.set(startPos.x - 30, startPos.y - 30, startPos.z - 50);
            break;
    }

    // Create elongated geometry for shooting star
    const length = 5 + Math.random() * 5;
    const geometry = new THREE.CylinderGeometry(0.05, 0.15, length, 8);
    const material = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
    });

    const shootingStar = new THREE.Mesh(geometry, material);
    shootingStar.position.copy(startPos);
    
    // Orient towards direction
    const direction = new THREE.Vector3().subVectors(endPos, startPos).normalize();
    shootingStar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

    // Add glow
    const glowGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xADD8E6,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    shootingStar.add(glow);

    scene.add(shootingStar);

    // Animate
    const speed = 20 + Math.random() * 10;
    const duration = startPos.distanceTo(endPos) / speed;

    // Fade in
    gsap.to(material, { opacity: 1, duration: 0.1 });
    gsap.to(glowMaterial, { opacity: 0.6, duration: 0.1 });

    // Move
    gsap.to(shootingStar.position, {
        x: endPos.x,
        y: endPos.y,
        z: endPos.z,
        duration: duration,
        ease: 'none'
    });

    // Fade out and remove
    gsap.to(material, {
        opacity: 0,
        duration: 0.5,
        delay: duration - 0.5
    });

    gsap.to(glowMaterial, {
        opacity: 0,
        duration: 0.5,
        delay: duration - 0.5,
        onComplete: () => {
            scene.remove(shootingStar);
            geometry.dispose();
            material.dispose();
            glowGeometry.dispose();
            glowMaterial.dispose();
            const index = shootingStars.indexOf(shootingStar);
            if (index > -1) shootingStars.splice(index, 1);
        }
    });

    shootingStars.push(shootingStar);
}
