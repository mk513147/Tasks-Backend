import { Router } from 'express';
import { login, register, logout } from '../controllers/auth.controller.js';
import { authValidator } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authValidator, logout);

export default router;

