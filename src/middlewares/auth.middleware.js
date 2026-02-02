import jwt from 'jsonwebtoken';
import { apiError } from '../utils/apiError.js';
import User from "../models/user.model.js";


export const authValidator = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return next(new apiError(401, "Unauthorized: No access token"));
        }

        const decodedObj = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedObj?.sub).select("-password");

        if (!user) {
            return next(new apiError(401, "Unauthorized: User not found"));
        }

        req.user = user;
        next();

    } catch (error) {
        return next(new apiError(401, "Invalid or expired access token"));
    }
}