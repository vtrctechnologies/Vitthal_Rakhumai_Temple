import express from "express";
import {
  createCategory,
  getCategories,
  getCategoriesAdmin,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "./category.controller.js";
import { protect, admin } from "../auth/auth.middleware.js";

const router = express.Router();

router.get("/admin/all", protect, admin, getCategoriesAdmin);

router
  .route("/")
  .get(getCategories)
  .post(protect, admin, createCategory);

router
  .route("/:id")
  .get(getCategoryById)
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

export default router;
