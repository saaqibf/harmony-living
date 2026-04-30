import 'server-only';

import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { s3, S3_BUCKET } from './client';
import { env } from '@/lib/env';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/webm', 'audio/ogg'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

export class UploadError extends Error {
  constructor(
    public readonly code: 'TOO_LARGE' | 'INVALID_TYPE' | 'UPLOAD_FAILED',
    message: string,
  ) {
    super(message);
    this.name = 'UploadError';
  }
}

function s3Url(key: string): string {
  return `https://${S3_BUCKET}.s3.${env.AWS_S3_REGION}.amazonaws.com/${key}`;
}

async function putObject(key: string, body: Buffer, contentType: string): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      ServerSideEncryption: 'AES256',
    }),
  );
  return s3Url(key);
}

export async function deleteObject(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
}

export type ProfilePhotoResult = {
  photoUrl: string;
  photoUrlBlurred: string;
};

export async function uploadProfilePhoto(
  userId: string,
  buffer: Buffer,
  mimeType: string,
): Promise<ProfilePhotoResult> {
  if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    throw new UploadError('INVALID_TYPE', 'Profile photo must be JPEG, PNG, or WebP');
  }
  if (buffer.length > MAX_FILE_SIZE) {
    throw new UploadError('TOO_LARGE', 'Profile photo must be under 10 MB');
  }

  const ts = Date.now();

  // Resize to max 1200px on longest side, convert to JPEG for consistency
  const processed = await sharp(buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  // Blurred variant: 20px blur, downscaled to 400px (fast to load)
  const blurred = await sharp(buffer)
    .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
    .blur(20)
    .jpeg({ quality: 60 })
    .toBuffer();

  const [photoUrl, photoUrlBlurred] = await Promise.all([
    putObject(`profiles/${userId}/photo-${ts}.jpg`, processed, 'image/jpeg'),
    putObject(`profiles/${userId}/photo-${ts}-blurred.jpg`, blurred, 'image/jpeg'),
  ]);

  return { photoUrl, photoUrlBlurred };
}

export async function uploadListingImage(
  listingId: string,
  buffer: Buffer,
  mimeType: string,
  orderIdx: number,
): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    throw new UploadError('INVALID_TYPE', 'Listing image must be JPEG, PNG, or WebP');
  }
  if (buffer.length > MAX_FILE_SIZE) {
    throw new UploadError('TOO_LARGE', 'Listing image must be under 10 MB');
  }

  const ts = Date.now();
  const processed = await sharp(buffer)
    .resize(1600, 1200, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  return putObject(
    `listings/${listingId}/image-${orderIdx}-${ts}.jpg`,
    processed,
    'image/jpeg',
  );
}

export async function uploadIntroMedia(
  userId: string,
  buffer: Buffer,
  mimeType: string,
): Promise<{ url: string; mediaType: 'VOICE' | 'VIDEO' }> {
  const isAudio = ALLOWED_AUDIO_TYPES.includes(mimeType);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType);

  if (!isAudio && !isVideo) {
    throw new UploadError('INVALID_TYPE', 'Intro media must be an audio or video file');
  }
  if (buffer.length > MAX_FILE_SIZE) {
    throw new UploadError('TOO_LARGE', 'Intro media must be under 10 MB');
  }

  const ts = Date.now();
  const extMap: Record<string, string> = {
    'audio/mpeg': 'mp3',
    'audio/mp4': 'm4a',
    'audio/webm': 'webm',
    'audio/ogg': 'ogg',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
  };
  const ext = extMap[mimeType] ?? 'bin';
  const key = `profiles/${userId}/intro-${ts}.${ext}`;
  const url = await putObject(key, buffer, mimeType);

  return { url, mediaType: isAudio ? 'VOICE' : 'VIDEO' };
}
