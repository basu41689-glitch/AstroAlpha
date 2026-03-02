import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { runAgent } from "../src/lib/aiAgent.js";
import aiRoutes from "./routes/aiRoutes.js";
import { config } from "./config.js";

// Load environment variables from .env file
dotenv.config();

const app = express();

// configure CORS based on environment or allowed list
const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (e.g. curl, mobile apps)
    if (!origin) return callback(null, true);
    if (config.corsOrigins.length === 0) {
      if (config.env === 'development') {
        return callback(null, true);
      }
      return callback(new Error('CORS origins not configured'));
    }
    if (config.corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// ============================================================================
// HEALTH CHECK ENDPOINTS
// ============================================================================

// Simple health check
app.get("/", (req, res) => res.send("🤖 AI Agent Server Running"));

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "AI Agent Backend",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: config.env
  });
});

// ============================================================================
// LEGACY API ENDPOINTS (Maintained for backward compatibility)
// ============================================================================

app.post("/api/agent", async (req, res) => {
  try {
    const { task } = req.body;
    if (!task) return res.status(400).json({ error: "missing task" });
    const result = await runAgent(task);
    res.json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

// Example streaming endpoint with SSE
app.post("/api/agent/stream", async (req, res) => {
  // set headers for SSE
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.write(`data: starting stream\n\n`);
  // placeholder response sequence
  setTimeout(() => res.write(`data: first chunk\n\n`), 500);
  setTimeout(() => res.write(`data: second chunk\n\n`), 1000);
  setTimeout(() => res.write(`event: done\n\n`), 1500);
});

// ============================================================================
// NEW AI ROUTES - ADVANCED ANALYSIS ENDPOINTS
// ============================================================================

app.use("/api/ai", aiRoutes);

// trust proxy for platforms like Render/Vercel
app.enable('trust proxy');

const port = config.port;
app.listen(port, () => {
  console.log(`🚀 Backend server listening on port ${port} (env=${config.env})`);
});

// production-style error handler
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(err.status || 500).json({
    error:
      config.env === 'production'
        ? 'Internal server error'
        : err.message || err.toString(),
  });
});
