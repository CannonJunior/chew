/**
 * POST /api/kitchen/equipment/record
 *
 * Creates a kitchen equipment record and saves the uploaded image (via sharp)
 * WITHOUT running AI identification. Returns the absolute image path so the
 * caller (Green's subprocess agent) can do vision inference externally.
 */
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { kitchenEquipment } from '@/lib/db/schema';
import { newId } from '@/lib/utils/id';
import { now } from '@/lib/utils/time';
import { saveEquipmentImage } from '@/lib/utils/upload';

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
  const imagePath = await saveEquipmentImage(buffer, id); // relative: uploads/equipment/<id>.jpg

  db.insert(kitchenEquipment).values({
    id,
    name: 'Unidentified Equipment',
    imagePath,
    createdAt: now(),
  }).run();

  // Return absolute path so the Green subprocess can read the file directly
  const absoluteImagePath = path.join(process.cwd(), imagePath);

  return NextResponse.json({ id, imagePath: absoluteImagePath });
}
