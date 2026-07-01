import { Router } from "express";
import { 
  signIn, 
  signOut, 
  verifyInvitationToken, 
  activateAccount, 
  changePassword,
  forgotPassword,
  resetPassword,
  verifyResetToken
} from "../controlers/auth.controler.js";
import { protect, validateInvitationToken, validateResetToken } from "../middlewares/auth.middleware.js";

const authRouter = Router();
console.log('authRouter');
authRouter.post("/sign-in", signIn);
authRouter.post("/sign-out", signOut);
authRouter.get("/verify-invitation", validateInvitationToken, verifyInvitationToken);
authRouter.post("/activate-account", validateInvitationToken, activateAccount);

// New routes for password management
authRouter.post("/change-password", protect, changePassword);
authRouter.post("/forgot-password", forgotPassword);
authRouter.get("/verify-reset-token", validateResetToken, verifyResetToken);
authRouter.post("/reset-password", validateResetToken, resetPassword);

export default authRouter