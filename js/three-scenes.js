/* =========================================================
   QUANTIX INNOVATIONS — Three.js 3D Scenes
   AI Globe, Particle Background, Tech Spheres, Glowing Sphere
   ========================================================= */

// --- Wait for Three.js to load ---
function waitForThree(callback) {
  if (typeof THREE !== 'undefined') {
    callback();
  } else {
    setTimeout(() => waitForThree(callback), 100);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  waitForThree(() => {
    initHeroScene();
    initBrainScene();
    initCTAScene();
  });
});

/* =========================================================
   HERO — AI Globe with Particles & Neural Network
   ========================================================= */
function initHeroScene() {
  const container = document.getElementById('hero-canvas');
  if (!container) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ 
    alpha: true, 
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // --- Particle Globe ---
  const globeGeometry = new THREE.SphereGeometry(1.8, 64, 64);
  const globePositions = globeGeometry.attributes.position;
  const particleCount = globePositions.count;
  
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  
  const colorPrimary = new THREE.Color(0x0066ff);
  const colorCyan = new THREE.Color(0x00d4ff);
  const colorLight = new THREE.Color(0x4dc9f6);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = globePositions.getX(i);
    positions[i * 3 + 1] = globePositions.getY(i);
    positions[i * 3 + 2] = globePositions.getZ(i);
    
    const mixFactor = Math.random();
    const color = colorPrimary.clone().lerp(mixFactor > 0.5 ? colorCyan : colorLight, mixFactor);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
    
    sizes[i] = Math.random() * 3 + 1;
  }
  
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.025,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const globe = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(globe);

  // --- Neural Network Lines ---
  const linesMaterial = new THREE.LineBasicMaterial({
    color: 0x0066ff,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
  });

  const linesGroup = new THREE.Group();
  const connectionCount = 150;
  
  for (let i = 0; i < connectionCount; i++) {
    const idx1 = Math.floor(Math.random() * particleCount);
    const idx2 = Math.floor(Math.random() * particleCount);
    
    const p1 = new THREE.Vector3(
      globePositions.getX(idx1),
      globePositions.getY(idx1),
      globePositions.getZ(idx1)
    );
    const p2 = new THREE.Vector3(
      globePositions.getX(idx2),
      globePositions.getY(idx2),
      globePositions.getZ(idx2)
    );
    
    if (p1.distanceTo(p2) < 1.5) {
      const lineGeom = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const line = new THREE.Line(lineGeom, linesMaterial);
      linesGroup.add(line);
    }
  }
  scene.add(linesGroup);

  // --- Ambient Floating Particles ---
  const ambientCount = 500;
  const ambientGeometry = new THREE.BufferGeometry();
  const ambientPositions = new Float32Array(ambientCount * 3);
  const ambientSpeeds = [];
  
  for (let i = 0; i < ambientCount; i++) {
    ambientPositions[i * 3] = (Math.random() - 0.5) * 12;
    ambientPositions[i * 3 + 1] = (Math.random() - 0.5) * 12;
    ambientPositions[i * 3 + 2] = (Math.random() - 0.5) * 12;
    ambientSpeeds.push({
      x: (Math.random() - 0.5) * 0.002,
      y: (Math.random() - 0.5) * 0.002,
      z: (Math.random() - 0.5) * 0.002,
    });
  }
  
  ambientGeometry.setAttribute('position', new THREE.BufferAttribute(ambientPositions, 3));
  
  const ambientMaterial = new THREE.PointsMaterial({
    size: 0.015,
    color: 0x00aaff,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  
  const ambientParticles = new THREE.Points(ambientGeometry, ambientMaterial);
  scene.add(ambientParticles);

  // --- Light Beams (rings) ---
  const ringGeometry = new THREE.RingGeometry(2.2, 2.25, 64);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x0088ff,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  
  const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
  ring1.rotation.x = Math.PI * 0.35;
  scene.add(ring1);
  
  const ring2 = new THREE.Mesh(
    new THREE.RingGeometry(2.5, 2.53, 64),
    ringMaterial.clone()
  );
  ring2.material.opacity = 0.08;
  ring2.rotation.x = Math.PI * 0.55;
  ring2.rotation.y = Math.PI * 0.3;
  scene.add(ring2);

  // --- Mouse Interaction ---
  const mouse = { x: 0, y: 0 };
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  });

  // --- Animation Loop ---
  const clock = new THREE.Clock();

  let isVisible = false;

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible || document.hidden) return;

    const time = clock.getElapsedTime();

    // Rotate globe
    globe.rotation.y = time * 0.15;
    globe.rotation.x = Math.sin(time * 0.1) * 0.1;
    linesGroup.rotation.y = time * 0.15;
    linesGroup.rotation.x = Math.sin(time * 0.1) * 0.1;

    // Ring animation
    ring1.rotation.z = time * 0.1;
    ring2.rotation.z = -time * 0.08;

    // Mouse influence
    globe.rotation.y += mouse.x * 0.01;
    globe.rotation.x += mouse.y * 0.01;

    // Animate ambient particles
    const aPos = ambientParticles.geometry.attributes.position;
    for (let i = 0; i < ambientCount; i++) {
      aPos.array[i * 3] += ambientSpeeds[i].x;
      aPos.array[i * 3 + 1] += ambientSpeeds[i].y;
      aPos.array[i * 3 + 2] += ambientSpeeds[i].z;
      
      // Wrap around
      for (let j = 0; j < 3; j++) {
        if (Math.abs(aPos.array[i * 3 + j]) > 6) {
          aPos.array[i * 3 + j] *= -0.9;
        }
      }
    }
    aPos.needsUpdate = true;

    // Pulse globe size
    const scale = 1 + Math.sin(time * 0.5) * 0.02;
    globe.scale.set(scale, scale, scale);

    renderer.render(scene, camera);
  }

  animate();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
    });
  }, { threshold: 0.01 });
  observer.observe(container);

  // --- Resize Handler ---
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

