import { body } from "express-validator";

export const createBoardValidator = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("board title is required")
        .isLength({ min: 3, max: 100 })
        .withMessage("title must be between 3 and 100 characters")
        .escape(),
    body("description")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("description cannot exceed 500 characters"),
];

export const updateBoardValidator = [
    body("title")
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage("title must be between 3 and 100 characters")
        .escape(),
    body("description")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("description cannot exceed 500 characters"),
];

export const memberValidator = [
    body("userId")
        .notEmpty()
        .withMessage("userId is required")
        .isMongoId()
        .withMessage("invalid userId format"),
];
