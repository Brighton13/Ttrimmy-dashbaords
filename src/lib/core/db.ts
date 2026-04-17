import { Sequelize } from "sequelize";

import { appConfig } from "@/lib/core/config";

declare global {
  var __ttrimmySequelize: Sequelize | undefined;
}

export const sequelize =
  globalThis.__ttrimmySequelize ??
  new Sequelize(appConfig.databaseUrl, {
    dialect: "postgres",
    logging: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__ttrimmySequelize = sequelize;
}