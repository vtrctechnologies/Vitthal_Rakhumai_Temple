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
                  message: `Thank you ${formData.name}! Your generous donation of ₹${formData.amount} has been received. Your name has been added to our donor leaderboard.`,
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
      <section className="py-20 pt-36 px-4 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <Heart className="w-16 h-16 mx-auto text-primary mb-6 animate-float" />
          <h1 className="text-5xl md:text-6xl font-display font-bold text-gradient mb-6 animate-fade-in">
            Support Our Temple
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-primary to-accent mx-auto mb-6" />
          <p className="text-xl text-muted-foreground">
            Support our dream to build a new temple for Lord Vithal and Goddess
            Rakhumai. Every rupee counts in this divine mission!
          </p>
        </div>
      </section>

      {/* Progress Section */}
      <section className="py-12 px-4 bg-stone-50">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Raised</p>
                <p className="text-3xl font-bold text-primary">
                  {formatRupees(stats.totalRaised)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Target</p>
                <p className="text-3xl font-bold text-stone-700">
                  {formatRupees(targetAmount)}
                </p>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {progressPercentage.toFixed(1)}% of goal reached
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
                  <div className="h-2 w-full bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400"></div>

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

                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
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

      {/* Donation Form */}
      <section ref={ref2} className="py-16 px-4">
        <div
          className={`container mx-auto max-w-6xl ${inView2 ? "animate-fade-in" : "opacity-0"
            }`}
        >
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Donation Form */}
            <Card className="p-8 bg-white">
              <h3 className="text-2xl font-display font-bold mb-6">
                Make a Donation
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Full Name *"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Email Address *"
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Phone Number *"
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Donation Amount (₹) *"
                  id="amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  required
                />

                <Textarea
                  label="Message (Optional)"
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="resize-none"
                />

                <label htmlFor="isAnonymous" className="text-sm flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    id="isAnonymous"
                    name="isAnonymous"
                    checked={formData.isAnonymous}
                    onChange={handleChange}
                    className="rounded"
                  />
                  <span>Donate anonymously (name won't appear on leaderboard)</span>
                </label>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-accent text-lg py-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Proceed to Payment"
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  You'll be redirected to a secure payment gateway (UPI, Card, Net Banking, etc.)
                </p>
              </form>
            </Card>

            {/* Payment Info */}
            <div className="space-y-6">
              <Card className="p-8 text-center bg-white">
                <QrCode className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="text-2xl font-display font-bold mb-4">
                  Secure Payment
                </h3>
                <p className="text-muted-foreground mb-4">
                  We accept all major payment methods through Razorpay:
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-stone-50 rounded-lg">
                    <p className="font-semibold">UPI</p>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-lg">
                    <p className="font-semibold">Credit/Debit Card</p>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-lg">
                    <p className="font-semibold">Net Banking</p>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-lg">
                    <p className="font-semibold">Wallets</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-primary/10 border-primary/20">
                <p className="text-sm text-center text-muted-foreground">
                  All donations are tax-exempt under Section 80G. Receipt will
                  be issued for donations above ₹500.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Donation;
