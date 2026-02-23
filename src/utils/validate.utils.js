import mongoose from "mongoose"
import { ApiError } from "./apiError.utils.js"

export const validateId = (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid ID");
    }
}