import { Link } from "react-router-dom";
import {
  Youtube,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Heart,
  Send,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

import { useState } from "react";
import SubscriptionModal from "./SubscriptionModal";

const Footer = () => {
  const { isMarathi } = useLanguage();
  const currentYear = new Date().getFullYear();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const quickLinks = [
    { name: "Home", marathiName: "मुख्यपान", path: "/" },
    { name: "About", marathiName: "आमच्याबद्दल", path: "/about" },
    { name: "Gallery", marathiName: "गॅलरी", path: "/gallery" },
    { name: "Events", marathiName: "कार्यक्रम", path: "/events" },
    { name: "Donation", marathiName: "देणगी", path: "/donation" },
    { name: "Contact", marathiName: "संपर्क", path: "/contact" },
  ];

  return (
    <footer className="bg-maroon-dk text-cream relative overflow-hidden border-t-4 border-gold pt-16 pb-8">
      {/* Subtle Pattern Background */}
      <div
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, var(--color-gold) 0, var(--color-gold) 1px, transparent 0, transparent 50%)",
          backgroundSize: "20px 20px",
        }}
      />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-14 mb-14">
          {/* Column 1: About & Donation CTA */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-display font-bold text-gold-lt mb-3 leading-tight drop-shadow-md">
                {isMarathi
                  ? "श्री विठ्ठल-रखुमाई मंदिर"
                  : "Shree Vitthal-Rakhumai Mandir"}
              </h3>
              <p className="text-sm text-cream-dk/80 leading-relaxed font-body">
                {isMarathi
                  ? "अंबेरे गावाच्या हृदयात वसलेले भक्ती, शांती आणि आध्यात्मिक साक्षात्काराचे पवित्र स्थान."
                  : "A sacred place of devotion, peace, and spiritual enlightenment in the heart of Ambere Village."}
              </p>
            </div>

            {/* Donate CTA */}
            <Link
              to="/donation"
              className="inline-flex items-center gap-2.5 bg-gradient-to-br from-vermillion to-saffron-dk text-white px-7 py-3 rounded-md text-[0.95rem] font-heading font-semibold tracking-widest uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(192,57,43,0.35)] hover:-translate-y-1 hover:shadow-[0_6px_28px_rgba(192,57,43,0.5)] group"
            >
              <Heart className="w-4 h-4 fill-current group-hover:scale-110 transition-transform duration-300" />
              <span>{isMarathi ? "देणगी" : "Donate Now"}</span>
            </Link>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-display font-semibold mb-6 text-saffron-lt uppercase tracking-widest">
              {isMarathi ? "महत्वाचे दुवे" : "Quick Links"}
            </h4>
            <ul className="space-y-3.5">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="group flex items-center text-[0.95rem] font-heading text-cream/70 hover:text-gold-lt hover:pl-2 transition-all duration-300"
                  >
                    <ArrowRight className="w-3.5 h-3.5 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-gold-lt" />
                    {isMarathi ? link.marathiName : link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact & Hours */}
          <div>
            <h4 className="text-lg font-display font-semibold mb-6 text-saffron-lt uppercase tracking-widest">
              {isMarathi ? "संपर्क करा" : "Visit Us"}
            </h4>
            <div className="space-y-5">
              {/* Address */}
              <div className="flex items-start space-x-3.5 group">
                <MapPin className="w-5 h-5 text-gold-lt shrink-0 mt-0.5" />
                <div className="text-sm text-cream-dk/80 font-body">
                  <p className="leading-relaxed mb-1.5">
                    {isMarathi ? (
                      <>
                        आंबेकरवाडी, गावडे अंबेरे, तालुका रत्नागिरी,
                        <br />
                        महाराष्ट्र ४१५६१२, भारत
                      </>
                    ) : (
                      <>
                        Amberkarwadi, Gavade Ambere, Taluka Ratnagiri,
                        <br />
                        Maharashtra 415612, India
                      </>
                    )}
                  </p>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Shree+Vitthal+Rakhumai+Temple+Amberkarwadi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-saffron-lt font-heading font-semibold hover:text-gold transition-colors inline-flex items-center gap-1 uppercase tracking-wider"
                  >
                    {isMarathi ? "नकाशा पहा" : "Get Directions"}{" "}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center space-x-3.5">
                <Phone className="w-5 h-5 text-gold-lt shrink-0" />
                <a
                  href="tel:+919876543210"
                  className="text-sm font-body text-cream-dk/80 hover:text-gold transition-colors"
                >
                  +91 9876543210
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-3.5">
                <Mail className="w-5 h-5 text-gold-lt shrink-0" />
                <a
                  href="mailto:trust@vitthalrakhumai.com"
                  className="text-sm font-body text-cream-dk/80 hover:text-gold transition-colors"
                >
                  trust@vitthalrakhumai.com
                </a>
              </div>
            </div>
          </div>

          {/* Column 4: Newsletter & Social */}
          <div>
            <h4 className="text-lg font-display font-semibold mb-6 text-saffron-lt uppercase tracking-widest">
              {isMarathi ? "जोडलेले रहा" : "Stay Connected"}
            </h4>
            <p className="text-sm font-body text-cream-dk/80 mb-5 leading-relaxed">
              {isMarathi
                ? "दैनिक दर्शन अपडेट्स आणि आगामी कार्यक्रमांसाठी आमच्या वृत्तपत्राची सदस्यता घ्या."
                : "Subscribe to our newsletter for daily darshan updates and upcoming events."}
            </p>

            {/* Newsletter Button */}
            <div className="mb-8">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center justify-between gap-3 bg-gold/5 border border-gold/30 rounded-md px-4 py-3 text-cream-dk hover:bg-gold/15 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gold/20 rounded-sm group-hover:bg-gold-lt group-hover:text-maroon-dk transition-colors duration-300">
                    <Send className="w-4 h-4" />
                  </div>
                  <span className="text-[0.9rem] font-heading font-semibold tracking-wide uppercase">
                    {isMarathi ? "आता सबस्क्राईब करा" : "Subscribe Now"}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-gold-lt group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <SubscriptionModal 
              isOpen={isModalOpen} 
              onClose={() => setIsModalOpen(false)} 
            />

            {/* Social Icons */}
            <div className="flex space-x-4">
              <a
                href="https://www.youtube.com/@VitthalRakhumaiAmberkarwadi"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-gold/30 hover:border-gold hover:bg-gold/15 text-gold-lt flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="Youtube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-gold/30 hover:border-gold hover:bg-gold/15 text-gold-lt flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gold/20 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-body text-cream-dk/60">
          <div className="text-center md:text-left">
            <p>
              © {currentYear}{" "}
              {isMarathi
                ? "श्री विठ्ठल-रखुमाई सेवा मंडळ, आंबेकरवाडी"
                : "Shree Vitthal-Rakhumai Seva Mandal, Amberkarwadi"}
              . {isMarathi ? "सर्व हक्क राखीव." : "All rights reserved."}
            </p>
          </div>

          <div className="flex gap-6 font-heading tracking-widest uppercase text-[0.65rem]">
            <Link
              to="/privacy"
              className="hover:text-gold-lt transition-colors"
            >
              {isMarathi ? "गोपनीयता धोरण" : "Privacy Policy"}
            </Link>
            <Link to="/terms" className="hover:text-gold-lt transition-colors">
              {isMarathi ? "सेवा अटी" : "Terms of Service"}
            </Link>
          </div>

          <div className="text-center md:text-right">
            <p>
              {isMarathi ? "भक्तीभावाने निर्मित " : "Made with devotion By "}
              <span className="text-gold-lt font-semibold tracking-wide">
                Sahil Amberkar
              </span> &{" "}
              <span className="text-gold-lt font-semibold tracking-wide">Sohan Sarang</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
