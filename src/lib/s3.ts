import { S3Client } from '@aws-sdk/client-s3';

const endpoint = process.env.MINIO_ENDPOINT || 'http://localhost:9000';

export const s3 = new S3Client({
  endpoint,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  },
  forcePathStyle: true,
});

export const BUCKETS = {
  AVATARS: 'birdieboard-avatars',
  TOUR_IMAGES: 'birdieboard-tour-images',
  ROUND_PHOTOS: 'birdieboard-round-photos',
} as const;
