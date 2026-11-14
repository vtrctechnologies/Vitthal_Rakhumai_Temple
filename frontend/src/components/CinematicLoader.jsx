import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────
   All animations are CSS @keyframes — no JS on the main thread.
   This keeps the loader silky-smooth even on low-end devices.
───────────────────────────────────────────────────────────── */

const loaderStyles = `
  @keyframes vr-fadeIn {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes vr-fadeOut {
    from { opacity: 1; }
    to   { opacity: 0; }
  }
  @keyframes vr-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes vr-spinReverse {
    from { transform: rotate(0deg); }
    to   { transform: rotate(-360deg); }
  }
  @keyframes vr-scale-in {
    0%   { opacity: 0; transform: scale(0.7); }
    60%  { transform: scale(1.06); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes vr-divider {
    from { transform: scaleX(0); opacity: 0; }
    to   { transform: scaleX(1); opacity: 1; }
  }
  @keyframes vr-pulse-glow {
    0%, 100% { box-shadow: 0 0 18px 4px rgba(212,175,55,0.18); }
    50%       { box-shadow: 0 0 40px 12px rgba(212,175,55,0.38); }
  }
  @keyframes vr-text1 {
    0%   { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes vr-text2 {
    0%   { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes vr-dots {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
    40%            { transform: scale(1); opacity: 1; }
  }
  @keyframes vr-streak {
    0%   { transform: translate3d(-120%, -50%, 0) rotate(-35deg); }
    100% { transform: translate3d(220%, -50%, 0) rotate(-35deg); }
  }
  @keyframes vr-lotus-fade {
    0%   { opacity: 0; transform: scale(0.5) rotate(var(--lr,0deg)); }
    100% { opacity: 0.22; transform: scale(1) rotate(var(--lr,0deg)); }
  }
  @keyframes vr-corner-fade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes vr-progress {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }

  /* Outer ring – slow clockwise */
  .vr-ring-outer {
    animation: vr-spin 10s linear infinite;
    will-change: transform;
  }
  /* Inner ring – counter-clockwise */
  .vr-ring-inner {
    animation: vr-spinReverse 6s linear infinite;
    will-change: transform;
  }
  /* Logo zoom-in */
  .vr-logo {
    animation: vr-scale-in 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s both,
               vr-pulse-glow 3s ease-in-out 1.2s infinite;
    will-change: transform, opacity;
  }
  /* Gold divider line */
  .vr-divider {
    animation: vr-divider 1.2s cubic-bezier(0.22,1,0.36,1) 1s both;
    will-change: transform;
  }
  /* Title text */
  .vr-title {
    animation: vr-text1 0.9s cubic-bezier(0.22,1,0.36,1) 0.55s both;
    will-change: transform, opacity;
  }
  /* Subtitle Sanskrit text */
  .vr-subtitle {
    animation: vr-text2 0.9s cubic-bezier(0.22,1,0.36,1) 1.1s both;
    will-change: transform, opacity;
  }
  /* Corner ornaments */
  .vr-corner {
    animation: vr-corner-fade 0.6s ease 1.6s both;
  }
  /* Light streak */
  .vr-streak {
    animation: vr-streak 7s linear 0.5s infinite;
    will-change: transform;
  }
  /* Lotus petals */
  .vr-petal {
    animation: vr-lotus-fade 1.2s cubic-bezier(0.22,1,0.36,1) var(--pd,0s) both;
  }
  /* Loading dots */
  .vr-dot-1 { animation: vr-dots 1.4s ease-in-out 1.8s infinite; }
  .vr-dot-2 { animation: vr-dots 1.4s ease-in-out 2.0s infinite; }
  .vr-dot-3 { animation: vr-dots 1.4s ease-in-out 2.2s infinite; }
  /* Progress bar (GPU-composited transform so main-thread work never freezes it) */
  .vr-progress-bar {
    width: 100%;
    transform: scaleX(0);
    transform-origin: left center;
    animation: vr-progress 2.3s cubic-bezier(0.22,1,0.36,1) 0.15s forwards;
    will-change: transform;
  }
  /* Whole loader fade-out */
  .vr-loader-exit {
    animation: vr-fadeOut 0.6s ease forwards;
    pointer-events: none;
  }
`;

