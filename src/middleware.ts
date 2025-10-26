import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';


// Any pathways placed here will need to be protected by authentication.
const isProtectedRoute = createRouteMatcher(["/tasks", "/home", "/settings"]);

/**
 * Intercepts all incoming requests
 * Protects routes found in isProtectedRoute
 * Making sure that you need to be authenticated first
 */
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|api/cron|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes except cron
    '/api/clerk-webhook',
    '/trpc/:path*',
  ],
};