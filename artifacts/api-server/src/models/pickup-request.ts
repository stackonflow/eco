import mongoose from "mongoose";
import { wasteCategories } from "./waste-rate";

export const pickupRequestStatuses = [
  "pending",
  "accepted",
  "scheduled",
  "completed",
  "cancelled",
  "rejected",
] as const;

const pickupRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: wasteCategories,
      required: true,
    },
    estimatedQuantityKg: {
      type: Number,
      required: true,
      min: 0.001,
      max: 1000,
    },
    pickupAddress: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 500,
    },
    preferredPickupAt: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },
    ratePerKg: {
      type: Number,
      required: true,
      min: 0.01,
      max: 1_000_000,
    },
    estimatedValue: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: pickupRequestStatuses,
      required: true,
      default: "pending",
    },
  },
  { timestamps: true },
);

pickupRequestSchema.index({ user: 1, createdAt: -1 });

export const PickupRequest =
  mongoose.models.PickupRequest ??
  mongoose.model("PickupRequest", pickupRequestSchema);