/* ── Lotus petal SVG decorations (pure SVG, no JS) ── */
const LotusRing = () => {
  const petals = Array.from({ length: 8 }, (_, i) => {
    const angle = i * 45;
    const delay = `${0.6 + i * 0.08}s`;
    return (
      <div
        key={i}
        className="vr-petal absolute top-1/2 left-1/2 origin-bottom"
        style={{
          "--lr": `${angle}deg`,
          "--pd": delay,
          transform: `translate(-50%, -100%) rotate(${angle}deg)`,
          transformOrigin: "50% 100%",
          width: "18px",
          height: "38px",
        }}
      >
        <svg viewBox="0 0 18 38" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="9" cy="24" rx="7" ry="16"
            fill="none"
            stroke="rgba(212,175,55,0.55)"
            strokeWidth="1"
          />
          <ellipse cx="9" cy="22" rx="4" ry="10"
            fill="rgba(229,130,30,0.18)"
          />
        </svg>
      </div>
    );
  });
  return (
    <div
      className="absolute"
      style={{ width: "120px", height: "120px", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)" }}
    >
      {petals}
    </div>
  );
};

/* ── Ornamental SVG ring (Mandala-like) ── */
const MandalaRing = ({ size, dashes, color, className }) => (
  <svg
    width={size} height={size}
    viewBox={`0 0 ${size} ${size}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`absolute top-1/2 left-1/2 ${className}`}
    style={{ transform: "translate(-50%,-50%)", pointerEvents: "none" }}
  >
    <circle
      cx={size / 2} cy={size / 2} r={size / 2 - 2}
      stroke={color}
      strokeWidth="1.5"
      strokeDasharray={dashes}
      strokeDashoffset="0"
    />
    {/* 8 small diamonds around the ring */}
    {Array.from({ length: 8 }, (_, i) => {
      const angle = (i * 45 * Math.PI) / 180;
      const r = size / 2 - 2;
      const cx2 = size / 2 + r * Math.cos(angle);
      const cy2 = size / 2 + r * Math.sin(angle);
      return (
        <rect
          key={i}
          x={cx2 - 3} y={cy2 - 3}
          width="6" height="6"
          rx="0.5"
          transform={`rotate(45 ${cx2} ${cy2})`}
          fill={color}
        />
      );
    })}
  </svg>
);

/* ── Main Loader Component ── */
const CinematicLoader = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Strictly prevent any scrolling or touch-dragging while loading screen is active
  useEffect(() => {
    window.scrollTo(0, 0);

    const blockScroll = (e) => {
      if (e.cancelable) {
        e.preventDefault();
      }
      e.stopPropagation();
      return false;
    };

    window.addEventListener("wheel", blockScroll, { passive: false });
    window.addEventListener("touchmove", blockScroll, { passive: false });
    document.addEventListener("touchmove", blockScroll, { passive: false });

    return () => {
      window.removeEventListener("wheel", blockScroll);
      window.removeEventListener("touchmove", blockScroll);
      document.removeEventListener("touchmove", blockScroll);
    };
  }, []);

  // Allow the full glorious cinematic animation to complete first, then smoothly fade out
  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2450);

    const doneTimer = setTimeout(() => {
      if (onCompleteRef.current) onCompleteRef.current();
    }, 3050);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <>
      {/* Inject styles once (no external CSS file needed) */}
      <style>{loaderStyles}</style>

      <div
        className={isExiting ? "vr-loader-exit" : ""}
        onTouchMove={(e) => {
          if (e.cancelable) e.preventDefault();
        }}
        onWheel={(e) => {
          if (e.cancelable) e.preventDefault();
        }}
        style={{
          position: "fixed",
          inset: 0,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100dvh",
          minHeight: "100%",
          zIndex: 999999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #3a0a0a 0%, #6b1a1a 45%, #4a0f0f 100%)",
          overflow: "hidden",
          touchAction: "none",
          overscrollBehavior: "none",
          userSelect: "none",
          color: "white",
        }}
      >
        {/* ── Background diamond grid ── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(45deg,rgba(212,175,55,0.06) 0,rgba(212,175,55,0.06) 1px,transparent 0,transparent 28px)",
            backgroundSize: "28px 28px",
            pointerEvents: "none",
          }}
        />

        {/* ── Radial glow in center ── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(212,175,55,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* ── Light streak ── */}
        <div
          aria-hidden
          className="vr-streak"
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            width: "35%",
            height: "280px",
            background:
              "linear-gradient(90deg,transparent,rgba(245,166,35,0.06),transparent)",
            pointerEvents: "none",
          }}
        />

        {/* ══ Main content ══ */}
        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center" }}>

          {/* ── Logo medallion ── */}
          <div style={{ position: "relative", width: "180px", height: "180px", marginBottom: "32px" }}>

            {/* Outer spinning mandala ring */}
            <div
              className="vr-ring-outer"
              style={{ position: "absolute", inset: "-18px" }}
            >
              <MandalaRing
                size={216}
                dashes="4 8"
                color="rgba(212,175,55,0.45)"
                className=""
              />
            </div>

            {/* Inner counter-spinning ring */}
            <div
              className="vr-ring-inner"
              style={{ position: "absolute", inset: "-6px" }}
            >
              <MandalaRing
                size={192}
                dashes="2 6"
                color="rgba(229,130,30,0.5)"
                className=""
              />
            </div>

            {/* Lotus petals behind logo */}
            <LotusRing />

            {/* Conic gold border */}
            <div
              style={{
                position: "absolute",
                inset: "-4px",
                borderRadius: "50%",
                background:
                  "conic-gradient(from 0deg, #d4af37, #f5a623, #d4af37, #8b2222, #d4af37)",
                zIndex: 1,
              }}
            />

            {/* Dark backing ring */}
            <div
              style={{
                position: "absolute",
                inset: "2px",
                borderRadius: "50%",
                background: "#4a0f0f",
                zIndex: 2,
              }}
            />

            {/* Logo image */}
            <img
              src="/temple-logo-optimized.png"
              alt="Shree Vitthal Rakhumai Temple"
              className="vr-logo"
              style={{
                position: "absolute",
                inset: "6px",
                width: "calc(100% - 12px)",
                height: "calc(100% - 12px)",
                borderRadius: "50%",
                objectFit: "cover",
                zIndex: 3,
              }}
            />
          </div>

          {/* ── Temple Name ── */}
          <h1
            className="vr-title"
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: "clamp(1.4rem, 4vw, 2.2rem)",
              fontWeight: 700,
              letterSpacing: "0.22em",
              color: "#d4af37",
              textTransform: "uppercase",
              margin: "0 0 4px 0",
              textShadow: "0 2px 20px rgba(212,175,55,0.35)",
            }}
          >
            VITTHAL RAKHUMAI
          </h1>

          {/* ── Gold ornament line ── */}
          <div
            className="vr-divider"
            style={{
              height: "2px",
              width: "220px",
              background:
                "linear-gradient(90deg,transparent,#d4af37 30%,#f5a623 50%,#d4af37 70%,transparent)",
              margin: "10px 0",
              transformOrigin: "center",
            }}
          />

          {/* ── Sanskrit subtitle ── */}
          <p
            className="vr-subtitle"
            style={{
              fontFamily: "'Noto Serif Devanagari', serif",
              fontSize: "clamp(1.05rem, 3vw, 1.4rem)",
              color: "#f5a623",
              letterSpacing: "0.06em",
              margin: "0 0 28px 0",
              textShadow: "0 1px 10px rgba(229,130,30,0.3)",
            }}
          >
            ॥ पुंडलिका वरदा हरी विठ्ठल ॥
          </p>

          {/* ── Progress bar ── */}
          <div
            style={{
              width: "220px",
              height: "3px",
              background: "rgba(212,175,55,0.15)",
              borderRadius: "4px",
              overflow: "hidden",
              marginBottom: "18px",
            }}
          >
            <div
              className="vr-progress-bar"
              style={{
                height: "100%",
                background: "linear-gradient(90deg,#8b2222,#d4af37,#f5a623)",
                borderRadius: "4px",
              }}
            />
          </div>

          {/* ── Loading dots ── */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {["vr-dot-1", "vr-dot-2", "vr-dot-3"].map((cls, i) => (
              <div
                key={i}
                className={cls}
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: i === 1 ? "#f5a623" : "#d4af37",
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Corner ornaments ── */}
        {[
          { top: "20px", left: "20px", borderTop: "2px solid rgba(212,175,55,0.5)", borderLeft: "2px solid rgba(212,175,55,0.5)" },
          { top: "20px", right: "20px", borderTop: "2px solid rgba(212,175,55,0.5)", borderRight: "2px solid rgba(212,175,55,0.5)" },
          { bottom: "20px", left: "20px", borderBottom: "2px solid rgba(212,175,55,0.5)", borderLeft: "2px solid rgba(212,175,55,0.5)" },
          { bottom: "20px", right: "20px", borderBottom: "2px solid rgba(212,175,55,0.5)", borderRight: "2px solid rgba(212,175,55,0.5)" },
        ].map((corner, i) => (
          <div
            key={i}
            aria-hidden
            className="vr-corner"
            style={{
              position: "absolute",
              width: "36px",
              height: "36px",
              borderRadius: "2px",
              ...corner,
            }}
          />
        ))}

        {/* ── Small Om symbols in bg ── */}
        {[
          { top: "12%", left: "8%", size: "2rem", opacity: 0.07 },
          { top: "75%", right: "7%", size: "2.5rem", opacity: 0.06 },
          { bottom: "15%", left: "5%", size: "1.5rem", opacity: 0.05 },
        ].map((s, i) => (
          <div
            key={i}
            aria-hidden
            style={{
              position: "absolute",
              top: s.top,
              left: s.left,
              right: s.right,
              bottom: s.bottom,
              fontFamily: "'Noto Serif Devanagari', serif",
              fontSize: s.size,
              color: `rgba(212,175,55,${s.opacity})`,
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            ॐ
          </div>
        ))}
      </div>
    </>
  );
};

export default CinematicLoader;
