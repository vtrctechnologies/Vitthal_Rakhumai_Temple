import { useNavigate } from "react-router-dom";
import { Home as HomeIcon } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fef6e4] px-4 py-12">
      <div className="temple-card text-center max-w-md w-full p-8 sm:p-10 animate-fade-in-up">
        <div className="w-16 h-16 mx-auto mb-5 rounded-full border-2 border-[#d4af37]/65 p-[2px] bg-[#180303] shadow-md">
          <img
            src="/temple-logo-optimized.png"
            alt="Shree Vitthal Rakhumai Mandir Logo"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <h1 className="text-6xl sm:text-7xl font-bold text-[#6b1a1a] mb-3 font-heading-temple">
          404
        </h1>
        <div className="w-24 h-0.5 bg-gradient-to-r from-[#6b1a1a] via-[#d4af37] to-[#e8650a] mx-auto mb-5 rounded-full" />
        <p className="text-xl font-semibold mb-2 text-[#2c1a0e] font-heading-temple">
          Page Not Found
        </p>
        <p className="text-sm sm:text-base text-[#8b5e3c] mb-8">
          The page you&apos;re looking for doesn&apos;t exist in the admin portal.
        </p>
        <button
          onClick={() => navigate("/admin")}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6b1a1a] to-[#4a0f0f] text-[#fef6e4] border border-[#d4af37]/50 rounded-xl hover:from-[#7c1f1f] hover:to-[#5a1515] hover:-translate-y-0.5 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
        >
          <HomeIcon className="h-4 w-4 text-[#f0d060]" />
          <span className="font-medium text-sm tracking-wide">Return to Admin</span>
        </button>
      </div>
    </div>
  );
};

export default NotFound;
