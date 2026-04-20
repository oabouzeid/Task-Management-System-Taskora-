import Board from "../models/board.js";
import HttpError from "../utils/httpError.js";
import User from "../models/user.js";

export const getAllBoards = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // return boards where user is owner or member
        const boards = await Board.find({
            $or: [{ owner: userId }, { members: userId }],
        })
            .populate("owner", "name email")
            .populate("members", "name email")
            .lean();

        return res.status(200).json({ count: boards.length, boards });
    } catch (error) {
        next(error);
    }
};

export const createBoard = async (req, res, next) => {
    try {
        const { title, description } = req.body;

        const board = await Board.create({
            title,
            description,
            owner: req.user._id,
            members: [],
        });

        return res.status(201).json({ message: "board created", board });
    } catch (error) {
        next(error);
    }
};

export const getBoardById = async (req, res, next) => {
    try {
        // req.board already set by authorizBoardMember middleware
        const board = await Board.findById(req.params.id)
            .populate("owner", "name email")
            .populate("members", "name email");

        return res.status(200).json(board);
    } catch (error) {
        next(error);
    }
};

export const updateBoard = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        // req.board already set by authorizBoardOwner middleware
        const board = req.board;

        board.title = title || board.title;
        board.description = description ?? board.description;
        await board.save();

        return res.status(200).json({ message: "board updated", board });
    } catch (error) {
        next(error);
    }
};

export const deleteBoard = async (req, res, next) => {
    try {
        const board = req.board;
        await board.deleteOne();

        return res.status(200).json({ message: "board deleted successfully" });
    } catch (error) {
        next(error);
    }
};

export const addMember = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const board = req.board;

        const user = await User.findById(userId);
        if (!user) return next(new HttpError(404, "user not found"));

        const alreadyMember = board.members.some(
            (m) => m.toString() === userId
        );
        if (alreadyMember)
            return next(new HttpError(400, "user is already a member"));

        if (board.owner.toString() === userId)
            return next(new HttpError(400, "owner is already part of the board"));

        board.members.push(userId);
        await board.save();

        return res.status(200).json({ message: "member added", board });
    } catch (error) {
        next(error);
    }
};

export const removeMember = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const board = req.board;

        const memberExists = board.members.some(
            (m) => m.toString() === userId
        );
        if (!memberExists)
            return next(new HttpError(404, "user is not a member of this board"));

        board.members = board.members.filter(
            (m) => m.toString() !== userId
        );
        await board.save();

        return res.status(200).json({ message: "member removed", board });
    } catch (error) {
        next(error);
    }
};
