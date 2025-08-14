// src/app/api/clerk-webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Minimal types for the bits we use
type ClerkEmailAddress = { email_address: string };
type ClerkUserData = {
  id?: string;
  email_addresses?: ClerkEmailAddress[];
  username?: string | null;
};
type ClerkEvent = { type: string; data?: ClerkUserData };

// Type guard without `any`
function hasType(obj: unknown): obj is { type: unknown } {
  return typeof obj === "object" && obj !== null && "type" in obj;
}
function isClerkEvent(obj: unknown): obj is ClerkEvent {
  if (!hasType(obj)) return false;
  const t = (obj as { type: unknown }).type;
  return typeof t === "string";
}

export async function POST(req: NextRequest) {
  const now = new Date().toISOString();
  console.log("🔔 WEBHOOK RECEIVED @", now);

  // 1) Parse JSON safely
  let body: unknown;
  try {
    body = await req.json();
  } catch (err) {
    console.error("❌ Invalid JSON body:", err);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isClerkEvent(body)) {
    return NextResponse.json({ error: "Missing or invalid event type" }, { status: 400 });
  }

  const eventType = body.type;
  // 2) Ignore other events
  if (eventType !== "user.created") {
    console.log("ℹ️ Ignored event:", eventType);
    return NextResponse.json({ ok: true, ignored: eventType }, { status: 200 });
  }

  // 3) Extract fields
  const user = body.data ?? {};
  const id = user.id;
  const email = user.email_addresses?.[0]?.email_address;
  const username = user.username ?? null;

  if (!id)    return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  if (!email) return NextResponse.json({ error: "Missing email"   }, { status: 400 });

  console.log("👤 user.created:", { id, email, username });

  // 4) Supabase (service role)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const srk = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !srk) {
    console.error("❌ Missing Supabase env vars");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  const supabase = createClient(url, srk);

  // 5) Upsert into users
  const { data, error } = await supabase
    .from("users")
    .upsert({ id, email, username }, { onConflict: "id" })
    .select("id, email")
    .single();

  if (error) {
    console.error("❌ Supabase upsert error:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return NextResponse.json(
      { error: "Supabase upsert failed", message: error.message, code: error.code },
      { status: 500 }
    );
  }

  console.log("✅ User upserted:", data);
  return NextResponse.json({ success: true, userId: data.id, email: data.email }, { status: 200 });
}
