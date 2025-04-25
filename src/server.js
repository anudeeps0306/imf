import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler.js";
import gadgetRoutes from "./routes/gadgetRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { connectDB, disconnectDB } from "./models/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.API_RATE_LIMIT || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Too many requests, please try again later.",
  },
});
app.use(limiter);

app.use("/api/auth", authRoutes);
app.use("/api/gadgets", gadgetRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    
    const server = app.listen(PORT, () => {
      console.log(`IMF Gadget API running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });

    const shutdown = async () => {
      console.log("Shutting down server...");
      await disconnectDB();
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
    
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
