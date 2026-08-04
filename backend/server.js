import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import orderRoutes from "./routes/order.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import bannerRoutes from "./routes/banner.routes.js";
import modeContext from "./middleware/mode.middleware.js";
import blockCatalogWritesInLive from "./middleware/liveGuard.middleware.js";
import { isWordPressConfigured } from "./lib/wpgraphql.js";
import { seedAdminUser } from "./models/User.js";

dotenv.config();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "8mb" }));
app.use("/uploads", express.static(path.join(path.dirname(fileURLToPath(import.meta.url)), "uploads")));
app.use(modeContext);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Radha Imitation Jewellery API is running" });
});

// Tells the storefront which data source is active and whether Live mode is ready.
app.get("/api/mode", (req, res) => {
  res.json({
    mode: req.dataMode,
    wordpressConfigured: isWordPressConfigured(),
    defaultMode: process.env.DATA_MODE_DEFAULT || "demo",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", blockCatalogWritesInLive, adminRoutes);
app.use("/api/banners", bannerRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
seedAdminUser()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✨ Radha Imitation Jewellery API running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Unable to seed admin user", error);
    process.exit(1);
  });