/* =========================================================
   DIGITAL BRAIN — Rotating 3D Wireframe Brain
   ========================================================= */
function initBrainScene() {
  const container = document.getElementById('brain-canvas');
  if (!container) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 4;

  const renderer = new THREE.WebGLRenderer({ 
    alpha: true, 
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Create brain-like shape using icosahedron
  const brainGroup = new THREE.Group();
  
  // Core wireframe
  const coreGeom = new THREE.IcosahedronGeometry(1.2, 3);
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: 0x0066ff,
    wireframe: true,
    transparent: true,
    opacity: 0.15,
  });
  const core = new THREE.Mesh(coreGeom, coreMaterial);
  brainGroup.add(core);

  // Synaptic nodes
  const nodeCount = 200;
  const nodesGeometry = new THREE.BufferGeometry();
  const nodePositions = new Float32Array(nodeCount * 3);
  const nodeColors = new Float32Array(nodeCount * 3);
  
  const brainVertices = coreGeom.attributes.position;
  const usedVertices = [];
  
  for (let i = 0; i < nodeCount; i++) {
    const idx = Math.floor(Math.random() * brainVertices.count);
    const x = brainVertices.getX(idx) + (Math.random() - 0.5) * 0.3;
    const y = brainVertices.getY(idx) + (Math.random() - 0.5) * 0.3;
    const z = brainVertices.getZ(idx) + (Math.random() - 0.5) * 0.3;
    
    nodePositions[i * 3] = x;
    nodePositions[i * 3 + 1] = y;
    nodePositions[i * 3 + 2] = z;
    
    usedVertices.push(new THREE.Vector3(x, y, z));
    
    const bright = 0.5 + Math.random() * 0.5;
    nodeColors[i * 3] = 0 * bright;
    nodeColors[i * 3 + 1] = 0.6 * bright;
    nodeColors[i * 3 + 2] = 1 * bright;
  }
  
  nodesGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
  nodesGeometry.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));
  
  const nodesMaterial = new THREE.PointsMaterial({
    size: 0.04,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  
  const nodes = new THREE.Points(nodesGeometry, nodesMaterial);
  brainGroup.add(nodes);

  // Synaptic connections
  const synapseLineMat = new THREE.LineBasicMaterial({
    color: 0x00aaff,
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
  });

  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < Math.min(i + 5, nodeCount); j++) {
      if (usedVertices[i].distanceTo(usedVertices[j]) < 0.8) {
        const lineGeom = new THREE.BufferGeometry().setFromPoints([usedVertices[i], usedVertices[j]]);
        const line = new THREE.Line(lineGeom, synapseLineMat);
        brainGroup.add(line);
      }
    }
  }

  // Outer glow sphere
  const glowGeom = new THREE.SphereGeometry(1.5, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x0066ff,
    transparent: true,
    opacity: 0.03,
    side: THREE.BackSide,
  });
  const glowMesh = new THREE.Mesh(glowGeom, glowMat);
  brainGroup.add(glowMesh);

  scene.add(brainGroup);

  // --- Animate ---
  const clock = new THREE.Clock();
  let isVisible = false;
  
  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible || document.hidden) return;

    const time = clock.getElapsedTime();
    
    brainGroup.rotation.y = time * 0.2;
    brainGroup.rotation.x = Math.sin(time * 0.15) * 0.15;
    
    // Pulse nodes
    const nPos = nodes.geometry.attributes.position;
    for (let i = 0; i < nodeCount; i++) {
      const phase = Math.sin(time * 2 + i * 0.5) * 0.02;
      nPos.array[i * 3] += phase * 0.1;
    }
    nPos.needsUpdate = true;
    
    // Pulse glow
    const glowScale = 1 + Math.sin(time) * 0.05;
    glowMesh.scale.set(glowScale, glowScale, glowScale);
    
    renderer.render(scene, camera);
  }
  
  animate();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
    });
  }, { threshold: 0.01 });
  observer.observe(container);

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

