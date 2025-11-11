import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

import { generatePrompts } from "./controller/forYouPage.controller.js";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.post("/api/getPrompts", generatePrompts);

app.listen(process.env.PORT || 8000, () => {
  console.log(`app is running at port : ${process.env.PORT}`);
});
