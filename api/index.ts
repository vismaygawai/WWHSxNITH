import { app } from "../server/server.js";

export default function (req: any, res: any) {
  try {
    return app(req, res);
  } catch (error: any) {
    console.error("Vercel Init Error:", error);
    res.status(500).json({ 
      error: "Initialization Crash", 
      message: error.message, 
      stack: error.stack 
    });
  }
}
