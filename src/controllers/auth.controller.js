import User from '../models/user.model.js';
import { ApiError } from '../utils/apiResponse.utils.js';
import { ApiResponse } from '../utils/apiResponse.utils.js';


const tokenGeneration = async (userId) => {
    try {
        const user = await User.findOne({
            _id: userId,
            deletedAt: null,
            isActive: true,
        });
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const { accessToken, refreshToken } = user.generateTokens();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };

    } catch (error) {
        throw error;
    }
}

const options = {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
};


export const register = async (req, res, next) => {
    try {
        const { fullName, userName, email, password } = req.body;

        if ([fullName, userName, email, password].some(field => field?.trim() === "")) {
            throw new ApiError(400, "All fields are required");
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { userName }],
            deletedAt: null,
            isActive: true
        }).select("+password");
        if (existingUser) { throw new ApiError(409, "User with given email or userName already exists"); }

        const user = await User.create({ fullName, userName: userName.toLowerCase(), email: email.toLowerCase(), password });

        const createdUser = await User.findById(user._id).lean();
        if (!createdUser) {
            throw new ApiError(500, "Failed to create user");
        }

        return res.status(201).json({ success: true, user: createdUser, message: "User registered successfully" });


    } catch (error) {
        next(error);
    }
}

export const login = async (req, res, next) => {
    try {
        const { email, userName, password } = req.body;

        if (!(email || userName) || !password) {
            throw new ApiError(400, "Email or userName and Password are required");
        }

        const user = await User.findOne({
            $or: [{ email }, { userName }],
        }).select("+password");

        if (!user) {
            throw new ApiError(401, "Invalid Credentials");
        }
        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            throw new ApiError(401, "Invalid Credentials");
        }

        if (user.deletedAt) {
            throw new ApiError(401, "Account deleted");
        }

        if (!user.isActive) {
            throw new ApiError(403, "Account is inactive")
        }

        const { accessToken, refreshToken } = await tokenGeneration(user._id);
        const loggedInUser = user.toObject();
        delete loggedInUser.password;

        return res.status(200)
            .cookie('accessToken', accessToken, options)
            .cookie('refreshToken', refreshToken, options)
            .json({ success: true, loggedInUser, message: "Login successful", accessToken, refreshToken });



    } catch (error) {
        next(error);
    }
}

export const logout = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new ApiError(401, "Unauthorized");
        }
        if (req.user.deletedAt) {
            throw new ApiError(401, "Account deleted");
        }

        req.user.refreshToken = null;
        await req.user.save({ validateBeforeSave: false });
        res
            .clearCookie('accessToken', options)
            .clearCookie('refreshToken', options)
            .status(200)
            .json({ success: true, message: "Logout Successful" });
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
            return next(new ApiError(400, "Invalid role. Allowed values are 'user' and 'admin'"));
        }

        const updatedUser = await User.findOneAndUpdate({ _id: id, deletedAt: null }, { $set: { role } }, { new: true, runValidators: true });
        if (!updatedUser) {
            return next(new ApiError(404, "User not found or has been deleted"));
        }

        return ApiResponse(res, 200, "User role updated successfully")
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
            return next(new ApiError(404, "User not found"));
        }

        await user.softDelete();
        return ApiResponse(res, 200, "User deleted successfully");

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
            return next(new ApiError(404, "User not found"));
        }
        await user.restore(req.user._id);
        return ApiResponse(res, 200, "User restored successfully");
    } catch (error) {
        next(error);
    }
}

export const resetPassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword?.trim() || !newPassword?.trim()) {
            throw new ApiError(400, "Fields should not be empty");
        }

        if (currentPassword === newPassword) {
            throw new ApiError(400, "New password must be different from current password");
        }

        const user = req.user;
        if (!user) {
            throw new ApiError(401, "Invalid credentials");
        }

        const isPasswordCorrect = await user.comparePassword(currentPassword);
        if (!isPasswordCorrect) {
            throw new ApiError(401, "Invalid credentials");
        }

        user.password = newPassword;
        user.refreshToken = null;
        await user.save();
        return res.status(200)
            .clearCookie('accessToken', options)
            .clearCookie('refreshToken', options)
            .json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        next(error);
    }
}

export const refreshToken = async (req, res, next) => {
    try {
        const incomingRefreshToken =
            req.cookies?.refreshToken
            || req.body?.refreshToken
            || req.header("Authorization")?.replace("Bearer ", "");
        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized");
        }

        const decodedobj = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findOne({ _id: decodedobj.sub, deletedAt: null, isActive: true });
        if (!user) {
            throw new ApiError(401, "Unauthorized")
        }
        if (!user.refreshToken || user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized");
        }

        const accessToken = jwt.sign({
            sub: user._id,
            role: user.role,
        },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m',
            }
        );

        return res.status(200)
            .cookie('accessToken', accessToken, options)
            .json({ success: true, message: "Access token refreshed successfully", accessToken });
    } catch (error) {
        return next(new ApiError(401, "Invalid or expired refresh token"));
    }
}
