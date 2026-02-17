// getCurrentUser

// updateProfile

// deleteMyAccount

import User from '../models/user.model.js';
import { apiError } from '../utils/apiError.utils.js';
import { ApiResponse } from '../utils/apiResponse.utils.js';
import { validateId } from '../utils/validate.utils.js';

const SAFE_FIELDS = "fullName userName email role isActive"

export const getCurrentUser = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            return next(new apiError(401, "Unauthorized"));
        }
        const { id } = req.user;
        validateId(id);

        const user = await User.findOne({ _id: id, deletedAt: null, isActive: true }).select(SAFE_FIELDS).lean();
        if (!user) {
            return next(apiError(404, "User not found"));
        }
        return res.status(200).json(new ApiResponse(200, user, "User retrieved successfully"));
    } catch (error) {
        next(error);
    }
}