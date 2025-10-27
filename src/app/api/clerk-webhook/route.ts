/**
 * @fileoverview Clerk webhook endpoint for user synchronization
 * @module app/api/clerk-webhook/route
 * 
 * This webhook endpoint receives user creation events from Clerk authentication
 * and synchronizes them to the Supabase database. Handles new user registration
 * by creating corresponding records in the users table with email and username.
 * 
 * Process flow:
 * 1. Validates incoming webhook payload structure
 * 2. Filters for "user.created" events (ignores others)
 * 3. Extracts user data (id, email, username)
 * 4. Creates/updates user record in Supabase
 * 5. Returns success response with user details
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Type definition for Clerk email address objects
 */
type ClerkEmailAddress = { email_address: string };

/**
 * Type definition for Clerk user data structure
 */
type ClerkUserData = {
  id?: string;
  email_addresses?: ClerkEmailAddress[];
  username?: string | null;
};

/**
 * Type definition for Clerk webhook events
 */
type ClerkEvent = { type: string; data?: ClerkUserData };

/**
 * Type guard to check if an object has a type property
 * 
 * Safely determines if an unknown object has a type field.
 * Used for runtime type checking of webhook payloads.
 * 
 * @param {unknown} obj - Object to check
 * @returns {boolean} True if object has type property
 */
function hasType(obj: unknown): obj is { type: unknown } {
  return typeof obj === "object" && obj !== null && "type" in obj;
}

/**
 * Type guard to validate Clerk event structure
 * 
 * Validates that an incoming webhook payload has the expected
 * Clerk event structure with a string type field.
 * 
 * @param {unknown} obj - Webhook payload to validate
 * @returns {boolean} True if valid Clerk event structure
 */
function isClerkEvent(obj: unknown): obj is ClerkEvent {
  if (!hasType(obj)) return false;
  const t = (obj as { type: unknown }).type;
  return typeof t === "string";
}

/**
 * POST handler for Clerk webhook events
 * 
 * Receives and processes webhook events from Clerk authentication service.
 * Currently handles "user.created" events to synchronize new users to Supabase.
 * All other event types are acknowledged but ignored.
 * 
 * @param {NextRequest} req - Incoming webhook request
 * @returns {Promise<NextResponse>} JSON response with success status
 * 
 * @example
 * // Clerk sends: { type: "user.created", data: { id: "usr_xxx", email_addresses: [...] }}
 * // Response: { success: true, userId: "usr_xxx", email: "user@example.com" }
 */
export async function POST(req: NextRequest) {
  const now = new Date().toISOString();
  console.log("🔔 WEBHOOK RECEIVED @", now);

  // Step 1: Parse JSON payload safely with error handling
  let body: unknown;
  try {
    body = await req.json();
  } catch (err) {
    console.error("❌ Invalid JSON body:", err);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Step 2: Validate webhook payload structure
  if (!isClerkEvent(body)) {
    return NextResponse.json({ error: "Missing or invalid event type" }, { status: 400 });
  }

  const eventType = body.type;
  
  // Step 3: Handle only user.created events, acknowledge others
  if (eventType !== "user.created") {
    console.log("ℹ️ Ignored event:", eventType);
    return NextResponse.json({ ok: true, ignored: eventType }, { status: 200 });
  }

  // Step 4: Extract user data from payload
  const user = body.data ?? {};
  const id = user.id;
  const email = user.email_addresses?.[0]?.email_address;
  const username = user.username ?? null;

  // Step 5: Validate required fields exist
  if (!id)    return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  if (!email) return NextResponse.json({ error: "Missing email"   }, { status: 400 });

  console.log("👤 user.created:", { id, email, username });

  // Step 6: Initialize Supabase client with service role (bypasses RLS)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const srk = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !srk) {
    console.error("❌ Missing Supabase env vars");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  const supabase = createClient(url, srk);

  // Step 7: Upsert user into database (creates new or updates existing)
  const { data, error } = await supabase
    .from("users")
    .upsert({ id, email, username }, { onConflict: "id" })
    .select("id, email")
    .single();

  // Step 8: Handle Supabase errors with detailed logging
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

  // Step 9: Return success with user details
  console.log("✅ User upserted:", data);
  return NextResponse.json({ success: true, userId: data.id, email: data.email }, { status: 200 });
}
