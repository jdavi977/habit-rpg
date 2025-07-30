import { NextRequest, NextResponse } from "next/server";
import { useClerkSupabaseClient } from "@/lib/supabaseClient";

const client = useClerkSupabaseClient()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventType = body.type;

    if (eventType === "user.created") {
      const user = body.data;

      const id = user.id;
      const email = user.email_addresses[0]?.email_address;
      const username = user.username ?? null;

      const { error } = await client.from("users").upsert({
        id,
        email,
        username,
        gold: 0,
        mana: 0
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
