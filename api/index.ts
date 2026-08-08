export default async function (req: any, res: any) {
  try {
    const { app } = await import("../server/server");
    return app(req, res);
  } catch (error: any) {
    console.error("Vercel Init Error:", error);
    res.status(200).json({ 
      error: "Initialization Crash", 
      message: error.message, 
      stack: error.stack 
    });
  }
}
