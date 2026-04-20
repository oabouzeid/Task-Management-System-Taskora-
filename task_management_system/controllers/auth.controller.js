import HttpError from "../utils/httpError.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import RefreshToken from "../models/refreshToken.js";

export const registration = async (req, res, next) => {
    try {
        const { email, name, password } = req.body;

        await User.create({ email, name, password, role: "user" });

        return res.status(201).json({
            message: "account created, please login",
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // fix from demo: was checking !email instead of !user
        const user = await User.findOne({ email });
        if (!user) return next(new HttpError(401, "wrong email or password"));

        const isMatched = await user.comparePassword(password);
        if (!isMatched) return next(new HttpError(401, "wrong email or password"));

        const accessToken = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.JWT_ACCESS_TOKEN_EXP }
        );

        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.JWT_REFRESH_TOKEN_EXP }
        );

        await RefreshToken.create({
            token: refreshToken,
            user: user._id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        // fix from demo: accessToken now returned correctly in the json body
        return res
            .status(200)
            .cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            .json({ message: "user authenticated", accessToken });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return next(new HttpError(400, "refresh token required"));

        let payload;
        try {
            payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
        } catch (error) {
            return next(new HttpError(401, "invalid refresh token"));
        }

        const userTokens = await RefreshToken.find({ user: payload.userId });

        const comparisons = await Promise.all(
            userTokens.map((t) => t.compareToken(refreshToken))
        );

        const matchedIndex = comparisons.findIndex((match) => match === true);
        if (matchedIndex === -1)
            return next(new HttpError(401, "refresh token not found"));

        const storedToken = userTokens[matchedIndex];

        // fix from demo: was RefreshToken, findByIdAndDelete (comma instead of dot)
        await RefreshToken.findByIdAndDelete(storedToken._id);

        return res
            .clearCookie("refreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            })
            .json({ message: "logout successful" });
    } catch (error) {
        next(error);
    }
};

export const refresh = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return next(new HttpError(400, "refresh token required"));

        let payload;
        try {
            payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
        } catch (error) {
            return next(new HttpError(401, "invalid refresh token"));
        }

        const userTokens = await RefreshToken.find({ user: payload.userId });

        const comparisons = await Promise.all(
            userTokens.map((t) => t.compareToken(refreshToken))
        );

        const matchedIndex = comparisons.findIndex((match) => match === true);
        if (matchedIndex === -1)
            return next(new HttpError(401, "refresh token not found"));

        const user = await User.findById(payload.userId);
        if (!user) return next(new HttpError(404, "user not found"));

        const accessToken = jwt.sign(
            { userId: payload.userId, role: user.role },
            process.env.JWT_ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.JWT_ACCESS_TOKEN_EXP }
        );

        return res.status(200).json({ accessToken });
    } catch (error) {
        next(error);
    }
};
