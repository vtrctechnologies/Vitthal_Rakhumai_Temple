import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (window.lenis) {
      // If Lenis is active, tell it to scroll to top immediately
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      // Fallback for standard scrolling behavior
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
