import { db } from '@/lib/db/client';
import { kitchenEquipment, kitchenFloorplans } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { KitchenClient } from '@/components/kitchen/KitchenClient';

export default function KitchenPage() {
  const equipment = db.select().from(kitchenEquipment).orderBy(desc(kitchenEquipment.createdAt)).all();
  const floorplans = db.select().from(kitchenFloorplans).orderBy(desc(kitchenFloorplans.createdAt)).all();
  return <KitchenClient initialEquipment={equipment} initialFloorplans={floorplans} />;
}
