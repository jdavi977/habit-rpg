import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(req: NextRequest) {
  try {
    console.log("🔔 Webhook received - Starting processing...");
    
    const body = await req.json();
    console.log("📦 Webhook body received:", JSON.stringify(body, null, 2));
    
    const eventType = body.type;
    console.log("🎯 Event type:", eventType);

    if (eventType === "user.created") {
      console.log("👤 Processing user.created event...");
      
      const user = body.data;
      console.log("👤 User data:", JSON.stringify(user, null, 2));

      const id = user.id;
      const email = user.email_addresses?.[0]?.email_address;
      const username = user.username ?? null;

      console.log("🔍 Extracted user info:", {
        id,
        email,
        username,
        emailAddressesCount: user.email_addresses?.length || 0
      });

      // Validate required fields
      if (!id) {
        console.error("❌ Missing user ID");
        return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
      }

      if (!email) {
        console.error("❌ Missing email address");
        return NextResponse.json({ error: "Missing email address" }, { status: 400 });
      }

      console.log("🚀 Attempting to insert user into Supabase...");
      console.log("📊 Insert data:", { id, email, username});

      const { data, error } = await supabase.from("users").upsert({
        id,
        email,
        username,
      });

      if (error) {
        console.error("❌ Supabase insert error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return NextResponse.json({ 
          error: "Supabase insert failed", 
          details: error.message,
          code: error.code 
        }, { status: 500 });
      }

      console.log("✅ User successfully inserted into Supabase:", data);
      return NextResponse.json({ 
        success: true, 
        message: "User created successfully",
        userId: id 
      });

    } else {
      console.log("ℹ️ Ignoring event type:", eventType);
      return NextResponse.json({ 
        message: "Event ignored", 
        eventType 
      }, { status: 200 });
    }

  } catch (err) {
    console.error("💥 Webhook handler error:", {
      error: err,
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({ 
      error: "Invalid webhook request", 
      details: err instanceof Error ? err.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }
}
