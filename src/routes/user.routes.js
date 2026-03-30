import { Router } from "express";
import registerUser from "../controllres/user.controller.js";

const userRouter = Router();

userRouter.route("/register").post(registerUser);



export default userRouter;
