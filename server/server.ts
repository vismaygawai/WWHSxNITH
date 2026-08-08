import express, { urlencoded } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// functions
import { connectToMongo } from "./services/connection"

// routes
import { chatRoute } from "./routes/chat"
import { authRoute } from "./routes/auth";
import { roomRoute } from "./routes/room";
import { featureRoute } from "./routes/feature";
import { blogRoute } from "./routes/blog";
import { projectRoute } from "./routes/project";
import Room from "./models/room";

// middlewares
import { allowOnlyAuthenticatedUser } from "./middlewares/auth";

const app = express();
const server = createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_PROD_URL,
].filter(Boolean) as string[];

app.use(async (req, res, next) => {
  await connectToMongo();
  next();
});

if (!process.env.VERCEL) {
  Promise.all([
    import("socket.io"),
    import("./services/socket")
  ]).then(([{ Server }, { socketSetup }]) => {
    const io = new Server(server, {
      pingTimeout: 10000,
      pingInterval: 5000,
      cors: {
        origin: (origin, callback) => {
          if (!origin || process.env.NODE_ENV !== "production") return callback(null, true);
          if (allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            console.log("Socket blocked by CORS:", origin);
            callback(new Error("Not allowed by CORS"));
          }
        },
        methods: ["GET", "POST"],
        credentials: true,
      }
    });

    app.set("io", io);
    socketSetup(io);
  }).catch(console.error);


  connectToMongo()
    .then(async () => {
      try {
        const count = await Room.countDocuments();
        if (count === 0) {
          await Room.insertMany([
            { roomId: "general", title: "General", description: "Main room for general discussions", members: [] },
            { roomId: "tech-chat", title: "Tech Chat", description: "Discuss tech, code, tools, and projects", members: [] },
            { roomId: "announcements", title: "Announcements", description: "Official updates and announcements", members: [] },
            { roomId: "random", title: "Random", description: "Meme sharing and casual banter", members: [] },
          ]);
          console.log("Seeded default chat rooms: general, tech-chat, announcements, random");
        }
      } catch (err) {
        console.error("Error seeding default rooms:", err);
      }
    })
    .catch((e: string) =>
      console.log(`Database connection warning: ${e}`)
    );
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || process.env.NODE_ENV !== "production") return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("API blocked by CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(morgan("combined"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", allowOnlyAuthenticatedUser, (req, res) => {
  return res
    .status(200)
    .json({ message: "Hey welcome to the WWHS? x NITH server" });
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { message: "Too many attempts, try again later" } });
app.use("/api/auth", authLimiter);

app.use('/api/chat', allowOnlyAuthenticatedUser, chatRoute);
app.use('/api/auth', authRoute);
app.use('/api/room', allowOnlyAuthenticatedUser, roomRoute);
app.use('/api/features', featureRoute);
app.use('/api/blog', blogRoute);
app.use('/api/project', projectRoute);

// Serve Vite build in production
if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(__dirname, "../dist/client");
  app.use(express.static(clientDist));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

export { app, server };

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 8000;
  server.listen(PORT, () => console.log(`Server started on - http://localhost:${PORT}`));
}
