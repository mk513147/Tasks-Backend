import { ApiError } from "#utils/apiError.utils.js";
import { property } from "zod";

export const validate = (schema) => (req, res, next) => {
    const parsedData = schema.safeParse(req.body);
    if (!parsedData.success) {
        const formattedErrors = parsedData.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
        }))

        return next(new ApiError(400, "Validation failed", formattedErrors));
    }
    req[property] = parsedData.data;
    next();
}