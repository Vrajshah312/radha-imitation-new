import { modeStore } from "../lib/mode.js";

// Reads the X-Data-Mode header the storefront sends and makes it available to
// the whole request via AsyncLocalStorage. Defaults to demo.
export function modeContext(req, res, next) {
  const header = String(req.headers["x-data-mode"] || "").toLowerCase();
  const mode = header === "live" ? "live" : header === "demo" ? "demo" : process.env.DATA_MODE_DEFAULT || "demo";
  req.dataMode = mode;
  modeStore.run({ mode }, () => next());
}

export default modeContext;
