import { useCallback, useEffect, useState, Suspense, lazy, memo } from "react";
// Removed Shadcn UI components
// Lazy load Lenis to reduce initial bundle size
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";
import Events from "./pages/Events.jsx";


// Lazy load all non-critical components for better initial performance
const Navbar = lazy(() => import("./components/Navbar"));
const Footer = lazy(() => import("./components/Footer"));
const ScrollToTop = lazy(() => import("./components/ScrollToTop"));
import CinematicLoader from "./components/CinematicLoader";

// Context - Keep this non-lazy as it's needed immediately
import { LanguageProvider } from "./context/LanguageContext";
import Donation from "./pages/Donation.jsx";
import Contact from "./pages/Contact.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import NotFound from "./pages/NotFound.jsx";

// Lazy load pages for code splitting
const Home = lazy(() => import("./pages/Home.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Gallery = lazy(() => import("./pages/Gallery.jsx"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const Sports = lazy(() => import("./pages/events/Sports"));
const Banners = lazy(() => import("./pages/events/Banners"));
const LivePrograms = lazy(() => import("./pages/events/LivePrograms"));
const EventDetail = lazy(() => import("./pages/EventDetail.jsx"));
const Committee = lazy(() => import("./pages/Committee"));
const SportsRegistration = lazy(() => import("./pages/events/SportsRegistration"));

// Fast, lightweight loading fallback for seamless route transitions
const PageLoader = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center bg-cream text-maroon gap-3">
    <div className="w-9 h-9 rounded-full border-2 border-amber-400 border-t-amber-700 animate-spin" />
    <span className="font-marathi text-xs text-amber-800 font-bold">|| राम कृष्ण हरी ||</span>
  </div>
);

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

// 1. Create a Layout Component for the Public Website
// This includes elements you ONLY want on the main site (Nav, Footer, etc.)
const PublicLayout = memo(() => {
  const { pathname } = useLocation();

  return (
    <>
      {/* Subtle Golden Micro-Progress Bar on Route Redirect */}
      <div
        key={`route-bar-${pathname}`}
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 h-[2.5px] z-[9999] bg-gradient-to-r from-saffron via-gold-lt to-amber-300 vr-route-bar pointer-events-none"
      />
      <Suspense fallback={null}>
        <ScrollToTop />
        <Navbar />
      </Suspense>
      {/* Outlet renders the child route with smooth GPU micro-transition */}
      <main>
        <div key={pathname} className="vr-page-enter">
          <Outlet />
        </div>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  );
});

PublicLayout.displayName = "PublicLayout";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const handleLoaderComplete = useCallback(() => setIsLoading(false), []);

  // Safety timeout ensuring loader cleanly completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  // Eagerly prefetch lazy route chunks during idle time for instant zero-lag navigation
  useEffect(() => {
    const prefetchRoutes = () => {
      import("./pages/About.jsx");
      import("./pages/Gallery.jsx");
      import("./pages/Committee");
      import("./pages/events/Sports");
      import("./pages/events/Banners");
      import("./pages/events/LivePrograms");
      import("./pages/EventDetail.jsx");
      import("./pages/events/SportsRegistration");
      import("./pages/TermsAndConditions");
    };

    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(prefetchRoutes, { timeout: 2500 });
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(prefetchRoutes, 1200);
      return () => clearTimeout(id);
    }
  }, []);

  // Strictly lock any scrolling/movement while the loading animation is active
  useEffect(() => {
    if (isLoading) {
      window.scrollTo(0, 0);
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.height = "100%";
      document.body.style.overflow = "hidden";
      document.body.style.height = "100%";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = "0";
      document.body.style.left = "0";
      document.body.style.touchAction = "none";
    } else {
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";
      document.body.style.overflow = "";
      document.body.style.height = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.touchAction = "";
      window.scrollTo(0, 0);
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";
      document.body.style.overflow = "";
      document.body.style.height = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.touchAction = "";
    };
  }, [isLoading]);

  // Defer and optimize Lenis initialization for silky smooth performance
  useEffect(() => {
    let rafId = null;
    let lenisInstance = null;

    const initLenis = () => {
      // Never run Lenis on mobile/tablet or touch devices.
      // Native touch momentum scrolling at 60-120Hz is completely smooth on phones/tablets.
      // Running Lenis on touch devices intercepts events and causes noticeable stutter, lag, and scroll delay.
      const isTouchOrMobile =
        window.innerWidth < 1024 ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.hardwareConcurrency <= 2 ||
        (navigator.deviceMemory && navigator.deviceMemory <= 2);

      if (isTouchOrMobile) {
        return;
      }

      import("lenis")
        .then((LenisModule) => {
          const Lenis = LenisModule.default;
          const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;

          if (prefersReducedMotion) return;

          lenisInstance = new Lenis({
            duration: 0.35,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            smoothTouch: false,
            wheelMultiplier: 1.15,
            infinite: false,
            orientation: "vertical",
            gestureOrientation: "vertical",
            normalizeWheel: true,
            autoResize: true,
          });

          window.lenis = lenisInstance;

          const raf = (time) => {
            lenisInstance.raf(time);
            rafId = requestAnimationFrame(raf);
          };

          rafId = requestAnimationFrame(raf);
        })
        .catch((error) => {
          console.warn("Failed to initialize Lenis:", error);
        });
    };

    if ("requestIdleCallback" in window) {
      requestIdleCallback(initLenis, { timeout: 2000 });
    } else {
      setTimeout(initLenis, 300);
    }

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (lenisInstance) {
        lenisInstance.destroy();
        delete window.lenis;
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        {isLoading && (
          <CinematicLoader
            key="loader"
            onComplete={handleLoaderComplete}
          />
        )}

        <div
          style={
            isLoading
              ? {
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  overflow: "hidden",
                  pointerEvents: "none",
                }
              : undefined
          }
        >
          <BrowserRouter
            future={{
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              <Route element={<PublicLayout />}>
                <Route
                  path="/"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <Home />
                    </Suspense>
                  }
                />
                <Route
                  path="/about"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <About />
                    </Suspense>
                  }
                />
                <Route
                  path="/gallery"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <Gallery />
                    </Suspense>
                  }
                />
                <Route
                  path="/events"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <Events />
                    </Suspense>
                  }
                />
                <Route
                  path="/events/:id"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <EventDetail />
                    </Suspense>
                  }
                />
                <Route
                  path="/donation"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <Donation />
                    </Suspense>
                  }
                />
                <Route
                  path="/contact"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <Contact />
                    </Suspense>
                  }
                />
                <Route
                  path="/privacy"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <PrivacyPolicy />
                    </Suspense>
                  }
                />
                <Route
                  path="/terms"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <TermsAndConditions />
                    </Suspense>
                  }
                />
                <Route
                  path="/events/sports"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <Sports />
                    </Suspense>
                  }
                />
                <Route
                  path="/events/banners"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <Banners />
                    </Suspense>
                  }
                />
                <Route
                  path="/events/live-programs"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <LivePrograms />
                    </Suspense>
                  }
                />
                <Route
                  path="/about/committee"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <Committee />
                    </Suspense>
                  }
                />
                <Route
                  path="/events/sports-registration"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <SportsRegistration />
                    </Suspense>
                  }
                />

                {/* 404 handling for public site */}
                <Route
                  path="*"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <NotFound />
                    </Suspense>
                  }
                />
              </Route>
            </Routes>
          </BrowserRouter>
        </div>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
