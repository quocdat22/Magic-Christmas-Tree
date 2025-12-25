/**
 * @file geometry-helpers.js
 * @description Helper functions for 3D geometry calculations
 * @dependencies None
 */

/**
 * Generate a random point within a sphere
 * @param {number} radius - Sphere radius
 * @returns {THREE.Vector3} Random point within sphere
 */
export function randomInSphere(radius) {
    let x, y, z;
    do {
        x = (Math.random() - 0.5) * 2 * radius;
        y = (Math.random() - 0.5) * 2 * radius;
        z = (Math.random() - 0.5) * 2 * radius;
    } while (x*x + y*y + z*z > radius * radius);
    
    return new THREE.Vector3(x, y, z);
}

/**
 * Generate a point on a cone surface
 * @param {number} height - Cone height
 * @param {number} baseRadius - Base radius of cone
 * @param {number} t - Parameter from 0 to 1 (0 = bottom, 1 = top)
 * @returns {THREE.Vector3} Point on cone surface
 */
export function randomOnCone(height, baseRadius, t) {
    const y_local = t * height;
    const y = y_local - height / 2; // Center vertically
    const r = baseRadius * (1 - y_local / height);
    const theta = Math.random() * Math.PI * 2;
    
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    
    return new THREE.Vector3(x, y, z);
}

/**
 * Create a cloud texture using canvas
 * @returns {THREE.CanvasTexture} Cloud texture
 */
export function createCloudTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Create noise-based cloud
    ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    ctx.fillRect(0, 0, 256, 256);

    // Draw multiple overlapping circles for cloud effect
    for (let i = 0; i < 8; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const radius = 30 + Math.random() * 60;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

/**
 * Create a snow particle texture
 * @returns {THREE.CanvasTexture} Snow texture
 */
export function createSnowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}
