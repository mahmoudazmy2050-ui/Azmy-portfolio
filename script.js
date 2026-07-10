/* ============================================
   KAIRO VEX — CYBERPUNK PORTFOLIO
   JavaScript: Particles, Animations, Interactions
   ============================================ */

(function () {
  'use strict';

  // ==========================================
  // PARTICLE SYSTEM
  // ==========================================
  class ParticleSystem {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.mouse = { x: 0, y: 0, radius: 180 };
      this.dpr = window.devicePixelRatio || 1;
      this.particleCount = 120;
      this.connectionDistance = 140;
      this.animFrameId = null;

      this.resize();
      this.init();
      this.bindEvents();
      this.animate();
    }

    resize() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.width = rect.width;
      this.height = rect.height;
      this.canvas.width = this.width * this.dpr;
      this.canvas.height = this.height * this.dpr;
      this.canvas.style.width = this.width + 'px';
      this.canvas.style.height = this.height + 'px';
      this.ctx.scale(this.dpr, this.dpr);
    }

    init() {
      this.particles = [];
      for (let i = 0; i < this.particleCount; i++) {
        this.particles.push(new Particle(this.width, this.height));
      }
    }

    bindEvents() {
      window.addEventListener('resize', () => {
        this.resize();
        this.init();
      });

      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
      });

      this.canvas.addEventListener('mouseleave', () => {
        this.mouse.x = -1000;
        this.mouse.y = -1000;
      });
    }

    animate() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Update and draw particles
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.update(this.width, this.height, this.mouse);
        p.draw(this.ctx);

        // Draw connections
        for (let j = i + 1; j < this.particles.length; j++) {
          const p2 = this.particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < this.connectionDistance) {
            const opacity = (1 - dist / this.connectionDistance) * 0.3;
            this.ctx.beginPath();
            this.ctx.strokeStyle = `rgba(0, 240, 255, ${opacity})`;
            this.ctx.lineWidth = 0.5;
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.stroke();
          }
        }

        // Draw connections to mouse
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.mouse.radius) {
          const opacity = (1 - dist / this.mouse.radius) * 0.6;
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(123, 47, 240, ${opacity})`;
          this.ctx.lineWidth = 1;
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(this.mouse.x, this.mouse.y);
          this.ctx.stroke();
        }
      }

      // Mouse glow
      if (this.mouse.x > 0 && this.mouse.y > 0) {
        const gradient = this.ctx.createRadialGradient(
          this.mouse.x, this.mouse.y, 0,
          this.mouse.x, this.mouse.y, 80
        );
        gradient.addColorStop(0, 'rgba(0, 240, 255, 0.08)');
        gradient.addColorStop(0.5, 'rgba(123, 47, 240, 0.04)');
        gradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
      }

      this.animFrameId = requestAnimationFrame(() => this.animate());
    }
  }

  class Particle {
    constructor(canvasW, canvasH) {
      this.x = Math.random() * canvasW;
      this.y = Math.random() * canvasH;
      this.baseX = this.x;
      this.baseY = this.y;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.radius = Math.random() * 2 + 0.5;
      this.opacity = Math.random() * 0.6 + 0.2;
      this.pulseSpeed = Math.random() * 0.02 + 0.005;
      this.pulsePhase = Math.random() * Math.PI * 2;
      this.color = Math.random() > 0.5
        ? { r: 0, g: 240, b: 255 }    // Cyan
        : { r: 123, g: 47, b: 240 };  // Purple
    }

    update(canvasW, canvasH, mouse) {
      // Pulse
      this.pulsePhase += this.pulseSpeed;
      const pulseFactor = 0.5 + Math.sin(this.pulsePhase) * 0.5;

      // Mouse interaction — repel particles
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        const angle = Math.atan2(dy, dx);
        this.vx += Math.cos(angle) * force * 0.8;
        this.vy += Math.sin(angle) * force * 0.8;
      }

      // Drift back to base
      this.vx += (this.baseX - this.x) * 0.001;
      this.vy += (this.baseY - this.y) * 0.001;

      // Friction
      this.vx *= 0.98;
      this.vy *= 0.98;

      this.x += this.vx;
      this.y += this.vy;

      // Wrap around
      if (this.x < -10) this.x = canvasW + 10;
      if (this.x > canvasW + 10) this.x = -10;
      if (this.y < -10) this.y = canvasH + 10;
      if (this.y > canvasH + 10) this.y = -10;

      this.currentOpacity = this.opacity * (0.5 + pulseFactor * 0.5);
      this.currentRadius = this.radius * (0.8 + pulseFactor * 0.4);
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.currentOpacity})`;
      ctx.fill();

      // Glow effect
      if (this.currentRadius > 1.5) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentRadius * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.currentOpacity * 0.1})`;
        ctx.fill();
      }
    }
  }

  // ==========================================
  // CURSOR GLOW
  // ==========================================
  const cursorGlow = document.getElementById('cursorGlow');
  let cursorActive = false;

  document.addEventListener('mousemove', (e) => {
    if (!cursorActive) {
      cursorGlow.classList.add('active');
      cursorActive = true;
    }
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
  });

  document.addEventListener('mouseleave', () => {
    cursorGlow.classList.remove('active');
    cursorActive = false;
  });

  // ==========================================
  // NAVIGATION
  // ==========================================
  const nav = document.getElementById('mainNav');
  const navLinksContainer = document.querySelector('.nav__links');
  const navLinks = document.querySelectorAll('.nav__link');
  const sections = document.querySelectorAll('section[id]');
  const navToggle = document.getElementById('navToggle');

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  window.addEventListener('scroll', () => {
    // Nav scroll effect
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Active section tracking
    let current = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 200;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('data-section') === current) {
        link.classList.add('active');
      }
    });
  });

  // ==========================================
  // COUNTER ANIMATION
  // ==========================================
  function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 2000;
    const start = performance.now();
    const initial = 0;

    function update(timestamp) {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = Math.floor(initial + (target - initial) * eased);

      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target;
      }
    }

    requestAnimationFrame(update);
  }

  // ==========================================
  // SKILL BAR ANIMATION
  // ==========================================
  function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-bar__fill');
    skillBars.forEach((bar) => {
      const width = bar.getAttribute('data-width');
      bar.style.setProperty('--target-width', width + '%');
      bar.classList.add('animated');
    });
  }

  // ==========================================
  // STAT BAR ANIMATION
  // ==========================================
  function animateStatBars() {
    const statBars = document.querySelectorAll('.stat-card__bar-fill');
    statBars.forEach((bar) => {
      const width = bar.getAttribute('data-width');
      bar.style.setProperty('--target-width', width + '%');
      bar.classList.add('animated');
    });
  }

  // ==========================================
  // PROGRESS RINGS
  // ==========================================
  function animateProgressRings() {
    const rings = document.querySelectorAll('.case-card__progress-fill');
    rings.forEach((ring) => {
      const progress = parseInt(ring.getAttribute('data-progress'));
      const circumference = 2 * Math.PI * 45; // r=45
      const offset = circumference - (progress / 100) * circumference;
      ring.style.strokeDashoffset = offset;
    });
  }

  // ==========================================
  // CASE CARD EXPAND / COLLAPSE
  // ==========================================
  document.querySelectorAll('.case-card__expand[data-case]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const caseId = btn.getAttribute('data-case');
      const detail = document.getElementById('caseDetail' + caseId);

      if (detail) {
        detail.classList.toggle('open');

        // Update button text
        const textEl = btn.querySelector('.case-card__expand-text');
        if (detail.classList.contains('open')) {
          textEl.textContent = 'COLLAPSE INTEL';
        } else {
          textEl.textContent = 'UNLOCK INTEL';
        }
      }
    });
  });

  document.querySelectorAll('.case-card__detail-close').forEach((btn) => {
    btn.addEventListener('click', () => {
      const caseId = btn.getAttribute('data-close');
      const detail = document.getElementById('caseDetail' + caseId);
      if (detail) {
        detail.classList.remove('open');
        const expandBtn = document.querySelector(`.case-card__expand[data-case="${caseId}"]`);
        if (expandBtn) {
          expandBtn.querySelector('.case-card__expand-text').textContent = 'UNLOCK INTEL';
        }
      }
    });
  });

  // ==========================================
  // INTERSECTION OBSERVER — REVEALS
  // ==========================================
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px',
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');

        // Trigger counters
        if (entry.target.querySelectorAll('[data-count]').length > 0) {
          entry.target.querySelectorAll('[data-count]').forEach((el) => {
            if (!el.classList.contains('counted')) {
              el.classList.add('counted');
              animateCounter(el);
            }
          });
        }

        // Trigger skill bars
        if (entry.target.classList.contains('about__card--skills')) {
          setTimeout(animateSkillBars, 300);
        }

        // Trigger stat bars
        if (entry.target.id === 'stats') {
          setTimeout(animateStatBars, 300);
        }

        // Trigger progress rings
        if (entry.target.id === 'cases') {
          setTimeout(animateProgressRings, 500);
        }
      }
    });
  }, observerOptions);

  // Observe sections and cards
  document.querySelectorAll('.about__card, .case-card, .stat-card, .timeline__item').forEach((el) => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

  // Observe sections for counter / bar triggers
  ['hero', 'about', 'cases', 'stats'].forEach((id) => {
    const section = document.getElementById(id);
    if (section) revealObserver.observe(section);
  });

  // Special: stagger grids
  document.querySelectorAll('.stats__grid, .cases__grid').forEach((el) => {
    el.classList.add('reveal-stagger');
    revealObserver.observe(el);
  });

  // Timeline items
  document.querySelectorAll('.timeline__item').forEach((el) => {
    revealObserver.observe(el);
  });

  // ==========================================
  // CONTACT FORM
  // ==========================================
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = contactForm.querySelector('.btn');
      const btnText = btn.querySelector('.btn__text');
      const originalText = btnText.textContent;

      btnText.textContent = 'TRANSMITTING...';
      btn.style.pointerEvents = 'none';

      setTimeout(() => {
        btnText.textContent = '✓ TRANSMISSION RECEIVED';
        btn.style.background = 'linear-gradient(135deg, #00ff88 0%, #00c868 100%)';

        setTimeout(() => {
          btnText.textContent = originalText;
          btn.style.background = '';
          btn.style.pointerEvents = '';
          contactForm.reset();
        }, 2500);
      }, 1500);
    });
  }

  // ==========================================
  // TYPEWRITER EFFECT — TERMINAL
  // ==========================================
  function typewriterEffect() {
    const lines = document.querySelectorAll('.contact__terminal-text');
    lines.forEach((line, i) => {
      const text = line.textContent;
      line.textContent = '';
      line.style.opacity = '1';

      let charIndex = 0;
      const delay = i * 800;

      setTimeout(() => {
        const interval = setInterval(() => {
          line.textContent += text[charIndex];
          charIndex++;
          if (charIndex >= text.length) {
            clearInterval(interval);
          }
        }, 25);
      }, delay);
    });
  }

  const terminalObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !entry.target.classList.contains('typed')) {
        entry.target.classList.add('typed');
        typewriterEffect();
      }
    });
  }, { threshold: 0.5 });

  const terminal = document.querySelector('.contact__terminal');
  if (terminal) terminalObserver.observe(terminal);

  // ==========================================
  // INIT PARTICLE SYSTEM
  // ==========================================
  const particleCanvas = document.getElementById('particleCanvas');
  if (particleCanvas) {
    new ParticleSystem(particleCanvas);
  }

  // ==========================================
  // HERO HUD COUNTER INIT
  // ==========================================
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.hero__hud-value[data-count]').forEach((el) => {
          if (!el.classList.contains('counted')) {
            el.classList.add('counted');
            animateCounter(el);
          }
        });
      }
    });
  }, { threshold: 0.5 });

  const heroSection = document.getElementById('hero');
  if (heroSection) heroObserver.observe(heroSection);

  // ==========================================
  // SMOOTH SCROLL FOR NAV LINKS
  // ==========================================
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
      
      // Close mobile menu if open
      nav.classList.remove('open');
    });
  });

  // ==========================================
  // GLITCH EFFECT ON HOVER (TITLE)
  // ==========================================
  const heroTitle = document.querySelector('.hero__title-line--2');
  if (heroTitle) {
    heroTitle.addEventListener('mouseenter', () => {
      heroTitle.style.animation = 'glitch-1 0.3s ease-in-out';
      setTimeout(() => {
        heroTitle.style.animation = '';
      }, 300);
    });
  }

})();
