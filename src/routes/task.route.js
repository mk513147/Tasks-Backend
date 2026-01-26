import { Router } from "express";
import { createTask, getTasks, deleteTask } from "../controllers/task.controller.js";

const router = Router();

router.post('/', createTask);
router.get('/getTasks', getTasks);
router.delete('/delete/:taskId', deleteTask);
export default router;