import React from "react";
import { Award, ExternalLink } from "lucide-react";

const committeeData = [
  {
    id: 1,
    role: "President",
    name: "Shri. Ramchandra Joshi",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 2,
    role: "Secretary",
    name: "Mrs. Sunita Deshpande",
    imageUrl:
      "https://i.3dmodels.org/uploads/elegant-mesh-3d/199_Classic_Cartoon_Man_Rigged_Model_Realtime_Male_3d_Toon_Low_poly_3d_Model/Classic_Cartoon_Man_Rigged_Model_Realtime_Male_3d_Toon_Low_poly_3d_Model_1000_0001.jpg",
  },
  {
    id: 3,
    role: "Treasurer",
    name: "Shri. Vinay Kulkarni",
    imageUrl:
      "https://i.3dmodels.org/uploads/elegant-mesh-3d/199_Classic_Cartoon_Man_Rigged_Model_Realtime_Male_3d_Toon_Low_poly_3d_Model/Classic_Cartoon_Man_Rigged_Model_Realtime_Male_3d_Toon_Low_poly_3d_Model_1000_0001.jpg",
  },
];

const CommitteeMembers = () => {
  return (
    <section className="py-10 px-4 font-sans relative bg-[#FFFCF5] overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern
            id="lotus-light"
            x="0"
            y="0"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="30" cy="30" r="1.5" fill="#FDBA74" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#lotus-light)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6 font-medium">
            Register Committee
          </h2>

          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-px w-12 bg-orange-300"></div>
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <div className="h-px w-12 bg-orange-300"></div>
          </div>

          <p className="text-gray-600 max-w-2xl mx-auto text-lg font-light leading-relaxed">
            Dedicated individuals working tirelessly to preserve our traditions,
            maintain sanctity, and serve the community with devotion.
          </p>
        </div>

        {/* Card Grid - Optimized for Premium Look */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 justify-items-center">
          {committeeData.map((member) => (
            <div
              key={member.id}
              className="group flex flex-col items-center text-center w-full max-w-sm"
            >
              {/* Premium Circular Profile with Decorative Rings */}
              <div className="relative mb-8">
                {/* Outer Glow/Ring */}
                <div className="absolute inset-[-12px] bg-linear-to-tr from-orange-100/50 to-amber-50/30 rounded-full blur-xl group-hover:inset-[-20px] transition-all duration-700 opacity-0 group-hover:opacity-100" />

                {/* Decorative Border Rings */}
                <div className="absolute inset-[-4px] rounded-full border border-orange-200/50 transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-[-8px] rounded-full border border-orange-100/30 transition-transform duration-1000 group-hover:scale-125" />

                {/* Main Image Container */}
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 aspect-square rounded-full bg-linear-to-br from-white via-orange-50 to-orange-100 shadow-xl overflow-hidden z-10 border-4 border-white">
                  <img
                    src={member.imageUrl}
                    alt={member.name}
                    className="absolute inset-0 block w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />

                  {/* Subtle Inner Glow on Hover */}
                  <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] pointer-events-none group-hover:shadow-[inset_0_0_40px_rgba(0,0,0,0.2)] transition-shadow duration-500" />
                </div>

                {/* Badge/Icon Accents */}
                <div className="absolute bottom-1 right-1 z-20 bg-white p-2.5 rounded-full shadow-lg border border-orange-100 transform transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12">
                  <Award className="w-5 h-5 text-orange-500" />
                </div>
              </div>

              {/* Name & Role Container */}
              <div className="space-y-3 z-10">
                <h3 className="text-2xl font-serif text-gray-900 font-bold tracking-tight group-hover:text-orange-900 transition-colors duration-300">
                  {member.name}
                </h3>

                <div className="flex items-center justify-center gap-3">
                  <div className="h-px w-6 bg-orange-200" />
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-[0.2em] opacity-90">
                    {member.role}
                  </span>
                  <div className="h-px w-6 bg-orange-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommitteeMembers;