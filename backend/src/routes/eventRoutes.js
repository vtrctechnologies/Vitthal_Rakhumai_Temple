import express from "express";
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getUpcomingEvents,
  getUpcomingEvent,
  createUpcomingEvent,
  updateUpcomingEvent,
  deleteUpcomingEvent,
} from "../controllers/eventController.js";
import {
  getFeaturedEvent,
  setFeaturedEvent,
  updateFeaturedEvent,
  getAllFeaturedEvents,
} from "../controllers/featuredEventController.js";
import { protect } from "../middleware/auth.js";
import createUploader from "../utils/uploadFactory.js"; // 1. Import the factory function

const router = express.Router();

// 2. Initialize the specific uploader for events
const eventUpload = createUploader("events");

// ==================== FEATURED EVENT ROUTES ====================
router.route("/featured").get(getFeaturedEvent).post(protect, setFeaturedEvent);

router.get("/featured/all", protect, getAllFeaturedEvents);

router.put("/featured/:id", protect, updateFeaturedEvent);

// ==================== UPCOMING EVENT ROUTES ====================

router
  .route("/upcoming")
  .get(getUpcomingEvents)
  // 3. Use the initialized 'eventUpload' here
  .post(
    protect,
    (req, res, next) => {
      eventUpload.single("image")(req, res, (err) => {
        if (err) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              status: "error",
              message: "File too large. Maximum size is 5MB.",
            });
          }
          if (err.message) {
            return res.status(400).json({
              status: "error",
              message: err.message,
            });
          }
          return res.status(400).json({
            status: "error",
            message: "File upload error",
          });
        }
        next();
      });
    },
    createUpcomingEvent
  );

router
  .route("/upcoming/:id")
  .get(getUpcomingEvent)
  // 3. Use the initialized 'eventUpload' here
  .put(
    protect,
    (req, res, next) => {
      eventUpload.single("image")(req, res, (err) => {
        if (err) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              status: "error",
              message: "File too large. Maximum size is 5MB.",
            });
          }
          if (err.message) {
            return res.status(400).json({
              status: "error",
              message: err.message,
            });
          }
          return res.status(400).json({
            status: "error",
            message: "File upload error",
          });
        }
        next();
      });
    },
    updateUpcomingEvent
  )
  .delete(protect, deleteUpcomingEvent);

// ==================== GENERAL EVENT ROUTES ====================

// Root Routes
router
  .route("/")
  .get(getEvents)
  // 3. Use the initialized 'eventUpload' here
  .post(
    protect,
    (req, res, next) => {
      eventUpload.single("image")(req, res, (err) => {
        if (err) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              status: "error",
              message: "File too large. Maximum size is 5MB.",
            });
          }
          if (err.message) {
            return res.status(400).json({
              status: "error",
              message: err.message,
            });
          }
          return res.status(400).json({
            status: "error",
            message: "File upload error",
          });
        }
        next();
      });
    },
    createEvent
  );

// Dynamic Routes (Must be defined last)
router
  .route("/:id")
  .get(getEvent)
  // 3. Use the initialized 'eventUpload' here
  .put(
    protect,
    (req, res, next) => {
      eventUpload.single("image")(req, res, (err) => {
        if (err) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              status: "error",
              message: "File too large. Maximum size is 5MB.",
            });
          }
          if (err.message) {
            return res.status(400).json({
              status: "error",
              message: err.message,
            });
          }
          return res.status(400).json({
            status: "error",
            message: "File upload error",
          });
        }
        next();
      });
    },
    updateEvent
  )
  .delete(protect, deleteEvent);

export default router;
