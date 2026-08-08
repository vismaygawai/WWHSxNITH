import { Request, Response } from "express";
import Auth from "../models/auth";
import { generateToken } from "../services/authToken";
import { generateSalt, hashPassword } from "../services/authUtils";
import { sendEmail } from "../services/sendEmail";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { verifyAcc } from "../services/verifyAcc";
import bcrypt from "bcrypt";

dotenv.config();

export const handleUserSignUp = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All the fields are required" });
    }

    const existingUser = await Auth.findOne({ email });
    if(existingUser) {
      return res.status(400).json({ message: "You already have an account, login instead OR if you want to verify your email then check your email inbox" });
    }

    const salt = generateSalt();
    const hash = hashPassword(password, salt);

    const newUser = new Auth({
      name,
      email,
      password: hash,
      salt: salt,
      isVerified: false,
    });
    await newUser.save();
    verifyAcc(newUser);

    return res.status(200).json({ message: "Check your inbox for account verification email" });
  } catch (error) {
    console.error("Error in handleUserSignUp:", error);
    return res.status(500).json({ message: "Failed to create account. Please try again." });
  }
};

export const handleVerifyEmail = async (req: Request, res: Response) => {
  try {
    const queryHash = req.query.hash as string;
    const decoder = jwt.verify(queryHash, process.env.JWT_ENCRYP_KEY || "wwhs_super_secret_jwt_key_2026_nith_secure") as {
      email: string;
      name: string;
    };

    const user = await Auth.findOne({ email: decoder.email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "User with that email is not registered" });
    }

    user.isVerified = true;
    await user.save();

    const token = generateToken(user);
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "Email verified successfully", token, user });
  } catch (error) {
    console.error("Error in handleVerifyEmail:", error);
    return res.status(400).json({ message: "Invalid or expired verification link." });
  }
};

export const handleUserLogIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All the fields are required" });
  }
  try {
    const mail = email.trim().toLowerCase();
    const existingUser = await Auth.findOne({ email: mail });

    if (!existingUser) {
      return res.status(400).json({ message: "You don't have an account, sign up first" });
    }

    if (!existingUser.isVerified) {
      return res.status(400).json({ message: "Account is unverified. Check your email inbox." });
    }

    let isMatch = false;
    if (existingUser.salt) {
      try {
        const inputhash = hashPassword(password, existingUser.salt);
        isMatch = inputhash === existingUser.password;
      } catch {
        isMatch = false;
      }
    }

    if (!isMatch && existingUser.password) {
      try {
        isMatch = await bcrypt.compare(password, existingUser.password);
      } catch {
        isMatch = false;
      }
    }

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = generateToken(existingUser);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Logged in successfully",
      token,
      user: {
        _id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        isVerified: true,
      },
    });
  } catch (error) {
    console.error("Error in handleUserLogIn:", error);
    return res.status(500).json({ message: "Failed to log in. Please try again." });
  }
};

// via old password
export const handleForgetPassViaOld = async (req: Request, res: Response) => {
  const { email, oldPassword, newPassword } = req.body;
  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ message: "All the fields are required" });
  }

  try {
    const user = await Auth.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Account with that email does not exists" });
    }

    const oldHash = hashPassword(oldPassword, user?.salt);
    if (oldHash !== user?.password) {
      return res
        .status(400)
        .json({ message: "You have entered a wrong password" });
    }

    const newSalt = generateSalt();
    const newHash = hashPassword(newPassword, newSalt);

    user.password = newHash;
    user.salt = newSalt;
    await user.save();
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.log(`${error}`);
    throw new Error(`While changing the password`);
  }
};

// via nodemailer
export const handlerForgetPassViaEmail = async (
  req: Request,
  res: Response
) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Enter all the required fields" });
  }
  try {
    const user = await Auth.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "This email isn't registered to any accounts" });
    }

    const status = sendEmail(user);
    if (!status) {
      return res
        .status(400)
        .json({ message: "Email couldn't be sent at the moment" });
    }
    return res.status(200).json({ message: `Reset link sent to your email` });
  } catch (error) {
    console.log(`${error}`);
    throw new Error(`While user tried to change pass via email`);
  }
};

export const changeUserPass = async (req: Request, res: Response) => {
  const { newPassword } = req.body;
  const token = req.query.token as string;

  if (!newPassword) {
    return res.status(400).json({ message: "All the fields are required" });
  }

  if (!token) {
    return res.status(400).json({ message: "No validated token found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ENCRYP_KEY!) as {
      name: string;
      email: string;
    };

    const user = await Auth.findOne({ email: decoded.email });
    if (!user) {
      return res.status(400).json({ message: "Token is altered" });
    }

    const newSalt = generateSalt();
    const newHash = hashPassword(newPassword, newSalt);
    user.password = newHash;
    user.salt = newSalt;
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.log(`${error}`);
    throw new Error(`While changing password via email`);
  }
};

export const handleUserLogOut = async(req: Request, res: Response) => {
    try {
        res.clearCookie('token');
        return res.status(200).json({ message: "Logged out successfully" });
    }catch(error) {
        console.log(`${error}`);
        throw new Error(`While clearing the token from cookies`);
    }
};

export const getMembers = async (req: Request, res: Response) => {
    try {
        const users = await Auth.find({ isVerified: true }).select("name email");
        return res.status(200).json({ members: users });
    } catch (error) {
        console.log(`${error}`);
        return res.status(500).json({ message: "Failed to fetch members" });
    }
};

export const handleUpdateProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Name is required" });
        }
        const updatedUser = await Auth.findByIdAndUpdate(
            userId,
            { name: name.trim() },
            { new: true }
        ).select("name email isVerified");
        
        return res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.log(`${error}`);
        return res.status(500).json({ message: "Failed to update profile" });
    }
};

export const handleGoogleAuth = async (req: Request, res: Response) => {
    try {
        const { credential, email: googleEmail, name: googleName } = req.body;

        let email = googleEmail;
        let name = googleName;

        if (credential) {
            try {
                const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
                if (response.ok) {
                    const payload = await response.json();
                    if (payload.email) email = payload.email;
                    if (payload.name) name = payload.name;
                }
            } catch {
                // Ignore fetch error fallback
            }
        }

        if (!email) {
            return res.status(400).json({ message: "Google authentication failed: Email missing" });
        }

        const mail = email.trim().toLowerCase();

        if (!mail.endsWith("@nith.ac.in")) {
            return res.status(400).json({ message: "Only @nith.ac.in Google accounts can join WWHS? x NITH." });
        }

        let user = await Auth.findOne({ email: mail });

        if (!user) {
            const randomPassword = Math.random().toString(36).slice(-10) + "A1!";
            const hashPassword = await bcrypt.hash(randomPassword, 10);
            user = await Auth.create({
                name: name || mail.split("@")[0],
                email: mail,
                password: hashPassword,
                isVerified: true,
            });
        } else if (!user.isVerified) {
            user.isVerified = true;
            await user.save();
        }

        const token = generateToken(user);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Google login successful",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isVerified: true,
            }
        });
    } catch (error) {
        console.error("Google Auth error:", error);
        return res.status(500).json({ message: "Google authentication failed" });
    }
};
