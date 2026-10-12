import mongoose from "mongoose";
import { wasteCategories } from "./waste-rate";

const receiptSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    pickupRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PickupRequest",
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userName: { type: String, required: true, trim: true, maxlength: 80 },
    userEmail: { type: String, required: true, lowercase: true, trim: true },
    category: { type: String, enum: wasteCategories, required: true },
    estimatedQuantityKg: { type: Number, required: true, min: 0.001 },
    estimatedRatePerKg: { type: Number, required: true, min: 0.01 },
    estimatedValue: { type: Number, required: true, min: 0 },
    actualWeightKg: { type: Number, required: true, min: 0.001 },
    finalRatePerKg: { type: Number, required: true, min: 0.01 },
    finalAmount: { type: Number, required: true, min: 0 },
    collectionDate: { type: Date, required: true },
    verificationDate: { type: Date, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending"],
      default: "pending",
      required: true,
    },
  },
  { timestamps: true },
);

export const Receipt =
  mongoose.models.Receipt ?? mongoose.model("Receipt", receiptSchema);
