import User from '../models/user.model.js';
import { apiError } from '../utils/apiError.js';


const tokenGeneration = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new apiError(404, "User not found");
        const { accessToken, refreshToken } = user.generateTokens();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };

    } catch (error) {
        throw new apiError(500, "Failed to generate authentication tokens");
    }
}

const options = {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
};


export const register = async (req, res, next) => {
    try {
        const { fullName, username, email, password } = req.body;

        if ([fullName, username, email, password].some(field => field?.trim() === "")) {
            throw new apiError(400, "All fields are required");
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] })
        if (existingUser) { throw new apiError(409, "User with given email or username already exists"); }

        const user = await User.create({ fullName, username: username.toLowerCase(), email, password });

        const createdUser = await User.findById(user._id).select('-password');
        if (!createdUser) {
            throw new apiError(500, "Failed to create user");
        }

        return res.status(201).json({ success: true, user: createdUser, message: "User registered successfully" });


    } catch (error) {
        next(error);
    }
}

export const login = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;

        if (!(email || username) || !password) {
            throw new apiError(400, "Email or Username and Password are required");
        }

        const user = await User.findOne({ $or: [{ email }, { username: username?.toLowerCase() }] });
        if (!user) {
            throw new apiError(404, "User not found");
        }

        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            throw new apiError(401, "Invalid Credentials");
        }

        const { accessToken, refreshToken } = await tokenGeneration(user._id);
        const loggedInUser = await User.findById(user._id).select('-password');

        return res.status(200)
            .cookie('accessToken', accessToken, options)
            .cookie('refreshToken', refreshToken, options)
            .json({ success: true, loggedInUser, message: "Login successful" });



    } catch (error) {
        next(error);
    }
}

export const logout = async (req, res, next) => {
    try {
        if (!req.user) throw new apiError(401, "Unauthorized");

        req.user.refreshToken = null;
        await req.user.save({ validateBeforeSave: false });
        res
            .clearCookie('accessToken')
            .clearCookie('refreshToken')
            .status(200)
            .json({ success: true, message: "Logout Successful" });
    } catch (error) {
        next(error);
    }
}
