import express from "express";
import {
  handleCreateRoom,
  handleRoomInfo,
  handleJoining,
  handleJoinedRooms,
  handleGetAllRooms,
} from "../controllers/room.js";
import { allowOnlyAuthenticatedUser } from "../middlewares/auth.js";

export const roomRoute = express.Router();

roomRoute.get("/allRooms", handleGetAllRooms);
roomRoute.post("/", allowOnlyAuthenticatedUser, handleCreateRoom);
roomRoute.get("/joined", allowOnlyAuthenticatedUser, handleJoinedRooms);
roomRoute.get("/:roomId/join", allowOnlyAuthenticatedUser, handleJoining);
roomRoute.get("/:roomId", allowOnlyAuthenticatedUser, handleRoomInfo);
