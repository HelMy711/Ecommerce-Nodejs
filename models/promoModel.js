import mongoose from 'mongoose';

const promoCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  discountType: String,
  discountValue: Number,
  expiryDate: Date,
  minOrderValue: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PromoCode = mongoose.model('PromoCode', promoCodeSchema);

export default PromoCode;