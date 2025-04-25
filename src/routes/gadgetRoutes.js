import express from "express";
import {
  getAllGadgets,
  getGadgetById,
  createGadget,
  updateGadget,
  deleteGadget,
  selfDestruct,
} from "../controllers/gadgetController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getAllGadgets);
router.get("/:id", getGadgetById);
router.post("/", authorize(["admin"]), createGadget);
router.patch("/:id", authorize(["admin"]), updateGadget);
router.delete("/:id", authorize(["admin"]), deleteGadget);

router.post("/:id/self-destruct", authorize(["admin", "agent"]), selfDestruct);

export default router;
