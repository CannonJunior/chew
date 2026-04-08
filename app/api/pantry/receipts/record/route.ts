/**
 * POST /api/pantry/receipts/record
 *
 * Creates a receipt record and saves the uploaded image (with sharp enhancement)
 * WITHOUT running AI parsing. Returns the absolute image path so the caller
 * (Green's subprocess agent) can do vision inference externally.
 */
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { receipts } from '@/lib/db/schema';
import { newId } from '@/lib/utils/id';
import { now } from '@/lib/utils/time';
import { saveReceiptImage } from '@/lib/utils/upload';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
  }

  const id = newId();
  const buffer = Buffer.from(await file.arrayBuffer());
  const imagePath = await saveReceiptImage(buffer, id); // relative: uploads/receipts/<id>.jpg

  db.insert(receipts).values({
    id,
    imagePath,
    uploadDate: now(),
    processed: 0,
    itemCount: 0,
  }).run();

  // Return absolute path so the Green subprocess can read the file directly
  const absoluteImagePath = path.join(process.cwd(), imagePath);

  return NextResponse.json({ id, imagePath: absoluteImagePath });
}
