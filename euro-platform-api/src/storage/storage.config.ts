import { registerAs } from '@nestjs/config';

export default registerAs('gcs', () => ({
  bucketName: process.env.GCS_BUCKET_NAME as string,
  projectId: process.env.GCS_PROJECT_ID as string,
}));
