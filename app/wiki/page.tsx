import { db } from '@/lib/db/client';
import { wikiIngredients } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { WikiClient } from '@/components/wiki/WikiClient';

export default function WikiPage() {
  const ingredients = db.select().from(wikiIngredients).orderBy(desc(wikiIngredients.createdAt)).all();
  return <WikiClient initialIngredients={ingredients} />;
}
