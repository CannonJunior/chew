import { db } from '@/lib/db/client';
import { socialPosts, socialSources } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { SocialClient } from '@/components/social/SocialClient';

export default function SocialPage() {
  const posts = db.select().from(socialPosts).orderBy(desc(socialPosts.publishedAt)).limit(100).all();
  const sources = db.select().from(socialSources).orderBy(desc(socialSources.createdAt)).all();
  return <SocialClient initialPosts={posts} initialSources={sources} />;
}
