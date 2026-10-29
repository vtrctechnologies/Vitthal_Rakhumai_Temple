import { useState, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import Card from "@/components/base/Card";
import Button from "@/components/base/Button";
import { Input, Textarea } from "@/components/base/Input";
import Progress from "@/components/base/Progress";
import {
  Heart,
  Users,
  Star,
  QrCode,
  Loader2,
  User,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  Trophy,
  IndianRupee,
} from "lucide-react";
import { donationAPI } from "@/services/api";
import apiClient from "@/services/axiosClient";

const Donation = () => {
  const [ref1, inView1] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [ref2, inView2] = useInView({ triggerOnce: true, threshold: 0.1 });

  const sectionRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [recentDonors, setRecentDonors] = useState([]);
  const [loadingDonors, setLoadingDonors] = useState(true);
  const [inView, setInView] = useState(false);
  const [stats, setStats] = useState({ totalRaised: 0, totalDonors: 0 });

  // State for search
  const [searchQuery, setSearchQuery] = useState("");

  // State for custom notification modal
  const [notification, setNotification] = useState(null);
  const [currentDonationId, setCurrentDonationId] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) observer.disconnect();
    };
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    amount: "",
    message: "",
    isAnonymous: false,
  });

  // Load Razorpay script
  useEffect(() => {
    // Check if script already exists
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
    };
    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  // Fetch leaderboard from API
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await donationAPI.getLeaderboard({ limit: 100 });
        if (response.status === "success") {
          setRecentDonors(response.data.leaderboard || []);
          setStats({
            totalRaised: response.data.stats.totalRaised || 0,
            totalDonors: response.data.stats.totalDonors || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoadingDonors(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Filter donors based on search query
  const filteredDonors = recentDonors.filter((donor) =>
    (donor.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const closeNotification = () => {
    setNotification(null);
    if (notification?.type === "success") {
      // Refresh leaderboard after successful donation
      const fetchLeaderboard = async () => {
        try {
          const response = await donationAPI.getLeaderboard({ limit: 100 });
          if (response.status === "success") {
            setRecentDonors(response.data.leaderboard || []);
            setStats({
              totalRaised: response.data.stats.totalRaised || 0,
              totalDonors: response.data.stats.totalDonors || 0,
            });
          }
        } catch (error) {
          console.error("Error fetching leaderboard:", error);
        }
      };
      fetchLeaderboard();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name || !formData.email || !formData.phone || !formData.amount) {
      setNotification({
        type: "error",
        title: "Missing Information",
        message: "Please fill in all required fields.",
      });
      setLoading(false);
      return;
    }

    if (parseFloat(formData.amount) < 1) {
      setNotification({
        type: "error",
        title: "Invalid Amount",
        message: "Donation amount must be at least ₹1.",
      });
      setLoading(false);
      return;
    }

    try {
      // Create donation and get payment order
      const response = await donationAPI.createDonation({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        amount: parseFloat(formData.amount),
        message: formData.message || "",
        isAnonymous: formData.isAnonymous,
      });

      if (response.status === "success") {
        const { donation, order } = response.data;
        setCurrentDonationId(donation.id);

        // Initialize Razorpay checkout
        const options = {
          key: order.key,
          amount: order.amount,
          currency: order.currency,
          name: "VR Temple",
          description: `Donation of ₹${formData.amount}`,
          order_id: order.id,
          handler: async function (response) {
            // Payment successful, verify payment
            try {
              const verifyResponse = await donationAPI.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                donationId: donation.id,
              });

              if (verifyResponse.status === "success") {
                setNotification({
                  type: "success",
                  title: "Payment Successful!",
                  message: formData.isAnonymous
                    ? `Thank you for your generous anonymous donation of ₹${formData.amount}! Your contribution has been safely recorded.`
                    : `Thank you ${formData.name}! Your generous donation of ₹${formData.amount} has been received. Your name has been added to our donor leaderboard.`,
                });
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  amount: "",
                  message: "",
                  isAnonymous: false,
                });
                // Refresh leaderboard
                const leaderboardResponse = await donationAPI.getLeaderboard({ limit: 100 });
                if (leaderboardResponse.status === "success") {
                  setRecentDonors(leaderboardResponse.data.leaderboard || []);
                  setStats({
                    totalRaised: leaderboardResponse.data.stats.totalRaised || 0,
                    totalDonors: leaderboardResponse.data.stats.totalDonors || 0,
                  });
                }
              }
            } catch (error) {
              console.error("Payment verification error:", error);
              setNotification({
                type: "error",
                title: "Verification Failed",
                message: "Payment was successful but verification failed. Please contact support.",
              });
            }
          },
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: "#ea580c",
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        // Check if Razorpay is loaded
        if (!window.Razorpay) {
          setNotification({
            type: "error",
            title: "Payment Gateway Error",
            message: "Payment gateway is not loaded. Please refresh the page and try again.",
          });
          setLoading(false);
          return;
        }

        const razorpay = new window.Razorpay(options);
        razorpay.open();
        razorpay.on("payment.failed", function (response) {
          setNotification({
            type: "error",
            title: "Payment Failed",
            message: response.error.description || "Payment could not be processed. Please try again.",
          });
          setLoading(false);
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setNotification({
        type: "error",
        title: "Submission Failed",
        message: error.response?.data?.message || "There was an error processing your donation. Please try again.",
      });
      setLoading(false);
    }
  };

  const formatRupees = (num) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);

  // Progress bar - fundraising stats
  const targetAmount = 10000000; // 1 Crore
  const progressPercentage = (stats.totalRaised / targetAmount) * 100;

  return (
    <main className="w-full relative">
      {/* Custom Notification Modal */}
      {notification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md p-6 relative bg-white shadow-2xl">
            <button
              onClick={closeNotification}
              className="absolute right-4 top-4 text-stone-400 hover:text-stone-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div
                className={`rounded-full p-3 mb-4 ${notification.type === "success"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
                  }`}
              >
                {notification.type === "success" ? (
                  <CheckCircle2 className="h-8 w-8" />
                ) : (
                  <AlertCircle className="h-8 w-8" />
                )}
              </div>

              <h3 className="text-2xl font-bold text-stone-800 mb-2">
                {notification.title}
              </h3>

              <p className="text-stone-600 mb-6">{notification.message}</p>

              <Button
                onClick={closeNotification}
                className={`w-full ${notification.type === "success"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
                  }`}
              >
                {notification.type === "success" ? "Close" : "Try Again"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-20 pt-36 px-4 bg-linear-to-br from-primary/10 to-secondary/10 relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-white to-transparent opacity-40"></div>
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <Heart className="w-16 h-16 mx-auto text-secondary mb-6 animate-float" />
          <h1 className="text-5xl md:text-7xl font-serif font-bold spiritual-gradient-text mb-6 animate-fade-in">
            Divine Contribution
          </h1>
          <div className="w-48 h-1 bg-linear-to-r from-transparent via-primary to-transparent mx-auto mb-8" />
          <p className="text-xl text-secondary/70 font-medium max-w-2xl mx-auto leading-relaxed">
            Support our sacred mission to build a magnificent abode for Lord Vithal and Goddess
            Rakhumai. Every contribution is a brick in this eternal monument.
          </p>
        </div>
      </section>

      {/* Progress Section */}
      <section className="py-12 px-4 bg-[#FFFCF5]">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-10 border-primary/20 shadow-xl bg-white/80 backdrop-blur-sm rounded-5xl">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
              <div className="text-center md:text-left">
                <p className="text-xs font-bold text-secondary/50 uppercase tracking-widest mb-1">Total Contributions</p>
                <p className="text-4xl font-bold text-secondary">
                  {formatRupees(stats.totalRaised)}
                </p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-xs font-bold text-secondary/50 uppercase tracking-widest mb-1">Divine Goal</p>
                <p className="text-4xl font-bold text-primary">
                  {formatRupees(targetAmount)}
                </p>
              </div>
            </div>

            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-secondary bg-primary/20">
                    Sacred Progress
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold inline-block text-secondary">
                    {progressPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <Progress value={progressPercentage} className="h-4 bg-orange-100" />
            </div>

            <p className="text-sm text-secondary/60 mt-4 text-center font-medium italic">
              Join {stats.totalDonors} devotees who have already contributed.
            </p>
          </Card>
        </div>
      </section>

      {/* Leaderboard Section */}
      <div className="bg-stone-50 font-sans text-stone-800">
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #ea580c 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        ></div>

        <section
          ref={sectionRef}
          className="relative py-16 px-4 bg-orange-50/50 flex flex-col justify-center"
        >
          <div
            className={`container mx-auto max-w-5xl transition-all duration-1000 ease-out transform ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
          >
            {/* Header Section */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center p-3 bg-orange-100 rounded-full mb-4 shadow-sm animate-bounce-slow">
                <Trophy className="w-6 h-6 text-orange-600 fill-orange-600" />
              </div>
              <h3 className="text-3xl md:text-5xl font-bold text-stone-800 mb-4 tracking-tight">
                Donor Leaderboard
              </h3>
              <p className="text-stone-600 max-w-2xl mx-auto text-lg leading-relaxed">
                Our top donors who have generously contributed to this divine cause.
                Rankings are based on donation amount.
              </p>
            </div>

            {/* Main Content Area */}
            {loadingDonors ? (
              <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl shadow-xl border border-orange-100">
                <Loader2 className="h-10 w-10 animate-spin text-orange-500 mb-4" />
                <p className="text-stone-500 text-lg font-medium animate-pulse">
                  Loading the leaderboard...
                </p>
              </div>
            ) : recentDonors.length > 0 ? (
              <div className="grid lg:grid-cols-3 gap-8 items-start">
                {/* Left Column: Stats Card */}
                <Card className="lg:col-span-1 p-8 flex flex-col items-center justify-center text-center bg-white border-orange-100 shadow-xl relative overflow-hidden h-full min-h-[300px]">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-orange-50 rounded-full opacity-50 z-0"></div>
                  <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-orange-50 rounded-full opacity-50 z-0"></div>

                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center p-4 bg-orange-100 rounded-full mb-6 shadow-sm">
                      <Users className="w-8 h-8 text-orange-600" />
                    </div>
                    <div className="mb-2">
                      <span className="text-6xl font-bold text-stone-800 tracking-tight">
                        {stats.totalDonors}
                      </span>
                    </div>
                    <h4 className="text-xl font-semibold text-stone-600 mb-4">
                      Total Donors
                    </h4>
                    <p className="text-sm text-stone-500 max-w-[200px] mx-auto">
                      Join {stats.totalDonors} generous devotees who have
                      contributed to this holy mission.
                    </p>
                  </div>
                </Card>

                {/* Right Column: Leaderboard List */}
                <Card className="lg:col-span-2 bg-white shadow-xl border-orange-100 overflow-hidden relative">
                  <div className="h-2 w-full bg-linear-to-r from-orange-400 via-amber-500 to-orange-400"></div>

                  <div className="p-6 md:p-8">
                    <div className="relative">
                      {/* Search Filter */}
                      <div className="mb-6 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-4 w-4" />
                        <Input
                          placeholder="Search for a donor..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-stone-50 border-stone-200 focus:border-orange-300 focus:ring-orange-200 transition-all"
                        />
                      </div>

                      {/* List Header */}
                      <div className="flex items-center justify-between mb-4 px-2">
                        <span className="text-sm font-bold text-stone-400 uppercase tracking-wider">
                          Donor Name
                        </span>
                        <span className="text-sm font-bold text-stone-400 uppercase tracking-wider">
                          Amount
                        </span>
                      </div>

                      {/* Scrollable Container */}
                      <div className="h-96 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                        {filteredDonors.length > 0 ? (
                          filteredDonors.map((donor, index) => (
                            <div
                              key={index}
                              className="group flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-transparent hover:border-orange-200 hover:bg-orange-50/50 hover:shadow-md transition-all duration-300"
                            >
                              <div className="flex items-center flex-1">
                                {/* Rank Badge */}
                                <div className="flex-shrink-0 mr-3">
                                  {index < 3 ? (
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? "bg-yellow-400 text-yellow-900" :
                                      index === 1 ? "bg-gray-300 text-gray-700" :
                                        "bg-orange-300 text-orange-900"
                                      }`}>
                                      {index + 1}
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center font-semibold text-xs">
                                      {index + 1}
                                    </div>
                                  )}
                                </div>

                                {/* Avatar / Initials */}
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white border-2 border-orange-100 text-orange-600 font-bold flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                                  {(() => {
                                    if (donor.isAnonymous) {
                                      return <User className="w-5 h-5 text-orange-500" />;
                                    }
                                    const parts = (donor.name || "")
                                      .split(/\s+/)
                                      .filter(Boolean);
                                    if (parts.length >= 2) {
                                      return (
                                        parts[0][0] + parts[parts.length - 1][0]
                                      ).toUpperCase();
                                    }
                                    if (parts.length === 1) {
                                      return parts[0][0].toUpperCase();
                                    }
                                    return <User className="w-5 h-5" />;
                                  })()}
                                </div>

                                <div className="ml-4 flex-1">
                                  <h4 className="font-semibold text-stone-700 text-lg group-hover:text-orange-800 transition-colors">
                                    {donor.isAnonymous ? "Anonymous Donor" : (donor.name || "Anonymous")}
                                  </h4>
                                  {donor.message && (
                                    <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                                      {donor.message}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <IndianRupee className="w-4 h-4 text-orange-600" />
                                <span className="font-bold text-orange-600 text-lg">
                                  {formatRupees(donor.amount)}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-stone-500 py-10">
                            <Search className="h-8 w-8 text-stone-300 mb-2" />
                            <p>No donors found matching "{searchQuery}"</p>
                          </div>
                        )}
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-white to-transparent pointer-events-none"></div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-stone-50 px-6 py-4 border-t border-stone-100 text-center">
                    <div className="animate-pulse">
                      <p className="text-sm text-stone-500 flex items-center justify-center gap-2 font-medium">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        Join the community of generous hearts
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl shadow-xl border border-orange-100">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-orange-500" />
                </div>
                <h4 className="text-xl font-semibold text-stone-800 mb-2">
                  Be the First to Donate
                </h4>
                <p className="text-stone-500">
                  Your contribution will light up this leaderboard.
                </p>
              </div>
            )}
          </div>
        </section>

        <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f5f5f4;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #fb923c;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #ea580c;
        }
        @keyframes bounce-slow {
            0%, 100% { transform: translateY(-5%); }
            50% { transform: translateY(5%); }
        }
        .animate-bounce-slow {
            animation: bounce-slow 2s infinite;
        }
      `}</style>
      </div>

      {/* Donation Form Section */}
      <section ref={ref2} className="py-24 px-4 bg-[#FFFCF5] relative overflow-hidden rounded-2xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(var(--color-primary) 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}>
        </div>

        {/* Decorative Ornaments */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-linear-to-r from-transparent via-orange-300 to-transparent rounded-t-5xl"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-linear-to-r from-transparent via-orange-300 to-transparent rounded-b-5xl"></div>

        <div className={`container mx-auto max-w-7xl relative z-10 ${inView2 ? "animate-fade-in" : "opacity-0"}`}>
          <div className="flex flex-col lg:flex-row gap-12 items-start justify-center">

            {/* LEFT: PREMIUM GLASS FORM */}
            <div className="w-full lg:flex-[1.4]">
              <div className="relative p-[1px] rounded-2xl bg-linear-to-br from-primary via-accent to-secondary shadow-2xl overflow-hidden group">
                {/* Glossy Overlay */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                <div className="bg-white/95 backdrop-blur-2xl rounded-2xl p-8 md:p-12">
                  <div className="mb-10 text-center lg:text-left">
                    <span className="inline-block px-4 py-1.5 bg-primary/10 text-secondary text-xs font-bold uppercase tracking-[0.2em] rounded-full mb-4">
                      Divine Contribution
                    </span>
                    <h3 className="text-4xl font-serif font-bold text-secondary mb-3 tracking-tight">Support Our Mission</h3>
                    <p className="text-muted-foreground text-lg italic font-serif">"Your contribution helps build something truly divine and eternal."</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Name + Phone */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-secondary ml-1">Full Name</label>
                        <Input
                          name="name"
                          placeholder="Shri. Your Name"
                          value={formData.name}
                          onChange={handleChange}
                          className="h-14 w-full px-3 rounded-2xl bg-stone-50/50 border-orange-100 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-stone-800"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-secondary ml-1">Phone Number</label>
                        <Input
                          name="phone"
                          placeholder="+91-00000-00000"
                          value={formData.phone}
                          onChange={handleChange}
                          className="h-14 w-full px-3 rounded-2xl bg-stone-50/50 border-orange-100 focus:border-orange-100 focus:ring-4 focus:ring-orange-100 transition-all text-stone-800"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-secondary ml-1">Email Address</label>
                      <Input
                        name="email"
                        placeholder="devout@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="h-14 px-3 w-full rounded-2xl bg-stone-50/50 border-orange-100 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-stone-800"
                      />
                    </div>

                    {/* Amount Area */}
                    <div className="space-y-4">
                      <label className="text-sm font-semibold text-secondary ml-1">Donation Amount</label>
                      <div className="relative">
                        <Input
                          name="amount"
                          type="number"
                          placeholder="Enter Amount"
                          value={formData.amount}
                          onChange={handleChange}
                          className="h-14 pl-16 pr-6 text-xl font-bold text-secondary bg-orange-50/50 border-2 border-orange-100 rounded-3xl focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all"
                        />
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary text-xl font-bold">₹</span>
                      </div>

                      <div className="flex gap-3 flex-wrap justify-center lg:justify-start pt-2">
                        {[501, 1001, 5001, 11001].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setFormData({ ...formData, amount: amt })}
                            className="px-6 py-2.5 rounded-full bg-orange-50 border border-orange-100 hover:border-primary hover:bg-primary/10 text-secondary text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
                          >
                            ₹{amt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-secondary ml-1">Share Your Blessings (Optional)</label>
                      <Textarea
                        name="message"
                        placeholder="Leave a message for the temple community..."
                        value={formData.message}
                        onChange={handleChange}
                        rows={3}
                        className="px-3 w-full mt-1 py-2 rounded-2xl bg-stone-50/50 border-orange-100 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none text-stone-800"
                      />
                    </div>

                    {/* Checkbox */}
                    <label className="flex items-center gap-4 p-4 bg-orange-50/30 rounded-2xl border border-orange-100/50 cursor-pointer hover:bg-orange-50/50 transition-colors group/check">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          name="isAnonymous"
                          checked={formData.isAnonymous}
                          onChange={handleChange}
                          className="w-6 h-6 rounded-md border-orange-200 text-primary focus:ring-primary accent-primary cursor-pointer"
                        />
                      </div>
                      <span className="text-sm text-stone-600 font-medium group-hover/check:text-secondary transition-colors">
                        Choose to remain anonymous on the leaderboard
                      </span>
                    </label>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-18 rounded-3xl bg-linear-to-r from-secondary via-stone-900 to-secondary text-white font-bold text-xl shadow-[0_10px_30px_rgba(93,0,0,0.2)] hover:shadow-[0_15px_40px_rgba(93,0,0,0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 group"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <IndianRupee className="w-5 h-5 text-primary group-hover:rotate-12 transition-transform" />
                          <span>Devout Contribution</span>
                          <Star className="w-5 h-5 text-primary group-hover:scale-125 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>


            {/* RIGHT: QR + TRUST + STATS */}
            <div className="w-full lg:flex-1 flex flex-col gap-8">

              {/* QR CARD - PREMIUM MAROON */}
              <div className="relative rounded-2xl overflow-hidden bg-secondary text-white p-10 shadow-2xl border border-white/10 group min-h-[400px] flex flex-col justify-center">
                {/* Decorative background circle */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-1000"></div>

                <div className="relative z-10 text-center">
                  <div className="relative inline-block mb-8">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                    <div className="relative bg-white p-5 rounded-3xl shadow-2xl transform group-hover:rotate-3 transition-transform duration-500">
                      <QrCode className="w-32 h-32 text-secondary" />
                    </div>
                  </div>

                  <h4 className="text-3xl font-serif font-bold mb-3 tracking-wide">Instant Scan & Pay</h4>
                  <p className="text-orange-100/70 text-sm mb-8 italic">
                    "Support the divine mission instantly via any UPI app"
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    {["G-Pay", "PhonePe"].map((app) => (
                      <div
                        key={app}
                        className="py-3 bg-white/5 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-primary/80"
                      >
                        {app}
                      </div>
                    ))}
                  </div>
                </div>
              </div>


              {/* TRUST CARD - MODERN GOLD */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-orange-100 relative overflow-hidden flex-1">
                <div className="absolute bottom-0 right-0 opacity-10 translate-x-1/4 translate-y-1/4 group transition-transform duration-500 group-hover:scale-110">
                  <Star className="w-48 h-48 text-primary" />
                </div>

                <div className="relative z-10 space-y-8">
                  <div className="flex items-start gap-5">
                    <div className="bg-primary/10 p-4 rounded-2xl shadow-inner group-hover:bg-primary/20 transition-colors">
                      <Star className="w-6 h-6 text-primary fill-primary/30" />
                    </div>
                    <div>
                      <h5 className="font-bold text-secondary text-lg">80G Tax Benefits</h5>
                      <p className="text-sm text-muted-foreground leading-relaxed">All contributions are eligible for income tax exemptions under section 80G.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="bg-green-50 p-4 rounded-2xl shadow-inner">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h5 className="font-bold text-secondary text-lg">Instant Receipt</h5>
                      <p className="text-sm text-muted-foreground leading-relaxed">A digital receipt and certificate will be sent to your email immediately.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secure Token */}
              <div className="flex items-center justify-center gap-3 text-stone-400 opacity-50">
                <div className="h-px w-8 bg-current"></div>
                <p className="text-[10px] uppercase font-bold tracking-[0.3em]">Securely Processed by Razorpay</p>
                <div className="h-px w-8 bg-current"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
};

export default Donation;
