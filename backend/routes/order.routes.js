import { Router } from "express";
import { createOrder, getMyOrders, getMyOrderById } from "../controllers/order.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);
router.post("/", createOrder);
router.get("/", getMyOrders);
router.get("/:id", getMyOrderById);

export default router;
