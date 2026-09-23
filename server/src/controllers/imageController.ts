import { Request, Response, NextFunction } from 'express';
import { imageService } from '../services/imageService';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { ImageSlot } from '../types';

export class ImageController {
  /**
   * GET /api/admin/images
   */
  async listImages(req: Request, res: Response, next: NextFunction) {
    try {
      const { slot, isActive, serviceId } = req.query;
      const filters: { slot?: ImageSlot; isActive?: boolean; serviceId?: string } = {};

      if (slot && typeof slot === 'string') {
        filters.slot = slot.toUpperCase() as ImageSlot;
      }
      if (isActive !== undefined) {
        filters.isActive = isActive === 'true' || isActive === '1';
      }
      if (serviceId && typeof serviceId === 'string') {
        filters.serviceId = serviceId;
      }

      const images = await imageService.listImages(filters);
      return sendSuccess(res, images);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/admin/images
   * Accepts multipart/form-data or JSON with base64
   */
  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      let fileBuffer: Buffer | null = null;
      let filename: string = 'image.jpg';
      let mimetype: string = 'image/jpeg';
      let size: number = 0;

      // 1. Check if uploaded via multipart (multer)
      if (req.file) {
        fileBuffer = req.file.buffer;
        filename = req.file.originalname;
        mimetype = req.file.mimetype;
        size = req.file.size;
      } else if (req.body?.fileBase64) {
        // 2. Base64 JSON support
        const base64Str = req.body.fileBase64;
        const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          mimetype = matches[1];
          fileBuffer = Buffer.from(matches[2], 'base64');
        } else {
          fileBuffer = Buffer.from(base64Str, 'base64');
          if (req.body.mimetype) mimetype = req.body.mimetype;
        }
        filename = req.body.filename || `upload_${Date.now()}.${mimetype.split('/')[1] || 'jpg'}`;
        size = fileBuffer.length;
      }

      if (!fileBuffer) {
        return sendError(res, 'No image file provided. Please attach a file or base64 data.', 400);
      }

      const slot = (req.body.slot || 'GALLERY').toString().toUpperCase() as ImageSlot;
      const altText = req.body.altText ? String(req.body.altText).trim() : undefined;
      const serviceId = req.body.serviceId ? String(req.body.serviceId).trim() : undefined;
      const isActive = req.body.isActive !== undefined 
        ? (req.body.isActive === true || req.body.isActive === 'true' || req.body.isActive === '1')
        : true;

      const created = await imageService.uploadImage(
        { originalname: filename, mimetype, size, buffer: fileBuffer },
        { slot, altText, serviceId, isActive }
      );

      return sendSuccess(res, created, 'Image uploaded and registered successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/admin/images/:id
   */
  async updateMetadata(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { altText, isActive, slot, serviceId } = req.body;

      const updates: {
        altText?: string;
        isActive?: boolean;
        slot?: ImageSlot;
        serviceId?: string | null;
      } = {};

      if (altText !== undefined) updates.altText = String(altText);
      if (isActive !== undefined) updates.isActive = Boolean(isActive);
      if (slot !== undefined) updates.slot = String(slot).toUpperCase() as ImageSlot;
      if (serviceId !== undefined) updates.serviceId = serviceId ? String(serviceId) : null;

      const updated = await imageService.updateImageMetadata(id, updates);
      return sendSuccess(res, updated, 'Image metadata updated successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/admin/images/:id/file
   * Replace the underlying file for an existing image record
   */
  async replaceFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      let fileBuffer: Buffer | null = null;
      let filename: string = 'image.jpg';
      let mimetype: string = 'image/jpeg';
      let size: number = 0;

      if (req.file) {
        fileBuffer = req.file.buffer;
        filename = req.file.originalname;
        mimetype = req.file.mimetype;
        size = req.file.size;
      } else if (req.body?.fileBase64) {
        const base64Str = req.body.fileBase64;
        const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          mimetype = matches[1];
          fileBuffer = Buffer.from(matches[2], 'base64');
        } else {
          fileBuffer = Buffer.from(base64Str, 'base64');
          if (req.body.mimetype) mimetype = req.body.mimetype;
        }
        filename = req.body.filename || `replace_${Date.now()}.${mimetype.split('/')[1] || 'jpg'}`;
        size = fileBuffer.length;
      }

      if (!fileBuffer) {
        return sendError(res, 'No replacement image file provided.', 400);
      }

      const updated = await imageService.replaceImageFile(id, {
        originalname: filename,
        mimetype,
        size,
        buffer: fileBuffer,
      });

      return sendSuccess(res, updated, 'Image replaced successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/admin/images/:id
   */
  async deleteImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await imageService.deleteImage(id);
      return sendSuccess(res, { deletedId: id }, 'Image deleted successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/images/active
   * Public endpoint to get active images (for Hero, Services, Gallery, etc.)
   */
  async getActiveImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { slot, serviceId } = req.query;
      if (slot && typeof slot === 'string') {
        const slotUpper = slot.toUpperCase() as ImageSlot;
        const image = await imageService.getActiveImage(slotUpper, serviceId as string | undefined);
        return sendSuccess(res, image || null);
      }

      // Return all active images grouped by slot
      const allActive = await imageService.listImages({ isActive: true });
      return sendSuccess(res, allActive);
    } catch (err) {
      next(err);
    }
  }
}

export const imageController = new ImageController();
