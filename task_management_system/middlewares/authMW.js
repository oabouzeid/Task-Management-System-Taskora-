import HttpError from "../utils/httpError.js";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

export default async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return next(new HttpError(401, "no token provided"));

        const accessToken = authHeader.split(" ")[1];
        if (!accessToken) return next(new HttpError(401, "no token provided"));

        let payload;
        try {
            payload = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET);
        } catch (error) {
            return next(new HttpError(401, error.message));
        }

        const user = await User.findById(payload.userId);
        if (!user) return next(new HttpError(404, "user not found"));

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};
