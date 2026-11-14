import { useState, memo } from "react";
import { MapPin, Phone, Mail, Clock, Send, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { contactAPI } from "@/services/api";
import { useLanguage } from "@/context/LanguageContext";

/* ── Sacred Diamond Divider ── */
const DiamondDivider = () => (
  <div className="flex items-center gap-3 my-3 justify-center">
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

/* ── Corner Accents for Cards ── */
const CornerAccents = () => (
  <>
    <span className="absolute -top-0.5 -left-0.5 w-3.5 h-3.5 border-t-2 border-l-2 border-saffron z-20" />
    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 border-t-2 border-r-2 border-saffron z-20" />
    <span className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 border-b-2 border-l-2 border-saffron z-20" />
    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-b-2 border-r-2 border-saffron z-20" />
  </>
);

const Contact = memo(() => {
  const { isMarathi } = useLanguage();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name || !formData.email || !formData.message) {
      Swal.fire({
        icon: "error",
        title: isMarathi ? "अपूर्ण माहिती" : "Missing Information",
        text: isMarathi
          ? "कृपया सर्व आवश्यक माहिती भरा."
          : "Please fill in all required fields.",
        confirmButtonColor: "#d97706",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await contactAPI.sendMessage(formData);

      if (response && (response.status === "success" || response.success)) {
        Swal.fire({
          icon: "success",
          title: isMarathi ? "संदेश पाठवला!" : "Message Sent!",
          text: isMarathi
            ? "आमच्याशी संपर्क साधल्याबद्दल धन्यवाद. आम्ही लवकरच उत्तर देऊ."
            : "Thank you for contacting us. We will get back to you soon.",
          confirmButtonColor: "#d97706",
        });

        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: isMarathi ? "त्रुटी आली" : "Submission Failed",
        text:
          error.response?.data?.message ||
          (isMarathi
            ? "संदेश पाठवताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा."
            : "There was an error sending your message."),
        confirmButtonColor: "#d97706",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactCards = [
    {
      icon: MapPin,
      title: isMarathi ? "पत्ता" : "Address",
      content: isMarathi ? (
        <>
          श्री विठ्ठल रखुमाई मंदिर ट्रस्ट,
          <br />
          आंबेकरवाडी, अंबरे, ता. रत्नागिरी,
          <br />
          जि. रत्नागिरी, महाराष्ट्र
        </>
      ) : (
        <>
          Shree Vitthal Rakhumai Temple,
          <br />
          Amberkarwadi, Ambere, Tal. Ratnagiri,
          <br />
          Dist. Ratnagiri, Maharashtra, India
        </>
      ),
    },
    {
      icon: Phone,
      title: isMarathi ? "दूरध्वनी" : "Phone",
      content: isMarathi ? "+९१ ९८७६५ ४३२१०" : "+91 9876543210",
    },
    {
      icon: Mail,
      title: isMarathi ? "ईमेल" : "Email",
      content: "templetrust@abc.com",
    },
    {
      icon: Clock,
      title: isMarathi ? "दर्शन वेळ" : "Timings",
      content: isMarathi ? (
        <>
          सकाळी: ६:०० ते दुपारी १२:००
          <br />
          सायंकाळी: ४:०० ते रात्री ९:००
          <br />
          सर्व दिवस खुले
        </>
      ) : (
        <>
          Morning: 6:00 AM - 12:00 PM
          <br />
          Evening: 4:00 PM - 9:00 PM
          <br />
          Open All Days
        </>
      ),
    },
  ];

  return (
    <div className="w-full bg-cream font-body text-ink-dark min-h-screen relative overflow-hidden">
      {/* ═══════════ 1. CINEMATIC HERO BANNER ═══════════ */}
      <section className="relative pt-28 pb-16 sm:pt-32 sm:pb-20 bg-gradient-to-b from-[#180303] via-[#100202] to-[#180303] text-cream border-b border-amber-500/25 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.12)_0%,_rgba(24,4,4,0.40)_65%,_rgba(12,2,2,0.95)_100%)] pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, var(--color-gold) 0, var(--color-gold) 1px, transparent 0, transparent 40px)",
          }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <motion.div
            className="inline-flex items-center gap-2 bg-black/45 border border-amber-400/40 rounded-full px-4 py-1.5 font-heading text-xs sm:text-[0.82rem] font-medium text-amber-200 tracking-wide mb-4 shadow-sm backdrop-blur-xs select-none"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <Sparkles size={13} className="text-amber-300 shrink-0" />
            <span>{isMarathi ? "भक्त सेवा व संपर्क" : "Devotee Assistance & Inquiries"}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col items-center select-none"
          >
            <span className="font-heading text-[clamp(2rem,5.5vw,4rem)] font-black text-white leading-tight tracking-wider drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
              {isMarathi ? "आमच्याशी संपर्क साधा" : "Contact Us"}
            </span>
            <span className="font-heading text-[clamp(1.1rem,3vw,2rem)] font-bold tracking-[0.16em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)] mt-1 block">
              {isMarathi ? "श्री विठ्ठल रखुमाई मंदिर ट्रस्ट" : "Shree Vitthal Rakhumai Mandir Trust"}
            </span>
          </motion.h1>

          <DiamondDivider />

          <motion.p
            className="max-w-2xl mx-auto text-base sm:text-lg text-cream/85 font-body leading-relaxed mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {isMarathi
              ? "“दर्शन, महापूजा, अन्नदान व देणगीविषयक माहितीसाठी आम्ही सदैव आपल्या सेवेत तत्पर आहोत.”"
              : "“We are here to assist devotees with darshan timings, seva bookings, rituals, and general inquiries.”"}
          </motion.p>
        </div>
      </section>

      {/* ═══════════ 2. SACRED SHLOKA STRIP ═══════════ */}
      <div className="h-[3px] bg-gradient-to-r from-maroon via-gold via-saffron-lt to-maroon" />
      <div className="relative bg-maroon px-6 py-7 sm:py-8 text-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(212,175,55,0.15) 0, rgba(212,175,55,0.15) 1px, transparent 0, transparent 60px)",
          }}
        />
        <p className="relative z-10 font-marathi text-[clamp(1.1rem,2.8vw,1.5rem)] text-gold-lt tracking-wide leading-relaxed">
          || विठ्ठल चरणी शरण — सेवा व संपर्क ||
        </p>
      </div>
      <div className="h-[3px] bg-gradient-to-r from-maroon via-gold via-saffron-lt to-maroon" />

      {/* ═══════════ 3. CONTACT INFO CARDS ═══════════ */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 sm:mb-16">
          {contactCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="group relative bg-cream-dk rounded-md p-6 border border-gold/45 shadow-xs hover:border-gold hover:shadow-md transition-colors duration-200 text-center flex flex-col items-center justify-between overflow-hidden"
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <CornerAccents />
                </div>

                <div className="w-12 h-12 rounded-md bg-white border border-gold/40 flex items-center justify-center text-maroon shadow-xs mb-4">
                  <Icon className="w-6 h-6 text-saffron" />
                </div>

                <h3 className="font-display font-bold text-lg text-maroon mb-2">
                  {card.title}
                </h3>

                <div className="text-xs sm:text-sm font-body text-ink-mid leading-relaxed mt-auto">
                  {card.content}
                </div>
              </div>
            );
          })}
        </div>

        {/* ═══════════ 4. FORM & MAP SECTION ═══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {/* Contact Form */}
          <div className="relative bg-cream-dk rounded-md border border-gold/45 p-6 sm:p-8 shadow-xs">
            <h2 className="font-display text-2xl font-bold text-maroon mb-2">
              {isMarathi ? "संदेश पाठवा" : "Send Us a Message"}
            </h2>
            <p className="text-xs text-ink-light font-body mb-6">
              {isMarathi
                ? "आपला प्रश्न, प्रतिक्रिया किंवा प्रार्थना खालील फॉर्मद्वारे पाठवा."
                : "Fill out the form below with your questions, feedback, or prayer requests."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-maroon mb-1">
                  {isMarathi ? "नाव *" : "Your Name *"}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={isMarathi ? "पूर्ण नाव लिहा" : "Enter your full name"}
                  className="w-full px-3.5 py-2.5 rounded-md bg-white border border-gold/40 text-sm focus:outline-none focus:border-amber-500 font-body"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-maroon mb-1">
                    {isMarathi ? "ईमेल पत्ता *" : "Email Address *"}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-md bg-white border border-gold/40 text-sm focus:outline-none focus:border-amber-500 font-body"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-heading font-bold uppercase tracking-wider text-maroon mb-1">
                    {isMarathi ? "मोबाईल क्रमांक" : "Phone Number"}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={isMarathi ? "१० अंकी क्रमांक" : "Enter phone number"}
                    className="w-full px-3.5 py-2.5 rounded-md bg-white border border-gold/40 text-sm focus:outline-none focus:border-amber-500 font-body"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-maroon mb-1">
                  {isMarathi ? "विषय *" : "Subject *"}
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder={isMarathi ? "संदर्भाचा विषय" : "What is this regarding?"}
                  className="w-full px-3.5 py-2.5 rounded-md bg-white border border-gold/40 text-sm focus:outline-none focus:border-amber-500 font-body"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-maroon mb-1">
                  {isMarathi ? "संदेश *" : "Your Message *"}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={isMarathi ? "आपला संदेश येथे लिहा..." : "Write your message here..."}
                  rows={5}
                  className="w-full px-3.5 py-2.5 rounded-md bg-white border border-gold/40 text-sm focus:outline-none focus:border-amber-500 font-body"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-md font-heading font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-maroon-dk shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                <span>{loading ? (isMarathi ? "पाठवत आहे..." : "Sending…") : isMarathi ? "संदेश पाठवा" : "Send Message"}</span>
              </button>
            </form>
          </div>

          {/* Map Location Card */}
          <div className="relative bg-cream-dk rounded-md border border-gold/45 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-maroon mb-2">
                {isMarathi ? "मंदिराचे स्थान (Google Map)" : "Find Us Here"}
              </h2>
              <p className="text-xs text-ink-light font-body mb-4">
                {isMarathi
                  ? "रत्नागिरी शहरापासून जवळ, आंबेकरवाडी येथे मंदिर स्थित आहे."
                  : "Located peacefully in Amberkarwadi, easily reachable from Ratnagiri."}
              </p>
            </div>

            <div className="aspect-[4/3] rounded-md overflow-hidden border border-gold/40 bg-black/10">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3859.1083838879717!2d73.33572137519744!3d16.810287083981756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bea717523ce896f%3A0x7d2fb257f2b9cc4d!2sVithhal%20Rakhumai%20Mandir%2C%20Amberkarwadi!5e1!3m2!1sen!2sin!4v1763733345074!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Shree Vitthal Rakhumai Temple"
              ></iframe>
            </div>

            <div className="mt-4 p-3.5 bg-white rounded-md border border-gold/30 text-xs font-body text-ink-mid text-center">
              <strong>{isMarathi ? "सुचना:" : "Note:"}</strong>{" "}
              {isMarathi
                ? "भाविक भक्तांसाठी मंदिर परिसरात वाहन पार्किंग व पिण्याच्या पाण्याची उत्तम सोय उपलब्ध आहे."
                : "Safe parking space and drinking water facilities are available for all visiting devotees."}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

Contact.displayName = "Contact";
export default Contact;
