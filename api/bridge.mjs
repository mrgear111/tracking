import app from '../packages/server/index.js';

// Vercel handler
export default function handler(req, res) {
  // Reconstruct original path from the rewrite (?path=:path*)
  const raw = req.query?.path;
  const path = Array.isArray(raw) ? raw.join("/") : (raw ?? "");
  // Ensure Express sees the original `/api/...` path (or `/api` for base)
  req.url = path ? `/api/${path}` : "/api";
  app(req, res);
}