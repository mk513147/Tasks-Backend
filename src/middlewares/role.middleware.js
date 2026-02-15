import { apiError } from "../utils/apiError.js"

export const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new apiError(401, "Unauthorized"));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(apiError(403, "Forbidden: You do not have permission to access this resource"));
        }
        next();
    }
}