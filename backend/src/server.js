import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import connectDB from "./shared/config/db.js";
import authRoutes from "./features/auth/auth.routes.js";
import categoryRoutes from "./features/category/category.routes.js";
import galleryRoutes from "./features/gallery/gallery.routes.js";
import eventRoutes from "./features/event/event.routes.js";
import bannerRoutes from "./features/banner/banner.routes.js";
import committeeRoutes from "./features/commitiee/commitee.routes.js";
import contactRoutes from "./features/contact/contact.routes.js";
import guestRoutes from "./features/guest/guest.routes.js";
import heroRoutes from "./modules/hero/hero.routes.js";
import notificationRoutes from "./modules/notification/notification.routes.js";
import sportsRoutes from "./modules/sports/sports.routes.js";
import liveProgramsRoutes from "./modules/livePrograms/live.routes.js";
import subscriberRoutes from "./modules/subscriber/subscriber.routes.js";
import { notFound, errorHandler } from "./shared/middlewares/error.middleware.js";

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// Connect Database
connectDB();

const app = express();

// CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files (for local uploaded media)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Root API Endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Vitthal Rakhumai Temple API Server is running...",
    version: "1.0.0",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/committee", committeeRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/hero", heroRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/sports", sportsRoutes);
app.use("/api/live-programs", liveProgramsRoutes);
app.use("/api/subscribers", subscriberRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Server is running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});

