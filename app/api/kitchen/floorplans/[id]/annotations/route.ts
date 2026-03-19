import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { floorplanAnnotations } from '@/lib/db/schema';
import { newId } from '@/lib/utils/id';
import { eq } from 'drizzle-orm';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: floorplanId } = await params;
  const rows = db.select().from(floorplanAnnotations).where(eq(floorplanAnnotations.floorplanId, floorplanId)).all();
  return NextResponse.json(rows);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: floorplanId } = await params;
  const annotations = await req.json() as Array<{
    equipmentId?: string; label?: string; xPct: number; yPct: number;
    rotationDeg?: number; widthPct?: number; heightPct?: number; color?: string;
  }>;

  db.delete(floorplanAnnotations).where(eq(floorplanAnnotations.floorplanId, floorplanId)).run();
  for (const a of annotations) {
    db.insert(floorplanAnnotations).values({
      id: newId(),
      floorplanId,
      equipmentId: a.equipmentId ?? null,
      label: a.label ?? null,
      xPct: a.xPct,
      yPct: a.yPct,
      rotationDeg: a.rotationDeg ?? 0,
      widthPct: a.widthPct ?? 0.08,
      heightPct: a.heightPct ?? 0.08,
      color: a.color ?? '#4f46e5',
    }).run();
  }
  return NextResponse.json({ ok: true });
}
