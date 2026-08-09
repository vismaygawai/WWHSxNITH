import express from "express";
import {
  handleUserSignUp,
  handleUserLogIn,
  handlerForgetPassViaEmail,
  handleForgetPassViaOld,
  changeUserPass,
  handleVerifyEmail,
  handleUserLogOut,
  getMembers,
  handleUpdateProfile,
  handleGoogleAuth,
} from "../controllers/auth.js";
import { savePushToken } from "../controllers/notification.js";
import { allowOnlyAuthenticatedUser } from "../middlewares/auth.js";

export const authRoute = express.Router();

authRoute.post("/signup", handleUserSignUp);
authRoute.post("/login", handleUserLogIn);
authRoute.post("/google", handleGoogleAuth);
authRoute.post("/forget-password/viaOldPass", handleForgetPassViaOld);
authRoute.post("/forget-password/viaEmail", handlerForgetPassViaEmail);
authRoute.post("/reset-password", changeUserPass);
authRoute.get("/verify-acc", handleVerifyEmail);
authRoute.post("/save-token", allowOnlyAuthenticatedUser, savePushToken);
authRoute.post("/logout", allowOnlyAuthenticatedUser, handleUserLogOut);
authRoute.get("/members", allowOnlyAuthenticatedUser, getMembers);
authRoute.put("/profile", allowOnlyAuthenticatedUser, handleUpdateProfile);
