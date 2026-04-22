import jwt from "jsonwebtoken";
import HttpError from "../utils/httpError.js";

export default async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

       
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next(new HttpError(401, "no token provided"));
        }

        const accessToken = authHeader.split(" ")[1];

        let payload;

        try {
            payload = jwt.verify(
                accessToken,
                process.env.JWT_ACCESS_TOKEN_SECRET
            );
        } catch (error) {
            return next(new HttpError(401, "invalid token"));
        }

        req.user = {
            id: payload.userId,
            _id: payload.userId,
            role: payload.role,
        };

        next();
    } catch (error) {
        next(error);
    }
};