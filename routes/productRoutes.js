import express from "express";
import {
  getProducts,
  getProductBySlug,
  getProductsByCategory,
  getProductById,
  getProductByCode
} from "../controllers/productController.js";

const router = express.Router();

router.route("/").get(getProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/category/:category", getProductsByCategory);
router.get("/product/:id", getProductById); 
router.get("/c/:code", getProductByCode);

export default router;