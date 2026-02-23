import { Router } from "express";
import { getCurrentUser, deleteMyAccount, updateProfile } from "../controllers/user.controller";
import { authValidator } from "../middlewares/auth.middleware";

const router = Router();

router.get('/current', authValidator, getCurrentUser);
router.put('/update-profile', authValidator, updateProfile);
router.delete('/delete-account', authValidator, deleteMyAccount);

export default router;