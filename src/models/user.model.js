import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/apiError.utils.js';


const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    isActive: {
        type: Boolean,
        default: true
    },
    deletedAt: {
        type: Date,
        default: null,
        index: true,
    },
    lastDeletedAt: {
        type: Date,
        default: null,
    },
    restoredAt: {
        type: Date,
        default: null,
    },
    restoredBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    refreshToken: {
        type: String,
    }
}, {
    timestamps: true
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.comparePassword = async function (givenPassword) {
    return await bcrypt.compare(givenPassword, this.password);
}

userSchema.methods.generateTokens = function () {
    const accessToken = jwt.sign({
        sub: this._id,
        role: this.role,
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m',
        }
    )
    const refreshToken = jwt.sign({
        sub: this._id,
        role: this.role,
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d',
        }
    )
    return { accessToken, refreshToken };
}

userSchema.methods.softDelete = async function () {

    if (this.deletedAt) { throw new ApiError(400, "User is already deleted"); }
    const now = new Date();
    this.deletedAt = now;
    this.lastDeletedAt = now;
    this.isActive = false;
    this.refreshToken = null;
    await this.save({ validateBeforeSave: false });
}

userSchema.methods.restore = async function (adminId) {
    if (!this.deletedAt) {
        throw new ApiError(400, "User is not deleted");
    }
    this.restoredAt = new Date();
    this.deletedAt = null;
    this.isActive = true;
    this.restoredBy = adminId
    await this.save({ validateBeforeSave: false });
}

const User = model('User', userSchema);
export default User;