import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventType = body.type;

    if (eventType === "user.created") {
      const user = body.data;

      const id = user.id;
      const email = user.email_addresses[0]?.email_address;
      const username = user.username ?? null;

      const { error } = await supabase.from("users").upsert({
        id,
        email,
        username,
      });

      if (error) {
        console.error("Supabase insert error:", error);
        return NextResponse.json({ error: "Supabase insert failed" }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ message: "Event ignored" }, { status: 200 });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Invalid webhook request" }, { status: 400 });
  }
}
