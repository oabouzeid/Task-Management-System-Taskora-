import { body } from "express-validator";

export const createTaskValidator = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("task title is required")
        .isLength({ max: 200 })
        .withMessage("title cannot exceed 200 characters")
        .escape(),
    body("description")
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage("description cannot exceed 2000 characters"),
    body("dueDate")
        .optional()
        .isISO8601()
        .withMessage("dueDate must be a valid date (ISO 8601)")
        .toDate(),
    body("assignedTo")
        .optional()
        .isMongoId()
        .withMessage("assignedTo must be a valid user id"),
];

export const updateTaskValidator = [
    body("title")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage("title cannot exceed 200 characters")
        .escape(),
    body("description")
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage("description cannot exceed 2000 characters"),
    body("dueDate")
        .optional()
        .isISO8601()
        .withMessage("dueDate must be a valid date (ISO 8601)")
        .toDate(),
];

export const updateStatusValidator = [
    body("status")
        .notEmpty()
        .withMessage("status is required")
        .isIn(["todo", "inProgress", "done"])
        .withMessage("status must be todo, inProgress, or done"),
];

export const assignTaskValidator = [
    body("userId")
        .notEmpty()
        .withMessage("userId is required")
        .isMongoId()
        .withMessage("invalid userId format"),
];

export const createCommentValidator = [
    body("content")
        .trim()
        .notEmpty()
        .withMessage("comment content is required")
        .isLength({ max: 500 })
        .withMessage("comment cannot exceed 500 characters"),
];

export const updateCommentValidator = [
    body("content")
        .trim()
        .notEmpty()
        .withMessage("comment content is required")
        .isLength({ max: 500 })
        .withMessage("comment cannot exceed 500 characters"),
];
