import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { kitchenFloorplans } from '@/lib/db/schema';
import { newId } from '@/lib/utils/id';
import { now } from '@/lib/utils/time';
import { desc } from 'drizzle-orm';
import { saveEquipmentImage } from '@/lib/utils/upload';

export async function GET() {
  const rows = db.select().from(kitchenFloorplans).orderBy(desc(kitchenFloorplans.createdAt)).all();
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('image') as File | null;
  const name = (form.get('name') as string) ?? 'My Kitchen';
  const widthFt = form.get('widthFt') ? parseFloat(form.get('widthFt') as string) : null;
  const heightFt = form.get('heightFt') ? parseFloat(form.get('heightFt') as string) : null;

  if (!file) return NextResponse.json({ error: 'image required' }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buf = Buffer.from(bytes);
  const imagePath = await saveEquipmentImage(buf, file.name);

  const fp = {
    id: newId(),
    name,
    imagePath,
    widthFt,
    heightFt,
    createdAt: now(),
  };
  db.insert(kitchenFloorplans).values(fp).run();
  return NextResponse.json(fp, { status: 201 });
}
