/**
 * Lightweight ember-particle backdrop for the landing hero.
 *
 * Performance notes (this replaced a much heavier version):
 * - DPR is capped at 1: the effect is soft, so a 1x backing store keeps the
 *   per-frame fill cheap on high-DPI displays.
 * - Each particle is drawn with a pre-rendered glow sprite via `drawImage`
 *   rather than `ctx.shadowBlur` (which is extremely expensive per fill).
 * - The molten bloom is a static CSS gradient (see the SCSS), NOT redrawn here.
 * - The animation loop pauses whenever the canvas scrolls offscreen.
 *
 * Returns a cleanup function that stops the loop and removes listeners.
 * Browser-only: call from `afterNextRender`.
 */
const EMBER_COLORS = ['#ff4d00', '#ff6b2b', '#ff8c42', '#ffb627'];
const MAX_PARTICLES = 56;

interface Particle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  sprite: HTMLCanvasElement;
}

export function initEmberCanvas(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => undefined;

  const dpr = 1;
  let w = 0;
  let h = 0;
  let particles: Particle[] = [];
  let rafId = 0;
  let running = false;

  // Pre-render one soft glow sprite per ember color (cheap to drawImage).
  const sprites = EMBER_COLORS.map((col) => {
    const s = document.createElement('canvas');
    const SZ = 32;
    s.width = s.height = SZ;
    const sc = s.getContext('2d');
    if (sc) {
      const g = sc.createRadialGradient(SZ / 2, SZ / 2, 0, SZ / 2, SZ / 2, SZ / 2);
      g.addColorStop(0, col);
      g.addColorStop(0.45, col);
      g.addColorStop(1, 'rgba(255,77,0,0)');
      sc.fillStyle = g;
      sc.fillRect(0, 0, SZ, SZ);
    }
    return s;
  });

  function makeParticle(seed = false): Particle {
    const sprite = sprites[(Math.random() * sprites.length) | 0];
    const p: Particle = {
      x: Math.random() * w,
      y: seed ? Math.random() * h : h + Math.random() * 60,
      r: 3 + Math.random() * 7,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(0.25 + Math.random() * 0.85),
      life: 0,
      maxLife: 220 + Math.random() * 300,
      sprite,
    };
    if (seed) p.life = Math.random() * p.maxLife;
    return p;
  }

  function resize(): void {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function paint(advance: boolean): void {
    ctx!.clearRect(0, 0, w, h);
    ctx!.globalCompositeOperation = 'lighter';
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx!.globalAlpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.7;
      ctx!.drawImage(p.sprite, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      if (advance) {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        if (p.life >= p.maxLife || p.y < -20) particles[i] = makeParticle(false);
      }
    }
    ctx!.globalAlpha = 1;
    ctx!.globalCompositeOperation = 'source-over';
  }

  function loop(): void {
    if (!running) return;
    paint(true);
    rafId = requestAnimationFrame(loop);
  }

  resize();
  particles = Array.from({ length: MAX_PARTICLES }, () => makeParticle(true));
  window.addEventListener('resize', resize, { passive: true });

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    paint(false);
    return () => window.removeEventListener('resize', resize);
  }

  let observer: IntersectionObserver | null = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting;
        if (visible && !running) {
          running = true;
          rafId = requestAnimationFrame(loop);
        } else if (!visible) {
          running = false;
        }
      },
      { threshold: 0 },
    );
    observer.observe(canvas);
  } else {
    running = true;
    rafId = requestAnimationFrame(loop);
  }

  return () => {
    running = false;
    cancelAnimationFrame(rafId);
    observer?.disconnect();
    window.removeEventListener('resize', resize);
  };
}
