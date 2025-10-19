import { NextRequest, NextResponse } from "next/server";
import { createClient }  from "@supabase/supabase-js";
import { processStreakChecking } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization")
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret || authHeader  !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized "}, {status: 401});
        }

        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!url || !serviceKey) {
            throw new Error("Missing Supabase environment variables");
        }

        const supaBase = createClient(url, serviceKey);

        const result = await processStreakChecking(supaBase);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Cron job error:", error)
        return NextResponse.json(
            { error: "Internal server error", message: error },
            { status: 500}
        )
    }
}