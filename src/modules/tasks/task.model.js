import { Schema, model } from "mongoose";

const reccurenceSchema = new Schema({
    type: {
        type: String,
        enum: ["daily", "weekly", "monthly", "yearly"],
        required: true,
    },
    interval: {
        type: Number,
        default: 1,
        min: 1,
    },
    daysOfWeek: [{
        type: String,
        enum: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
    }],
},
    {
        _id: false
    })

const taskSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    repeating: {
        type: Boolean,
        default: false,
    },
    recurrence: {
        type: reccurenceSchema,
        required: function () { return this.repeating === true },
    },
    status: {
        type: String,
        enum: ["pending", "completed", "archived"],
        default: "pending",
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
    }


}, { timestamps: true }).index({ userId: 1 });

const Task = model("Task", taskSchema);

export default Task;
