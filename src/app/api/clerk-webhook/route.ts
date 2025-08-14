// app/api/clerk/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";       // easier logging in Vercel
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const now = new Date().toISOString();
  console.log("🔔 WEBHOOK RECEIVED @", now);

  // 1) Parse JSON safely
  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    console.error("❌ Invalid JSON body");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = body?.type;
  if (!eventType) {
    return NextResponse.json({ error: "Missing event type" }, { status: 400 });
  }

  // 2) Ignore non-user.created early (Clerk sends many kinds)
  if (eventType !== "user.created") {
    console.log("ℹ️ Ignored event:", eventType);
    return NextResponse.json({ ok: true, ignored: eventType }, { status: 200 });
  }

  // 3) Extract minimal fields
  const user = body.data;
  const id: string | undefined = user?.id;
  const email: string | undefined = user?.email_addresses?.[0]?.email_address ?? undefined;
  const username: string | null = user?.username ?? null;

  if (!id)   return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  if (!email) return NextResponse.json({ error: "Missing email"   }, { status: 400 });

  console.log("👤 user.created:", { id, email, username });

  // 4) Supabase (service role) — create client per request
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const srk = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !srk) {
    console.error("❌ Missing Supabase env vars");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  const supabase = createClient(url, srk);

  // 5) Upsert into users; let DB trigger create user_stats/settings
  const { data, error } = await supabase
    .from("users")
    .upsert({ id, email, username }, { onConflict: "id" })
    .select("id, email")
    .single(); // returns a single row or error

  if (error) {
    // This is the error you’ll see in Vercel “Functions” logs
    console.error("❌ Supabase upsert error:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return NextResponse.json(
      {
        error: "Supabase upsert failed",
        message: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }

  console.log("✅ User upserted:", data);

  // Optional: quick read-back is redundant now that we used .single()
  return NextResponse.json(
    { success: true, userId: data.id, email: data.email },
    { status: 200 }
  );
}
