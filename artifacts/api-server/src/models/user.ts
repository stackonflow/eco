import mongoose from "mongoose";

export const userRoles = ["user", "collector", "recycler", "admin"] as const;
export type UserRole = (typeof userRoles)[number];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: userRoles,
      default: "user",
      required: true,
    },
    phone: {
      type: String,
      default: null,
      maxlength: 32,
    },
    address: {
      type: String,
      default: null,
      maxlength: 300,
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.models.User ?? mongoose.model("User", userSchema);
