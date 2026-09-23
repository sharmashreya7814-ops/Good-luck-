import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface FilePayload {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface StorageResult {
  storageKey: string;
  publicUrl: string;
}

export interface StorageProvider {
  saveFile(payload: FilePayload, customFilename?: string): Promise<StorageResult>;
  deleteFile(storageKey: string): Promise<boolean>;
  getFileUrl(storageKey: string): string;
}

/**
 * Local file system storage implementation for development and testing.
 * Stores files under public/uploads and serves them with clean public URLs.
 * Designed with path traversal prevention and unique key generation.
 */
export class LocalStorageProvider implements StorageProvider {
  private uploadsDir: string;
  private publicPrefix: string;

  constructor(uploadsDir?: string, publicPrefix: string = '/uploads') {
    this.uploadsDir = uploadsDir || path.resolve(process.cwd(), 'public', 'uploads');
    this.publicPrefix = publicPrefix;

    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  getUploadsDirectory(): string {
    return this.uploadsDir;
  }

  private sanitizeExtension(mimeType: string, originalName: string): string {
    const ext = path.extname(originalName).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      return ext === '.jpeg' ? '.jpg' : ext;
    }
    if (mimeType === 'image/png') return '.png';
    if (mimeType === 'image/webp') return '.webp';
    return '.jpg';
  }

  async saveFile(payload: FilePayload, customFilename?: string): Promise<StorageResult> {
    const ext = this.sanitizeExtension(payload.mimeType, payload.originalName);
    const safeRandom = crypto.randomBytes(6).toString('hex');
    const filename = customFilename 
      ? path.basename(customFilename).replace(/[^a-zA-Z0-9._-]/g, '_')
      : `img_${Date.now()}_${safeRandom}${ext}`;

    const safeFilename = path.basename(filename); // Prevent path traversal
    const destinationPath = path.join(this.uploadsDir, safeFilename);

    // Verify resolved path stays inside uploadsDir
    if (!destinationPath.startsWith(this.uploadsDir)) {
      throw new Error('Invalid destination path - directory traversal detected.');
    }

    await fs.promises.writeFile(destinationPath, payload.buffer);

    return {
      storageKey: safeFilename,
      publicUrl: `${this.publicPrefix}/${safeFilename}`,
    };
  }

  async deleteFile(storageKey: string): Promise<boolean> {
    try {
      const safeKey = path.basename(storageKey);
      const filePath = path.join(this.uploadsDir, safeKey);
      if (filePath.startsWith(this.uploadsDir) && fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch (err) {
      console.warn(`[LocalStorageProvider] Warning: could not delete file "${storageKey}":`, err);
      return false;
    }
  }

  getFileUrl(storageKey: string): string {
    const safeKey = path.basename(storageKey);
    return `${this.publicPrefix}/${safeKey}`;
  }
}

// Default storage instance (Local development, swap with S3/GCS provider for persistent cloud hosting)
export const storageProvider: StorageProvider = new LocalStorageProvider();
