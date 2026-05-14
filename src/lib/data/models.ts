import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from "sequelize";

import { sequelize } from "@/lib/core/db";
import type {
  IssueCategory,
  IssuePriority,
  IssueStatus,
  UserRole,
} from "@/lib/core/config";

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare email: string;
  declare role: UserRole;
  declare passwordHash: string;
  declare department: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare submittedIssues?: NonAttribute<Issue[]>;
  declare assignedIssues?: NonAttribute<Issue[]>;
}

export class Issue extends Model<
  InferAttributes<Issue>,
  InferCreationAttributes<Issue>
> {
  declare id: CreationOptional<string>;
  declare reference: CreationOptional<string>;
  declare title: string;
  declare description: string;
  declare category: IssueCategory;
  declare location: string;
  declare priority: IssuePriority;
  declare status: IssueStatus;
  declare studentId: string;
  declare assignedToId: string | null;
  declare assignedById: string | null;
  declare resolutionNotes: string | null;
  declare resolvedAt: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare student?: NonAttribute<User>;
  declare assignee?: NonAttribute<User>;
  declare supervisor?: NonAttribute<User>;
}

export class Notification extends Model<
  InferAttributes<Notification>,
  InferCreationAttributes<Notification>
> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare title: string;
  declare message: string;
  declare type: string;
  declare readAt: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

let initialized = false;

export function initializeModels() {
  if (initialized) {
    return;
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      role: {
        type: DataTypes.ENUM("admin", "student", "supervisor", "technician"),
        allowNull: false,
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      department: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
    },
  );

  Issue.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      reference: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: () => `ISS-${Math.floor(100000 + Math.random() * 900000)}`,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      category: {
        type: DataTypes.ENUM(
          "Plumbing",
          "Electrical",
          "Windows",
          "Networking",
          "Furniture",
          "Safety",
        ),
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      priority: {
        type: DataTypes.ENUM("low", "medium", "high", "critical"),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("open", "pending", "in_progress", "resolved"),
        allowNull: false,
        defaultValue: "open",
      },
      studentId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      assignedToId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      assignedById: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      resolutionNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      resolvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Issue",
      tableName: "issues",
    },
  );

  Notification.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      readAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Notification",
      tableName: "notifications",
    },
  );

  User.hasMany(Issue, { as: "submittedIssues", foreignKey: "studentId" });
  User.hasMany(Issue, { as: "assignedIssues", foreignKey: "assignedToId" });
  Issue.belongsTo(User, { as: "student", foreignKey: "studentId" });
  Issue.belongsTo(User, { as: "assignee", foreignKey: "assignedToId" });
  Issue.belongsTo(User, { as: "supervisor", foreignKey: "assignedById" });
  Notification.belongsTo(User, { as: "user", foreignKey: "userId" });
  User.hasMany(Notification, { as: "notifications", foreignKey: "userId" });

  initialized = true;
}