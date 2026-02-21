//TODO: Fine for phase need refining for later phases 

import User from '../models/user.model.js';
import { ApiError } from '../utils/apiError.utils.js';
import { ApiResponse } from '../utils/apiResponse.utils.js';
import { validateId } from '../utils/validate.utils.js';

const SAFE_FIELDS = "fullName userName email role isActive"

export const getCurrentUser = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            return next(new ApiError(401, "Unauthorized"));
        }
        const { id } = req.user;
        validateId(id);

        const user = await User.findOne({ _id: id, deletedAt: null, isActive: true }).select(SAFE_FIELDS).lean();
        if (!user) {
            return next(ApiError(404, "User not found"));
        }
        return res.status(200).json(new ApiResponse(200, user, "User retrieved successfully"));
    } catch (error) {
        next(error);
    }
}

export const updateProfile = async (req, res, next) => {
    try {
        const { id } = req.user;
        validateId(id);
        const fullName = req.body.fullName?.toLowerCase().trim();
        const email = req.body.email?.toLowerCase().trim();

        if (!fullName || !email) {
            return next(new ApiError(400, "Full name and email are required"));
        }

        const updatedUser = await User.findOneAndUpdate({
            _id: id,
            deletedAt: null,
            isActive: true
        }, {
            fullName, email
        },
            {
                new: true, runValidators: true, select: SAFE_FIELDS
            });

        if (!updatedUser) {
            return next(new ApiError(404, "User not found "));
        }

        return res.status(200).json(new ApiResponse(200, updatedUser, "Profile updated successfully"));

    } catch (error) {
        if (error.code === 11000) {
            return next(new ApiError(400, "Email already exists"));
        }
        next(error);
    }
}

export const deleteMyAccount = async (req, res, next) => {
    try {
        const { id } = req.user;
        validateId(id);
        const user = await User.findOne({ _id: id, deletedAt: null, isActive: true });
        if (!user) {
            return next(new ApiError(404, "User not found"));
        }
        await user.softDelete();
        return res.status(200).json(new ApiResponse(200, null, "Account deleted successfully"));

    } catch (error) {
        next(error);
    }
}
