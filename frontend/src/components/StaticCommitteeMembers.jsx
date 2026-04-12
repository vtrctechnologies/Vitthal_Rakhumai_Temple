import React, { useState, useEffect } from "react";
import { Award, User } from "lucide-react";
import { committeeAPI } from "@/services/api";
import { getImageUrl } from "@/utils/imageUrl";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";

/* ── Section Header (Internal) ── */
const SectionHeader = ({ title, titleMr, isMarathi }) => (
  <div className="text-center mb-16 relative">
    <div className="inline-block relative">
      <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold text-maroon leading-tight relative z-10 px-8">
        {isMarathi ? titleMr : title}
      </h2>
      <div className="absolute top-1/2 left-0 w-6 h-6 border-l-4 border-t-4 border-saffron -translate-y-full -translate-x-2 opacity-30" />
      <div className="absolute bottom-1/2 right-0 w-6 h-6 border-r-4 border-b-4 border-saffron translate-y-full translate-x-2 opacity-30" />
    </div>
    
    <div className="flex items-center justify-center gap-4 mt-6">
      <div className="flex-1 max-w-[80px] h-px bg-gradient-to-r from-transparent to-gold" />
      <div className="w-2.5 h-2.5 bg-saffron rotate-45" />
      <div className="flex-1 max-w-[80px] h-px bg-gradient-to-l from-transparent to-gold" />
    </div>
  </div>
);

const defaultMembers = [
  {
    _id: "default-1",
    name: "Shri. Ramchandra Joshi",
    nameMarathi: "श्री. रामचंद्र जोशी",
    position: "President",
    positionMarathi: "अध्यक्ष",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    order: 1
  },
  {
    _id: "default-2",
    name: "Mrs. Sunita Deshpande",
    nameMarathi: "सौ. सुनीता देशपांडे",
    position: "Secretary",
    positionMarathi: "सचिव",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop",
    order: 2
  },
  {
    _id: "default-3",
    name: "Shri. Vinay Kulkarni",
    nameMarathi: "श्री. विनय कुलकर्णी",
    position: "Treasurer",
    positionMarathi: "खजिनदार",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop",
    order: 3
  }
];

const CommitteeMembers = () => {
  const { isMarathi } = useLanguage();
  const [members, setMembers] = useState(defaultMembers);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await committeeAPI.getMembers({ committeeType: 'register', isActive: 'true' });
        if (response && response.status === "success" && Array.isArray(response.data) && response.data.length > 0) {
           // Sort by order
           const sorted = response.data.sort((a,b) => (a.order || 0) - (b.order || 0));
           setMembers(sorted.slice(0, 6)); // Top 6 for home page
        }
      } catch (error) {
        console.error("Error fetching committee members:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  if (!loading && members.length === 0) return null;

  return (
    <div className="relative">
      <SectionHeader 
        title="Temple Committee" 
        titleMr="मंदिर व्यवस्थापन समिती" 
        isMarathi={isMarathi} 
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
           {[1, 2, 3].map(i => (
             <div key={i} className="aspect-square bg-stone-100 rounded-full animate-pulse border-4 border-white shadow-lg mx-auto w-48" />
           ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 justify-items-center">
          {members.map((member, index) => (
            <motion.div
              key={member._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group flex flex-col items-center text-center w-full max-w-sm"
            >
              <div className="relative mb-8">
                {/* Decorative Halo */}
                <div className="absolute inset-[-15px] bg-gradient-to-tr from-saffron/10 to-gold/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                {/* Ornamental Rings */}
                <div className="absolute inset-[-6px] rounded-full border border-gold/30 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-[-12px] rounded-full border border-saffron/10 group-hover:scale-125 transition-transform duration-1000" />

                {/* Main Profile Image */}
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full shadow-2xl overflow-hidden z-10 border-4 border-white bg-cream">
                  <img
                    src={getImageUrl(member.imageUrl)}
                    alt={member.name}
                    className="absolute inset-0 block w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Inner Shadow Overlay */}
                  <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.1)] group-hover:shadow-[inset_0_0_60px_rgba(0,0,0,0.2)] transition-shadow duration-500" />
                </div>

                {/* Badge Icon */}
                <div className="absolute bottom-2 right-2 z-20 bg-white p-2.5 rounded-full shadow-lg border border-gold/20 transform transition-transform duration-500 group-hover:scale-125 group-hover:-rotate-12">
                  <Award className="w-5 h-5 text-saffron" />
                </div>
              </div>

              {/* Text Info */}
              <div className="space-y-2 relative z-10 w-full px-4">
                <div className="flex items-center justify-center gap-2 mb-2 opacity-40">
                   <div className="h-px w-6 bg-gold" />
                   <div className="w-1 h-1 bg-maroon rounded-full" />
                   <div className="h-px w-6 bg-gold" />
                </div>

                <h3 className="font-display text-2xl font-bold text-maroon group-hover:text-saffron-dk transition-colors">
                  {member.name}
                </h3>
                {member.nameMarathi && (
                  <p className="font-marathi text-xl text-ink-mid font-semibold -mt-1 mb-2">
                    {member.nameMarathi}
                  </p>
                )}

                <div className="inline-block px-4 py-1.5 rounded-full bg-cream-dk/50 border border-gold/10 hover:bg-gold/10 transition-colors">
                  <p className="font-heading text-xs font-bold text-saffron tracking-[0.2em] uppercase">
                    {isMarathi && member.positionMarathi ? member.positionMarathi : (member.position || "Member")}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommitteeMembers;