import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import articleRoutes from "./routes/articles";
import topicRoutes from "./routes/topics";
import favoriteRoutes from "./routes/favorites";
import authRoutes from "./routes/auth";
import notificationRoutes from "./routes/notifications";
import analyticsRoutes from "./routes/analytics";
import { errorHandler, notFound } from "./middlewares/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
});

if (process.env.NODE_ENV !== "development") {
  app.use("/api", limiter);
}

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
