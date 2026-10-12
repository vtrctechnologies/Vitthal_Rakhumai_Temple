import React, { useState, useEffect } from "react";
import { Users, Loader2, User, Award } from "lucide-react";
import { committeeAPI } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { motion } from "framer-motion";

/* ── Sacred Diamond Divider ── */
const DiamondDivider = () => (
  <div className="flex items-center gap-3 my-5 justify-center">
    <div className="flex-1 max-w-[120px] h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect
        x="11"
        y="1"
        width="13"
        height="13"
        rx="1"
        transform="rotate(45 11 1)"
        className="fill-saffron opacity-80"
      />
      <rect
        x="11"
        y="4"
        width="9"
        height="9"
        rx="0.5"
        transform="rotate(45 11 4)"
        fill="none"
        className="stroke-gold-lt"
        strokeWidth="0.8"
      />
    </svg>
    <div className="flex-1 max-w-[120px] h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
  </div>
);

const Committee = () => {
  const { isMarathi } = useLanguage();
  const [data, setData] = useState({ register: [], utsav: [], mahila: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("register");
  const [activeYear, setActiveYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);

  // Fetch available years on mount
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await committeeAPI.getCommitteeYears();
        if (response?.status === "success" && Array.isArray(response.data)) {
          setAvailableYears(response.data);
          if (response.data.length > 0 && !response.data.includes(activeYear)) {
            setActiveYear(response.data[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching committee years:", err);
      }
    };
    fetchYears();
  }, []);

  // Fetch members when year changes
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all three committees for the selected year in parallel
        const [registerRes, utsavRes, mahilaRes] = await Promise.all([
          committeeAPI.getMembers({ committeeType: "register", year: activeYear }),
          committeeAPI.getMembers({ committeeType: "utsav", year: activeYear }),
          committeeAPI.getMembers({ committeeType: "mahila", year: activeYear }),
        ]);

        const extractMembers = (response) => {
          if (!response) return [];
          if (response.status === "success" && Array.isArray(response.data)) {
            return response.data;
          } else if (response.data && Array.isArray(response.data)) {
            return response.data;
          } else if (Array.isArray(response)) {
            return response;
          }
          return [];
        };

        setData({
          register: extractMembers(registerRes),
          utsav: extractMembers(utsavRes),
          mahila: extractMembers(mahilaRes),
        });
      } catch (err) {
        console.error("Error fetching committee members:", err);
        setError(
          isMarathi
            ? "समिती सदस्य लोड करण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा."
            : "Unable to load committee members. Please try again later."
        );
        setData({ register: [], utsav: [], mahila: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [activeYear, isMarathi]);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http")) return imageUrl;
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
      "http://localhost:5000";
    return `${baseUrl}${imageUrl}`;
  };

  const committees = [
    {
      id: "register",
      title: "Register Committee",
      marathiTitle: "नोंदणी समिती",
      description:
        "The pillars of our governance, ensuring transparency and operational excellence.",
      marathiDescription:
        "आमच्या शासनाचे आधारस्तंभ, पारदर्शकता आणि परिचालन उत्कृष्टता सुनिश्चित करणारे विश्वस्त मंडळ.",
      members: data.register,
    },
    {
      id: "utsav",
      title: "Utsav Committee",
      marathiTitle: "उत्सव समिती",
      description:
        "Orchestrating divine celebrations and keeping our vibrant traditions alive.",
      marathiDescription:
        "दिव्य उत्सवांचे नियोजन आणि आपल्या वारकरी परंपरा अखंड चालू ठेवणारी समिती.",
      members: data.utsav,
    },
    {
      id: "mahila",
      title: "Mahila Mandal",
      marathiTitle: "महिला मंडळ",
      description:
        "The strength of our community, empowering women through spiritual union and seva.",
      marathiDescription:
        "आमच्या समाजाची ताकद, आध्यात्मिक एकता आणि सेवाभावाने कार्यरत महिला भगिनी.",
      members: data.mahila,
    },
  ];

  const activeCommittee =
    committees.find((c) => c.id === activeTab) || committees[0];

  return (
    <div className="bg-cream font-body text-ink-dark py-24 min-h-screen relative overflow-hidden">
      {/* Top decorative stripe */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-maroon via-gold via-saffron to-maroon" />

      {/* Subtle background motif */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, var(--color-gold) 0, var(--color-gold) 1px, transparent 0, transparent 40px)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="block font-heading text-xs tracking-[0.28em] uppercase text-saffron mb-2">
            Sansthan Mandal
          </span>
          <h1 className="font-display text-[clamp(2.2rem,5vw,3.75rem)] font-bold text-maroon mb-2 leading-tight">
            {isMarathi ? "मंदिर व्यवस्थापन समिती" : "Our Committee"}
          </h1>
          <p className="font-marathi text-[clamp(1.3rem,3vw,2rem)] text-ink-mid font-semibold mb-3">
            {isMarathi ? "श्री विठ्ठल रखुमाई मंदिर ट्रस्ट" : "Shree Vitthal Rakhumai Mandir Trust"}
          </p>
          <DiamondDivider />
          <p className="max-w-2xl mx-auto text-lg text-ink-light font-body italic">
            {isMarathi
              ? "“समर्पित भावनेने मंदिर संकुलाची सेवा आणि वारकरी परंपरेचे जतन करणारे कार्यकर्ते.”"
              : "“Dedicated souls weaving the fabric of our community through sacred seva, tradition, and devotion.”"}
          </p>
        </motion.div>

        {/* Committee Wings Tab Navigation */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {committees.map((committee) => (
            <button
              key={committee.id}
              onClick={() => setActiveTab(committee.id)}
              className={`
                px-6 py-3 rounded-full font-heading text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-300 border
                ${
                  activeTab === committee.id
                    ? "bg-gradient-to-r from-maroon via-maroon-lt to-maroon text-gold-lt border-gold shadow-lg shadow-maroon/20 scale-105"
                    : "bg-cream-dk/60 text-ink-mid border-gold/30 hover:border-gold hover:text-maroon hover:bg-cream-dk"
                }
              `}
            >
              {isMarathi ? committee.marathiTitle : committee.title}
            </button>
          ))}
        </motion.div>

        {/* Year Filter Pill Selector */}
        {availableYears.length > 0 && (
          <motion.div
            className="flex flex-wrap justify-center items-center gap-2 mb-14"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="font-heading text-xs font-bold text-ink-light uppercase tracking-widest mr-2">
              {isMarathi ? "वर्ष निवडा:" : "Year:"}
            </span>
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => setActiveYear(year)}
                className={`
                  px-4 py-1.5 rounded-full text-xs font-heading font-semibold tracking-widest transition-all duration-200 border
                  ${
                    activeYear === year
                      ? "bg-saffron text-white border-saffron-dk shadow-sm scale-105"
                      : "bg-cream-dk/80 text-ink-light border-gold/30 hover:border-saffron hover:text-saffron-dk"
                  }
                `}
              >
                {year}
              </button>
            ))}
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            className="flex flex-col items-center justify-center py-24 text-ink-light"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Loader2 className="w-12 h-12 animate-spin text-saffron mb-4" />
            <p className="font-heading text-sm tracking-widest uppercase text-maroon">
              {isMarathi ? "समिती सदस्य लोड होत आहेत..." : "Loading sacred committee…"}
            </p>
          </motion.div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            className="bg-cream-dk border border-vermillion/30 rounded-xl p-8 text-center max-w-lg mx-auto shadow-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-vermillion font-medium">{error}</p>
          </motion.div>
        )}

        {/* Committee Wing Content */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Wing Banner Info */}
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-maroon mb-2">
                {isMarathi ? activeCommittee.marathiTitle : activeCommittee.title}
              </h2>
              <p className="font-body text-ink-light text-base sm:text-lg leading-relaxed">
                {isMarathi ? activeCommittee.marathiDescription : activeCommittee.description}
              </p>
            </div>

            {/* Empty State */}
            {activeCommittee.members.length === 0 ? (
              <div className="bg-cream-dk/60 rounded-2xl border border-gold/30 p-16 text-center max-w-lg mx-auto">
                <div className="bg-white/80 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 border border-gold/30 shadow-inner">
                  <Users className="w-10 h-10 text-gold-dk" />
                </div>
                <h3 className="font-display text-2xl font-bold text-maroon mb-2">
                  {isMarathi ? "सदस्य माहिती उपलब्ध नाही" : "No Members Found"}
                </h3>
                <p className="font-body text-ink-light">
                  {isMarathi
                    ? `या वर्षासाठी ${activeCommittee.marathiTitle}चे सदस्य उपलब्ध नाहीत.`
                    : `No members available for ${activeCommittee.title} for ${activeYear}.`}
                </p>
              </div>
            ) : (
              /* Members Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                {activeCommittee.members.map((member, idx) => (
                  <MemberCard
                    key={member._id || idx}
                    member={member}
                    getImageUrl={getImageUrl}
                    index={idx}
                    isMarathi={isMarathi}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

/* ── Refined Member Card matching Website Theme ── */
const MemberCard = ({ member, getImageUrl, index, isMarathi }) => {
  const [imgError, setImgError] = useState(false);
  const photoUrl = getImageUrl(member.imageUrl);

  return (
    <motion.div
      className="group relative bg-[#FCF8EE] rounded-sm p-3.5 shadow-md border border-gold/40 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:border-gold flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.04 }}
    >
      {/* Outer Dashed Border Accent */}
      <div className="absolute inset-1 pointer-events-none border border-dashed border-gold/30 rounded-sm group-hover:border-gold/60 transition-colors" />

      {/* Image Container with Postage Vignette Frame */}
      <div className="h-64 w-full relative overflow-hidden bg-cream-dk border border-gold/40 rounded-sm">
        {photoUrl && !imgError ? (
          <img
            src={photoUrl}
            alt={member.name}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-cream-dk text-gold-dk">
            <User size={56} strokeWidth={1.5} />
          </div>
        )}

        {/* Warm Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-maroon/40 via-transparent to-transparent opacity-70 group-hover:opacity-40 transition-opacity duration-300" />

        {/* Corner Badge */}
        <div className="absolute bottom-2 left-2 z-10 bg-cream/95 backdrop-blur-sm px-2.5 py-0.5 rounded-sm border border-gold/40 shadow-sm flex items-center gap-1">
          <Award className="w-3 h-3 text-saffron shrink-0" />
          <span className="font-heading text-[10px] font-bold text-maroon uppercase tracking-wider">
            {isMarathi && member.positionMarathi ? member.positionMarathi : (member.role || member.position || "Member")}
          </span>
        </div>
      </div>

      {/* Text Info */}
      <div className="pt-3.5 pb-1 text-center relative z-10 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-display text-lg font-bold text-maroon leading-tight group-hover:text-saffron-dk transition-colors line-clamp-1">
            {member.name}
          </h4>
          {member.nameMarathi && (
            <p className="font-marathi text-base font-semibold text-ink-mid mt-0.5 line-clamp-1">
              {member.nameMarathi}
            </p>
          )}
        </div>

        <div className="mt-3 pt-2 border-t border-gold/30">
          <p className="font-heading text-[10px] font-semibold text-saffron-dk uppercase tracking-[0.2em] line-clamp-1">
            {isMarathi && member.roleMarathi ? member.roleMarathi : (member.role || member.position || "Member")}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Committee;
