/**
 * @file hand-tracking.js
 * @description Hand tracking system using MediaPipe
 * @dependencies config.js, snow.js, transitions.js
 */

import { createSnowWave, createSnowSpiral } from '../entities/snow.js';
import { transitionState, updateButtonState } from '../animations/transitions.js';

// Hand tracking state
let handTrackingEnabled = false;
let handsDetector = null;
let handCamera = null;
let lastGesture = null;
let lastGestureTime = 0;

/**
 * Hand tracking state object
 * @type {Object}
 */
export const handTrackingState = {
    enabled: false,
    detected: false,
    position: new THREE.Vector3(),
    gesture: 'none'
};

/**
 * Toggle hand tracking on/off
 * @param {Object} dependencies - Required dependencies
 * @returns {Promise<void>}
 */
export async function toggleHandTracking(dependencies) {
    const { CONFIG } = dependencies;
    const btn = document.getElementById('handTrackingBtn');
    const webcamContainer = document.getElementById('webcam-container');
    const gestureDisplay = document.getElementById('gesture-display');
    const instruction = document.getElementById('hand-instruction');

    if (!handTrackingEnabled) {
        // Enable hand tracking
        btn.textContent = '⏳ Loading...';
        btn.disabled = true;

        try {
            await initHandTracking(dependencies);
            handTrackingEnabled = true;
            handTrackingState.enabled = true;
            btn.textContent = '🛑 Stop Hand Control';
            btn.classList.add('active');
            webcamContainer.classList.add('active');
            gestureDisplay.classList.add('active');
            instruction.classList.add('active');
        } catch (error) {
            console.error('Hand tracking error:', error);
            alert('Could not start hand tracking. Please ensure camera access is allowed.');
            btn.textContent = '✋ Hand Control';
        }
        btn.disabled = false;
    } else {
        // Disable hand tracking
        stopHandTracking();
        handTrackingEnabled = false;
        handTrackingState.enabled = false;
        btn.textContent = '✋ Hand Control';
        btn.classList.remove('active');
        webcamContainer.classList.remove('active');
        gestureDisplay.classList.remove('active');
        instruction.classList.remove('active');
    }
}

/**
 * Initialize MediaPipe hand tracking
 * @param {Object} dependencies - Required dependencies
 * @returns {Promise<void>}
 */
export async function initHandTracking(dependencies) {
    const { CONFIG } = dependencies;
    const videoElement = document.getElementById('webcam');
    const canvasElement = document.getElementById('hand-canvas');
    const canvasCtx = canvasElement.getContext('2d');

    // Initialize MediaPipe Hands
    handsDetector = new Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
    });

    handsDetector.setOptions({
        maxNumHands: CONFIG.handTracking.maxNumHands,
        modelComplexity: CONFIG.handTracking.modelComplexity,
        minDetectionConfidence: CONFIG.handTracking.minDetectionConfidence,
        minTrackingConfidence: CONFIG.handTracking.minTrackingConfidence
    });

    handsDetector.onResults((results) => onHandResults(results, canvasElement, canvasCtx, dependencies));

    // Initialize Camera
    handCamera = new Camera(videoElement, {
        onFrame: async () => {
            if (handsDetector) {
                await handsDetector.send({ image: videoElement });
            }
        },
        width: 320,
        height: 240
    });

    await handCamera.start();
}

/**
 * Stop hand tracking
 */
export function stopHandTracking() {
    if (handCamera) {
        handCamera.stop();
        handCamera = null;
    }
    if (handsDetector) {
        handsDetector.close();
        handsDetector = null;
    }
    lastGesture = null;
    handTrackingState.detected = false;
}

/**
 * Process hand detection results
 * @param {Object} results - MediaPipe results
 * @param {HTMLCanvasElement} canvasElement - Canvas element
 * @param {CanvasRenderingContext2D} canvasCtx - Canvas context
 * @param {Object} dependencies - Required dependencies
 */
