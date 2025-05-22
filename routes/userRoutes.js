import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  addToCart,
  removeFromCart,
  updateCartItem,
  addToWishlist,
  removeFromWishlist,
  getUserOrders,
  getOrderById
} from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authmiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

router.use(authMiddleware);

router.route('/profile')
  .get(getUserProfile)
  .put(updateUserProfile);

router.route('/cart')
  .post(addToCart);

router.route('/cart/:itemId')
  .put(updateCartItem)
  .delete(removeFromCart);

router.route('/wishlist')
  .post(addToWishlist);

router.route('/wishlist/:productId')
  .delete(removeFromWishlist);

router.route('/orders')
  .get(getUserOrders);

router.route('/orders/:orderId')
  .get(getOrderById);

export default router;