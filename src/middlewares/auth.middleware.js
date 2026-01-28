import jwt from 'jsonwebtoken';
import { apiError } from '../utils/apiError.js';
import { User } from "../models/user.model.js";


export const authValidator = async (req, resizeBy, next) => {
    try {
        const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) throw new apiError(401, "Unauthorized: Access");

        const decodedObj = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedObj?._id).select("-password");

        if (!user) throw new apiError(401, "Unauthorized: User not found");

        req.user = user;
        next();

    } catch (error) {
        throw new apiError(401, error?.message || `Invalid access token`)
    }
}