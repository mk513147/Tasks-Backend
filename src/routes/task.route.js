import { Router } from "express";
import { createTask, getTasks, deleteTask } from "../controllers/task.controller.js";
import { authValidator } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/', authValidator, createTask);
router.get('/getTasks', authValidator, getTasks);
router.delete('/delete/:taskId', authValidator, deleteTask);
export default router;