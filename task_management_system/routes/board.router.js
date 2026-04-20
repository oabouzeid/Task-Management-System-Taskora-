import { Router } from "express";
import {
    getAllBoards,
    createBoard,
    getBoardById,
    updateBoard,
    deleteBoard,
    addMember,
    removeMember,
} from "../controllers/board.controller.js";
import {
    createBoardValidator,
    updateBoardValidator,
    memberValidator,
} from "../validations/boardValidators.js";
import { idParamValidator } from "../validations/validateMongoID.js";
import validateResults from "../validations/validateResults.js";
import authMW from "../middlewares/authMW.js";
import {
    authorizBoardOwner,
    authorizBoardMember,
} from "../middlewares/authorizMW.js";

const router = Router();

// /api/boards
router.get("/", authMW, getAllBoards);

router.post("/", authMW, createBoardValidator, validateResults, createBoard);

router.get(
    "/:id",
    authMW,
    idParamValidator,
    validateResults,
    authorizBoardMember,
    getBoardById
);

router.patch(
    "/:id",
    authMW,
    idParamValidator,
    updateBoardValidator,
    validateResults,
    authorizBoardOwner,
    updateBoard
);

router.delete(
    "/:id",
    authMW,
    idParamValidator,
    validateResults,
    authorizBoardOwner,
    deleteBoard
);

router.post(
    "/:id/members",
    authMW,
    idParamValidator,
    memberValidator,
    validateResults,
    authorizBoardOwner,
    addMember
);

router.delete(
    "/:id/members/:userId",
    authMW,
    idParamValidator,
    validateResults,
    authorizBoardOwner,
    removeMember
);

export default router;
