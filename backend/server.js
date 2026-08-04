// PREVIEW-ONLY shim. The Emergent preview ingress routes /api -> :8001 and
// everything else -> :3000. Since this is now a single Next.js app (API routes
// live inside Next on :3000), this tiny proxy forwards :8001 traffic to Next.
// It is NOT part of the Vercel deployment — on Vercel everything is one origin.
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
