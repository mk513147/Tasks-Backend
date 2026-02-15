import mongoose from "mongoose"
import { apiError } from "./apiError.utils.js"

export const validateId = (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new apiError(400, "Invalid ID");
    }
}