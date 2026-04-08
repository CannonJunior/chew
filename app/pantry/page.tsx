import { db } from '@/lib/db/client';
import { groceryItems, receipts } from '@/lib/db/schema';
import { desc, isNull, eq } from 'drizzle-orm';
import { PantryClient } from '@/components/pantry/PantryClient';

export default async function PantryPage() {
  const items = db
    .select({
      id: groceryItems.id,
      receiptId: groceryItems.receiptId,
      name: groceryItems.name,
      normalizedName: groceryItems.normalizedName,
      category: groceryItems.category,
      quantity: groceryItems.quantity,
      unit: groceryItems.unit,
      price: groceryItems.price,
      purchaseDate: groceryItems.purchaseDate,
      expiryDate: groceryItems.expiryDate,
      runningLow: groceryItems.runningLow,
      remainingPct: groceryItems.remainingPct,
      removedAt: groceryItems.removedAt,
      removalReason: groceryItems.removalReason,
      notes: groceryItems.notes,
      wikiId: groceryItems.wikiId,
      createdAt: groceryItems.createdAt,
      receiptImagePath: receipts.imagePath,
      receiptMerchant: receipts.merchantName,
      receiptDate: receipts.receiptDate,
    })
    .from(groceryItems)
    .leftJoin(receipts, eq(groceryItems.receiptId, receipts.id))
    .where(isNull(groceryItems.removedAt))
    .orderBy(desc(groceryItems.createdAt))
    .all();

  return <PantryClient initialItems={items} />;
}
