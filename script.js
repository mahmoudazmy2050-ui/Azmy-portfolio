/* ===== Dark Mode Toggle ===== */
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;
const icon = themeToggle.querySelector('i');

function setTheme(mode) {
  if (mode === 'dark') {
    html.classList.add('dark-mode');
    icon.className = 'fas fa-sun';
    localStorage.setItem('theme', 'dark');
  } else {
    html.classList.remove('dark-mode');
    icon.className = 'fas fa-moon';
    localStorage.setItem('theme', 'light');
  }
}

const saved = localStorage.getItem('theme');
if (saved) {
  setTheme(saved);
} else {
  setTheme('dark');
}

themeToggle.addEventListener('click', () => {
  setTheme(html.classList.contains('dark-mode') ? 'light' : 'dark');
});

/* ===== Nav Toggle ===== */
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('open');
  document.body.classList.toggle('no-scroll');
});

document.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    document.body.classList.remove('no-scroll');
  });
});

/* ===== Nav Scroll Effect ===== */
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('nav--scrolled', window.scrollY > 40);
});

/* ===== Scroll Reveal ===== */
const revealElements = document.querySelectorAll(
  '.section__head, .service, .timeline__item, .cert-card, .about, .contact'
);

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

revealElements.forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});

/* ===== Skill Bars on Scroll ===== */
const skillSection = document.querySelector('.about__skills');
let barsAnimated = false;

const skillObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !barsAnimated) {
        barsAnimated = true;
        document.querySelectorAll('.skill__fill').forEach(bar => {
          const w = bar.style.width;
          bar.style.width = '0%';
          setTimeout(() => {
            bar.style.width = w;
          }, 200);
        });
        skillObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

if (skillSection) skillObserver.observe(skillSection);

/* ===== Contact Form ===== */
const form = document.getElementById('contactForm');

form.addEventListener('submit', e => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  const original = btn.innerHTML;
  btn.innerHTML = 'Sent! <i class="fas fa-check"></i>';
  btn.style.background = '#22c55e';
  setTimeout(() => {
    btn.innerHTML = original;
    btn.style.background = '';
    form.reset();
  }, 2500);
});

/* ===== Back to Top ===== */
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 400);
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ===== Counter Animation ===== */
function animateCounters() {
  const stats = document.querySelector('.hero__stats');
  if (!stats) return;

  const statObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      document.querySelectorAll('.stat__num').forEach(el => {
        const text = el.textContent;
        const suffix = text.replace(/[\d]/g, '');
        const target = parseInt(text) || 0;

        let current = 0;
        const step = Math.ceil(target / 40);
        const interval = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(interval);
          }
          el.textContent = current + suffix;
        }, 40);
      });

      statObserver.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  statObserver.observe(stats);
}

animateCounters();

/* ===== 3D Tilt Effect on Cards ===== */
document.querySelectorAll('.cert-card, .service').forEach(card => {
  card.classList.add('tilt');
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotX = ((y - centerY) / centerY) * -8;
    const rotY = ((x - centerX) / centerX) * 8;
    card.style.setProperty('--rotX', rotX + 'deg');
    card.style.setProperty('--rotY', rotY + 'deg');
  });
  card.addEventListener('mouseleave', () => {
    card.style.setProperty('--rotX', '0deg');
    card.style.setProperty('--rotY', '0deg');
  });
});

/* ===== Glow Border on Cert Cards ===== */
document.querySelectorAll('.cert-card').forEach(card => {
  card.classList.add('glow-border');
});

/* ===== Network Particles ===== */
(function initParticles() {
  const canvas = document.getElementById('particlesCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let w, h;

  function resize() {
    const hero = canvas.parentElement;
    w = canvas.width = hero.offsetWidth;
    h = canvas.height = hero.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r = Math.random() * 2 + 1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > w) this.vx *= -1;
      if (this.y < 0 || this.y > h) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      const isDark = html.classList.contains('dark-mode');
      ctx.fillStyle = isDark ? 'rgba(0, 180, 255, 0.5)' : 'rgba(0, 102, 255, 0.35)';
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = [];
    const count = Math.floor((w * h) / 15000);
    for (let i = 0; i < Math.min(count, 80); i++) {
      particles.push(new Particle());
    }
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const isDark = html.classList.contains('dark-mode');
          const alpha = (1 - dist / 150) * 0.3;
          ctx.strokeStyle = isDark
            ? `rgba(0, 180, 255, ${alpha})`
            : `rgba(0, 102, 255, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animate);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      init();
    }, 200);
  });

  init();
  animate();

  // Re-draw on theme change
  themeToggle.addEventListener('click', () => {
    setTimeout(init, 50);
  });
})();
