import express from "express";

import { signUp, signIn } from "../controllers/authControllers.js";

const router = express.Router();

router.use("/signup", signUp);
router.use("/signin", signIn);

export default router;
