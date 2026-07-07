"use client";

import { useEffect, useRef } from "react";

const CATS = ["ALL", "BX", "UX", "AI", "MOTION"];

// placeholder cards — varied heights for the masonry look (images swapped in later)
const HEIGHTS = [380, 280, 460, 320, 240, 400, 300, 360, 260, 420, 300, 340];
const CARDS = Array.from({ length: 24 }, (_, i) => ({
  h: HEIGHTS[i % HEIGHTS.length],
  t: `Project ${String(i + 1).padStart(2, "0")}`,
}));

export default function WorkOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const starsRef = useRef<HTMLCanvasElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // while open, grab the wheel at the window in CAPTURE phase (before Lenis)
  // so it can never scroll anything but the card grid
  useEffect(() => {
    if (!open) return;
    const scroller = mainRef.current;
    if (!scroller) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      scroller.scrollTop += e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    };
    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () =>
      window.removeEventListener("wheel", onWheel, { capture: true } as EventListenerOptions);
  }, [open]);

  // the overlay's own starfield (only runs while open) — same "space", no logo/text
  useEffect(() => {
    if (!open) return;
    const canvas = starsRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const DPR = Math.min(window.devicePixelRatio, 2);
    let W = 0, H = 0;
    const resize = () => {
      W = canvas.width = window.innerWidth * DPR;
      H = canvas.height = window.innerHeight * DPR;
    };
    resize();
    const stars: { x: number; y: number; z: number; r: number; tw: number; c: string }[] = [];
    for (let i = 0; i < 280; i++) {
      const roll = Math.random();
      stars.push({
        x: Math.random() * W, y: Math.random() * H, z: Math.random(),
        r: (Math.random() * 1.3 + 0.3) * DPR, tw: Math.random() * Math.PI * 2,
        c: roll < 0.14 ? "#8fbcff" : roll < 0.22 ? "#ffd6a8" : "#ffffff",
      });
    }
    window.addEventListener("resize", resize);
    let raf = 0;
    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        s.x += (0.02 + s.z * 0.06) * DPR;
        if (s.x > W) s.x = 0;
        const a = 0.35 + 0.65 * Math.abs(Math.sin(s.tw + t * 0.001 * (0.5 + s.z)));
        ctx.globalAlpha = a * (0.35 + s.z * 0.65);
        ctx.fillStyle = s.c;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * (0.6 + s.z), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [open]);

  return (
    <section ref={sectionRef} className={"work-overlay" + (open ? " open" : "")} aria-hidden={!open}>
      <canvas ref={starsRef} className="work-stars" />
      <aside className="work-side">
        <button className="work-back" onClick={onClose} aria-label="Back">
          <span className="arrow">←</span> Back
        </button>
        <div className="work-side__body">
          <h2 className="work-side__title">
            <span>WORK</span>
            <span className="out">2026</span>
          </h2>
          <nav className="work-cats">
            {CATS.map((c, i) => (
              <button key={c} className={i === 0 ? "active" : ""}>
                {c}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <div className="work-main" data-lenis-prevent ref={mainRef}>
        <div className="work-grid">
          {[0, 1, 2].map((ci) => (
            <div className="work-col" key={ci}>
              {CARDS.filter((_, i) => i % 3 === ci).map((card) => (
                <div className="work-card" key={card.t} style={{ minHeight: card.h }}>
                  <span>{card.t}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
