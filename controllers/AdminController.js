import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import PromoCode from "../models/promoModel.js";
import Order from "../models/orderModel.js"; 
import { isAdmin } from "../middlewares/AdminMiddleware.js";
import jwt from 'jsonwebtoken';
import authConfig from "../config/auth.js";
export const addProduct = async (req, res) => {
  try {
    const { name, slug, description, price, category, sizes, images, discount, isAvailable,productCode,reviews } = req.body;
    const newProduct = new Product({
      name,
      slug,
      description,
      price,
      category,
      sizes,
      images,
      discount,
      isAvailable,
      reviews: [],
      productCode
      
    });

    await newProduct.save();
    return res.status(201).json({ message: "Product added successfully!", product: newProduct });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, slug, description, price, category, sizes, images, discount, isAvailable ,productCode,reviews } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(productId, {
      name,
      slug,
      description,
      price,
      category,
      sizes,
      images,
      discount,
      isAvailable
    }, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json({ message: "Product updated successfully!", product: updatedProduct });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json({ message: "Product deleted successfully!" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).json({ products });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const allowedStatuses = ["Pending", "Shipped", "Delivered", "Cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updatedOrder = await User.updateOne(
      { "orders.orderId": orderId },
      { $set: { "orders.$.status": status } }
    );

    if (updatedOrder.nModified === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    return res.status(200).json({ message: "Order status updated successfully!" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const addPromoCode = async (req, res) => {
  try {
    const { code, discountType, discountValue, expiryDate, minOrderValue } = req.body;
    const newPromoCode = new PromoCode({
      code,
      discountType,
      discountValue,
      expiryDate,
      minOrderValue
    });

    await newPromoCode.save();
    return res.status(201).json({ message: "Promo code added successfully!", promoCode: newPromoCode });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updatePromoCode = async (req, res) => {
  try {
    const promoCodeId = req.params.id;
    const { code, discountType, discountValue, expiryDate, minOrderValue } = req.body;

    const updatedPromoCode = await PromoCode.findByIdAndUpdate(promoCodeId, {
      code,
      discountType,
      discountValue,
      expiryDate,
      minOrderValue
    }, { new: true });

    if (!updatedPromoCode) {
      return res.status(404).json({ error: "Promo code not found" });
    }

    return res.status(200).json({ message: "Promo code updated successfully!", promoCode: updatedPromoCode });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deletePromoCode = async (req, res) => {
  try {
    const promoCodeId = req.params.id;
    const deletedPromoCode = await PromoCode.findByIdAndDelete(promoCodeId);

    if (!deletedPromoCode) {
      return res.status(404).json({ error: "Promo code not found" });
    }

    return res.status(200).json({ message: "Promo code deleted successfully!" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAllPromoCodes = async (req, res) => {
  try {
    const promoCodes = await PromoCode.find();
    return res.status(200).json({ promoCodes });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("userid", "name phoneNumber");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("userid", "name phoneNumber");
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedOrder) return res.status(404).json({ error: "Order not found" });
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addOrder = async (req, res) => {
  try {
    const { userid, items, totalAmount, status, promoCode, PromoCodeActive, address } = req.body;

    const user = await User.findById(userid);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newOrder = new Order({
      userid,
      items,
      totalAmount,
      status: status || "pending",
      promoCode,
      PromoCodeActive,
      address
    });

    await newOrder.save();

    res.status(201).json({ message: "Order added successfully!", order: newOrder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const isAdminCheck = async (req, res) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ message: 'Authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, authConfig.secret);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied, admin only' });
    }

    res.status(200).json({ message: 'admin:true' });
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

