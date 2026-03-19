'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Heart, RefreshCw, Plus, ExternalLink, Clock, Rss } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type Post = {
  id: string;
  sourceId: string | null;
  title: string | null;
  description: string | null;
  url: string;
  imageUrl: string | null;
  author: string | null;
  publishedAt: number | null;
  liked: number | null;
};

type Source = {
  id: string;
  name: string;
  type: string;
  url: string;
  active: number | null;
  lastFetched: number | null;
};

const DEFAULT_SOURCES = [
  { name: 'r/food', type: 'reddit_rss', url: 'https://www.reddit.com/r/food.rss' },
  { name: 'r/cooking', type: 'reddit_rss', url: 'https://www.reddit.com/r/cooking.rss' },
  { name: 'Serious Eats', type: 'rss', url: 'https://www.seriouseats.com/feed/all' },
  { name: 'Food52', type: 'rss', url: 'https://food52.com/blog/feed' },
];

function PostCard({ post, onLike }: { post: Post; onLike: (id: string) => void }) {
  const isLiked = post.liked === 1;
  const publishedAgo = post.publishedAt
    ? formatDistanceToNow(new Date(post.publishedAt * 1000), { addSuffix: true })
    : null;

  return (
    <Card className="overflow-hidden">
      {post.imageUrl && (
        <div className="aspect-video overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.imageUrl}
            alt={post.title ?? ''}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}
      <CardContent className="p-4 space-y-2">
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-sm leading-tight hover:underline line-clamp-2 flex gap-1 items-start"
        >
          {post.title}
          <ExternalLink className="w-3 h-3 shrink-0 mt-0.5 text-muted-foreground" />
        </a>
        {post.description && (
          <p className="text-xs text-muted-foreground line-clamp-3">{post.description}</p>
        )}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {post.author && <span>{post.author}</span>}
            {publishedAgo && (
              <span className="flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                {publishedAgo}
              </span>
            )}
          </div>
          <button
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-1 text-xs transition-colors ${isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'}`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export function SocialClient({
  initialPosts,
  initialSources,
}: {
  initialPosts: Post[];
  initialSources: Source[];
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [sources, setSources] = useState(initialSources);
  const [refreshing, setRefreshing] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', url: '', type: 'rss' });
  const [addingSource, setAddingSource] = useState(false);
  const [filter, setFilter] = useState<'all' | 'liked'>('all');

  const displayed = useMemo(
    () => filter === 'liked' ? posts.filter((p) => p.liked === 1) : posts,
    [posts, filter]
  );

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const res = await fetch('/api/social/refresh', { method: 'POST' });
      const { added } = await res.json();
      // Reload posts
      const postsRes = await fetch('/api/social/posts');
      setPosts(await postsRes.json());
      toast.success(`Refreshed — ${added} new post${added !== 1 ? 's' : ''}`);
    } catch {
      toast.error('Refresh failed');
    } finally {
      setRefreshing(false);
    }
  }

  async function handleLike(id: string) {
    const res = await fetch(`/api/social/posts/${id}/like`, { method: 'POST' });
    const { liked } = await res.json();
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, liked } : p)));
  }

  async function addDefaultSources() {
    for (const s of DEFAULT_SOURCES) {
      const exists = sources.find((src) => src.url === s.url);
      if (!exists) {
        const res = await fetch('/api/social/sources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(s),
        });
        const source = await res.json();
        setSources((prev) => [...prev, source]);
      }
    }
    toast.success('Default sources added — click Refresh to load posts');
  }

  async function handleAddSource() {
    if (!addForm.name.trim() || !addForm.url.trim()) return;
    setAddingSource(true);
    try {
      const res = await fetch('/api/social/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      const source = await res.json();
      setSources((prev) => [...prev, source]);
      setAddForm({ name: '', url: '', type: 'rss' });
      toast.success('Source added');
    } catch {
      toast.error('Failed to add source');
    } finally {
      setAddingSource(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Social</h1>
          <p className="text-muted-foreground text-sm">{posts.length} posts • {sources.length} sources</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowSources(true)}>
            <Rss className="w-4 h-4 mr-2" />
            Sources
          </Button>
          <Button size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b">
        {(['all', 'liked'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${filter === f ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {f === 'liked' ? '❤️ Saved' : 'All'}
          </button>
        ))}
      </div>

      {displayed.length === 0 && (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          <Rss className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">
            {sources.length === 0 ? 'No sources configured' : 'No posts yet'}
          </p>
          <p className="text-sm mt-1">
            {sources.length === 0
              ? 'Add RSS sources or use the defaults'
              : 'Click Refresh to fetch the latest posts'}
          </p>
          {sources.length === 0 && (
            <Button className="mt-4" onClick={addDefaultSources}>
              Add Default Sources
            </Button>
          )}
        </div>
      )}

      {displayed.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((post) => (
            <PostCard key={post.id} post={post} onLike={handleLike} />
          ))}
        </div>
      )}

      {/* Sources Dialog */}
      <Dialog open={showSources} onOpenChange={setShowSources}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Feed Sources</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {sources.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sources yet.</p>
            ) : (
              <ul className="space-y-2">
                {sources.map((s) => (
                  <li key={s.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-xs">{s.url}</p>
                    </div>
                    <Badge variant="outline">{s.type}</Badge>
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t pt-4 space-y-3">
              <p className="text-sm font-medium">Add Source</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Name</Label>
                  <Input value={addForm.name} onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))} placeholder="My Feed" />
                </div>
                <div>
                  <Label className="text-xs">Type</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                    value={addForm.type}
                    onChange={(e) => setAddForm((p) => ({ ...p, type: e.target.value }))}
                  >
                    <option value="rss">RSS</option>
                    <option value="reddit_rss">Reddit RSS</option>
                    <option value="youtube_atom">YouTube Atom</option>
                  </select>
                </div>
              </div>
              <div>
                <Label className="text-xs">URL</Label>
                <Input value={addForm.url} onChange={(e) => setAddForm((p) => ({ ...p, url: e.target.value }))} placeholder="https://..." />
              </div>
              <Button size="sm" onClick={handleAddSource} disabled={addingSource || !addForm.name.trim() || !addForm.url.trim()}>
                <Plus className="w-3 h-3 mr-1" />
                {addingSource ? 'Adding...' : 'Add Source'}
              </Button>
            </div>

            {sources.length === 0 && (
              <Button size="sm" variant="outline" onClick={addDefaultSources} className="w-full">
                Add Default Sources (Reddit, Serious Eats, Food52)
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
