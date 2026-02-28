import { Router } from "express";
import { getCurrentUser, deleteMyAccount, updateProfile } from "./user.controller.js";
import { authValidator } from "#middlewares/auth.middleware.js";

const router = Router();

router.get('/current', authValidator, getCurrentUser);
router.put('/update-profile', authValidator, updateProfile);
router.delete('/delete-account', authValidator, deleteMyAccount);

export default router;