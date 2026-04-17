import http, { type IncomingMessage } from "node:http";
import next from "next";
import { WebSocket, WebSocketServer } from "ws";

import { ensureAppReady } from "@/lib/core/bootstrap";
import { attachRealtimeClient, detachRealtimeClient } from "@/lib/realtime/hub";
import { verifyRealtimeToken } from "@/lib/realtime/token";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const host = process.env.HOST ?? "0.0.0.0";
const isDev = process.env.NODE_ENV !== "production";
const app = next({ dev: isDev, dir: process.cwd() });
const handle = app.getRequestHandler();

void app.prepare().then(async () => {
  await ensureAppReady();

  const server = http.createServer((request, response) => {
    void handle(request, response);
  });

  const websocketServer = new WebSocketServer({ noServer: true });

  websocketServer.on(
    "connection",
    (
      socket: WebSocket,
      _request: IncomingMessage,
      session: { userId: string },
    ) => {
    attachRealtimeClient(session.userId, socket);

    socket.send(
      JSON.stringify({
        type: "system.connected",
        payload: {
          userId: session.userId,
          connectedAt: new Date().toISOString(),
        },
      }),
    );

    socket.on("close", () => {
      detachRealtimeClient(session.userId, socket);
    });
    },
  );

  server.on("upgrade", (request, socket, head) => {
    if (!request.url?.startsWith("/ws")) {
      socket.destroy();
      return;
    }

    const url = new URL(request.url, `http://${request.headers.host}`);
    const token = url.searchParams.get("token");

    if (!token) {
      socket.destroy();
      return;
    }

    const session = verifyRealtimeToken(token);

    if (!session) {
      socket.destroy();
      return;
    }

    websocketServer.handleUpgrade(request, socket, head, (websocket: WebSocket) => {
      websocketServer.emit("connection", websocket, request, session);
    });
  });

  server.listen(port, host, () => {
    console.log(`Ttrimmy dashboard running on http://${host}:${port}`);
  });
});