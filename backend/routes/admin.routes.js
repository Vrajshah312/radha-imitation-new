import { Router } from "express";
import protect from "../middleware/auth.middleware.js";
import adminOnly from "../middleware/admin.middleware.js";

import { getStats } from "../controllers/admin/dashboard.admin.controller.js";
import {
  listProducts,
  createProduct,
  bulkCreateProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/admin/product.admin.controller.js";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  addSubcategory,
  deleteSubcategory,
} from "../controllers/admin/category.admin.controller.js";
import {
  listOrders,
  getOrder,
  updateOrderStatus,
} from "../controllers/admin/order.admin.controller.js";
import {
  listUsers,
  updateUserStatus,
  updateUserRole,
} from "../controllers/admin/user.admin.controller.js";
import {
  listInventory,
  adjustStock,
  setStock,
} from "../controllers/admin/inventory.admin.controller.js";
import { listBanners, createBanner, updateBanner, deleteBanner } from "../controllers/admin/banner.admin.controller.js";
import { uploadBannerImage } from "../controllers/admin/upload.admin.controller.js";

const router = Router();

// Every route below requires a valid token AND an admin role.
router.use(protect, adminOnly);

router.get("/stats", getStats);

router.get("/products", listProducts);
router.post("/products", createProduct);
router.post("/products/bulk", bulkCreateProducts);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

router.get("/categories", listCategories);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);
router.post("/categories/:id/subcategories", addSubcategory);
router.delete("/categories/:id/subcategories/:subId", deleteSubcategory);

router.get("/orders", listOrders);
router.get("/orders/:id", getOrder);
router.patch("/orders/:id/status", updateOrderStatus);

router.get("/users", listUsers);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/role", updateUserRole);

router.get("/inventory", listInventory);
router.patch("/inventory/:id/adjust", adjustStock);
router.patch("/inventory/:id/set", setStock);

router.get("/banners", listBanners);
router.post("/banners", createBanner);
router.put("/banners/:id", updateBanner);
router.delete("/banners/:id", deleteBanner);
router.post("/uploads/banners", uploadBannerImage);

export default router;
