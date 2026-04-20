import { body } from "express-validator";

export const createListValidator = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("list title is required")
        .isLength({ min: 1, max: 100 })
        .withMessage("title cannot exceed 100 characters")
        .escape(),
];

export const updateListValidator = [
    body("title")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage("title cannot exceed 100 characters")
        .escape(),
    body("order")
        .optional()
        .isInt({ min: 0 })
        .withMessage("order must be a non-negative integer")
        .toInt(),
];
