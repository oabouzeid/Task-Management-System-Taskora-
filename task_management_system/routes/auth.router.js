import { Router } from "express";
import { registration, login, logout, refresh } from "../controllers/auth.controller.js";
import { registerValidator, loginValidator } from "../validations/userValidators.js";
import validateResults from "../validations/validateResults.js";

const router = Router();

router.post("/registration", registerValidator, validateResults, registration);
router.post("/login", loginValidator, validateResults, login);
router.post("/logout", logout);
router.post("/refresh", refresh);

export default router;
