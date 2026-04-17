type SocketLike = {
  readyState: number;
  send: (message: string) => void;
};

declare global {
  var __ttrimmyRealtimeHub:
    | Map<string, Set<SocketLike>>
    | undefined;
}

const hub = globalThis.__ttrimmyRealtimeHub ?? new Map<string, Set<SocketLike>>();

if (process.env.NODE_ENV !== "production") {
  globalThis.__ttrimmyRealtimeHub = hub;
}

export function attachRealtimeClient(userId: string, socket: SocketLike) {
  const clients = hub.get(userId) ?? new Set<SocketLike>();
  clients.add(socket);
  hub.set(userId, clients);
}

export function detachRealtimeClient(userId: string, socket: SocketLike) {
  const clients = hub.get(userId);

  if (!clients) {
    return;
  }

  clients.delete(socket);

  if (clients.size === 0) {
    hub.delete(userId);
  }
}

export function pushRealtimeMessage(userId: string, event: unknown) {
  const clients = hub.get(userId);

  if (!clients) {
    return;
  }

  const payload = JSON.stringify(event);

  for (const socket of clients) {
    if (socket.readyState === 1) {
      socket.send(payload);
    }
  }
}