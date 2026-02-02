import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';


const userSchema = new Schema({
    username: {
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
        minlength: 6
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
        default: null
    }, refreshToken: {
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
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d',
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

const User = model('User', userSchema);
export default User;