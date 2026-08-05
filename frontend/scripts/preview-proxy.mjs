// PREVIEW-ONLY dev shim (NOT used on Vercel).
// The Emergent preview ingress sends /api -> :8001 and everything else -> :3000.
// This app is a single Next.js server on :3000 (its API routes live under /api),
// so this tiny proxy forwards :8001 traffic to Next on :3000 during preview.
// On Vercel everything is one origin, so this file is ignored (see .vercelignore).
import http from "node:http";
import httpProxy from "http-proxy";

const TARGET = "http://localhost:3000";
const proxy = httpProxy.createProxyServer({ target: TARGET, ws: true, changeOrigin: true });

proxy.on("error", (err, req, res) => {
  try {
    if (res && res.writeHead && !res.headersSent) {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Preview proxy: Next.js dev server is still starting." }));
    }
  } catch {}
});

const server = http.createServer((req, res) => proxy.web(req, res));
server.on("upgrade", (req, socket, head) => proxy.ws(req, socket, head));
server.listen(8001, "0.0.0.0", () => console.log("Preview proxy listening on :8001 -> Next.js :3000"));
