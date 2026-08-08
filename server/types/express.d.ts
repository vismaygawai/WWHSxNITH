import { JwtPayload } from "jsonwebtoken";
import { IAuth } from "../models/auth.js";

declare global {
    namespace Express {
        interface Request {
            user?: IAuth;
        }
    }
}

export {};