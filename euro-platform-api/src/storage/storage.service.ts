import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';
import storageConfig from './storage.config';
import { SignedUpload } from './interfaces/signed-upload.interface';

const SIGNED_URL_TTL_MS = 15 * 60 * 1000;

@Injectable()
export class StorageService {
  private readonly storage: Storage;

  constructor(
    @Inject(storageConfig.KEY)
    private readonly config: ConfigType<typeof storageConfig>,
  ) {
    // Inline credentials when provided (Railway); otherwise the client picks up
    // GOOGLE_APPLICATION_CREDENTIALS, the mounted key-file path used by docker-compose.
    this.storage = new Storage({
      projectId: config.projectId,
      ...(config.credentialsJson
        ? { credentials: JSON.parse(config.credentialsJson) as Record<string, unknown> }
        : {}),
    });
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

  async deleteObject(objectKey: string): Promise<void> {
    await this.storage.bucket(this.config.bucketName).file(objectKey).delete({ ignoreNotFound: true });
  }

  // Reverses the URL shape generated in generateUploadUrl() above -- null if the URL isn't
  // actually one of ours (e.g. hand-pasted from elsewhere before this flow existed).
  getObjectKeyFromPublicUrl(url: string): string | null {
    const prefix = `https://storage.googleapis.com/${this.config.bucketName}/`;
    return url.startsWith(prefix) ? url.slice(prefix.length) : null;
  }
}
