import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "bcryptjs",
    "ioredis",
    "nodemailer",
    "pg",
    "pg-hstore",
    "sequelize",
    "ws",
  ],
};

export default nextConfig;
