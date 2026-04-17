import { Notification, User } from "@/lib/data/models";
import { sendEmail } from "@/lib/notifications/email";
import { publishNotificationEvent } from "@/lib/notifications/redis";

export async function createNotification(input: {
  userId: string;
  title: string;
  message: string;
  type: string;
  sendEmailCopy?: boolean;
}) {
  const notification = await Notification.create({
    userId: input.userId,
    title: input.title,
    message: input.message,
    type: input.type,
  });

  await publishNotificationEvent({
    userId: input.userId,
    notificationId: notification.id,
    title: notification.title,
    message: notification.message,
    createdAt: notification.createdAt.toISOString(),
    type: notification.type,
  });

  if (input.sendEmailCopy) {
    const user = await User.findByPk(input.userId);

    if (user) {
      await sendEmail({
        to: user.email,
        subject: input.title,
        text: input.message,
      });
    }
  }

  return notification;
}

export async function getUserNotifications(userId: string) {
  return Notification.findAll({
    where: { userId },
    order: [["createdAt", "DESC"]],
    limit: 10,
  });
}

export async function markNotificationRead(notificationId: string, userId: string) {
  await Notification.update(
    { readAt: new Date() },
    { where: { id: notificationId, userId } },
  );
}