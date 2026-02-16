import { apiError } from "../utils/apiError.utils";
import { apiResponse } from "../utils/apiResponse.utils";
import User from "../models/user.model";
import { queryBuilder } from "../utils/queryBuilder.utils.js";
import mongoose from "mongoose";
import { validateId } from "../utils/validate.utils.js";

export const getUsers = async (req, res, next) => {
    try {
        const { includeDeleted, includeInactive } = req.query;
        const baseFilters = {};

        if (includeDeleted !== "true") {
            baseFilters.deletedAt = null;
        }
        if (includeInactive !== "true") {
            baseFilters.isActive = true;
        }

        const { filters, sort, limit, page, skip } = queryBuilder({
            baseFilters,
            query: req.query,
            searchableFields: ["fullName", "email", "username"],
        })

        const [users, total] = await Promise.all([
            User.find(filters).select("-password").sort(sort).skip(skip).limit(limit).lean(),
            User.countDocuments(filters)
        ])

        return apiResponse(res, 200, "Users retrieved successfully", {
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            }
        })
    } catch (error) {
        next(error);
    }
}

export const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;


        validateId(id);
        const user = await User.findById(id).select("-password").lean();
        if (!user) {
            return next(apiError(404, "User not found"));
        }

        return apiResponse(res, 200, "User retrieved successfully", { user })
    } catch (error) {
        next(error);
    }
}

export const updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;

        validateId(id);
        const { role } = req.body;

        const allowedRoles = ["user", "admin"];

        if (!allowedRoles.includes(role)) {
            return next(apiError(400, "Invalid role. Allowed values are 'user' and 'admin'"));
        }

        const updatedUser = await User.findOneAndUpdate({ _id: id, deletedAt: null }, { $set: { role } }, { new: true, runValidators: true });
        if (!updatedUser) {
            return next(apiError(404, "User not found or has been deleted"));
        }

        return apiResponse(res, 200, "User role updated successfully")
    } catch (error) {
        next(error);
    }
}

export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        validateId(id);
        const user = await User.findById(id);
        if (!user) {
            return next(apiError(404, "User not found"));
        }

        await user.softDelete();
        return apiResponse(res, 200, "User deleted successfully");

    } catch (error) {
        next(error);
    }
}

export const restoreUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        validateId(id);
        const user = await User.findOne({ _id: id, deletedAt: { $ne: null } });
        if (!user) {
            return next(apiError(404, "User not found"));
        }
        await user.restore(req.user._id);
        return apiResponse(res, 200, "User restored successfully");
    } catch (error) {
        next(error);
    }
}