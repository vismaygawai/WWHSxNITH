import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

let s3Client: S3Client | null = null;

const accessKey = process.env.MY_AWS_ACCESS_KEY || process.env.AWS_ACCESS_KEY;
const secretKey = process.env.MY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

if (accessKey && secretKey) {
    try {
        s3Client = new S3Client({
            region: process.env.AWS_S3_REGION || "ap-south-1",
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
            },
        });
    } catch {
        s3Client = null;
    }
}

export const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
    const bucket = process.env.AWS_S3_BUCKET;

    // Check if valid AWS S3 bucket is configured
    if (s3Client && bucket && bucket !== "your-bucket-name" && !bucket.includes("YOUR_")) {
        const fileName = `chatRoom/img/${uuidv4()}`;
        const params = {
            Bucket: bucket,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        try {
            const command = new PutObjectCommand(params);
            await s3Client.send(command);
            const region = process.env.AWS_S3_REGION || "ap-south-1";
            return `https://${bucket}.s3.${region}.amazonaws.com/${fileName}`;
        } catch (error) {
            console.warn(`[S3 Upload Warning] S3 upload failed (${error}), falling back to Data URI encoding`);
        }
    }

    // Fail-safe Fallback: Convert image buffer to base64 Data URI so image sending NEVER fails
    const base64Image = file.buffer.toString("base64");
    return `data:${file.mimetype};base64,${base64Image}`;
};