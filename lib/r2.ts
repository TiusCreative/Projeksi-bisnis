import { S3Client } from "@aws-sdk/client-s3";

// Konfigurasi R2 Storage berdasarkan kredensial Cloudflare Anda
// Sangat disarankan untuk memindahkan key ke variabel lingkungan (.env)
export const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT || "https://dd3d0162fefacc8b01a83ca376d06947.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_KEY || "",
  },
});

export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://pub-b34ce52d222b44fb80f6d52eda54d537.r2.dev";
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "projeksi-bisnis";
