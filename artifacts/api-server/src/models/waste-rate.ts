import mongoose from "mongoose";

export const wasteCategories = [
  "Plastic",
  "Paper",
  "Cardboard",
  "Metal",
  "Glass",
  "E-waste",
  "Organic waste",
] as const;

export type WasteCategory = (typeof wasteCategories)[number];

const wasteRateSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: wasteCategories,
      required: true,
      unique: true,
      index: true,
    },
    ratePerKg: {
      type: Number,
      required: true,
      min: 0.01,
      max: 1_000_000,
    },
    active: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  { timestamps: true },
);

export const WasteRate =
  mongoose.models.WasteRate ?? mongoose.model("WasteRate", wasteRateSchema);
