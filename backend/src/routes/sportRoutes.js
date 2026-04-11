import express from "express";
import {
  getSports,
  getSport,
  getSportWithWinners,
  createSport,
  updateSport,
  deleteSport,
  getSportYears,
  getWinners,
  getWinner,
  createOrUpdateWinner,
  updateWinner,
  deleteWinner,
} from "../controllers/sportController.js";
import { protect } from "../middleware/auth.js";
import createUploader from "../utils/uploadFactory.js";

const router = express.Router();
const sportUpload = createUploader("sports");

// ==================== SPORT ROUTES ====================

// 1. Static Routes (Must define before dynamic /:id)
router.get("/years", getSportYears);

// 2. Root Routes (Public List & Admin Create)
router
  .route("/")
  .get(getSports)
  .post(protect, sportUpload.single("image"), createSport);

// 3. Dynamic Routes (ID-based operations)
router
  .route("/:id")
  .get(getSport)
  .put(protect, sportUpload.single("image"), updateSport)
  .delete(protect, deleteSport);

// 4. Sport-Specific Associations
router.get("/:id/winners", getSportWithWinners);

// ==================== WINNER ROUTES ====================

// 1. Nested Creation & Listing (Scoped to a Sport)
router.route("/:sportId/winners").post(
  protect,
  (req, res, next) => {
    sportUpload.single("image")(req, res, (err) => {
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
  createOrUpdateWinner
);

router.get("/:sportId/winners/list", getWinners);

// 2. Direct Winner Access (Global ID-based operations)
router
  .route("/winners/:id")
  .get(getWinner)
  .put(
    protect,
    (req, res, next) => {
      sportUpload.single("image")(req, res, (err) => {
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
    updateWinner
  )
  .delete(protect, deleteWinner);

export default router;
