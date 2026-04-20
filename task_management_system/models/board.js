import { Schema, model } from "mongoose";

const boardSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "board title is required"],
            trim: true,
            minlength: [3, "title must be at least 3 characters"],
            maxlength: [100, "title cannot exceed 100 characters"],
        },
        description: {
            type: String,
            maxlength: [500, "description cannot exceed 500 characters"],
            default: "",
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "board must have an owner"],
        },
        members: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: true }
);

export default model("Board", boardSchema);
