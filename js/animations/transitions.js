/**
 * @file transitions.js
 * @description State transition management
 * @dependencies gather.js, scatter.js
 */

import { gatherAll } from './gather.js';
import { scatterAll } from './scatter.js';

/**
 * Transition between gathered and scattered states
 * @param {boolean} toGathered - Target state
 * @param {Array<THREE.Mesh>} ornaments - Ornament meshes
 * @param {THREE.Mesh} topStar - Top star mesh
 * @param {THREE.Points} spiralRibbon - Spiral ribbon points
 * @param {THREE.PointLight} starLight - Star light reference
 * @param {Object} CONFIG - Configuration object
 * @param {Object} animationState - Animation state object with { animating: boolean }
 * @returns {Promise} Resolves when transition completes
 */
export async function transitionState(toGathered, ornaments, topStar, spiralRibbon, starLight, CONFIG, animationState) {
    if (animationState.animating) return;
    animationState.animating = true;

    const btn = document.getElementById('toggleBtn');
    btn.disabled = true;

    if (toGathered) {
        await gatherAll(ornaments, topStar, spiralRibbon, starLight, CONFIG);
    } else {
        await scatterAll(ornaments, topStar, spiralRibbon, starLight, CONFIG);
    }

    // Re-enable button after animation
    setTimeout(() => {
        animationState.animating = false;
        btn.disabled = false;
        btn.className = toGathered ? 'btn btn-scatter' : 'btn btn-gather';
        btn.innerHTML = toGathered ? '💥 Scatter' : '🎄 Gather';
    }, CONFIG.animationDuration * 1000);
}

/**
 * Update button UI state
 * @param {boolean} isGathered - Current state
 */
export function updateButtonState(isGathered) {
    const btn = document.getElementById('toggleBtn');
    btn.className = isGathered ? 'btn btn-scatter' : 'btn btn-gather';
    btn.innerHTML = isGathered ? '💥 Scatter' : '🎄 Gather';
}
