import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("./public/temp"));
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Origin"],
  })
);
app.use(cookieParser());

// Import routes
import userRouter from "./routes/user.routes.js";
app.use("/api/v1/users", userRouter);

export default app;
