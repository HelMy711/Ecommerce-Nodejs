import Product from "../models/productModel.js";
import mongoose from "mongoose";

const getProducts = async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryStr));

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const products = await query;
    const totalProducts = await Product.countDocuments(JSON.parse(queryStr));

    res.json({
      status: "success",
      results: products.length,
      total: totalProducts,
      page,
      pages: Math.ceil(totalProducts / limit),
      data: products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductByCode = async (req, res) => {
  try {
    const product = await Product.findOne({ productCode: req.params.code });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addProduct = async (req, res) => {
  try {
    const { name, slug, description, price, category, sizes, images, discount, isAvailable, productCode, reviews, brand, team, isFeatured } = req.body;

    const newProduct = new Product({
      name: {
        en: name.en,
        ar: name.ar
      },
      slug,
      description: {
        en: description.en,
        ar: description.ar
      },
      price,
      category,
      sizes,
      images,
      discount,
      isAvailable,
      reviews: [],
      productCode,
      brand,
      team,
      isFeatured
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
    const { name, slug, description, price, category, sizes, images, discount, isAvailable, productCode, reviews, brand, team, isFeatured } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(productId, {
      name: {
        en: name.en,
        ar: name.ar
      },
      slug,
      description: {
        en: description.en,
        ar: description.ar
      },
      price,
      category,
      sizes,
      images,
      discount,
      isAvailable,
      brand,
      team,
      isFeatured
    }, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json({ message: "Product updated successfully!", product: updatedProduct });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getProductsByTeam = async (req, res) => {
  try {
    const products = await Product.find({ team: req.params.team });
    if (products.length === 0) {
      return res.status(404).json({ message: "No products found for this team" });
    }
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductsByBrand = async (req, res) => {
  try {
    const products = await Product.find({ brand: req.params.brand });
    if (products.length === 0) {
      return res.status(404).json({ message: "No products found for this brand" });
    }
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getProducts,
  getProductBySlug,
  getProductById,
  getProductsByCategory,
  getProductByCode,
  getProductsByTeam,
  getProductsByBrand
};