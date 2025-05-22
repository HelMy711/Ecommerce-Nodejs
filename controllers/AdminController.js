import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import PromoCode from "../models/promoModel.js";

export const addProduct = async (req, res) => {
  try {
    const { name, slug, description, price, category, sizes, images, discount, isAvailable } = req.body;
    const newProduct = new Product({
      name,
      slug,
      description,
      price,
      category,
      sizes,
      images,
      discount,
      isAvailable
    });

    await newProduct.save();
    return res.status(201).json({ message: "Product added successfully!", product: newProduct });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, slug, description, price, category, sizes, images, discount, isAvailable } = req.body;

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
