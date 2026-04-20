import List from "../models/list.js";
import HttpError from "../utils/httpError.js";

export const getAllLists = async (req, res, next) => {
    try {
        const { boardId } = req.params;

        const lists = await List.find({ board: boardId })
            .sort({ order: 1 })
            .lean();

        return res.status(200).json({ count: lists.length, lists });
    } catch (error) {
        next(error);
    }
};

export const createList = async (req, res, next) => {
    try {
        const { boardId } = req.params;
        const { title } = req.body;

        // auto-set order to last position
        const lastList = await List.findOne({ board: boardId }).sort({ order: -1 });
        const order = lastList ? lastList.order + 1 : 0;

        const list = await List.create({ title, board: boardId, order });

        return res.status(201).json({ message: "list created", list });
    } catch (error) {
        next(error);
    }
};

export const updateList = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, order } = req.body;

        const list = await List.findById(id);
        if (!list) return next(new HttpError(404, "list not found"));

        list.title = title || list.title;
        if (order !== undefined) list.order = order;
        await list.save();

        return res.status(200).json({ message: "list updated", list });
    } catch (error) {
        next(error);
    }
};

export const deleteList = async (req, res, next) => {
    try {
        const { id } = req.params;

        const list = await List.findById(id);
        if (!list) return next(new HttpError(404, "list not found"));

        await list.deleteOne();

        return res.status(200).json({ message: "list deleted successfully" });
    } catch (error) {
        next(error);
    }
};
