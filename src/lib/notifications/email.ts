import nodemailer from "nodemailer";

import { appConfig } from "@/lib/core/config";

type EmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

let transporterPromise: Promise<nodemailer.Transporter> | undefined;

async function getTransporter() {
  transporterPromise ??= Promise.resolve(
    appConfig.smtpUrl
      ? nodemailer.createTransport(appConfig.smtpUrl)
      : appConfig.smtpHost
        ? nodemailer.createTransport({
            host: appConfig.smtpHost,
            port: appConfig.smtpPort,
            secure: appConfig.smtpSecure,
            auth: appConfig.smtpUser
              ? {
                  user: appConfig.smtpUser,
                  pass: appConfig.smtpPass,
                }
              : undefined,
          })
        : nodemailer.createTransport({
            streamTransport: true,
            newline: "unix",
            buffer: true,
          }),
  );

  return transporterPromise;
}

export async function sendEmail(input: EmailInput) {
  const transporter = await getTransporter();

  await transporter.sendMail({
    from: appConfig.smtpFrom,
    ...input,
    html: input.html ?? `<p>${input.text}</p>`,
  });
}