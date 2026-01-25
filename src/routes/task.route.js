import { Router } from "express";
import { createTask } from "../controllers/task.controller.js";

const router = Router();

router.post('/', createTask);

export default router;