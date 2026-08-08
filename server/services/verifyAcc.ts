import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { generateToken } from "./authToken";

dotenv.config();
const FRONTEND_URL = process.env.FRONTEND_PROD_URL;
const brand = "WWHS? x NITH";

export const verifyAcc = async (user: any) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER!,
        pass: process.env.MAIL_PASS!,
      },
    });

    const randomHash = generateToken(user);
    const verifyUrl = `${FRONTEND_URL}/verify-email?hash=${randomHash}`;

    await transporter.sendMail({
      from: `"${brand}" <${process.env.MAIL_USER!}>`,
      to: user.email,
      subject: `Confirm your email for ${brand}`,
      // Plain text fallback dramatically improves email deliverability & prevents spam classification
      text: `Welcome to ${brand}!\n\nPlease confirm your email address by visiting the link below:\n${verifyUrl}\n\nIf you did not request this account, please ignore this email.`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirm Your Email</title>
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
                        <h1>Confirm your email address</h1>
                        
                        <p>Welcome to <strong>${brand}</strong>! We're excited to have you on board. To get started, please confirm your email address.</p>
                        
                        <div class="btn-wrapper">
                            <a href="${verifyUrl}" style="display: inline-block; background-color: #22c55e; color: #ffffff !important; padding: 14px 32px; border-radius: 32px; text-decoration: none; font-weight: 600; font-size: 15px; text-align: center;" class="btn">Verify Email Address</a>
                        </div>
                        
                        <p style="font-size: 14px; color: #64748b;">
                            If you didn't create an account, you can safely ignore this email.
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
  } catch (error) {
    console.log(`${error}`);
    throw new Error(`While sending account verification email`);
  }
};
