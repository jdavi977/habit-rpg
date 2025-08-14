import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

// Helper function to log to file
function logToFile(message: string, data?: any) {
  try {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`;
    const logPath = join(process.cwd(), 'webhook-logs.txt');
    appendFileSync(logPath, logMessage);
    console.log('📝 Logged to file:', logPath);
  } catch (err) {
    console.error('Failed to write to log file:', err);
  }
}

// Test endpoint to verify the route is working
export async function GET() {
  const testMessage = "🧪 Webhook test endpoint working!";
  console.log(testMessage);
  logToFile(testMessage);
  
  return NextResponse.json({ 
    message: testMessage,
    timestamp: new Date().toISOString(),
    env: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const logMessage = "🔔 Webhook received - Starting processing...";
    console.log(logMessage);
    logToFile(logMessage);
    
    // Check environment variables
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + "...",
      serviceRoleKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
    };
    console.log("🔧 Environment check:", envCheck);
    logToFile("🔧 Environment check", envCheck);
    
    const body = await req.json();
    console.log("📦 Webhook body received:", JSON.stringify(body, null, 2));
    logToFile("📦 Webhook body received", body);
    
    const eventType = body.type;
    console.log("🎯 Event type:", eventType);
    logToFile("🎯 Event type", eventType);

    // Log all events for debugging
    logToFile("📋 All webhook events received", {
      eventType,
      timestamp: new Date().toISOString(),
      bodyKeys: Object.keys(body)
    });

    if (eventType === "user.created") {
      const logMessage = "👤 Processing user.created event...";
      console.log(logMessage);
      logToFile(logMessage);
      
      const user = body.data;
      console.log("👤 User data:", JSON.stringify(user, null, 2));
      logToFile("👤 User data", user);

      const id = user.id;
      const email = user.email_addresses?.[0]?.email_address;
      const username = user.username ?? null;

      const extractedInfo = {
        id,
        email,
        username,
        emailAddressesCount: user.email_addresses?.length || 0
      };
      console.log("🔍 Extracted user info:", extractedInfo);
      logToFile("🔍 Extracted user info", extractedInfo);

      // Validate required fields
      if (!id) {
        const errorMsg = "❌ Missing user ID";
        console.error(errorMsg);
        logToFile(errorMsg);
        return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
      }

      if (!email) {
        const errorMsg = "❌ Missing email address";
        console.error(errorMsg);
        logToFile(errorMsg);
        return NextResponse.json({ error: "Missing email address" }, { status: 400 });
      }

      const logMessage2 = "🚀 Attempting to insert user into Supabase...";
      console.log(logMessage2);
      logToFile(logMessage2);
      
      const insertData = { id, email, username };
      console.log("📊 Insert data:", insertData);
      logToFile("📊 Insert data", insertData);

      // Test database connection first
      try {
        const { data: testData, error: testError } = await supabase
          .from("users")
          .select("id")
          .limit(1);
        
        if (testError) {
          const errorMsg = "❌ Database connection test failed: " + testError.message;
          console.error(errorMsg, testError);
          logToFile(errorMsg, testError);
          return NextResponse.json({ 
            error: "Database connection failed", 
            details: testError.message 
          }, { status: 500 });
        }
        
        const successMsg = "✅ Database connection test successful";
        console.log(successMsg);
        logToFile(successMsg);
      } catch (testErr) {
        const errorMsg = "❌ Database connection test exception: " + (testErr instanceof Error ? testErr.message : 'Unknown error');
        console.error(errorMsg, testErr);
        logToFile(errorMsg, testErr);
        return NextResponse.json({ 
          error: "Database connection exception", 
          details: testErr instanceof Error ? testErr.message : 'Unknown error'
        }, { status: 500 });
      }

      const { data, error } = await supabase.from("users").upsert({
        id,
        email,
        username,
      });

      if (error) {
        const errorMsg = "❌ Supabase insert error: " + error.message;
        console.error(errorMsg, {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        logToFile(errorMsg, {
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

      const successMsg = "✅ User successfully inserted into Supabase: " + JSON.stringify(data);
      console.log(successMsg);
      logToFile(successMsg);
      
      return NextResponse.json({ 
        success: true, 
        message: "User created successfully",
        userId: id 
      });

    } else {
      const logMessage = `ℹ️ Ignoring event type: ${eventType}`;
      console.log(logMessage);
      logToFile(logMessage);
      
      return NextResponse.json({ 
        message: "Event ignored", 
        eventType 
      }, { status: 200 });
    }

  } catch (err) {
    const errorMsg = "💥 Webhook handler error: " + (err instanceof Error ? err.message : 'Unknown error');
    console.error(errorMsg, {
      error: err,
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined,
      timestamp: new Date().toISOString()
    });
    logToFile(errorMsg, {
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
