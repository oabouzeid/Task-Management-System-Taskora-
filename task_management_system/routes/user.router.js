import { Router } from "express";
import {
    getAllUsers,
    getUserById,
    updateUser,
    updatePassword,
    deleteUser,
} from "../controllers/user.controller.js";
import {
    updateUserValidator,
    updatePasswordValidator,
} from "../validations/userValidators.js";
import { idParamValidator } from "../validations/validateMongoID.js";
import validateResults from "../validations/validateResults.js";
import authMW from "../middlewares/authMW.js";
import { authoriz } from "../middlewares/authorizMW.js";

const router = Router();

router.get("/", authMW, authoriz("admin"), getAllUsers);

router.get("/:id", authMW, idParamValidator, validateResults, getUserById);

router.patch(
    "/:id",
    authMW,
    idParamValidator,
    updateUserValidator,
    validateResults,
    updateUser
);

router.patch(
    "/:id/password",
    authMW,
    idParamValidator,
    updatePasswordValidator,
    validateResults,
    updatePassword
);

router.delete(
    "/:id",
    authMW,
    authoriz("admin"),
    idParamValidator,
    validateResults,
    deleteUser
);

export default router;
