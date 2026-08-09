import type { VercelRequest, VercelResponse } from "@vercel/node";
import { app } from "../server/server.js";

export default function (req: VercelRequest, res: VercelResponse) {
  try {
    return app(req, res);
  } catch (error) {
    console.error("Vercel Init Error:", error);
    res.status(500).json({
      error: "Initialization Crash",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
