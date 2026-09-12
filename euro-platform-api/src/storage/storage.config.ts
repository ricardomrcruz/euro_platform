import { registerAs } from '@nestjs/config';

export default registerAs('gcs', () => ({
  bucketName: process.env.GCS_BUCKET_NAME as string,
  projectId: process.env.GCS_PROJECT_ID as string,
  // Inline service-account JSON, used where a key file can't be mounted (Railway). When
  // unset, the client falls back to GOOGLE_APPLICATION_CREDENTIALS (the mounted file path
  // used by docker-compose).
  credentialsJson: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
}));
