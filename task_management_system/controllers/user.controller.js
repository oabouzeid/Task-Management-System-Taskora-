import User from "../models/user.js";
import HttpError from "../utils/httpError.js";

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select("-password");
        return res.status(200).json({ count: users.length, users });
    } catch (error) {
        next(error);
    }
};

export const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return next(new HttpError(404, "user not found"));

        return res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const { name, email } = req.body;
        // fix from demo: was using undefined `id` instead of req.params.id
        const user = await User.findById(req.params.id);
        if (!user) return next(new HttpError(404, "user not found"));

        user.name = name || user.name;
        user.email = email || user.email;
        await user.save();

        return res.status(200).json({
            message: "user updated successfully",
            user,
        });
    } catch (error) {
        next(error);
    }
};

export const updatePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        // fix from demo: was using undefined `id` instead of req.params.id
        const user = await User.findById(req.params.id);
        if (!user) return next(new HttpError(404, "user not found"));

        const isMatched = await user.comparePassword(oldPassword);
        if (!isMatched) return next(new HttpError(401, "old password is incorrect"));

        user.password = newPassword;
        await user.save();

        return res.status(200).json({ message: "password updated successfully" });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        // fix from demo: was returning new HttpError without next()
        if (!user) return next(new HttpError(404, "user not found"));

        await user.deleteOne();
        return res.status(200).json({ message: "user deleted successfully" });
    } catch (error) {
        next(error);
    }
};
