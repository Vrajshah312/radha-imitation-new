import { AsyncLocalStorage } from "node:async_hooks";

// Per-request data-source mode ("demo" | "live"), stored so any model can read
// it without threading the value through every function signature.
export const modeStore = new AsyncLocalStorage();

export function getMode() {
  return modeStore.getStore()?.mode || process.env.DATA_MODE_DEFAULT || "demo";
}

export function isLive() {
  return getMode() === "live";
}
