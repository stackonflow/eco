import mongoose from "mongoose";
import { wasteCategories } from "./waste-rate";

export const pickupRequestStatuses = [
  "pending",
  "accepted",
  "scheduled",
  "collected",
  "verified",
  "completed",
  "cancelled",
  "rejected",
] as const;

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: pickupRequestStatuses,
      required: true,
    },
    note: {
      type: String,
      default: null,
      maxlength: 500,
    },
    actorName: {
      type: String,
      default: null,
      maxlength: 80,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { _id: false },
);

const collectionVerificationSchema = new mongoose.Schema(
  {
    actualWeightKg: {
      type: Number,
      required: true,
      min: 0.001,
      max: 100_000,
    },
    quality: {
      type: String,
      enum: ["excellent", "good", "fair", "poor"],
      required: true,
    },
    ratePerKg: {
      type: Number,
      required: true,
      min: 0.01,
      max: 1_000_000,
    },
    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      default: null,
      maxlength: 2000,
    },
    collectorName: {
      type: String,
      default: null,
      maxlength: 80,
    },
    verifiedAt: {
      type: Date,
      required: true,
    },
  },
  { _id: false },
);

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
    assignedCollector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    collectedAt: {
      type: Date,
      default: null,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
    verification: {
      type: collectionVerificationSchema,
      default: null,
    },
  },
  { timestamps: true },
);

pickupRequestSchema.index({ user: 1, createdAt: -1 });
pickupRequestSchema.index({ assignedCollector: 1, status: 1, scheduledAt: 1 });

export const PickupRequest =
  mongoose.models.PickupRequest ??
  mongoose.model("PickupRequest", pickupRequestSchema);
