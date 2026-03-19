import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { receipts } from '@/lib/db/schema';
import { newId } from '@/lib/utils/id';
import { now } from '@/lib/utils/time';
import { saveReceiptImage } from '@/lib/utils/upload';
import { parseReceiptImage } from '@/lib/ollama/receipt-parser';
import { desc, eq } from 'drizzle-orm';

export async function GET() {
  const rows = db.select().from(receipts).orderBy(desc(receipts.uploadDate)).all();
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
  }

  const id = newId();
  const buffer = Buffer.from(await file.arrayBuffer());
  const imagePath = await saveReceiptImage(buffer, id);

  // Save receipt record
  db.insert(receipts).values({
    id,
    imagePath,
    uploadDate: now(),
    processed: 0,
    itemCount: 0,
  }).run();

  // Parse with Ollama vision (may fail if model not available)
  try {
    const parsed = await parseReceiptImage(imagePath);
    db.update(receipts)
      .set({ processed: 1, itemCount: parsed.length, rawLlmOutput: JSON.stringify(parsed) })
      .where(eq(receipts.id, id))
      .run();
    return NextResponse.json({ id, imagePath, items: parsed });
  } catch (err) {
    // Return receipt ID even if parsing fails — user can add items manually
    console.error('Vision model error (is llava installed?):', err);
    return NextResponse.json({
      id,
      imagePath,
      items: [],
      warning: 'Vision model unavailable. Add items manually or install llava: ollama pull llava',
    });
  }
}
