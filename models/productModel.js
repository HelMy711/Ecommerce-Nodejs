import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema({
  size: { type: String, required: true },  
  available: { type: Boolean, default: true }  
});

const productSchema = new mongoose.Schema(
  {
   productCode:{ type: String, required: true, unique: true },
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      required: true
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
    reviews:[
            {
        FullName: { type: String, required: true},
        email: { type: String, required: true},
        comment: { type: String, required: true},
        rating: { type: Number, required: true},
        createdAt: { type: Date, default: Date.now }
    }
                ],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
