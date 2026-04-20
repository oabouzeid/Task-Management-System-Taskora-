import { Router } from "express";
import {
    getAllLists,
    createList,
    updateList,
    deleteList,
} from "../controllers/list.controller.js";
import {
    createListValidator,
    updateListValidator,
} from "../validations/listValidators.js";
import { idParamValidator, boardIdParamValidator } from "../validations/validateMongoID.js";
import validateResults from "../validations/validateResults.js";
import authMW from "../middlewares/authMW.js";
import {
    authorizBoardMember,
    authorizBoardOwner,
} from "../middlewares/authorizMW.js";

// mergeParams: true — to access :boardId from parent router
const router = Router({ mergeParams: true });

// /api/boards/:boardId/lists
router.get(
    "/",
    authMW,
    boardIdParamValidator,
    validateResults,
    authorizBoardMember,
    getAllLists
);

router.post(
    "/",
    authMW,
    boardIdParamValidator,
    createListValidator,
    validateResults,
    authorizBoardMember,
    createList
);

router.patch(
    "/:id",
    authMW,
    boardIdParamValidator,
    idParamValidator,
    updateListValidator,
    validateResults,
    authorizBoardMember,
    updateList
);

router.delete(
    "/:id",
    authMW,
    boardIdParamValidator,
    idParamValidator,
    validateResults,
    authorizBoardOwner,
    deleteList
);

export default router;
