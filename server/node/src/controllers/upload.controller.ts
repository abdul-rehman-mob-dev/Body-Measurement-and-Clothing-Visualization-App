import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env';
import fs from 'fs';
import path from 'path';

const uploadsDir = path.resolve(__dirname, '../../uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const isAwsConfigured = env.AWS_ACCESS_KEY_ID && env.AWS_ACCESS_KEY_ID !== 'your_access_key';

const s3Client = isAwsConfigured
  ? new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    })
  : null;

export async function getPresignedUrl(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      res.status(400).json({ error: 'fileName and fileType are required' });
      return;
    }

    const key = `users/${req.user!.uid}/scans/${Date.now()}-${fileName}`;

    if (s3Client) {
      const command = new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: key,
        ContentType: fileType,
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });

      res.json({
        uploadUrl: url,
        key,
        fileUrl: `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`,
      });
    } else {
      // Local mode: return local path
      const localPath = path.join(uploadsDir, key.replace(/\//g, '_'));
      res.json({
        uploadUrl: `http://localhost:${env.PORT}/api/upload/local/${encodeURIComponent(key)}`,
        key,
        fileUrl: `file://${localPath}`,
        local: true,
      });
    }
  } catch (error) {
    console.error('Get presigned URL error:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
}

export async function uploadPhoto(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const key = `users/${req.user!.uid}/scans/${Date.now()}-${req.file.originalname}`;

    if (s3Client) {
      const command = new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      });

      await s3Client.send(command);

      const fileUrl = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

      res.json({
        message: 'Photo uploaded successfully',
        url: fileUrl,
        key,
      });
    } else {
      // Local mode: save to uploads directory
      const filename = `${Date.now()}-${req.file.originalname}`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, req.file.buffer);

      res.json({
        message: 'Photo uploaded successfully (local)',
        url: `http://localhost:${env.PORT}/uploads/${filename}`,
        key: filename,
        local: true,
      });
    }
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
}
