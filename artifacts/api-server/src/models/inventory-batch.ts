import mongoose from "mongoose";
import { wasteCategories } from "./waste-rate";

export const inventoryProcessingStatuses = [
  "collected",
  "sorted",
  "stored",
  "sent_for_processing",
  "processed",
] as const;

const inventoryHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: inventoryProcessingStatuses,
      required: true,
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

const inventoryBatchSchema = new mongoose.Schema(
  {
    batchCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    category: {
      type: String,
      enum: wasteCategories,
      required: true,
    },
    verifiedQuantityKg: {
      type: Number,
      required: true,
      min: 0.001,
      max: 100_000,
    },
    availableQuantityKg: {
      type: Number,
      required: true,
      min: 0,
      max: 100_000,
    },
    reservedQuantityKg: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    quality: {
      type: String,
      enum: ["excellent", "good", "fair", "poor"],
      required: true,
    },
    pickupRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PickupRequest",
      required: true,
      unique: true,
      index: true,
    },
    collectionDate: { type: Date, required: true },
    processingStatus: {
      type: String,
      enum: inventoryProcessingStatuses,
      required: true,
      default: "collected",
    },
    storageLocation: {
      type: String,
      default: null,
      trim: true,
      maxlength: 300,
    },
    qrToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    statusHistory: {
      type: [inventoryHistorySchema],
      default: [],
    },
  },
  { timestamps: true },
);

export const InventoryBatch =
  mongoose.models.InventoryBatch ??
  mongoose.model("InventoryBatch", inventoryBatchSchema);
