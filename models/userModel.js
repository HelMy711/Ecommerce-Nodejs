
import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    address: {
      type: String,
      default: ""
    },
    cart: [{
      productId: {
        type : String,
        required: true,

      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      size: {
        type: String,
        required: true
      }
    }],

    wishlist: [Object],
    
    orderID:{type:String, default:""},
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);

export default User;