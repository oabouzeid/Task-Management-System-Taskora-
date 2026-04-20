import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            minlength: [3, "name must be at least 3 characters"],
            maxlength: [50, "name cannot exceed 50 characters"],
            required: [true, "name is required"],
        },
        email: {
            type: String,
            unique: true,
            lowercase: true,
            validate: {
                validator: function (value) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                },
                message: "please enter a valid email",
            },
            required: [true, "email is required"],
        },
        password: {
            type: String,
            minlength: [6, "password must be at least 6 characters"],
            required: [true, "password is required"],
        },
        role: {
            type: String,
            enum: ["admin", "user"],
            default: "user",
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
