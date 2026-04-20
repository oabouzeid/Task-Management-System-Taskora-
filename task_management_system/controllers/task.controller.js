import Task from "../models/task.js";
import List from "../models/list.js";
import User from "../models/user.js";
import HttpError from "../utils/httpError.js";

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const getAllTasks = async (req, res, next) => {
    try {
        const listId = req.params.id || req.params.listId;
        const { status, dueDate, assignedTo, page = 1, limit = 10 } = req.query;

        const filter = { list: listId };
        if (status) filter.status = status;
        if (assignedTo) filter.assignedTo = assignedTo;
        if (dueDate) filter.dueDate = { $lte: new Date(dueDate) };

        const skip = (page - 1) * limit;
        const tasks = await Task.find(filter)
            .populate("assignedTo", "name email")
            .skip(skip)
            .limit(Number(limit))
            .lean();

        const total = await Task.countDocuments(filter);

        return res.status(200).json({
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            tasks,
        });
    } catch (error) {
        next(error);
    }
};

export const createTask = async (req, res, next) => {
    try {
        const listId = req.params.id || req.params.listId;
        const { title, description, dueDate, assignedTo } = req.body;

        const list = await List.findById(listId);
        if (!list) return next(new HttpError(404, "list not found"));

        const task = await Task.create({
            title,
            description,
            dueDate,
            assignedTo: assignedTo || null,
            list: listId,
            activity: [{ action: "task created", user: req.user._id }],
        });

        return res.status(201).json({ message: "task created", task });
    } catch (error) {
        next(error);
    }
};

export const getTaskById = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.taskId)
            .populate("assignedTo", "name email")
            .populate("comments.user", "name email")
            .populate("activity.user", "name email");

        if (!task) return next(new HttpError(404, "task not found"));

        return res.status(200).json(task);
    } catch (error) {
        next(error);
    }
};

export const updateTask = async (req, res, next) => {
    try {
        const { title, description, dueDate } = req.body;

        const task = await Task.findById(req.params.taskId);
        if (!task) return next(new HttpError(404, "task not found"));

        task.title = title || task.title;
        task.description = description ?? task.description;
        if (dueDate !== undefined) task.dueDate = dueDate;

        task.activity.push({ action: "task updated", user: req.user._id });
        await task.save();

        return res.status(200).json({ message: "task updated", task });
    } catch (error) {
        next(error);
    }
};

export const deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) return next(new HttpError(404, "task not found"));

        await task.deleteOne();

        return res.status(200).json({ message: "task deleted successfully" });
    } catch (error) {
        next(error);
    }
};

export const updateStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        const task = await Task.findById(req.params.taskId);
        if (!task) return next(new HttpError(404, "task not found"));

        const oldStatus = task.status;
        task.status = status;
        task.activity.push({
            action: `status changed from "${oldStatus}" to "${status}"`,
            user: req.user._id,
        });
        await task.save();

        return res.status(200).json({ message: "status updated", task });
    } catch (error) {
        next(error);
    }
};

export const assignTask = async (req, res, next) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);
        if (!user) return next(new HttpError(404, "user not found"));

        const task = await Task.findById(req.params.taskId);
        if (!task) return next(new HttpError(404, "task not found"));

        task.assignedTo = userId;
        task.activity.push({
            action: `task assigned to ${user.name}`,
            user: req.user._id,
        });
        await task.save();

        return res.status(200).json({ message: "task assigned", task });
    } catch (error) {
        next(error);
    }
};

// ─── Comments ─────────────────────────────────────────────────────────────────

export const createComment = async (req, res, next) => {
    try {
        const { content } = req.body;

        const task = await Task.findById(req.params.taskId);
        if (!task) return next(new HttpError(404, "task not found"));

        task.comments.push({ content, user: req.user._id });
        task.activity.push({ action: "comment added", user: req.user._id });
        await task.save();

        return res.status(201).json({ message: "comment added", task });
    } catch (error) {
        next(error);
    }
};

export const updateComment = async (req, res, next) => {
    try {
        const { cId } = req.params;
        const { content } = req.body;

        // req.task already set by authorizCommentOwner middleware
        const task = req.task;

        const comment = task.comments.id(cId);
        if (!comment) return next(new HttpError(404, "comment not found"));

        comment.content = content;
        task.activity.push({ action: "comment updated", user: req.user._id });
        await task.save();

        return res.status(200).json({ message: "comment updated", task });
    } catch (error) {
        next(error);
    }
};

export const deleteComment = async (req, res, next) => {
    try {
        const { cId } = req.params;

        // req.task already set by authorizCommentOwner middleware
        const task = req.task;

        const comment = task.comments.id(cId);
        if (!comment) return next(new HttpError(404, "comment not found"));

        await comment.deleteOne();
        task.activity.push({ action: "comment deleted", user: req.user._id });
        await task.save();

        return res.status(200).json({ message: "comment deleted" });
    } catch (error) {
        next(error);
    }
};
