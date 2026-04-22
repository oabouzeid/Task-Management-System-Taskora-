import { validationResult } from "express-validator";
import HttpError from "../utils/httpError.js";

export default (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new HttpError(400, "validation error");
        error.errors = errors.array();
        return next(error);
    }
    next();
};
