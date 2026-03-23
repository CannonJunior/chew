import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { recipeSteps } from '@/lib/db/schema';
import { newId } from '@/lib/utils/id';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: recipeId } = await params;
  const body = await req.json();
  const step = {
    id: newId(),
    recipeId,
    stepNumber: body.stepNumber as number,
    instruction: body.instruction as string,
    durationMin: (body.durationMin ?? null) as number | null,
    tip: (body.tip ?? null) as string | null,
    imagePath: (body.imagePath ?? null) as string | null,
  };
  db.insert(recipeSteps).values(step).run();
  return NextResponse.json(step, { status: 201 });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: recipeId } = await params;
  const steps = await req.json() as Array<{ stepNumber: number; instruction: string; durationMin?: number; tip?: string }>;
  db.delete(recipeSteps).where(eq(recipeSteps.recipeId, recipeId)).run();
  if (steps.length > 0) {
    db.insert(recipeSteps).values(
      steps.map((s) => ({
        id: newId(),
        recipeId,
        stepNumber: s.stepNumber,
        instruction: s.instruction,
        durationMin: s.durationMin ?? null,
        tip: s.tip ?? null,
        imagePath: null,
      }))
    ).run();
  }
  return NextResponse.json({ ok: true });
}
