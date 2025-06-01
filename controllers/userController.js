import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authConfig from '../config/auth.js';

const generateToken = (id) => {
  return jwt.sign({ id }, authConfig.secret, {
    expiresIn: authConfig.expiresIn,
  });
};


const registerUser = async (req, res) => {
  try {
    const { name, password, phoneNumber, address } = req.body;

    if (!name || !password || !phoneNumber) {
      return res.status(400).json({ message: 'Please include all required fields' });
    }

    const userExists = await User.findOne({ phoneNumber });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      password: hashedPassword,
      phoneNumber,
      address,
      cart: [],
      wishlist: [],
      orders: []
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        address: user.address,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    const user = await User.findOne({ phoneNumber });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        address: user.address,
        role: user.role,
        cart: user.cart,
        wishlist: user.wishlist,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid phone number or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      name: user.name,
      phoneNumber: user.phoneNumber,
      address: user.address,
      cart: user.cart,
      wishlist: user.wishlist,
      orders: user.orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    user.address = req.body.address || user.address;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      name: updatedUser.name,
      phoneNumber: updatedUser.phoneNumber,
      address: updatedUser.address,
      token: generateToken(updatedUser._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity, size } = req.body;

    const product = await Product.findOne({ productCode: productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const sizeAvailable = product.sizes.find(s => s.size === size && s.available);
    if (!sizeAvailable) {
      return res.status(400).json({ message: 'Selected size is not available' });
    }

    const user = await User.findById(req.user._id);

    const itemIndex = user.cart.findIndex(
      item => item.productId === productId && item.size === size
    );

    if (itemIndex > -1) {
      user.cart[itemIndex].quantity += quantity || 1;
    } else {
      user.cart.push({
        productId, 
        quantity: quantity || 1,
        size
      });
    }

    await user.save();

    res.status(201).json(user.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.cart = user.cart.filter(
      item => item._id.toString() !== req.params.itemId
    );

    await user.save();

    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    const user = await User.findById(req.user._id);
    const itemIndex = user.cart.findIndex(
      item => item._id.toString() === req.params.itemId
    );

    if (itemIndex > -1) {
      user.cart[itemIndex].quantity = quantity;
      await user.save();
      res.json(user.cart);
    } else {
      res.status(404).json({ message: 'Cart item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    const product = await Product.findOne({ productCode: productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findById(req.user._id);

    const exists = user.wishlist.some(
      item => item.productId === productId
    );
    if (exists) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    user.wishlist.push({ productId }); 
    await user.save();

    res.status(201).json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.wishlist = user.wishlist.filter(
      item => item.productId !== req.params.productId
    );

    await user.save();

    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getUserOrders = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('orders.items.productId');
    res.json(user.orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




const createOrder = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const { items, totalAmount, promoCode, PromoCodeActive } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    for (const item of items) {
      if (!item.productId || !item.quantity || !item.size) {
        return res.status(400).json({ message: 'Each item must have productId, quantity, and size' });
      }
    }

    const newOrder = {
      items,
      totalAmount,
      promoCode: promoCode || "",
      PromoCodeActive: PromoCodeActive || false,
      status: "pending"
    };

    user.orders.push(newOrder);
    user.cart = [];
    await user.save();

    res.status(201).json(user.orders[user.orders.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { orderId } = req.params;
    const { status } = req.body;

    const order = user.orders.id(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!["pending", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    order.status = status;
    await user.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addOrder = async (req, res) => {
  try {
    const { userid, items, totalAmount, status, promoCode, PromoCodeActive, address } = req.body;

    // تحقق من وجود المستخدم
    const user = await User.findById(userid);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // إنشاء الأوردر الجديد
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

export {
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
  createOrder,
  updateOrderStatus,
  addOrder
};