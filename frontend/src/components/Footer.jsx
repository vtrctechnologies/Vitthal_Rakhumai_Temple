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

const Footer = () => {
  const { isMarathi } = useLanguage();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", marathiName: "मुख्यपान", path: "/" },
    { name: "About", marathiName: "आमच्याबद्दल", path: "/about" },
    { name: "Gallery", marathiName: "गॅलरी", path: "/gallery" },
    { name: "Events", marathiName: "कार्यक्रम", path: "/events" },
    { name: "Donation", marathiName: "देणगी", path: "/donation" },
    { name: "Contact", marathiName: "संपर्क", path: "/contact" },
  ];

  return (
    <footer className="bg-secondary text-secondary-foreground pt-16 pb-8 border-t border-primary/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-12 mb-12">
          {/* Column 1: About & Donation CTA */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-display font-bold text-primary mb-2">
                {isMarathi
                  ? "श्री विठ्ठल-रखुमाई मंदिर"
                  : "Shree Vitthal-Rakhumai Mandir"}
              </h3>
              <p className="text-sm opacity-90 leading-relaxed">
                {isMarathi
                  ? "अंबेरे गावाच्या हृदयात वसलेले भक्ती, शांती आणि आध्यात्मिक साक्षात्काराचे पवित्र स्थान."
                  : "A sacred place of devotion, peace, and spiritual enlightenment in the heart of Ambere Village."}
              </p>
            </div>

            {/* Donate CTA */}
            <Link
              to="/donation"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-medium hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 group"
            >
              <Heart className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              <span>{isMarathi ? "देणगी" : "Donate Now"}</span>
            </Link>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-display font-semibold mb-6 text-primary">
              {isMarathi ? "महत्वाचे दुवे" : "Quick Links"}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="group flex items-center text-sm hover:text-primary transition-colors duration-300"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {isMarathi ? link.marathiName : link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact & Hours */}
          <div>
            <h4 className="text-lg font-display font-semibold mb-6 text-primary">
              {isMarathi ? "संपर्क करा" : "Visit Us"}
            </h4>
            <div className="space-y-4">
              {/* Address */}
              <div className="flex items-start space-x-3 group">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
                <div className="text-sm">
                  <p className="leading-relaxed mb-1">
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
                    className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
                  >
                    {isMarathi ? "नकाशा पहा" : "Get Directions"}{" "}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <a
                  href="tel:+919876543210"
                  className="text-sm hover:text-primary transition-colors"
                >
                  +91 9876543210
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <a
                  href="mailto:trust@vitthalrakhumai.com"
                  className="text-sm hover:text-primary transition-colors"
                >
                  trust@vitthalrakhumai.com
                </a>
              </div>
            </div>
          </div>

          {/* Column 4: Newsletter & Social */}
          <div>
            <h4 className="text-lg font-display font-semibold mb-6 text-primary">
              {isMarathi ? "जोडलेले रहा" : "Stay Connected"}
            </h4>
            <p className="text-sm opacity-90 mb-4">
              {isMarathi
                ? "दैनिक दर्शन अपडेट्स आणि आगामी कार्यक्रमांसाठी आमच्या वृत्तपत्राची सदस्यता घ्या."
                : "Subscribe to our newsletter for daily darshan updates and upcoming events."}
            </p>

            {/* Newsletter Form */}
            <form
              className="flex gap-2 mb-8"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder={isMarathi ? "ईमेल पत्ता" : "Email address"}
                className="flex-1 bg-background/50 border border-primary/20 rounded-lg px-3 py-2 text-white placeholder:text-white/80 text-sm focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="button"
                className="bg-primary text-primary-foreground p-2 rounded-lg hover:bg-primary/90 transition-colors"
                aria-label="Subscribe"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Social Icons */}
            <div className="flex space-x-4">
              <a
                href="https://www.youtube.com/@VitthalRakhumaiAmberkarwadi"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300 group"
                aria-label="Youtube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300 group"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs opacity-75">
          <div className="text-center md:text-left">
            <p>
              © {currentYear}{" "}
              {isMarathi
                ? "श्री विठ्ठल-रखुमाई सेवा मंडळ, आंबेकरवाडी"
                : "Shree Vitthal-Rakhumai Seva Mandal, Amberkarwadi"}
              . {isMarathi ? "सर्व हक्क राखीव." : "All rights reserved."}
            </p>
          </div>

          <div className="flex gap-6">
            <Link
              to="/privacy"
              className="hover:text-primary transition-colors"
            >
              {isMarathi ? "गोपनीयता धोरण" : "Privacy Policy"}
            </Link>
            <Link to="/terms" className="hover:text-primary transition-colors">
              {isMarathi ? "सेवा अटी" : "Terms of Service"}
            </Link>
          </div>

          <div className="text-center md:text-right">
            <p>
              {isMarathi ? "भक्तीभावाने निर्मित " : "Made with devotion By "}
              <span className="text-primary font-medium">
                Sahil Amberkar
              </span> &{" "}
              <span className="text-primary font-medium">Sohan Sarang</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
