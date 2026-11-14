import { useState, useEffect, memo, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { donationAPI } from "@/services/api";
import { Sparkles, Heart } from "lucide-react";
import foldedIcon from "../assets/icons/folded.png";

// Curated devotional donors list (used as rich default & fallback)
const DEFAULT_DONORS = [
  { name: "Rahul Deshpande", marathiName: "राहुल देशपांडे", amount: 51000, tag: "सुवर्ण सेवा" },
  { name: "Suresh K. & Family", marathiName: "सुरेश के. व परिवार", amount: 25000, tag: "महाप्रसाद" },
  { name: "Priya Patil", marathiName: "प्रिया पाटील", amount: 21000, tag: "दीपोत्सव" },
  { name: "Meera Kulkarni", marathiName: "मीरा कुलकर्णी", amount: 15000, tag: "अन्नदान" },
  { name: "Amit & Family", marathiName: "अमित आणि परिवार", amount: 11000, tag: "पूजा सेवा" },
  { name: "Ganesh Joshi", marathiName: "गणेश जोशी", amount: 11000, tag: "उत्सव सेवा" },
  { name: "Anonymous Devotee", marathiName: "गुप्त देणगीदार", amount: 10000, tag: "दानशूर" },
  { name: "Sunil Amberkar", marathiName: "सुनील आंबेकर", amount: 7500, tag: "मंदिर सेवा" },
];

/**
 * Modern Sacred Diamond Separator
 */
const DiamondStar = memo(() => (
  <div className="flex items-center gap-1.5 opacity-60 shrink-0">
    <span className="w-1 h-1 rounded-full bg-amber-400/70" />
    <span className="text-amber-400 text-[10px]">✦</span>
    <span className="w-1 h-1 rounded-full bg-amber-400/70" />
  </div>
));
DiamondStar.displayName = "DiamondStar";

/**
 * Individual Donor Item in the Ticker Track
 */
const TickerCard = memo(({ donor, isMarathi }) => {
  const displayName = isMarathi ? (donor.marathiName || donor.name) : donor.name;

  return (
    <div className="inline-flex items-center gap-2.5 sm:gap-3.5 px-3.5 sm:px-5 py-2.5 rounded-full hover:bg-amber-400/10 transition-colors duration-200 select-none cursor-default group">
      {/* Sacred Folded Hands Icon Medallion */}
      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-400/15 border border-amber-400/40 flex items-center justify-center shrink-0 group-hover:border-amber-300 transition-colors shadow-xs">
        <img
          src={foldedIcon}
          alt="Pranam"
          className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain brightness-110"
          loading="lazy"
        />
      </div>

      {/* Donor Information */}
      <div className="flex items-center gap-2">
        <span className="font-heading text-xs sm:text-[0.82rem] font-semibold tracking-wide text-amber-100 group-hover:text-amber-200 transition-colors whitespace-nowrap">
          {displayName}
        </span>

        {/* Micro devotional tag */}
        {donor.tag && (
          <span className="hidden xs:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-marathi font-medium bg-amber-400/15 text-amber-300/90 border border-amber-400/20 whitespace-nowrap">
            {donor.tag}
          </span>
        )}
      </div>

      {/* Trailing Star Ornament */}
      <DiamondStar />
    </div>
  );
});
TickerCard.displayName = "TickerCard";

/**
 * DonationTicker – Modern, high-performance infinity marquee
 * Optimized for small screens, clean dark devotional aesthetic, light gold accents.
 */
const DonationTicker = () => {
  const { isMarathi } = useLanguage();
  const [donors, setDonors] = useState(DEFAULT_DONORS);

  // Attempt to fetch live leaderboard from backend; fallback to DEFAULT_DONORS gracefully
  useEffect(() => {
    let isMounted = true;
    const fetchTopDonors = async () => {
      try {
        const response = await donationAPI.getLeaderboard({ limit: 15 });
        if (isMounted && response?.status === "success" && Array.isArray(response.data?.leaderboard) && response.data.leaderboard.length > 0) {
          // Merge API data with mock details for richer display
          const mapped = response.data.leaderboard.map((d, idx) => ({
            name: d.isAnonymous ? "Anonymous Devotee" : (d.name || "Devotee"),
            marathiName: d.isAnonymous ? "गुप्त देणगीदार" : (d.marathiName || d.name || "भाविक"),
            amount: d.amount,
            tag: DEFAULT_DONORS[idx % DEFAULT_DONORS.length]?.tag || "दानशूर",
          }));
          setDonors(mapped);
        }
      } catch {
        // Retain default donors silently on error
      }
    };

    fetchTopDonors();
    return () => {
      isMounted = false;
    };
  }, []);

  // Duplicate items array to ensure a 100% gapless continuous marquee loop
  const marqueeList = useMemo(() => {
    return donors.length <= 8 ? [...donors, ...donors] : donors;
  }, [donors]);

  return (
    <section
      aria-label="Recent Top Donors Ticker"
      className="relative w-full overflow-hidden bg-[#160303] border-y border-amber-400/25 shadow-inner"
    >
      {/* Top delicate light gold hairline */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent z-20 pointer-events-none" />

      {/* Subtle divine golden texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #d4af37 0, #d4af37 1px, transparent 0, transparent 48px)",
        }}
      />

      <div className="relative z-10 flex items-center w-full">
        {/* ── STATIC LEADING BADGE ── */}
        <div className="relative z-20 shrink-0 flex items-center gap-1.5 sm:gap-2.5 bg-[#1f0505] border-r border-amber-400/30 px-3 sm:px-4 py-2 sm:py-2.5 shadow-[4px_0_14px_rgba(0,0,0,0.6)]">
          {/* Glowing pulse aura dot */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          </span>

          <Sparkles size={12} className="text-amber-300 shrink-0 hidden sm:block" />

          {/* Badge Label */}
          <div className="flex flex-col text-left">
            <span className="text-[0.62rem] sm:text-[0.7rem] font-heading font-bold uppercase tracking-[0.16em] text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 whitespace-nowrap">
              {isMarathi ? "प्रमुख देणगीदार" : "Top Donors"}
            </span>
          </div>

          <Heart size={10} className="fill-amber-400/70 text-amber-400/70 shrink-0 ml-0.5 hidden xs:block" />
        </div>

        {/* ── LEFT FADE VIGNETTE (seamless blend from badge) ── */}
        <div className="absolute left-[88px] xs:left-[110px] sm:left-[140px] top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#160303] to-transparent z-10 pointer-events-none" />

        {/* ── RIGHT FADE VIGNETTE ── */}
        <div className="absolute right-0 top-0 bottom-0 w-10 sm:w-20 bg-gradient-to-l from-[#160303] to-transparent z-10 pointer-events-none" />

        {/* ── INFINITE MARQUEE TRACK ── */}
        <div className="ticker-container flex overflow-hidden w-full py-1">
          {/* TRACK 1 */}
          <div className="flex shrink-0 animate-marquee items-center gap-1 sm:gap-2">
            {marqueeList.map((donor, i) => (
              <TickerCard
                key={`donor-a-${i}-${donor.name}`}
                donor={donor}
                isMarathi={isMarathi}
              />
            ))}
          </div>

          {/* TRACK 2 (Seamless loop copy) */}
          <div
            className="flex shrink-0 animate-marquee items-center gap-1 sm:gap-2"
            aria-hidden="true"
          >
            {marqueeList.map((donor, i) => (
              <TickerCard
                key={`donor-b-${i}-${donor.name}`}
                donor={donor}
                isMarathi={isMarathi}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Marquee Animation Styles with Hover Pause */}
      <style>{`
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-100%, 0, 0); }
        }
        .animate-marquee {
          animation: marquee 55s linear infinite;
          will-change: transform;
        }
        /* Pause on user hover so names can be read comfortably on desktop */
        .ticker-container:hover .animate-marquee {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee {
            animation-duration: 120s;
          }
        }
      `}</style>
    </section>
  );
};

export default memo(DonationTicker);
