import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';
import storageConfig from './storage.config';

export interface SignedUpload {
  uploadUrl: string;
  publicUrl: string;
}

const SIGNED_URL_TTL_MS = 15 * 60 * 1000;

// GOOGLE_APPLICATION_CREDENTIALS (set in docker-compose, pointing at the mounted
// service-account key) is picked up automatically by the client library -- no keyFilename here.
@Injectable()
export class StorageService {
  private readonly storage: Storage;

  constructor(
    @Inject(storageConfig.KEY)
    private readonly config: ConfigType<typeof storageConfig>,
  ) {
    this.storage = new Storage({ projectId: config.projectId });
  }

  async generateUploadUrl(objectKey: string, contentType: string): Promise<SignedUpload> {
    const [uploadUrl] = await this.storage
      .bucket(this.config.bucketName)
      .file(objectKey)
      .getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + SIGNED_URL_TTL_MS,
        contentType,
      });

    return {
      uploadUrl,
      publicUrl: `https://storage.googleapis.com/${this.config.bucketName}/${objectKey}`,
    };
  }
}
