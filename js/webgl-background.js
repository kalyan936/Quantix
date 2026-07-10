/* =========================================================
   PREMIUM WEBGL FLUID BACKGROUND
   Custom Three.js Fragment Shader
   ========================================================= */

function initWebGLBackground() {
  const container = document.getElementById('webgl-fluid-container');
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Optimized
  container.appendChild(renderer.domElement);

  // Uniforms for the shader
  const uniforms = {
    u_time: { type: "f", value: 1.0 },
    u_resolution: { type: "v2", value: new THREE.Vector2() },
    u_mouse: { type: "v2", value: new THREE.Vector2() },
    u_color1: { type: "v3", value: new THREE.Color('#0a0e1a') }, // Brand Darkest
    u_color2: { type: "v3", value: new THREE.Color('#002b80') }, // Deep Blue
    u_color3: { type: "v3", value: new THREE.Color('#0066ff') }, // Brand Primary
  };

  uniforms.u_resolution.value.x = renderer.domElement.width;
  uniforms.u_resolution.value.y = renderer.domElement.height;

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `;

  // Simplex noise fluid shader
  const fragmentShader = `
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform vec3 u_color1;
    uniform vec3 u_color2;
    uniform vec3 u_color3;
    
    varying vec2 vUv;

    // Pseudo-random function
    float random (in vec2 _st) {
        return fract(sin(dot(_st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    // 2D Noise based on Morgan McGuire @morgan3d
    float noise (in vec2 _st) {
        vec2 i = floor(_st);
        vec2 f = fract(_st);

        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));

        vec2 u = f * f * (3.0 - 2.0 * f);

        return mix(a, b, u.x) +
                (c - a)* u.y * (1.0 - u.x) +
                (d - b) * u.x * u.y;
    }

    // Fractional Brownian Motion
    #define NUM_OCTAVES 5
    float fbm ( in vec2 _st) {
        float v = 0.0;
        float a = 0.5;
        vec2 shift = vec2(100.0);
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
        for (int i = 0; i < NUM_OCTAVES; ++i) {
            v += a * noise(_st);
            _st = rot * _st * 2.0 + shift;
            a *= 0.5;
        }
        return v;
    }

    void main() {
        vec2 st = gl_FragCoord.xy/u_resolution.xy * 3.0;
        
        // Mouse interaction mapping
        vec2 mouse = u_mouse.xy / u_resolution.xy;
        st += mouse * 0.5;

        vec2 q = vec2(0.);
        q.x = fbm( st + 0.00*u_time);
        q.y = fbm( st + vec2(1.0));

        vec2 r = vec2(0.);
        r.x = fbm( st + 1.0*q + vec2(1.7,9.2)+ 0.15*u_time );
        r.y = fbm( st + 1.0*q + vec2(8.3,2.8)+ 0.126*u_time);

        float f = fbm(st+r);

        // Map colors
        vec3 color = mix(u_color1, u_color2, clamp((f*f)*4.0,0.0,1.0));
        color = mix(color, u_color3, clamp(length(q),0.0,1.0));
        color = mix(color, u_color1, clamp(length(r.x),0.0,1.0));
        
        // Add vignette
        float dist = distance(vUv, vec2(0.5));
        color *= smoothstep(0.8, 0.2, dist * 0.8);

        gl_FragColor = vec4((f*f*f+.6*f*f+.5*f)*color,1.);
    }
  `;

  const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(mesh);

  // Mouse tracking
  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;

  document.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX;
    targetMouseY = window.innerHeight - e.clientY; // Flip Y for WebGL
  });

  // Animation Loop
  function render(time) {
    if (!document.hidden) {
      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      uniforms.u_time.value = time * 0.0005; // Slow fluid speed
      uniforms.u_mouse.value.set(mouseX, mouseY);
      
      renderer.render(scene, camera);
    }
    requestAnimationFrame(render);
  }
  
  requestAnimationFrame(render);

  // Handle Resize
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.u_resolution.value.x = renderer.domElement.width;
    uniforms.u_resolution.value.y = renderer.domElement.height;
  });
}

// Initialize when Three.js is ready
document.addEventListener('DOMContentLoaded', () => {
  if (typeof THREE !== 'undefined') {
    initWebGLBackground();
  } else {
    // If Three isn't loaded yet, wait for it
    const checkThree = setInterval(() => {
      if (typeof THREE !== 'undefined') {
        clearInterval(checkThree);
        initWebGLBackground();
      }
    }, 100);
  }
});
