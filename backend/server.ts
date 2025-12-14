import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middleware/errorHandler";
import logger from "./utils/logger";

dotenv.config({ path: "../.env" }); // Load from root .env

const app = express();
const PORT = process.env.PORT || 3001;

import authRoutes from "./routes/authRoutes";
import ipfsRoutes from "./routes/ipfsRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import zkpRoutes from "./routes/zkpRoutes";
import registrationRoutes from "./routes/registrationRoutes";

app.use(helmet());
app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/registration", registrationRoutes);
app.use("/api/ipfs", ipfsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/zkp", zkpRoutes);

app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware should be last
app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Backend server running on http://localhost:${PORT}`);
});
