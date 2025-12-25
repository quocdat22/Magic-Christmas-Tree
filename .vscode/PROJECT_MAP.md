# Magic Christmas Tree - Project Map

## 🎄 Quick Navigation Guide

### Want to change...

#### 🎨 **Visual Appearance**
- **Colors**: → `js/config.js` (CONFIG.colors)
- **Tree size**: → `js/config.js` (treeHeight, treeBaseRadius)
- **Particle counts**: → `js/config.js` (ornamentCount, starDustCount, etc.)
- **Styles**: → `css/main.css`, `css/controls.css`, `css/hand-tracking.css`

#### ⚡ **Animations**
- **Gather behavior**: → `js/animations/gather.js`
- **Scatter behavior**: → `js/animations/scatter.js`
- **Animation speed**: → `js/config.js` (animationDuration, animationEase)
- **Transition logic**: → `js/animations/transitions.js`

#### 🎁 **Ornaments**
- **Creation logic**: → `js/entities/ornaments.js` (createOrnaments)
- **Position calculation**: → `js/entities/ornaments.js` (calculateTreePosition)
- **Rotation animation**: → `js/entities/ornaments.js` (updateOrnaments)

#### ⭐ **Star & Particles**
- **Top star**: → `js/entities/star.js` (createTopStar, updateStar)
- **Star dust**: → `js/entities/star.js` (createStarDust, updateStarDust)
- **Star geometry**: → `js/entities/star.js` (createStarGeometry)

#### ❄️ **Snow System**
- **Snow particles**: → `js/entities/snow.js` (createSnowSystem)
- **Snow physics**: → `js/entities/snow.js` (updateSnowSystem)
- **Snow interactions**: → `js/entities/snow.js` (createSnowWave, createSnowSpiral)

#### 🎀 **Spiral Ribbon**
- **Ribbon creation**: → `js/entities/spiral-ribbon.js`
- **Spiral parameters**: Modify in createSpiralRibbon function

#### 🌌 **Sky & Background**
- **Sky dome**: → `js/scene/scene-setup.js` (createSkyDome)
- **Aurora colors**: → `js/scene/scene-setup.js` (skyMaterial uniforms)
- **Twinkling stars**: → `js/scene/scene-setup.js` (createTwinklingStars)
- **Shooting stars**: → `js/scene/scene-setup.js` (createShootingStar)
- **Clouds**: → `js/scene/scene-setup.js` (createCloudLayer, updateCloudLayer)

#### 💡 **Lighting**
- **All lights**: → `js/scene/lighting.js` (setupLighting)
- **Star light color**: Controlled in animations (gather.js/scatter.js)

#### 📷 **Camera & Controls**
- **Camera setup**: → `js/scene/camera.js` (setupCamera)
- **Orbit controls**: → `js/scene/camera.js` (setupControls)
- **Renderer**: → `js/scene/camera.js` (setupRenderer)

#### ✋ **Hand Tracking**
- **MediaPipe setup**: → `js/interactions/hand-tracking.js` (initHandTracking)
- **Gesture detection**: → `js/interactions/hand-tracking.js` (detectGesture)
- **Gesture actions**: → `js/interactions/hand-tracking.js` (onHandResults)
- **UI updates**: → `js/interactions/hand-tracking.js` (updateGestureDisplay)
- **Debounce time**: → `js/config.js` (handTracking.gestureDebounceTime)

#### 🔧 **Utilities**
- **3D math helpers**: → `js/utils/geometry-helpers.js`
- **General math**: → `js/utils/math-helpers.js`
- **Texture creation**: → `js/utils/geometry-helpers.js`

#### 🎮 **Main Application**
- **Initialization**: → `js/main.js` (init function)
- **Animation loop**: → `js/main.js` (animate function)
- **Global state**: → `js/main.js` (top-level variables)

---

## 🔄 Data Flow

```
User Action
    ↓
index.html (UI Events)
    ↓
main.js (Event Handlers)
    ↓
animations/transitions.js
    ↓
animations/gather.js OR animations/scatter.js
    ↓
GSAP animates entities
    ↓
Scene updates in animate() loop
    ↓
Rendered to canvas
```

## 🎯 Common Tasks

### Adding a New Feature
1. Determine which category: scene, entity, animation, interaction
2. Create new file in appropriate folder
3. Add JSDoc comments and exports
4. Import in `main.js`
5. Initialize in `init()` or use in `animate()`

### Modifying Existing Feature
1. Find file using this map
2. Edit function with clear JSDoc
3. Test changes

### Debugging
1. Check browser console for module loading errors
2. Verify imports/exports match
3. Check `main.js` for initialization order
4. Use browser DevTools to set breakpoints in modules

---

## 📚 Module Dependency Graph

```
config.js (No dependencies)
    ↓
utils/* (No dependencies)
    ↓
scene/* ← config, utils
    ↓
entities/* ← config, utils, scene
    ↓
animations/* ← config, entities
    ↓
interactions/* ← config, entities, animations
    ↓
main.js ← ALL MODULES
```

---

## 🎄 Happy Coding!

This modular architecture makes it easy to:
- Find what you need
- Change what you want
- Add what you imagine
- Test what you build

Enjoy your Magic Christmas Tree! 🎅✨
