import { Router } from "express";
import {
    getAllTasks,
    createTask,
    getTaskById,
    updateTask,
    deleteTask,
    updateStatus,
    assignTask,
    createComment,
    updateComment,
    deleteComment,
} from "../controllers/task.controller.js";
import {
    createTaskValidator,
    updateTaskValidator,
    updateStatusValidator,
    assignTaskValidator,
    createCommentValidator,
    updateCommentValidator,
} from "../validations/taskValidators.js";
import {
    idParamValidator,
    boardIdParamValidator,
    taskIdParamValidator,
    cIdParamValidator,
} from "../validations/validateMongoID.js";
import { paginationValidator } from "../validations/paginationValidators.js";
import validateResults from "../validations/validateResults.js";
import authMW from "../middlewares/authMW.js";
import {
    authorizBoardMember,
    authorizBoardOwner,
    authorizCommentOwner,
} from "../middlewares/authorizMW.js";

// mergeParams: true — to access :boardId and :listId from parent routers
const router = Router({ mergeParams: true });

// /api/boards/:boardId/lists/:listId/tasks

router.get(
    "/",
    authMW,
    boardIdParamValidator,
    idParamValidator,
    paginationValidator,
    validateResults,
    authorizBoardMember,
    getAllTasks
);

router.post(
    "/",
    authMW,
    boardIdParamValidator,
    idParamValidator,
    createTaskValidator,
    validateResults,
    authorizBoardMember,
    createTask
);

router.get(
    "/:taskId",
    authMW,
    boardIdParamValidator,
    idParamValidator,
    taskIdParamValidator,
    validateResults,
    authorizBoardMember,
    getTaskById
);

router.patch(
    "/:taskId",
    authMW,
    boardIdParamValidator,
    idParamValidator,
    taskIdParamValidator,
    updateTaskValidator,
    validateResults,
    authorizBoardMember,
    updateTask
);

router.delete(
    "/:taskId",
    authMW,
    boardIdParamValidator,
    idParamValidator,
    taskIdParamValidator,
    validateResults,
    authorizBoardOwner,
    deleteTask
);

router.patch(
    "/:taskId/status",
    authMW,
    boardIdParamValidator,
    idParamValidator,
    taskIdParamValidator,
    updateStatusValidator,
    validateResults,
    authorizBoardMember,
    updateStatus
);

router.post(
    "/:taskId/assign",
    authMW,
    boardIdParamValidator,
    idParamValidator,
    taskIdParamValidator,
    assignTaskValidator,
    validateResults,
    authorizBoardMember,
    assignTask
);

// ── Comments ──────────────────────────────────────────────────────────────────

router.post(
    "/:taskId/comments",
    authMW,
    boardIdParamValidator,
    idParamValidator,
    taskIdParamValidator,
    createCommentValidator,
    validateResults,
    authorizBoardMember,
    createComment
);

router.patch(
    "/:taskId/comments/:cId",
    authMW,
    boardIdParamValidator,
    idParamValidator,
    taskIdParamValidator,
    cIdParamValidator,
    updateCommentValidator,
    validateResults,
    authorizCommentOwner,
    updateComment
);

router.delete(
    "/:taskId/comments/:cId",
    authMW,
    boardIdParamValidator,
    idParamValidator,
    taskIdParamValidator,
    cIdParamValidator,
    validateResults,
    authorizCommentOwner,
    deleteComment
);

export default router;
