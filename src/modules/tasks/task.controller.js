import Task from "./task.model.js";
import { ApiError } from "#utils/apiError.utils.js";
import { ApiResponse } from "#utils/apiResponse.utils.js";
import { asyncHandler } from "#utils/asyncHandler.js"
// createTask

// getMyTasks

// updateTask

// deleteTask

export const createTask = asyncHandler(async (req, res, next) => {
    const userId = req.user?._id;
    const { title, repeating, recurrence, startDate, endDate, description } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
        return next(new ApiError(400, "Title is required and must be non-empty string"));
    }

    if (typeof repeating !== "boolean") {
        return next(new ApiError(400, "Repeating must be a true or false"));
    }

    if (repeating && !recurrence) {
        return next(new ApiError(400, "Recurrence details are required for repeating tasks"));
    }

    const task = await Task.create({
        userId,
        title: title.trim(),
        description,
        repeating,
        recurrence,
        startDate,
        endDate,
    })

    return res.status(201).json(new ApiResponse(201, task, "Task created successfully"));
})



export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        await Task.findByIdAndDelete(taskId);
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}