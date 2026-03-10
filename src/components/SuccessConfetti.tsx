import { useEffect, useRef } from 'react';

/* ─── Confetti particle system ─────────────────────────────── */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  spin: number;
  color: string;
  w: number;
  h: number;
  life: number;
}

const COLORS = ['#e3571c', '#1f8f63', '#f2a97f', '#f6c6a7', '#21364d', '#ffd6c3'];

function createParticle(width: number): Particle {
  return {
    x: Math.random() * width,
    y: -10,
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 3 + 2,
    angle: Math.random() * 360,
    spin: (Math.random() - 0.5) * 8,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    w: Math.random() * 8 + 4,
    h: Math.random() * 4 + 3,
    life: 1,
  };
}

function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = Array.from({ length: 80 }, () =>
      createParticle(canvas.width)
    );

    let raf: number;
    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // gravity
        p.angle += p.spin;
        p.life -= 0.005;

        if (p.y > canvas.height || p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.globalAlpha = Math.min(p.life * 2, 1);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (frame < 200 && particles.length < 120) {
        if (frame % 3 === 0) {
          particles.push(createParticle(canvas.width));
        }
      }

      if (particles.length > 0) {
        raf = requestAnimationFrame(draw);
      }
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}

/* ─── Success card ──────────────────────────────────────────── */

interface SuccessConfettiProps {
  open: boolean;
  blueprintUrl?: string;
  customerName: string;
  salesName: string;
  onClose: () => void;
  onPayment?: () => void;
  paymentEnabled?: boolean;
}

export function SuccessConfetti({
  open,
  blueprintUrl,
  customerName,
  salesName,
  onClose,
  onPayment,
  paymentEnabled,
}: SuccessConfettiProps) {
  if (!open) return null;

  return (
    <>
      <ConfettiCanvas />

      {/* Full-screen overlay */}
      <div
        className="fixed inset-0 z-50 flex items-end"
        style={{ background: 'rgba(15,23,42,0.56)' }}
      >
        <div
          className="w-full rounded-t-3xl pb-10 pt-6 px-6"
          style={{
            background: 'var(--arc-paper)',
            animation: 'slideUp 0.5s cubic-bezier(0.22,1,0.36,1) forwards',
          }}
        >
          <style>{`
            @keyframes slideUp {
              from { transform: translateY(60px); opacity: 0; }
              to   { transform: translateY(0);    opacity: 1; }
            }
          `}</style>

          {/* Blueprint thumbnail */}
          {blueprintUrl && (
            <div
              className="w-full rounded-2xl overflow-hidden mb-5"
              style={{ height: 160, background: '#20354d' }}
            >
              <img
                src={blueprintUrl}
                alt="Your blueprint"
                className="w-full h-full object-cover"
                style={{ opacity: 0.85 }}
              />
            </div>
          )}

          {/* Title */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--arc-ink)' }}>
              Proposal Approved!
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--arc-muted)' }}>
              Blueprint for <span className="font-semibold">{customerName}</span>.
              <br />
              {salesName} will contact you shortly to discuss next steps.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {paymentEnabled && onPayment && (
              <button
                onClick={onPayment}
                className="w-full py-4 rounded-2xl text-sm font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg,var(--arc-green),#177452)',
                  boxShadow: '0 10px 20px rgba(31,143,99,0.24)',
                }}
              >
                Make a Payment →
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold"
              style={{
                background: '#fff7f1',
                color: 'var(--arc-muted)',
                border: '1px solid var(--arc-border)',
              }}
            >
              View Proposal
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
