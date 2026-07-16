import { Router } from "express";
import { createUser, getUsers, findUserById, blockUser, updateUser, deleteUser } from "../controlers/user.controler.js";
import { protect, requireAdmin } from "../middlewares/auth.middleware.js";
const userRouter = Router();

userRouter.get("/", protect, requireAdmin, getUsers);
userRouter.get("/:id", protect, requireAdmin, findUserById);
userRouter.post("/", protect, requireAdmin, createUser);

userRouter.delete("/:id", protect, requireAdmin, deleteUser);
userRouter.put("/block-user",protect, requireAdmin, blockUser);
userRouter.put("/:id",protect, requireAdmin, updateUser);

export default userRouter