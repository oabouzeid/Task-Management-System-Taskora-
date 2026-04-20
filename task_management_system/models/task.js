import { Schema, model } from "mongoose";

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: [true, "comment content is required"],
            maxlength: [500, "comment cannot exceed 500 characters"],
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "comment must belong to a user"],
        },
    },
    { timestamps: true }
);

const activitySchema = new Schema(
    {
        action: {
            type: String,
            required: [true, "activity action is required"],
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "activity must belong to a user"],
        },
    },
    { timestamps: true }
);

const taskSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "task title is required"],
            trim: true,
            minlength: [1, "title must be at least 1 character"],
            maxlength: [200, "title cannot exceed 200 characters"],
        },
        description: {
            type: String,
            maxlength: [2000, "description cannot exceed 2000 characters"],
            default: "",
        },
        status: {
            type: String,
            enum: {
                values: ["todo", "inProgress", "done"],
                message: "status must be todo, inProgress, or done",
            },
            default: "todo",
        },
        dueDate: {
            type: Date,
            default: null,
        },
        list: {
            type: Schema.Types.ObjectId,
            ref: "List",
            required: [true, "task must belong to a list"],
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        comments: [commentSchema],
        activity: [activitySchema],
    },
    { timestamps: true }
);

export default model("Task", taskSchema);
