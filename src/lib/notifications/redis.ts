import { EventEmitter } from "node:events";

import Redis from "ioredis";

import { appConfig } from "@/lib/core/config";
import { pushRealtimeMessage } from "@/lib/realtime/hub";

const CHANNEL = "ttrimmy.notifications";
const localBus = new EventEmitter();

declare global {
  var __ttrimmyRedisPublisher: Redis | undefined;
  var __ttrimmyRedisSubscriber: Redis | undefined;
  var __ttrimmyNotificationBridgeStarted: boolean | undefined;
}

function getPublisher() {
  if (!appConfig.redisUrl) {
    return null;
  }

  globalThis.__ttrimmyRedisPublisher ??= new Redis(appConfig.redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
  });

  return globalThis.__ttrimmyRedisPublisher;
}

function getSubscriber() {
  if (!appConfig.redisUrl) {
    return null;
  }

  globalThis.__ttrimmyRedisSubscriber ??= new Redis(appConfig.redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
  });

  return globalThis.__ttrimmyRedisSubscriber;
}

export async function publishNotificationEvent(event: {
  userId: string;
  notificationId: string;
  title: string;
  message: string;
  createdAt: string;
  type: string;
}) {
  const serialized = JSON.stringify(event);
  const publisher = getPublisher();

  if (publisher) {
    await publisher.connect().catch(() => undefined);
    await publisher.publish(CHANNEL, serialized);
    return;
  }

  localBus.emit(CHANNEL, serialized);
}

export async function startNotificationSubscription() {
  if (globalThis.__ttrimmyNotificationBridgeStarted) {
    return;
  }

  const forward = (serialized: string) => {
    const event = JSON.parse(serialized) as {
      userId: string;
      notificationId: string;
      title: string;
      message: string;
      createdAt: string;
      type: string;
    };

    pushRealtimeMessage(event.userId, {
      type: "notification.created",
      payload: event,
    });
  };

  const subscriber = getSubscriber();

  if (subscriber) {
    await subscriber.connect().catch(() => undefined);
    await subscriber.subscribe(CHANNEL);
    subscriber.on("message", (channel, serialized) => {
      if (channel === CHANNEL) {
        forward(serialized);
      }
    });
  } else {
    localBus.on(CHANNEL, forward);
  }

  globalThis.__ttrimmyNotificationBridgeStarted = true;
}