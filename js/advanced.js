/* =========================================================
   ADVANCED UI JS
   3D Tilt, GSAP Horizontal Scroll, Accordions, Dynamic Glows
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  init3DTilt();
  initAccordions();
  initHorizontalScroll();
  initDynamicGlows();
});

/* --- 1. 3D Tilt Effect --- */
function init3DTilt() {
  const tiltCards = document.querySelectorAll('.tilt-card');
  
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within the element.
      const y = e.clientY - rect.top;  // y position within the element.
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -15; // Max 15deg
      const rotateY = ((x - centerX) / centerX) * 15;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.transition = 'transform 0.5s ease';
    });
    
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none'; // Remove transition for smooth tracking
    });
  });
}

/* --- 2. Accordions --- */
function initAccordions() {
  const headers = document.querySelectorAll('.accordion-header');
  
  headers.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = header.nextElementSibling;
      const isActive = item.classList.contains('active');
      
      // Close all other accordions (optional, comment out for independent opening)
      document.querySelectorAll('.accordion-item').forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.accordion-content').style.maxHeight = null;
      });
      
      if (!isActive) {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });
}

/* --- 3. GSAP Horizontal Scroll (Services Page) --- */
function initHorizontalScroll() {
  // Only run if ScrollTrigger is loaded and wrapper exists
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  
  const wrapper = document.querySelector('.horizontal-scroll-wrapper');
  const container = document.querySelector('.horizontal-scroll-container');
  
  if (wrapper && container) {
    gsap.registerPlugin(ScrollTrigger);
    
    // Get total scroll distance
    function getScrollAmount() {
      let containerWidth = container.scrollWidth;
      return -(containerWidth - window.innerWidth);
    }
    
    const tween = gsap.to(container, {
      x: getScrollAmount,
      ease: "none"
    });
    
    ScrollTrigger.create({
      trigger: wrapper,
      start: "top top",
      end: () => `+=${getScrollAmount() * -1}`,
      pin: true,
      animation: tween,
      scrub: 1,
      invalidateOnRefresh: true
    });
  }
}

/* --- 4. Dynamic Glow Tracking (Service Cards) --- */
function initDynamicGlows() {
  const glowCards = document.querySelectorAll('.service-card, .job-card'); // Reuse existing cards
  
  glowCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
      
      // Add a radial gradient highlight based on mouse position
      card.style.background = `
        radial-gradient(
          800px circle at ${x}px ${y}px, 
          rgba(0, 170, 255, 0.06),
          transparent 40%
        ),
        rgba(13, 21, 38, 0.6)
      `;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.background = 'rgba(13, 21, 38, 0.6)';
    });
  });
}
