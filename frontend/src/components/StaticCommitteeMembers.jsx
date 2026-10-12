import React, { useState } from "react";
import { User } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────────────────
   PERMANENT STATIC COMMITTEE MEMBERS (3 members)
   Edit this array directly to update names, designations, or photos.
   Set imageUrl to an image path or URL. Leave null for initials avatar.
   ───────────────────────────────────────────────────────────────────────────── */
const STATIC_COMMITTEE_MEMBERS = [
  {
    id: "cm-1",
    name: "Shri. Ramchandra Joshi",
    nameMarathi: "श्री. रामचंद्र जोशी",
    position: "President",
    positionMarathi: "अध्यक्ष",
    imageUrl: null,
  },
  {
    id: "cm-2",
    name: "Shri. Dattatray Shinde",
    nameMarathi: "श्री. दत्तात्रय शिंदे",
    position: "Vice President",
    positionMarathi: "उपाध्यक्ष",
    imageUrl: null,
  },
  {
    id: "cm-3",
    name: "Mrs. Sunita Deshpande",
    nameMarathi: "सौ. सुनीता देशपांडे",
    position: "Secretary",
    positionMarathi: "सचिव",
    imageUrl: null,
  },
];

/* ── Single Round Member Circle Card ── */
const MemberCircleCard = ({ member, index, isMarathi }) => {
  const [imgError, setImgError] = useState(false);
  const showAvatar = !member.imageUrl || imgError;

  // Extract up to 2 initials, ignoring honorific prefixes
  const initials = member.name
    .split(" ")
    .filter((w) => !["Shri.", "Mrs.", "Sou.", "Sau.", "Dr.", "Mr."].includes(w))
    .filter((w) => w[0] && w[0] === w[0].toUpperCase())
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true }}
      className="group flex flex-col items-center text-center px-4 max-w-[240px] w-full"
    >
      {/* Round Circle Image */}
      <div className="relative mb-5">
        {/* Outer decorative dashed ring */}
        <div
          className="absolute rounded-full border-2 border-dashed border-gold/30 group-hover:border-gold/60 transition-colors duration-500"
          style={{ inset: "-8px" }}
        />

        {/* Main circle with responsive dimensions */}
        <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full overflow-hidden border-[3px] border-gold shadow-[0_8px_30px_rgba(107,26,26,0.15)] group-hover:shadow-[0_12px_40px_rgba(107,26,26,0.25)] transition-all duration-500 group-hover:scale-105 relative bg-stone">
          {!showAvatar ? (
            <img
              src={member.imageUrl}
              alt={member.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-maroon via-maroon-lt to-maroon-dk">
              {initials ? (
                <span className="font-heading text-3xl sm:text-4xl font-bold text-gold-lt tracking-wider select-none drop-shadow-sm">
                  {initials}
                </span>
              ) : (
                <User size={46} strokeWidth={1.5} className="text-gold-lt" />
              )}
            </div>
          )}

          {/* Inner depth shadow */}
          <div className="absolute inset-0 rounded-full shadow-[inset_0_-6px_16px_rgba(0,0,0,0.2)] pointer-events-none" />
        </div>

        {/* Small sacred saffron accent dot */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-saffron border-2 border-cream shadow-sm" />
      </div>

      {/* Member Name */}
      <h3 className="font-display text-lg sm:text-xl md:text-[1.35rem] font-bold text-maroon leading-snug group-hover:text-saffron-dk transition-colors duration-300">
        {isMarathi ? member.nameMarathi : member.name}
      </h3>

      {/* Subtle gold divider */}
      <div className="w-8 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent my-2 opacity-60" />

      {/* Position */}
      <p className="font-heading text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-saffron-dk">
        {isMarathi ? member.positionMarathi : member.position}
      </p>
    </motion.div>
  );
};

/* ── Main Component ── */
const StaticCommitteeMembers = () => {
  const { isMarathi } = useLanguage();

  return (
    <div className="relative">
      {/* Section Header */}
      <div className="text-center mb-12 sm:mb-14 relative">
        <span className="block font-heading text-[10px] sm:text-xs tracking-[0.28em] uppercase text-saffron mb-2">
          {isMarathi ? "संस्थान मंडळ" : "Sansthan Mandal"}
        </span>
        <h2 className="font-display text-[clamp(1.8rem,5vw,3rem)] font-bold text-maroon leading-tight">
          {isMarathi ? "मंदिर व्यवस्थापन समिती" : "Temple Committee"}
        </h2>
        {!isMarathi && (
          <p className="font-marathi text-[clamp(1.3rem,3vw,2rem)] text-ink-mid font-semibold mt-1">
            मंदिर व्यवस्थापन समिती
          </p>
        )}

        {/* Diamond Divider */}
        <div className="flex items-center gap-3 my-4 justify-center">
          <div className="flex-1 max-w-[100px] h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
          <div className="w-2 h-2 bg-saffron rotate-45 opacity-80" />
          <div className="flex-1 max-w-[100px] h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
        </div>

        <p className="font-body text-base sm:text-lg text-ink-light max-w-md mx-auto italic px-4">
          {isMarathi
            ? "समर्पित सेवेने मंदिराची परंपरा सांभाळणारे विश्वस्त मंडळ"
            : "Guiding temple traditions and sacred service with devotion"}
        </p>
      </div>

      {/* 3 Members — responsive layout: stacked on mobile, row on tablet & desktop */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-10 sm:gap-8 md:gap-14 lg:gap-20">
        {STATIC_COMMITTEE_MEMBERS.map((member, index) => (
          <MemberCircleCard
            key={member.id}
            member={member}
            index={index}
            isMarathi={isMarathi}
          />
        ))}
      </div>
    </div>
  );
};

export default StaticCommitteeMembers;
