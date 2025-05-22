import User from '../models/userModel.js';
import Product from '../models/productModel.js';
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
    const { name, email, password, phoneNumber, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please include all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
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
        email: user.email,
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
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        role: user.role,
        cart: user.cart,
        wishlist: user.wishlist,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      address: user.address,
      role: user.role,
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
    user.email = req.body.email || user.email;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    user.address = req.body.address || user.address;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      address: updatedUser.address,
      role: updatedUser.role,
      token: generateToken(updatedUser._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const addToCart = async (req, res) => {
  try {
    const { productId, quantity, size } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const sizeAvailable = product.sizes.find(s => s.size === size && s.available);
    if (!sizeAvailable) {
      return res.status(400).json({ message: 'Selected size is not available' });
    }

    const user = await User.findById(req.user._id);

    const itemIndex = user.cart.findIndex(
      item => item.productId.toString() === productId && item.size === size
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

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findById(req.user._id);

    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    user.wishlist.push(productId);
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
      id => id.toString() !== req.params.productId
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

// @desc    Get specific order details
// @route   GET /api/users/orders/:orderId
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const user = await User.findOne(
      { _id: req.user._id, 'orders._id': req.params.orderId },
      { 'orders.$': 1 }
    );

    if (!user || !user.orders.length) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(user.orders[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
  getOrderById
};