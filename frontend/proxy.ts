import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { type SupabaseClient } from "@supabase/supabase-js";

/**
 * Persistent Rate Limiting (Pulse [DS] Protocol)
 * AC-01: Migrates volatile logic to Supabase 'security_logs' table.
 * AC-02: 100-attempt lockout / 24-hour persistence.
 */
async function checkRateLimit(supabase: SupabaseClient, ip: string, path: string): Promise<{ blocked: boolean; message: string }> {
  const { data: log } = await supabase
    .from('security_logs')
    .select('*')
    .eq('ip_address', ip)
    .maybeSingle();

  const now = new Date();

  // If IP is blocked and within time window
  if (log?.is_blocked && log.blocked_until && new Date(log.blocked_until) > now) {
    return { blocked: true, message: `Access suspended until ${new Date(log.blocked_until).toLocaleTimeString()}. Excessive authentication volume.` };
  }

  // Update or Create Log
  if (!log) {
    await supabase.from('security_logs').insert({ ip_address: ip, request_path: path, attempt_count: 1 });
  } else {
    const isNewPeriod = (now.getTime() - new Date(log.last_attempt_at).getTime()) > 3600000; // Reset count every hour or handle as needed
    const newCount = isNewPeriod ? 1 : log.attempt_count + 1;
    const shouldBlock = newCount > 100; // AC-02 Threshold
    
    await supabase
      .from('security_logs')
      .update({ 
        attempt_count: newCount, 
        last_attempt_at: now.toISOString(),
        is_blocked: shouldBlock,
        blocked_until: shouldBlock ? new Date(now.getTime() + 86400000).toISOString() : null // 24hr lockout
      })
      .eq('id', log.id);

    if (shouldBlock) {
      return { blocked: true, message: "Security lockout: 100+ failed attempts. 24-hour quarantine initiated." };
    }
  }

  return { blocked: false, message: "" };
}

export async function proxy(request: NextRequest) {
  // Extraction of CIDR/IP
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(',')[0] : (request.headers.get("x-real-ip") || "anonymous");
  const path = request.nextUrl.pathname;

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Persistence check [CS-03]
  if (path.startsWith("/login") || path.startsWith("/auth")) {
    const { blocked, message } = await checkRateLimit(supabase, ip, path);
    if (blocked) {
      return new NextResponse(message, { status: 429 });
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    request.nextUrl.pathname !== "/"
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as is. If you're creating a
  // new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally: return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
