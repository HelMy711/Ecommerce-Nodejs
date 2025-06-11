import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema({
  size: { type: String, required: true },  
  available: { type: Boolean, default: true }  
});

const productSchema = new mongoose.Schema(
  {
    productCode: { type: String, required: true, unique: true },
    name: {
      en: { type: String, required: true },
      ar: { type: String, required: true  }
    },
    slug: {
      type: String,
      required: true,
      unique: true
    },
    description:  {
      en: { type: String, required: true },
      ar: { type: String, required: true  }
    },
    price: {
      type: Number,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    sizes: [sizeSchema],
    images: {
      type: [String],
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
     isFeatured: {
      type: Boolean,
      default: false
    },
    brand: { type: String ,default: "Unknown" },

    team: { type: String, required: true ,default: "barndless" },

    reviews: [
      {
        FullName: { type: String, required: true },
        email: { type: String, required: true },
        comment: { type: String, required: true },
        rating: { type: Number, required: true , min: 1, max: 5 },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
