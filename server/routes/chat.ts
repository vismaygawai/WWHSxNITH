import express from "express";
import { sendChat, getChatHistory, deleteChat } from "../controllers/chat";
import multer from "multer";

export const chatRoute = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

chatRoute.post('/:roomId', upload.single("image"), sendChat);
chatRoute.get('/chat-history/:roomId', getChatHistory);
chatRoute.delete('/:messageId', deleteChat);


