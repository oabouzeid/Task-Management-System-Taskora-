import { param } from "express-validator";

export const idParamValidator = [
    param("id")
        .notEmpty()
        .withMessage("missing param id")
        .isMongoId()
        .withMessage("invalid id format"),
];

export const boardIdParamValidator = [
    param("boardId")
        .notEmpty()
        .withMessage("missing param boardId")
        .isMongoId()
        .withMessage("invalid boardId format"),
];

export const taskIdParamValidator = [
    param("taskId")
        .notEmpty()
        .withMessage("missing param taskId")
        .isMongoId()
        .withMessage("invalid taskId format"),
];

export const cIdParamValidator = [
    param("cId")
        .notEmpty()
        .withMessage("missing param cId")
        .isMongoId()
        .withMessage("invalid comment id format"),
];
