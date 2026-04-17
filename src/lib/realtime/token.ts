import crypto from "node:crypto";

import { appConfig, type UserRole } from "@/lib/core/config";

type RealtimePayload = {
  userId: string;
  role: UserRole;
  exp: number;
};

function sign(input: string) {
  return crypto
    .createHmac("sha256", appConfig.sessionSecret)
    .update(input)
    .digest("hex");
}

export function createRealtimeToken(user: { id: string; role: UserRole }) {
  const payload: RealtimePayload = {
    userId: user.id,
    role: user.role,
    exp: Date.now() + 1000 * 60 * 60 * 6,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifyRealtimeToken(token: string) {
  const [encoded, signature] = token.split(".");

  if (!encoded || !signature || sign(encoded) !== signature) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as RealtimePayload;

    if (payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}