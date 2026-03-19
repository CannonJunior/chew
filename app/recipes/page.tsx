import { db } from '@/lib/db/client';
import { recipes } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { RecipesClient } from '@/components/recipes/RecipesClient';

export default function RecipesPage() {
  const allRecipes = db.select().from(recipes).orderBy(desc(recipes.createdAt)).all();
  return <RecipesClient initialRecipes={allRecipes} />;
}
