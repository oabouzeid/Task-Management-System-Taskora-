import HttpError from "../utils/httpError.js";
import Board from "../models/board.js";
import Task from "../models/task.js";

// check user role (admin, user, etc.)
export const authoriz = (...roles) => {
    return (req, res, next) => {
        if (!req.user) return next(new HttpError(401, "authentication required"));

        // fix from demo: was !roles.includes() — logic was inverted
        if (!roles.includes(req.user.role))
            return next(new HttpError(403, "insufficient permissions"));

        next();
    };
};

// check board ownership or admin
export const authorizBoardOwner = async (req, res, next) => {
    try {
        const boardId = req.params.boardId || req.params.id;
        const userId = req.user._id;
        const role = req.user.role;

        const board = await Board.findById(boardId);
        if (!board) return next(new HttpError(404, "board not found"));

        if (board.owner.toString() === userId.toString() || role === "admin") {
            req.board = board;
            return next();
        }

        return next(new HttpError(403, "not authorized to perform this action"));
    } catch (error) {
        next(error);
    }
};

// check board membership (owner or member)
export const authorizBoardMember = async (req, res, next) => {
    try {
        const boardId = req.params.boardId || req.params.id;
        const userId = req.user._id.toString();
        const role = req.user.role;

        const board = await Board.findById(boardId);
        if (!board) return next(new HttpError(404, "board not found"));

        const isOwner = board.owner.toString() === userId;
        const isMember = board.members.some((m) => m.toString() === userId);

        if (isOwner || isMember || role === "admin") {
            req.board = board;
            return next();
        }

        return next(new HttpError(403, "not authorized to access this board"));
    } catch (error) {
        next(error);
    }
};

// check task comment ownership or admin
export const authorizCommentOwner = async (req, res, next) => {
    try {
        const { taskId, cId } = req.params;
        const userId = req.user._id.toString();
        const role = req.user.role;

        const task = await Task.findById(taskId);
        if (!task) return next(new HttpError(404, "task not found"));

        const comment = task.comments.id(cId);
        if (!comment) return next(new HttpError(404, "comment not found"));

        if (comment.user.toString() === userId || role === "admin") {
            req.task = task;
            return next();
        }

        return next(new HttpError(403, "not authorized to perform this action"));
    } catch (error) {
        next(error);
    }
};
