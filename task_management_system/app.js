import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";

import errorHandlingMW from "./middlewares/errorHandlingMW.js";
import notFoundMW from "./middlewares/notFoundMW.js";

import authRouter from "./routes/auth.router.js";
import userRouter from "./routes/user.router.js";
import boardRouter from "./routes/board.router.js";
import listRouter from "./routes/list.router.js";
import taskRouter from "./routes/task.router.js";

const app = express();

const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

// ── Middlewares ───────────────────────────────────────────────────────────────
app.use(
    cors({
        origin: frontendOrigin,
        credentials: true,
    })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/boards", boardRouter);

// nested routes: /api/boards/:boardId/lists
app.use("/api/boards/:boardId/lists", listRouter);

// nested routes: /api/boards/:boardId/lists/:id/tasks
app.use("/api/boards/:boardId/lists/:id/tasks", taskRouter);

// ── Error Handling ────────────────────────────────────────────────────────────
app.use(notFoundMW);
app.use(errorHandlingMW);

export default app;
