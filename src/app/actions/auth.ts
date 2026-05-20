"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import {
  authenticateUser,
  clearSession,
  createPasswordResetToken,
  createSession,
  findUserByIdentifier,
  getUserForPasswordResetToken,
} from "@/lib/auth/session";
import { appConfig } from "@/lib/core/config";
import { sendEmail } from "@/lib/notifications/email";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function loginAction(formData: FormData) {
  const identifier = getString(formData, "identifier") || getString(formData, "email");
  const password = getString(formData, "password");
  const user = await authenticateUser(identifier, password);

  if (!user) {
    redirect("/login?error=invalid_credentials");
  }

  await createSession(user);
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

export async function requestPasswordResetAction(formData: FormData) {
  const identifier = getString(formData, "identifier") || getString(formData, "email");

  if (!identifier) {
    redirect("/forgot-password?error=missing_identifier");
  }

  const user = await findUserByIdentifier(identifier);
  const hasConfiguredSmtp = Boolean(appConfig.smtpUrl || appConfig.smtpHost);

  if (user) {
    const token = createPasswordResetToken({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
    });
    const resetUrl = `${appConfig.publicBaseUrl}/reset-password?token=${encodeURIComponent(token)}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your Facility Maintenance password",
      text: `Hello ${user.name}, use this link to reset your password: ${resetUrl}. This link expires in 30 minutes.`,
      html: `
        <p>Hello ${user.name},</p>
        <p>Use the link below to reset your Facility Maintenance password. The link expires in 30 minutes.</p>
        <p><a href="${resetUrl}">Reset password</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      `,
    });

    if (!hasConfiguredSmtp) {
      redirect(`/forgot-password?sent=1&preview=${encodeURIComponent(resetUrl)}`);
    }
  }

  redirect("/forgot-password?sent=1");
}

export async function resetPasswordAction(formData: FormData) {
  const token = getString(formData, "token");
  const password = getString(formData, "password");
  const confirmPassword = getString(formData, "confirmPassword");

  if (!token) {
    redirect("/reset-password?error=invalid_or_expired_link");
  }

  if (!password || !confirmPassword) {
    redirect(`/reset-password?token=${encodeURIComponent(token)}&error=missing_fields`);
  }

  if (password.length < 8) {
    redirect(`/reset-password?token=${encodeURIComponent(token)}&error=password_too_short`);
  }

  if (password !== confirmPassword) {
    redirect(`/reset-password?token=${encodeURIComponent(token)}&error=password_mismatch`);
  }

  const user = await getUserForPasswordResetToken(token);

  if (!user) {
    redirect("/reset-password?error=invalid_or_expired_link");
  }

  user.passwordHash = await bcrypt.hash(password, 10);
  await user.save({ fields: ["passwordHash"] });

  await clearSession();
  redirect("/login?reset=1");
}