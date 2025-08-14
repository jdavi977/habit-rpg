// app/api/clerk-webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ClerkEmailAddress = { email_address: string };
type ClerkUserCreated = {
  type: "user.created";
  data?: {
    id?: string;
    email_addresses?: ClerkEmailAddress[];
    username?: string | null;
  };
};

// narrow unknown → ClerkUserCreated | {type:string} | nullish
function isClerkEvent(obj: unknown): obj is { type: string; data?: unknown } {
  return !!obj && typeof (obj as any).type === "string";
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
    return NextResponse.json({ error: "Missing event type" }, { status: 400 });
  }

  const eventType = body.type;
  // 2) Ignore non-user.created
  if (eventType !== "user.created") {
    console.log("ℹ️ Ignored event:", eventType);
    return NextResponse.json({ ok: true, ignored: eventType }, { status: 200 });
  }

  // 3) Extract minimal fields
  const userData = (body as ClerkUserCreated).data ?? {};
  const id = userData.id;
  const email = userData.email_addresses?.[0]?.email_address;
  const username = userData.username ?? null;

  if (!id)   return NextResponse.json({ error: "Missing user id" }, { status: 400 });
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
