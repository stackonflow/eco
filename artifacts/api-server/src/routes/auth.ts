import { Router, type IRouter } from "express";
import * as bcrypt from "bcryptjs";
import {
  GetCurrentUserResponse,
  LoginUserBody,
  LoginUserResponse,
  LogoutUserResponse,
  RegisterUserBody,
  RegisterUserResponse,
  UpdateProfileBody,
  UpdateProfileResponse,
} from "@workspace/api-zod";
import { User } from "../models/user";
import { clearSession, createSession } from "../lib/session";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();
const passwordRounds = 12;

function publicUser(user: {
  _id: { toString(): string };
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  address?: string | null;
  createdAt: Date;
}) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone ?? null,
    address: user.address ?? null,
    createdAt: user.createdAt,
  };
}

function authResponse(user: Parameters<typeof publicUser>[0]) {
  return {
    success: true,
    user: publicUser(user),
  };
}

function validationMessage(error: { issues: Array<{ message: string }> }): string {
  return error.issues.map((issue) => issue.message).join(" ");
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: validationMessage(parsed.error) });
    return;
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await User.findOne({ email }).select("_id").lean();
  if (existing) {
    res.status(409).json({ error: "An account with this email already exists." });
    return;
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, passwordRounds);
  try {
    const user = await User.create({
      name: parsed.data.name.trim(),
      email,
      passwordHash,
      role: parsed.data.role,
    });
    createSession(res, { id: user._id.toString(), role: user.role });
    res.status(201).json(RegisterUserResponse.parse(authResponse(user)));
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }
    throw error;
  }
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: validationMessage(parsed.error) });
    return;
  }

  const user = await User.findOne({
    email: parsed.data.email.toLowerCase().trim(),
  }).select("+passwordHash");
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    res.status(401).json({ error: "Email or password is incorrect." });
    return;
  }

  createSession(res, { id: user._id.toString(), role: user.role });
  res.json(LoginUserResponse.parse(authResponse(user)));
});

router.get("/auth/me", requireAuth, async (_req, res): Promise<void> => {
  const user = await User.findById(res.locals.userId);
  if (!user) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }
  res.json(GetCurrentUserResponse.parse(authResponse(user)));
});

router.patch("/auth/profile", requireAuth, async (req, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: validationMessage(parsed.error) });
    return;
  }
  if (Object.keys(parsed.data).length === 0) {
    res.status(400).json({ error: "Provide at least one profile field to update." });
    return;
  }

  const user = await User.findByIdAndUpdate(
    res.locals.userId,
    { $set: parsed.data },
    { new: true, runValidators: true },
  );
  if (!user) {
    res.status(404).json({ error: "Account not found." });
    return;
  }

  res.json(UpdateProfileResponse.parse(authResponse(user)));
});

router.post("/auth/logout", (_req, res): void => {
  clearSession(res);
  res.json(LogoutUserResponse.parse({ success: true }));
});

export default router;
