/**
 * VPN Status Check Worker
 *
 * DNS-based canary check for detecting if user is connected to Heaven VPN.
 *
 * Flow:
 * 1. Frontend generates random token, loads `https://<token>.vpncheck.heaven.example/pixel.png`
 * 2. DNS server (when query hits our resolver) logs {token, seenAt} to D1
 * 3. Frontend polls `GET /vpn-status?token=<token>`
 * 4. This worker checks D1 and returns {connected: true/false}
 */

export interface Env {
  DB: D1Database;
  ENVIRONMENT: string;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

// Token validity window (5 minutes)
const TOKEN_TTL_MS = 5 * 60 * 1000;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // Handle pixel.png requests (DNS canary endpoint)
    // These come from wildcard subdomains: <token>.vpncheck.heaven.example/pixel.png
    if (url.pathname === "/pixel.png") {
      // Extract token from subdomain
      const hostname = url.hostname;
      const token = hostname.split(".")[0];

      if (token && token !== "vpncheck") {
        // Log that DNS resolved through our server
        await env.DB.prepare(
          "INSERT OR REPLACE INTO dns_canary (token, seen_at) VALUES (?, ?)"
        )
          .bind(token, Date.now())
          .run();
      }

      // Return 1x1 transparent PNG
      const pixel = new Uint8Array([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
        0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
        0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
      ]);

      return new Response(pixel, {
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "image/png",
        },
      });
    }

    // Handle VPN status check
    if (url.pathname === "/vpn-status") {
      const token = url.searchParams.get("token");

      if (!token) {
        return Response.json(
          { error: "Missing token parameter" },
          { status: 400, headers: CORS_HEADERS }
        );
      }

      // Check if DNS server saw this token recently
      const result = await env.DB.prepare(
        "SELECT seen_at FROM dns_canary WHERE token = ?"
      )
        .bind(token)
        .first<{ seen_at: number }>();

      const connected =
        result !== null && Date.now() - result.seen_at < TOKEN_TTL_MS;

      return Response.json({ connected }, { headers: CORS_HEADERS });
    }

    // Health check
    if (url.pathname === "/health") {
      return Response.json({ status: "ok" }, { headers: CORS_HEADERS });
    }

    return new Response("Not Found", { status: 404, headers: CORS_HEADERS });
  },
};
