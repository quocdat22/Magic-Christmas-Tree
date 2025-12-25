/**
 * @file snow.js
 * @description Snow particle system with hand interaction
 * @dependencies config.js, geometry-helpers.js
 */

/**
 * Create snow particle system
 * @param {THREE.Scene} scene - Three.js scene
 * @param {Object} CONFIG - Configuration object
 * @param {Function} createSnowTexture - Function to create snow texture
 * @returns {Object} Object containing snow particles and velocities
 */
export function createSnowSystem(scene, CONFIG, createSnowTexture) {
    const snowCount = CONFIG.snowCount;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(snowCount * 3);
    const sizes = new Float32Array(snowCount);
    const snowVelocities = [];
    const snowSizes = [];

    for (let i = 0; i < snowCount; i++) {
        const i3 = i * 3;
        
        // Random position in a large area
        positions[i3] = (Math.random() - 0.5) * 100;     // x
        positions[i3 + 1] = Math.random() * 80 - 10;      // y (high up)
        positions[i3 + 2] = (Math.random() - 0.5) * 100;  // z

        // Random size
        sizes[i] = Math.random() * 0.6 + 0.2; // 0.2 to 0.8
        snowSizes.push(sizes[i]);

        // Random velocity
        snowVelocities.push({
            y: -(Math.random() * 0.06 + 0.02), // -0.02 to -0.08 (falling speed)
            x: 0,
            z: 0
        });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 0.5,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        map: createSnowTexture(),
        depthWrite: false
    });

    const snowParticles = new THREE.Points(geometry, material);
    scene.add(snowParticles);
    
    return {
        snowParticles,
        snowVelocities,
        snowSizes
    };
}

/**
 * Update snow system animation
 * @param {THREE.Points} snowParticles - Snow particles object
 * @param {Array} snowVelocities - Velocity array
 * @param {number} snowCount - Number of snow particles
 * @param {boolean} handDetected - Whether hand is detected
 * @param {THREE.Vector3} handPosition - Hand position in 3D space
 * @param {Object} CONFIG - Configuration object
 */
export function updateSnowSystem(snowParticles, snowVelocities, snowCount, handDetected, handPosition, CONFIG) {
    if (!snowParticles) return;

    const positions = snowParticles.geometry.attributes.position.array;

    for (let i = 0; i < snowCount; i++) {
        const i3 = i * 3;
        const velocity = snowVelocities[i];

        // Apply velocity
        positions[i3] += velocity.x;
        positions[i3 + 1] += velocity.y;
        positions[i3 + 2] += velocity.z;

        // Hand interaction - blow away snow
        if (handDetected) {
            const dx = positions[i3] - handPosition.x;
            const dy = positions[i3 + 1] - handPosition.y;
            const dz = positions[i3 + 2] - handPosition.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (distance < CONFIG.snowInteractionRadius) {
                const force = (CONFIG.snowInteractionRadius - distance) / CONFIG.snowInteractionRadius;
                velocity.x += (dx / distance) * force * 0.2;
                velocity.z += (dz / distance) * force * 0.2;
            }
        }

        // Decay horizontal velocity
        velocity.x *= 0.98;
        velocity.z *= 0.98;

        // Reset if fallen below ground
        if (positions[i3 + 1] < -10) {
            positions[i3] = (Math.random() - 0.5) * 100;
            positions[i3 + 1] = Math.random() * 30 + 50; // High up
            positions[i3 + 2] = (Math.random() - 0.5) * 100;
            velocity.x = 0;
            velocity.z = 0;
            velocity.y = -(Math.random() * 0.06 + 0.02);
        }
    }

    snowParticles.geometry.attributes.position.needsUpdate = true;
}

/**
 * Create snow wave effect (Open Hand gesture)
 * @param {THREE.Points} snowParticles - Snow particles object
 * @param {Array} snowVelocities - Velocity array
 * @param {number} snowCount - Number of snow particles
 * @param {THREE.Vector3} position - Hand position
 * @param {Object} CONFIG - Configuration object
 */
export function createSnowWave(snowParticles, snowVelocities, snowCount, position, CONFIG) {
    if (!snowParticles) return;

    const positions = snowParticles.geometry.attributes.position.array;

    for (let i = 0; i < Math.min(200, snowCount); i++) {
        const randomIndex = Math.floor(Math.random() * snowCount);
        const i3 = randomIndex * 3;

        // Calculate direction from hand
        const dx = positions[i3] - position.x;
        const dy = positions[i3 + 1] - position.y;
        const dz = positions[i3 + 2] - position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance < CONFIG.snowWaveRadius) {
            const velocity = snowVelocities[randomIndex];
            const force = 0.5;
            velocity.x += (dx / distance) * force;
            velocity.y += 0.3; // Upward boost
            velocity.z += (dz / distance) * force;
        }
    }
}

/**
 * Create snow spiral effect (Fist gesture)
 * @param {THREE.Points} snowParticles - Snow particles object
 * @param {Array} snowVelocities - Velocity array
 * @param {number} snowCount - Number of snow particles
 * @param {THREE.Vector3} position - Hand position
 * @param {Object} CONFIG - Configuration object
 */
export function createSnowSpiral(snowParticles, snowVelocities, snowCount, position, CONFIG) {
    if (!snowParticles) return;

    const positions = snowParticles.geometry.attributes.position.array;
    const time = Date.now() * 0.003;

    for (let i = 0; i < snowCount; i++) {
        const i3 = i * 3;
        const dx = positions[i3] - position.x;
        const dy = positions[i3 + 1] - position.y;
        const dz = positions[i3 + 2] - position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance < CONFIG.snowSpiralRadius) {
            const velocity = snowVelocities[i];
            const angle = Math.atan2(dz, dx) + 0.1; // Spiral angle
            const force = (CONFIG.snowSpiralRadius - distance) / CONFIG.snowSpiralRadius * 0.1;
            
            velocity.x += Math.cos(angle) * force;
            velocity.z += Math.sin(angle) * force;
            velocity.y += Math.sin(time + i * 0.1) * 0.05; // Oscillate vertically
        }
    }
}
