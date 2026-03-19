import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './uploads';

export async function saveReceiptImage(buffer: Buffer, id: string): Promise<string> {
  const dir = path.join(process.cwd(), UPLOAD_DIR, 'receipts');
  fs.mkdirSync(dir, { recursive: true });

  const filename = `${id}.jpg`;
  const filepath = path.join(dir, filename);

  // Enhance image for OCR: convert to grayscale, increase contrast
  await sharp(buffer)
    .resize({ width: 2000, withoutEnlargement: true })
    .grayscale()
    .normalise()
    .jpeg({ quality: 90 })
    .toFile(filepath);

  return `uploads/receipts/${filename}`;
}

export async function saveEquipmentImage(buffer: Buffer, id: string): Promise<string> {
  const dir = path.join(process.cwd(), UPLOAD_DIR, 'equipment');
  fs.mkdirSync(dir, { recursive: true });
  const filename = `${id}.jpg`;
  await sharp(buffer)
    .resize({ width: 800, withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toFile(path.join(dir, filename));
  return `uploads/equipment/${filename}`;
}
