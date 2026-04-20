import { Schema, model } from "mongoose";

const listSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "list title is required"],
            trim: true,
            minlength: [1, "title must be at least 1 character"],
            maxlength: [100, "title cannot exceed 100 characters"],
        },
        order: {
            type: Number,
            default: 0,
        },
        board: {
            type: Schema.Types.ObjectId,
            ref: "Board",
            required: [true, "list must belong to a board"],
        },
    },
    { timestamps: true }
);

export default model("List", listSchema);
