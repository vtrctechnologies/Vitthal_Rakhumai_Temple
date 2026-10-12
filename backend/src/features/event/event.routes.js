import express from "express";
import {
  createEvent,
  getEvents,
  getFeaturedEvents,
  getAllFeaturedEvents,
  setFeaturedEvent,
  updateFeaturedEvent,
  getUpcomingEvents,
  getUpcomingEvent,
  createUpcomingEvent,
  updateUpcomingEvent,
  deleteUpcomingEvent,
  getEventYears,
  getEventsAdmin,
  getEventById,
  updateEvent,
  deleteEvent,
} from "./event.controller.js";
import { protect, admin } from "../auth/auth.middleware.js";
import upload from "../../shared/middlewares/upload.middleware.js";

const router = express.Router();

// ==================== FEATURED EVENT ROUTES ====================
router
  .route("/featured")
  .get(getFeaturedEvents)
  .post(protect, admin, setFeaturedEvent);

router.get("/featured/all", protect, admin, getAllFeaturedEvents);
router.put("/featured/:id", protect, admin, updateFeaturedEvent);

// ==================== UPCOMING EVENT ROUTES ====================
router
  .route("/upcoming")
  .get(getUpcomingEvents)
  .post(protect, admin, upload.single("image"), createUpcomingEvent);

router
  .route("/upcoming/:id")
  .get(getUpcomingEvent)
  .put(protect, admin, upload.single("image"), updateUpcomingEvent)
  .delete(protect, admin, deleteUpcomingEvent);

// ==================== YEARS & ADMIN ALL ====================
router.get("/years", getEventYears);
router.get("/admin/all", protect, admin, getEventsAdmin);

// ==================== GENERAL EVENT CRUD ====================
router
  .route("/")
  .get(getEvents)
  .post(protect, admin, upload.single("image"), createEvent);

router
  .route("/:id")
  .get(getEventById)
  .put(protect, admin, upload.single("image"), updateEvent)
  .delete(protect, admin, deleteEvent);

export default router;
