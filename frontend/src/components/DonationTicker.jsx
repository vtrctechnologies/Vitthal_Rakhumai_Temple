import { useLanguage } from "@/context/LanguageContext";

// Mock data with Marathi translations
const MOCK_DONATIONS = [
  { name: "Rahul Deshpande", marathiName: "राहुल देशपांडे" },
  { name: "Priya Patil", marathiName: "प्रिया पाटील" },
  { name: "Amit & Family", marathiName: "अमित आणि परिवार" },
  { name: "Anonymous Devotee", marathiName: "गुप्त देणगीदार" },
  { name: "Suresh K.", marathiName: "सुरेश क." },
  { name: "Meera Kulkarni", marathiName: "मीरा कुलकर्णी" },
  { name: "Ganesh Joshi", marathiName: "गणेश जोशी" },
];

// Diamond ornament SVG — same style used in Home.jsx DiamondDivider
const DiamondOrn = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className="shrink-0 opacity-80"
  >
    <rect
      x="7"
      y="0.5"
      width="9"
      height="9"
      rx="0.5"
      transform="rotate(45 7 0.5)"
      fill="#e8650a"
      opacity="0.85"
    />
    <rect
      x="7"
      y="2.5"
      width="5.5"
      height="5.5"
      rx="0.3"
      transform="rotate(45 7 2.5)"
      fill="none"
      stroke="#f0d060"
      strokeWidth="0.7"
    />
  </svg>
);

const DonationTicker = () => {
  const { isMarathi } = useLanguage();

  // Triple the list to guarantee seamless loop at any viewport width
  const items = [...MOCK_DONATIONS, ...MOCK_DONATIONS, ...MOCK_DONATIONS];

  return (
    <div className="relative w-full flex overflow-hidden bg-white border-y-2 border-gold">
      {/* Vertical gold rule pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06] z-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #d4af37 0, #d4af37 1px, transparent 0, transparent 60px)",
        }}
      />

      {/* ── STATIC BADGE ── */}
      <div className="relative z-20 shrink-0 flex items-center gap-2 bg-ink-dark border-r-2 border-gold px-4 sm:px-5 py-3 shadow-[4px_0_16px_rgba(0,0,0,0.5)]">
        {/* Top arch accent line — mirrors the home hero top border */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-maroon via-gold to-saffron" />

        <span className="text-[0.6rem] sm:text-[0.65rem] font-heading font-bold uppercase tracking-[0.22em] text-transparent bg-clip-text bg-gradient-to-r from-gold-lt via-saffron-lt to-gold whitespace-nowrap">
          {isMarathi ? "प्रमुख देणगीदार" : "Top Donations"}
        </span>

        <div className="hidden sm:block w-px h-4 bg-gold/40" />
        <span className="hidden sm:inline text-gold/70 text-sm">✦</span>
      </div>

      {/* ── LEFT FADE MASK (after badge) ── */}
      <div className="absolute left-[var(--badge-w,110px)] top-0 bottom-0 w-12 bg-gradient-to-r from-maroon to-transparent z-10 pointer-events-none" />
      {/* ── RIGHT FADE MASK ── */}
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-maroon to-transparent z-10 pointer-events-none" />

      {/* ── SCROLLING TRACK WRAPPER ── */}
      {/*
        NO hover pause, NO lenis-scrolling pause.
        The two tracks run side-by-side and each loops independently,
        creating a perfectly seamless infinite marquee.
      */}
      <div className="relative z-10 flex min-w-0 w-full">
        {/* TRACK 1 */}
        <div className="flex shrink-0 animate-ticker gap-0 pr-0">
          {items.map((donor, i) => (
            <DonationItem key={`a-${i}`} donor={donor} isMarathi={isMarathi} />
          ))}
        </div>

        {/* TRACK 2 — duplicate for seamless loop */}
        <div
          className="flex shrink-0 animate-ticker gap-0 pr-0"
          aria-hidden="true"
        >
          {items.map((donor, i) => (
            <DonationItem key={`b-${i}`} donor={donor} isMarathi={isMarathi} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes ticker {
          from { transform: translateX(0) translateZ(0); }
          to   { transform: translateX(-100%) translateZ(0); }
        }
        .animate-ticker {
          animation: ticker 60s linear infinite;
          will-change: transform;
          transform: translateZ(0);
          /* Never pause — not on hover, not on scroll */
          animation-play-state: running !important;
        }
      `}</style>
    </div>
  );
};

/* ── Item sub-component ── */
const DonationItem = ({ donor, isMarathi }) => (
  <div className="inline-flex items-center gap-3 px-6 py-3 whitespace-nowrap">
    {/* Diamond ornament separator */}
    <DiamondOrn />

    {/* Folded-hands icon inside a subtle gold-rimmed circle */}
    <div className="flex items-center justify-center w-7 h-7 rounded-full border border-gold/50 bg-gold/10 shrink-0">
      <img
        src="./src/assets/icons/folded.png"
        alt=""
        aria-hidden="true"
        className="w-4 h-4 object-contain"
      />
    </div>

    {/* Donor name — gold gradient text, matching hero accent style */}
    <span className="font-heading text-[0.8rem] sm:text-[0.85rem] font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-gold-lt via-saffron-lt to-gold">
      {isMarathi ? (donor.marathiName ?? donor.name) : donor.name}
    </span>
  </div>
);

export default DonationTicker;
