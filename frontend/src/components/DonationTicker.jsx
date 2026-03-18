import { Heart } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// Mock data with Marathi translations
const MOCK_DONATIONS = [
  { name: "Rahul Deshpande", marathiName: "राहुल देशपांडे" },
  { name: "Priya Patil", marathiName: "प्रिया पाटील" },
  { name: "Amit & Family", marathiName: "अमित आणि परिवार" },
  { name: "Anonymous Devotee", marathiName: "गुप्त देणगीदार" },
  { name: "Suresh K.", marathiName: "सुरेश क." },
];

const DonationTicker = () => {
  const { isMarathi } = useLanguage();

  // We verify we have enough data to look good.
  // If the list is short, we double it inside the render to ensure it fills the screen width.
  const items = [...MOCK_DONATIONS, ...MOCK_DONATIONS];

  return (
    <div className="w-full bg-orange-50 border-y border-orange-100 py-3 relative flex overflow-hidden">
      {/* --- STATIC BADGE --- */}
      {/* Added z-20 to ensure it stays on top of the scrolling text */}
      <div className="absolute left-0 top-0 bottom-0 z-20 bg-red-900 text-primary font-bold border-r-4 border-primary flex items-center px-4 shadow-md">
        <p className="text-sm uppercase tracking-wider text-white whitespace-nowrap">
          {isMarathi ? "प्रमुख देणगीदार" : "Top Donations"}
        </p>
      </div>

      {/* --- GRADIENT MASKS --- */}
      {/* Left gradient pushed over to start AFTER the badge so text fades nicely into the badge */}
      <div className="absolute left-[120px] md:left-[140px] top-0 bottom-0 w-20 bg-gradient-to-r from-orange-50 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-orange-50 to-transparent z-10 pointer-events-none"></div>

      {/* --- SCROLLING WRAPPER --- */}
      {/* We add padding-left (pl-44) to the wrapper so the text doesn't start underneath the "Top Donations" badge initially */}
      <div className="flex w-full pl-44 group hover:[animation-play-state:paused]">
        {/* TRACK 1 */}
        <div className="flex animate-infinite-scroll shrink-0 gap-8 pr-8">
          {items.map((donor, index) => (
            <DonationItem
              key={`t1-${index}`}
              donor={donor}
              isMarathi={isMarathi}
            />
          ))}
        </div>

        {/* TRACK 2 (Duplicate for seamless loop) */}
        {/* aria-hidden ensures screen readers don't read the list twice */}
        <div
          className="flex animate-infinite-scroll shrink-0 gap-8 pr-8"
          aria-hidden="true"
        >
          {items.map((donor, index) => (
            <DonationItem
              key={`t2-${index}`}
              donor={donor}
              isMarathi={isMarathi}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes infinite-scroll {
          from { transform: translateX(0) translateZ(0); }
          to { transform: translateX(-100%) translateZ(0); }
        }
        .animate-infinite-scroll {
          animation: infinite-scroll 30s linear infinite;
          will-change: transform;
          transform: translateZ(0);
        }
        /* Pause animation when scrolling for better performance */
        .lenis.lenis-scrolling .animate-infinite-scroll {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

// Extracted Item component for cleaner code
const DonationItem = ({ donor, isMarathi }) => (
  <div className="inline-flex items-center text-orange-900/80 font-medium whitespace-nowrap">
    <div className="bg-orange-100 p-1.5 rounded-full mr-3">
      <img src="./src/assets/icons/folded.png" className="w-4 h-4" />
    </div>
    <span className="mr-2 font-bold text-orange-800 text-sm sm:text-base">
      {isMarathi ? donor.marathiName || donor.name : donor.name}
    </span>
  </div>
);

export default DonationTicker;
