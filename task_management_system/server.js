import app from "./app.js";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const mongoUrl = process.env.MONGODB_URL;

mongoose
    .connect(mongoUrl)
    .then(() => {
        console.log("connected to database");
    })
    .catch((err) => {
        console.log(" error connecting to database:", err);
        process.exit(1);
    });

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});