function onHandResults(results, canvasElement, canvasCtx, dependencies) {
    const { 
        CONFIG, 
        isGathered, 
        animationState, 
        ornaments, 
        topStar, 
        spiralRibbon, 
        starLight,
        snowParticles,
        snowVelocities,
        snowCount
    } = dependencies;

    // Set canvas size
    canvasElement.width = 320;
    canvasElement.height = 240;

    // Clear canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];

        // Draw hand connections and landmarks
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
            color: '#00FF00',
            lineWidth: 3
        });
        drawLandmarks(canvasCtx, landmarks, {
            color: '#FF0000',
            lineWidth: 1,
            radius: 3
        });

        // Update hand position for snow interaction
        handTrackingState.detected = true;
        const palmCenter = landmarks[9]; // Middle finger MCP as palm center
        // Map from normalized coordinates to 3D space
        handTrackingState.position.x = (palmCenter.x - 0.5) * 80;
        handTrackingState.position.y = (0.5 - palmCenter.y) * 60;
        handTrackingState.position.z = 20;

        // Detect gesture
        const gesture = detectGesture(landmarks);
        handTrackingState.gesture = gesture;
        updateGestureDisplay(gesture);

        // Snow effects based on gesture
        const currentTime = Date.now();
        
        // Continuous spiral effect when fist is held
        if (gesture === 'fist') {
            createSnowSpiral(snowParticles, snowVelocities, snowCount, handTrackingState.position, CONFIG);
        }

        // Trigger action based on gesture
        if (gesture !== lastGesture && currentTime - lastGestureTime > CONFIG.handTracking.gestureDebounceTime) {
            if (gesture === 'fist' && !isGathered.value && !animationState.animating) {
                isGathered.value = true;
                transitionState(true, ornaments, topStar, spiralRibbon, starLight, CONFIG, animationState);
                updateButtonState(true);
                lastGestureTime = currentTime;
            } else if (gesture === 'open' && isGathered.value && !animationState.animating) {
                isGathered.value = false;
                transitionState(false, ornaments, topStar, spiralRibbon, starLight, CONFIG, animationState);
                updateButtonState(false);
                // Snow wave effect
                createSnowWave(snowParticles, snowVelocities, snowCount, handTrackingState.position, CONFIG);
                lastGestureTime = currentTime;
            } else if (gesture === 'open') {
                // Even if not changing state, create wave effect
                createSnowWave(snowParticles, snowVelocities, snowCount, handTrackingState.position, CONFIG);
                lastGestureTime = currentTime;
            }
            lastGesture = gesture;
        }
    } else {
        updateGestureDisplay('none');
        handTrackingState.detected = false;
    }

    canvasCtx.restore();
}

/**
 * Detect hand gesture from landmarks
 * @param {Array} landmarks - Hand landmarks
 * @returns {string} Detected gesture: 'fist', 'open', 'partial', or 'none'
 */
function detectGesture(landmarks) {
    // Finger tip indices: thumb(4), index(8), middle(12), ring(16), pinky(20)
    // Finger MCP (base) indices: thumb(2), index(5), middle(9), ring(13), pinky(17)
    // Finger PIP (middle joint) indices: thumb(3), index(6), middle(10), ring(14), pinky(18)

    const fingerTips = [4, 8, 12, 16, 20];
    const fingerPIPs = [3, 6, 10, 14, 18];
    const fingerMCPs = [2, 5, 9, 13, 17];

    let fingersExtended = 0;

    // Check thumb (compare x position for horizontal spread)
    const thumbTip = landmarks[4];
    const thumbIP = landmarks[3];
    const thumbMCP = landmarks[2];
    
    // Thumb is extended if tip is far from palm center
    const palmCenter = landmarks[0]; // wrist
    const thumbExtended = Math.abs(thumbTip.x - palmCenter.x) > 0.1;
    if (thumbExtended) fingersExtended++;

    // Check other 4 fingers (compare y positions - lower y = higher on screen = extended)
    for (let i = 1; i < 5; i++) {
        const tipY = landmarks[fingerTips[i]].y;
        const pipY = landmarks[fingerPIPs[i]].y;
        const mcpY = landmarks[fingerMCPs[i]].y;

        // Finger is extended if tip is above (lower y) the PIP joint
        if (tipY < pipY - 0.02) {
            fingersExtended++;
        }
    }

    // Determine gesture
    if (fingersExtended >= 4) {
        return 'open'; // Open hand - Scatter
    } else if (fingersExtended <= 1) {
        return 'fist'; // Fist - Gather
    } else {
        return 'partial';
    }
}

/**
 * Update gesture display UI
 * @param {string} gesture - Detected gesture
 */
function updateGestureDisplay(gesture) {
    const gestureIcon = document.getElementById('gestureIcon');
    const gestureText = document.getElementById('gestureText');

    switch (gesture) {
        case 'fist':
            gestureIcon.textContent = '✊';
            gestureText.textContent = 'Nắm tay → GATHER';
            gestureText.style.color = '#4ADE80';
            break;
        case 'open':
            gestureIcon.textContent = '🖐️';
            gestureText.textContent = 'Mở tay → SCATTER';
            gestureText.style.color = '#F87171';
            break;
        case 'partial':
            gestureIcon.textContent = '🤚';
            gestureText.textContent = 'Detecting...';
            gestureText.style.color = '#FFD700';
            break;
        case 'none':
            gestureIcon.textContent = '👋';
            gestureText.textContent = 'Show your hand';
            gestureText.style.color = '#FFD700';
            break;
    }
}
