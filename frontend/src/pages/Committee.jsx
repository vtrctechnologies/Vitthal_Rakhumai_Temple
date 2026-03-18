import React, { useState, useEffect } from "react";
import { Users, Loader2, User } from "lucide-react";
import { committeeAPI } from "../services/api";

import { motion } from "framer-motion";

const Committee = () => {
  const [data, setData] = useState({ register: [], utsav: [], mahila: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("register");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all three committees in parallel
        const [registerRes, utsavRes, mahilaRes] = await Promise.all([
          committeeAPI.getMembers({ committeeType: "register" }),
          committeeAPI.getMembers({ committeeType: "utsav" }),
          committeeAPI.getMembers({ committeeType: "mahila" }),
        ]);

        // Helper to extract members array from response
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
        setError("Unable to load committee members. Please try again later.");
        setData({ register: [], utsav: [], mahila: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

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
        "आमच्या शासनाचे स्तंभ, पारदर्शकता आणि परिचालन उत्कृष्टता सुनिश्चित करतात.",
      members: data.register,
    },
    {
      id: "utsav",
      title: "Utsav Committee",
      marathiTitle: "उत्सव समिती",
      description:
        "Orchestrating divine celebrations and keeping our vibrant traditions alive.",
      marathiDescription:
        "दिव्य उत्सवांचे आयोजन करणे आणि आमच्या जिवंत परंपरा जिवंत ठेवणे.",
      members: data.utsav,
    },
    {
      id: "mahila",
      title: "Mahila Mandal",
      marathiTitle: "महिला मंडळ",
      description:
        "The strength of our community, empowering women through spiritual union.",
      marathiDescription:
        "आमच्या समुदायाची ताकद, आध्यात्मिक एकतेद्वारे महिलांना सक्षम करणे.",
      members: data.mahila,
    },
  ];

  const activeCommittee =
    committees.find((c) => c.id === activeTab) || committees[0];

  return (
    <div className="bg-[#FFFCF5] font-sans py-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block mb-4">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              className="text-orange-500 mx-auto opacity-80"
            >
              <path
                d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5L12 2Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-6 tracking-tight">
            Our Committee
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 font-serif italic">
            "Dedicated souls weaving the fabric of our community through
            service, tradition, and devotion."
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {committees.map((committee) => (
            <button
              key={committee.id}
              onClick={() => setActiveTab(committee.id)}
              className={`
                px-6 py-3 rounded-full text-sm md:text-base font-bold transition-all duration-300
                ${
                  activeTab === committee.id
                    ? "bg-red-900 text-yellow-400 shadow-lg scale-105"
                    : "bg-white text-gray-700 hover:bg-red-50 hover:text-red-900 border border-gray-200"
                }
              `}
            >
              {committee.title}
            </button>
          ))}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            className="flex flex-col items-center justify-center py-24 text-gray-400"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
            <p className="font-medium">Loading committee members...</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            className="bg-red-50 border border-red-200 rounded-xl p-8 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-red-600 font-medium">{error}</p>
          </motion.div>
        )}

        {/* Committee Members Grid */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-800 mb-3">
                {activeCommittee.title}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {activeCommittee.description}
              </p>
            </div>

            {activeCommittee.members.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  No Members Found
                </h3>
                <p className="text-gray-500">
                  No members available for {activeCommittee.title} at this time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {activeCommittee.members.map((member, idx) => (
                  <MemberCard
                    key={member._id || idx}
                    member={member}
                    getImageUrl={getImageUrl}
                    index={idx}
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

// Member Card Component
const MemberCard = ({ member, getImageUrl, index }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      className="group relative bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      {/* Image Container */}
      <div className="h-64 w-full relative overflow-hidden bg-orange-50">
        {member.imageUrl && !imgError ? (
          <img
            src={getImageUrl(member.imageUrl)}
            alt={member.name}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-[#FFF8F0] text-orange-200">
            <User size={64} strokeWidth={1.5} />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40" />
      </div>

      {/* Text Content */}
      <div className="p-5 text-center border-t border-orange-100/50">
        <h4 className="font-serif text-lg font-bold text-gray-800 leading-tight mb-2 group-hover:text-orange-700 transition-colors line-clamp-1">
          {member.name}
        </h4>
        <span className="inline-block w-8 h-0.5 bg-orange-200 my-2 rounded-full" />
        <p className="font-sans text-xs font-semibold text-orange-600 uppercase tracking-widest line-clamp-1">
          {member.role}
        </p>
      </div>
    </motion.div>
  );
};

export default Committee;
