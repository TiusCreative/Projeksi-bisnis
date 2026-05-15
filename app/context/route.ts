import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

const S3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT as string,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.R2_SECRET_KEY as string,
  },
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang diunggah' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `logos/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;

    await S3.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME as string,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    }));

    const fileUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Gagal mengunggah file' }, { status: 500 });
  }
}