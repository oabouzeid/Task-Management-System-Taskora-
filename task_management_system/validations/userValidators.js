import { body } from "express-validator";

export const registerValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("name is required")
        .isLength({ min: 3, max: 50 })
        .withMessage("name must be between 3 and 50 characters"),
    body("email")
        .trim()
        .notEmpty()
        .withMessage("email is required")
        .isEmail()
        .withMessage("not a valid email")
        .normalizeEmail(),
    body("password")
        .isLength({ min: 6 })
        .withMessage("password must be at least 6 characters"),
];

export const loginValidator = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("email is required")
        .isEmail()
        .withMessage("not a valid email")
        .normalizeEmail(),
    body("password").notEmpty().withMessage("password is required"),
];

export const updateUserValidator = [
    body("name")
        .optional()
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage("name must be between 3 and 50 characters"),
    body("email")
        .optional()
        .trim()
        .isEmail()
        .withMessage("not a valid email")
        .normalizeEmail(),
];

export const updatePasswordValidator = [
    body("oldPassword").notEmpty().withMessage("old password is required"),
    body("newPassword")
        .isLength({ min: 6 })
        .withMessage("new password must be at least 6 characters"),
];
