/* =========================================================
   PREMIUM ANIMATIONS JS
   Magnetic Cursor, GSAP Scroll Physics, Text Splitting
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initPageTransitions();
  
  // Wait a tiny bit for fonts to load before splitting text
  setTimeout(() => {
    initAdvancedTextReveal();
    initGSAPScrollPhysics();
  }, 100);
});

/* --- 1. Magnetic Custom Cursor --- */
function initCustomCursor() {
  const cursor = document.createElement('div');
  cursor.id = 'custom-cursor';
  document.body.appendChild(cursor);
  
  const follower = document.createElement('div');
  follower.id = 'custom-cursor-follower';
  document.body.appendChild(follower);
  
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  let followerX = mouseX;
  let followerY = mouseY;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  // Smooth animation loop
  function renderCursor() {
    // Fast follow for dot
    cursorX += (mouseX - cursorX) * 0.5;
    cursorY += (mouseY - cursorY) * 0.5;
    cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
    
    // Slow follow for ring
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;
    follower.style.transform = `translate(${followerX}px, ${followerY}px)`;
    
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);
  
  // Hover states for links and buttons
  const hoverTargets = document.querySelectorAll('a, button, .btn-primary, .btn-secondary, .service-card, .job-card, .glass-card');
  
  hoverTargets.forEach(target => {
    target.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
      
      // Magnetic pull effect on the element itself (if it's a small button)
      if (target.classList.contains('btn-primary') || target.classList.contains('btn-secondary')) {
        target.addEventListener('mousemove', magneticMove);
      }
    });
    
    target.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
      target.style.transform = '';
      target.removeEventListener('mousemove', magneticMove);
    });
  });
  
  function magneticMove(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    this.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  }
}

/* --- 2. Advanced GSAP Heading Reveal --- */
function initAdvancedTextReveal() {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  
  const headings = document.querySelectorAll('.hero-title, .page-header h1, h2.gradient-text-white');
  const scrollerElement = document.querySelector('.snap-container');
  
  headings.forEach(el => {
    // Prevent FOUC
    el.style.opacity = 0;
    
    let scrollCfg = {
      trigger: el,
      start: "top 85%",
    };
    if (scrollerElement) {
      scrollCfg.scroller = scrollerElement;
    }
    
    gsap.fromTo(el, 
      { 
        y: 60, 
        opacity: 0,
        rotationX: 15
      },
      {
        scrollTrigger: scrollCfg,
        duration: 1.2,
        opacity: 1,
        y: 0,
        rotationX: 0,
        ease: "power4.out"
      }
    );
  });
}

/* --- 3. GSAP Scroll Physics & Parallax --- */
function initGSAPScrollPhysics() {
  if (typeof gsap === 'undefined') return;
  
  // Disable old generic CSS reveals
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger-children > *').forEach(el => {
    el.classList.remove('reveal', 'reveal-left', 'reveal-right');
    el.style.opacity = 1; // reset for GSAP
    el.style.transform = 'none';
  });
  
  const scrollerElement = document.querySelector('.snap-container');
  
  // Advanced Card Staggering
  const cardGrids = document.querySelectorAll('.stats-grid, .stagger-children');
  
  cardGrids.forEach(grid => {
    const children = Array.from(grid.children);
    
    let scrollCfg = {
      trigger: grid,
      start: "top 80%",
    };
    if (scrollerElement) {
      scrollCfg.scroller = scrollerElement;
    }
    
    gsap.from(children, {
      scrollTrigger: scrollCfg,
      y: 100,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: "power4.out"
    });
  });

  // Dynamic SVG Line Drawing (if any SVG path has class 'draw-line')
  const lines = document.querySelectorAll('path.draw-line');
  lines.forEach(line => {
    const length = line.getTotalLength();
    gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });
    
    let scrollCfg = {
      trigger: line.parentElement,
      start: "top center",
      end: "bottom center",
      scrub: 1
    };
    if (scrollerElement) {
      scrollCfg.scroller = scrollerElement;
    }
    
    gsap.to(line, {
      strokeDashoffset: 0,
      scrollTrigger: scrollCfg
    });
  });
}

/* --- 4. Seamless Page Transitions --- */
function initPageTransitions() {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'page-transition-overlay';
  document.body.appendChild(overlay);
  
  // Animate in on page load
  gsap.set(overlay, { scaleY: 1, transformOrigin: 'top' });
  gsap.to(overlay, { 
    scaleY: 0, 
    duration: 1, 
    ease: "power4.inOut",
    delay: 0.2
  });
  
  // Intercept links
  const links = document.querySelectorAll('a[href]');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const target = link.getAttribute('href');
      
      // Don't transition for anchor links or external links
      if (target.startsWith('#') || target.startsWith('http') || target.startsWith('mailto')) return;
      
      e.preventDefault();
      
      // Animate out
      gsap.set(overlay, { transformOrigin: 'bottom' });
      gsap.to(overlay, {
        scaleY: 1,
        duration: 0.8,
        ease: "power4.inOut",
        onComplete: () => {
          window.location = target;
        }
      });
    });
  });
}
