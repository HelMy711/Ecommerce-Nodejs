import express from "express";
import {
  addProduct, updateProduct, deleteProduct, getAllProducts,
  updateOrderStatus,
  addPromoCode, updatePromoCode, deletePromoCode, getAllPromoCodes,
  getAllOrders, getOrderById, deleteOrder, updateOrder, addOrder,isAdminCheck,
  getAllUsers, getUserById, deleteUser, updateUser
} from "../controllers/AdminController.js";
import { isAdmin } from "../middlewares/AdminMiddleware.js";

const router = express.Router();

router.get("/auth/isadmin",isAdminCheck); 

router.post("/product", isAdmin, addProduct);
router.put("/product/:id", isAdmin, updateProduct);
router.delete("/product/:id", isAdmin, deleteProduct);
router.get("/products", getAllProducts);


router.post("/orders", isAdmin, addOrder);
router.get("/orders", isAdmin, getAllOrders);  
router.get("/orders/:id", isAdmin, getOrderById);        
router.delete("/orders/:id", isAdmin, deleteOrder);     
router.put("/orders/:id", isAdmin, updateOrder);      
router.put("/order/status", isAdmin, updateOrderStatus);


router.post("/promo", isAdmin, addPromoCode);
router.put("/promo/:id", isAdmin, updatePromoCode);
router.delete("/promo/:id", isAdmin, deletePromoCode);
router.get("/promos", getAllPromoCodes);

router.get("/users", isAdmin, getAllUsers);
router.get("/users/:id", isAdmin, getUserById);
router.put("/users/:id", isAdmin, updateUser);
router.delete("/users/:id", isAdmin, deleteUser);

export default router;
