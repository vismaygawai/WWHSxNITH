import nodemailer from "nodemailer";
import { generateToken } from "../services/authToken.js";
import { IAuth } from "../models/auth.js";
import dotenv from "dotenv";

dotenv.config();

export const sendEmail = async (user: Pick<IAuth, "name" | "email" | "_id">): Promise<boolean> => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER!,
      pass: process.env.MAIL_PASS!,
    },
  });

  const token = generateToken(user);
  const FRONTEND_URL = process.env.FRONTEND_PROD_URL;
  const brand = "WWHS? x NITH";
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"${brand}" <${process.env.MAIL_USER!}>`,
    to: `${user.email}`,
    subject: `Reset your ${brand} password`,
    text: `Hello,\n\nWe received a request to reset your ${brand} account password. Visit the link below to choose a new password:\n${resetUrl}\n\nIf you did not request a password reset, please ignore this email.`,
    html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    background-color: #F4F4F5;
                    margin: 0;
                    padding: 0;
                    color: #334155;
                }
                .wrapper {
                    width: 100%;
                    background-color: #F4F4F5;
                    padding: 40px 0;
                }
                .container {
                    max-width: 500px;
                    margin: 0 auto;
                    background-color: #FFFFFF;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    border: 1px solid #E2E8F0;
                }
                .content {
                    padding: 40px;
                    text-align: center;
                }
                h1 {
                    color: #0f172a;
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0 0 16px 0;
                }
                p {
                    color: #475569;
                    font-size: 16px;
                    line-height: 1.6;
                    margin: 0 0 24px 0;
                }
                .btn-wrapper {
                    margin: 32px 0;
                }
                .btn {
                    display: inline-block;
                    background-color: #22c55e;
                    color: #ffffff !important;
                    padding: 14px 32px;
                    border-radius: 32px; 
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 15px;
                }
                .footer {
                    padding: 30px;
                    text-align: center;
                    font-size: 12px;
                    color: #94a3b8;
                }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="container">
                    <div class="content">
                        <h1>Reset Password</h1>
                        
                        <p>Welcome to <strong>${brand}</strong>! We received a request to reset your password. Click the button below to choose a new password.</p>
                        
                        <div class="btn-wrapper">
                            <a href="${resetUrl}" style="display: inline-block; background-color: #22c55e; color: #ffffff !important; padding: 14px 32px; border-radius: 32px; text-decoration: none; font-weight: 600; font-size: 15px; text-align: center;" class="btn">Reset Password</a>
                        </div>
                        
                        <p style="font-size: 14px; color: #64748b;">
                            If you didn't request a password reset, you can safely ignore this email.
                        </p>
                    </div>
                </div>
                <div class="footer">
                    &copy; 2026 ${brand}. All rights reserved.<br>
                </div>
            </div>
        </body>
        </html>
    `,
  });
  return true;
};
