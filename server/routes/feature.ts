import express from "express";
import { allowOnlyAuthenticatedUser } from "../middlewares/auth.js";
import { getFeatures, postFeatures } from "../controllers/feature.js";

export const featureRoute = express.Router();

featureRoute.get("/", getFeatures);
featureRoute.post("/", allowOnlyAuthenticatedUser, postFeatures);
