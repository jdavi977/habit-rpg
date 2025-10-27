/**
 * @fileoverview Cron job endpoint for automated streak checking
 * @module app/api/cron/check-streaks/route
 * 
 * This endpoint is designed to be called by an external cron service (e.g., Vercel Cron)
 * to periodically check all users' tasks and reset streaks when deadlines are missed.
 * 
 * Process:
 * 1. Validates request with secret token (prevents unauthorized access)
 * 2. Creates Supabase client with service role privileges
 * 3. Executes streak checking logic for all users
 * 4. Returns processing statistics
 * 
 * Security: Protected by CRON_SECRET environment variable via Bearer token authentication
 * 
 * Endpoints: Supports both POST and GET requests for flexibility with different cron services
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient }  from "@supabase/supabase-js";
import { processStreakChecking } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST handler for cron job execution
 * 
 * Entry point for cron services that use POST requests.
 * Delegates to handleCronRequest for unified processing.
 * 
 * @param {NextRequest} req - Incoming cron request
 * @returns {Promise<NextResponse>} Processing results or error
 */
export async function POST(req: NextRequest) {
    return handleCronRequest(req);
}

/**
 * GET handler for cron job execution
 * 
 * Entry point for cron services that use GET requests.
 * Delegates to handleCronRequest for unified processing.
 * 
 * @param {NextRequest} req - Incoming cron request
 * @returns {Promise<NextResponse>} Processing results or error
 */
export async function GET(req: NextRequest) {
    return handleCronRequest(req);
}

/**
 * Main handler for cron job requests
 * 
 * Processes automated streak checking for all users. Verifies authentication,
 * initializes Supabase client, and executes the streak checking logic.
 * 
 * Authentication: Requires Bearer token matching CRON_SECRET
 * 
 * @param {NextRequest} req - Incoming cron request
 * @returns {Promise<NextResponse>} JSON response with processing statistics:
 *   - success: boolean
 *   - processedUsers: number of users checked
 *   - processedTasks: number of tasks checked
 *   - resetStreaks: number of streaks reset
 *   - timestamp: ISO timestamp of execution
 * 
 * @throws {Error} Returns 401 if unauthorized, 500 if processing fails
 */
async function handleCronRequest(req: NextRequest) {
    try {
        // Step 1: Verify cron secret authentication
        const authHeader = req.headers.get("authorization")
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret || authHeader  !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized "}, {status: 401});
        }

        // Step 2: Initialize Supabase client with service role (bypasses RLS)
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!url || !serviceKey) {
            throw new Error("Missing Supabase environment variables");
        }

        const supaBase = createClient(url, serviceKey);

        // Step 3: Execute streak checking for all users with rollover settings
        const result = await processStreakChecking(supaBase);

        // Step 4: Return processing statistics
        return NextResponse.json(result);
    } catch (error) {
        // Step 5: Handle errors and return 500 status
        console.error("Cron job error:", error)
        return NextResponse.json(
            { error: "Internal server error", message: error },
            { status: 500}
        )
    }
}