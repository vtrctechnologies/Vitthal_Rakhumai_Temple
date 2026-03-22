import { useEffect, Suspense, lazy, memo } from "react";
// Removed Shadcn UI components
// Lazy load Lenis to reduce initial bundle size
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Events from "./pages/Events.jsx";


// Lazy load all non-critical components for better initial performance
const Navbar = lazy(() => import("./components/Navbar"));
const Footer = lazy(() => import("./components/Footer"));
const ScrollToTop = lazy(() => import("./components/ScrollToTop"));

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

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
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
  return (
    <>
      <Suspense fallback={null}>
        <ScrollToTop />
        <Navbar />
      </Suspense>
      {/* Outlet renders the child route (e.g., Home, About) */}
      <main>
        <Outlet />
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  );
});

PublicLayout.displayName = "PublicLayout";

const App = () => {
  // Defer Lenis initialization to improve initial load and reduce TBT
  useEffect(() => {
    let rafId = null;
    let lenisInstance = null;

    const initLenis = () => {
      // Check if device can handle smooth scrolling
      const isLowEndDevice =
        navigator.hardwareConcurrency <= 2 ||
        (navigator.deviceMemory && navigator.deviceMemory <= 2);

      // Skip Lenis on low-end devices to reduce TBT
      if (isLowEndDevice) {
        return;
      }

      import("lenis")
        .then((LenisModule) => {
          const Lenis = LenisModule.default;
          const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;

          lenisInstance = new Lenis({
            duration: prefersReducedMotion ? 0 : 1.2, // Slightly longer duration for smoother feel
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: !prefersReducedMotion,
            smoothTouch: false,
            wheelMultiplier: 1.0, // Increased for better responsiveness
            touchMultiplier: 1.5,
            infinite: false,
            orientation: "vertical",
            gestureOrientation: "vertical",
            normalizeWheel: true,
            autoResize: true,
          });

          window.lenis = lenisInstance;

          // Use standard RAF for maximum smoothness (usually 60fps+)
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

    // Defer Lenis initialization even more to reduce initial TBT
    if ("requestIdleCallback" in window) {
      requestIdleCallback(initLenis, { timeout: 3000 });
    } else {
      setTimeout(initLenis, 500);
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
        <BrowserRouter
          future={{
            v7_startTransition: true,
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
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
