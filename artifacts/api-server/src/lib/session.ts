import type { CookieOptions, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { UserRole } from "../models/user";

export const sessionCookieName = "ecocycle_token";
const sessionDurationMs = 7 * 24 * 60 * 60 * 1000;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required to issue EcoCycle sessions.");
  }
  return secret;
}

function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api",
    maxAge: sessionDurationMs,
  };
}

export function createSession(
  response: Response,
  user: { id: string; role: UserRole },
): void {
  const token = jwt.sign(
    { role: user.role },
    getJwtSecret(),
    {
      subject: user.id,
      issuer: "ecocycle",
      expiresIn: "7d",
    },
  );
  response.cookie(sessionCookieName, token, cookieOptions());
}

export function clearSession(response: Response): void {
  response.clearCookie(sessionCookieName, cookieOptions());
}

export function verifySession(token: string): JwtPayload | string {
  return jwt.verify(token, getJwtSecret(), { issuer: "ecocycle" });
}
