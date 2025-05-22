import express from "express";
import { addProduct, updateProduct, deleteProduct, getAllProducts, updateOrderStatus, addPromoCode, updatePromoCode, deletePromoCode, getAllPromoCodes } from "../controllers/AdminController.js";
import { isAdmin } from "../middlewares/AdminMiddleware.js"; 

const router = express.Router();

router.post("/product", isAdmin, addProduct);
router.put("/product/:id", isAdmin, updateProduct);
router.delete("/product/:id", isAdmin, deleteProduct);
router.get("/products", getAllProducts);

router.put("/order/status", isAdmin, updateOrderStatus);

router.post("/promo", isAdmin, addPromoCode);
router.put("/promo/:id", isAdmin, updatePromoCode);
router.delete("/promo/:id", isAdmin, deletePromoCode);
router.get("/promos", getAllPromoCodes);

export default router;
