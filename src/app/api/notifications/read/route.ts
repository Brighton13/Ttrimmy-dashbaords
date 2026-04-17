import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth/session";
import { markNotificationRead } from "@/lib/notifications/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await requireSession();
  const body = (await request.json()) as { notificationId?: string };

  if (!body.notificationId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await markNotificationRead(body.notificationId, session.user.id);
  return NextResponse.json({ ok: true });
}