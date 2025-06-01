import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1 },
  size: { type: String, required: true }
});

const orderSchema = new mongoose.Schema({
  userid: { type: String,  required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "shipped", "delivered", "cancelled"],
    default: "pending"
  },
  promoCode: { type: String, default: "" },
  PromoCodeActive: { type: Boolean, default: false },
  address: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

export default Order;