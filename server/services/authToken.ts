import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_ENCRYP_KEY || "wwhs_super_secret_jwt_key_2026_nith_secure";

export const generateToken = (user: any) => {
    try {
        const payload = {
            userId: user._id,
            name: user.name,
            email: user.email,
        };
        return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
    } catch (error) {
        console.error("Error in generateToken:", error);
        return jwt.sign({ userId: user._id, name: user.name, email: user.email }, "wwhs_super_secret_jwt_key_2026_nith_secure", { expiresIn: "7d" });
    }
};

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.error("Error in verifyToken:", error);
        return null;
    }
};