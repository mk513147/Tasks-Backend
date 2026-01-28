import { apiError } from "../utils/apiError.js"

export const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            throw new apiError(403, "Forbidden: You do not have permission to access this resource");
        }
        next();
    }
}