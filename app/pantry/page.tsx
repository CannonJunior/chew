import { db } from '@/lib/db/client';
import { groceryItems } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { PantryClient } from '@/components/pantry/PantryClient';

export default async function PantryPage() {
  const items = db.select().from(groceryItems).orderBy(desc(groceryItems.createdAt)).all();
  const runningLow = items.filter((i) => i.runningLow === 1);

  return <PantryClient initialItems={items} initialRunningLow={runningLow} />;
}
