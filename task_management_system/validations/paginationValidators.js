import { query } from "express-validator";

export const paginationValidator = [
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("page must be a number greater than 0")
        .toInt(),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("limit must be a number between 1 and 100")
        .toInt(),
];
