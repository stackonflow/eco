import type { RequestHandler } from "express";
import type { JwtPayload } from "jsonwebtoken";
import { User, type UserRole } from "../models/user";
import { sessionCookieName, verifySession } from "../lib/session";

export const requireAuth: RequestHandler = async (_req, res, next): Promise<void> => {
  const token = _req.cookies?.[sessionCookieName] as string | undefined;
  if (!token) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  let claims: JwtPayload;
  try {
    const decoded = verifySession(token);
    if (typeof decoded === "string" || typeof decoded.sub !== "string") {
      res.status(401).json({ error: "Your session is invalid or has expired." });
      return;
    }
    claims = decoded;
  } catch {
    res.status(401).json({ error: "Your session is invalid or has expired." });
    return;
  }

  const user = await User.findById(claims.sub).select("_id role").lean();
  if (!user) {
    res.status(401).json({ error: "Your account is no longer available." });
    return;
  }

  res.locals.userId = user._id.toString();
  res.locals.userRole = user.role as UserRole;
  next();
};

export function requireRole(...roles: UserRole[]): RequestHandler {
  return (_req, res, next): void => {
    if (!roles.includes(res.locals.userRole as UserRole)) {
      res.status(403).json({ error: "You do not have permission to do that." });
      return;
    }
    next();
  };
}
