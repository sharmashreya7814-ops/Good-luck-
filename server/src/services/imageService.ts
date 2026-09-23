import path from 'path';
import { db } from '../db/dbClient';
import { storageProvider } from '../storage/storageProvider';
import { ImageModel, ImageSlot } from '../types';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const VALID_SLOTS = new Set<ImageSlot>(['HERO', 'ABOUT', 'GALLERY', 'SERVICE', 'LOGO']);

export class ImageService {
  /**
   * Validate uploaded image buffer, mime type, extension, and file size
   */
  validateFile(file: { originalname?: string; mimetype?: string; size?: number; buffer?: Buffer }) {
    if (!file || !file.buffer || !file.size) {
      throw { status: 400, message: 'No valid image file was uploaded.' };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      throw { 
        status: 400, 
        message: `Image file size (${sizeMb} MB) exceeds the maximum allowed limit of 5.00 MB.` 
      };
    }

    const mime = (file.mimetype || '').toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mime)) {
      throw { 
        status: 400, 
        message: `Unsupported image format: "${mime}". Only JPEG, PNG, and WebP images are allowed.` 
      };
    }

    const ext = path.extname(file.originalname || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      throw { 
        status: 400, 
        message: `Unsupported file extension "${ext}". Allowed extensions: .jpg, .jpeg, .png, .webp.` 
      };
    }
  }

  /**
   * Validate slot & service association
   */
  async validateMetadata(slot: ImageSlot, serviceId?: string | null, altText?: string) {
    if (!VALID_SLOTS.has(slot)) {
      throw {
        status: 400,
        message: `Invalid image slot "${slot}". Allowed slots: HERO, ABOUT, GALLERY, SERVICE, LOGO.`,
      };
    }

    if (slot === 'SERVICE' && serviceId) {
      const service = await db.getServiceById(serviceId);
      if (!service) {
        throw {
          status: 400,
          message: `Referenced service "${serviceId}" does not exist in the service catalog.`,
        };
      }
    }
  }

  /**
   * List all images with optional filters
   */
  async listImages(filters?: { slot?: ImageSlot; isActive?: boolean; serviceId?: string }): Promise<ImageModel[]> {
    return await db.getImages(filters);
  }

  /**
   * Get single image by ID
   */
  async getImageById(id: string): Promise<ImageModel> {
    const image = await db.getImageById(id);
    if (!image) {
      throw { status: 404, message: `Image with ID "${id}" was not found.` };
    }
    return image;
  }

  /**
   * Get active image for a specific slot (public safe endpoint)
   */
  async getActiveImage(slot: ImageSlot, serviceId?: string): Promise<ImageModel | null> {
    return await db.getActiveImageForSlot(slot, serviceId);
  }

  /**
   * Upload and persist new image
   */
  async uploadImage(
    file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
    data: { slot: ImageSlot; altText?: string; serviceId?: string | null; isActive?: boolean }
  ): Promise<ImageModel> {
    this.validateFile(file);
    await this.validateMetadata(data.slot, data.serviceId, data.altText);

    const safeAltText = (data.altText || '').trim() || `Good Luck Hair Salon - ${data.slot} visual`;
    const isActive = data.isActive !== undefined ? Boolean(data.isActive) : true;

    // Save to storage provider
    const storageResult = await storageProvider.saveFile({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    });

    const newImage = await db.createImage({
      slot: data.slot,
      serviceId: data.slot === 'SERVICE' ? (data.serviceId || null) : null,
      storageKey: storageResult.storageKey,
      publicUrl: storageResult.publicUrl,
      altText: safeAltText,
      mimeType: file.mimetype,
      fileSize: file.size,
      isActive,
    });

    return newImage;
  }

  /**
   * Replace image file keeping metadata
   */
  async replaceImageFile(
    id: string,
    file: { originalname: string; mimetype: string; size: number; buffer: Buffer }
  ): Promise<ImageModel> {
    const existing = await this.getImageById(id);
    this.validateFile(file);

    // Save new file to storage
    const storageResult = await storageProvider.saveFile({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    });

    // Attempt to remove the old file from storage
    await storageProvider.deleteFile(existing.storageKey);

    const updated = await db.updateImage(id, {
      storageKey: storageResult.storageKey,
      publicUrl: storageResult.publicUrl,
      mimeType: file.mimetype,
      fileSize: file.size,
    });

    if (!updated) {
      throw { status: 500, message: 'Failed to update image record after storage write.' };
    }

    return updated;
  }

  /**
   * Update metadata (alt text, active status, slot, serviceId)
   */
  async updateImageMetadata(
    id: string,
    updates: { altText?: string; isActive?: boolean; slot?: ImageSlot; serviceId?: string | null }
  ): Promise<ImageModel> {
    const existing = await this.getImageById(id);

    if (updates.slot) {
      await this.validateMetadata(updates.slot, updates.serviceId !== undefined ? updates.serviceId : existing.serviceId);
    }

    const payload: Partial<ImageModel> = {};
    if (updates.altText !== undefined) {
      payload.altText = updates.altText.trim() || existing.altText;
    }
    if (updates.isActive !== undefined) {
      payload.isActive = Boolean(updates.isActive);
    }
    if (updates.slot !== undefined) {
      payload.slot = updates.slot;
      if (updates.slot !== 'SERVICE') {
        payload.serviceId = null;
      }
    }
    if (updates.serviceId !== undefined) {
      payload.serviceId = updates.serviceId;
    }

    const updated = await db.updateImage(id, payload);
    if (!updated) {
      throw { status: 404, message: `Image with ID "${id}" was not found.` };
    }

    return updated;
  }

  /**
   * Delete image from DB and storage provider
   */
  async deleteImage(id: string): Promise<boolean> {
    const existing = await this.getImageById(id);
    await storageProvider.deleteFile(existing.storageKey);
    return await db.deleteImage(id);
  }
}

export const imageService = new ImageService();