/* =========================================================
   CTA — Massive Glowing Sphere + Stars
   ========================================================= */
function initCTAScene() {
  const container = document.getElementById('cta-canvas');
  if (!container) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ 
    alpha: true, 
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // --- Central Glowing Sphere ---
  const sphereGroup = new THREE.Group();
  
  // Core sphere
  const sphereGeom = new THREE.IcosahedronGeometry(1.4, 4);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0x0066ff,
    wireframe: true,
    transparent: true,
    opacity: 0.2,
  });
  const sphere = new THREE.Mesh(sphereGeom, sphereMat);
  sphereGroup.add(sphere);

  // Inner glow
  const innerGlow = new THREE.Mesh(
    new THREE.SphereGeometry(1.35, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0x0088ff,
      transparent: true,
      opacity: 0.08,
    })
  );
  sphereGroup.add(innerGlow);

  // Outer glow layers
  for (let i = 0; i < 3; i++) {
    const glowMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.5 + i * 0.3, 32, 32),
      new THREE.MeshBasicMaterial({
        color: i === 0 ? 0x0066ff : i === 1 ? 0x00aaff : 0x00d4ff,
        transparent: true,
        opacity: 0.04 - i * 0.01,
        side: THREE.BackSide,
      })
    );
    sphereGroup.add(glowMesh);
  }

  scene.add(sphereGroup);

  // --- Stars ---
  const starCount = 1000;
  const starGeometry = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  
  for (let i = 0; i < starCount; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 20;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    starPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }
  
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  
  const starMaterial = new THREE.PointsMaterial({
    size: 0.015,
    color: 0x4dc9f6,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  // --- Orbiting particles ---
  const orbitCount = 300;
  const orbitGeom = new THREE.BufferGeometry();
  const orbitPos = new Float32Array(orbitCount * 3);
  const orbitData = [];
  
  for (let i = 0; i < orbitCount; i++) {
    const radius = 2 + Math.random() * 2;
    const angle = Math.random() * Math.PI * 2;
    const inclination = (Math.random() - 0.5) * Math.PI;
    
    orbitPos[i * 3] = radius * Math.cos(angle) * Math.cos(inclination);
    orbitPos[i * 3 + 1] = radius * Math.sin(inclination);
    orbitPos[i * 3 + 2] = radius * Math.sin(angle) * Math.cos(inclination);
    
    orbitData.push({ radius, angle, inclination, speed: 0.2 + Math.random() * 0.5 });
  }
  
  orbitGeom.setAttribute('position', new THREE.BufferAttribute(orbitPos, 3));
  
  const orbitMat = new THREE.PointsMaterial({
    size: 0.02,
    color: 0x00bbff,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  
  const orbitParticles = new THREE.Points(orbitGeom, orbitMat);
  scene.add(orbitParticles);

  // --- Animate ---
  const clock = new THREE.Clock();
  let isVisible = false;
  
  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible || document.hidden) return;

    const time = clock.getElapsedTime();
    
    // Rotate sphere
    sphere.rotation.y = time * 0.2;
    sphere.rotation.x = Math.sin(time * 0.1) * 0.1;
    
    // Pulse
    const scale = 1 + Math.sin(time * 0.8) * 0.05;
    sphereGroup.scale.set(scale, scale, scale);
    
    // Rotate stars slowly
    stars.rotation.y = time * 0.02;
    stars.rotation.x = time * 0.01;
    
    // Orbit particles
    const oPos = orbitParticles.geometry.attributes.position;
    for (let i = 0; i < orbitCount; i++) {
      const d = orbitData[i];
      d.angle += d.speed * 0.005;
      oPos.array[i * 3] = d.radius * Math.cos(d.angle) * Math.cos(d.inclination);
      oPos.array[i * 3 + 1] = d.radius * Math.sin(d.inclination) + Math.sin(time + i) * 0.1;
      oPos.array[i * 3 + 2] = d.radius * Math.sin(d.angle) * Math.cos(d.inclination);
    }
    oPos.needsUpdate = true;
    
    renderer.render(scene, camera);
  }
  
  animate();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
    });
  }, { threshold: 0.01 });
  observer.observe(container);

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}
