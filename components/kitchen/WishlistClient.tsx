'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, ExternalLink, CheckCircle2, Circle, Star, ShoppingCart } from 'lucide-react';

export type WishlistItem = {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  priority: string | null;
  estimatedPrice: number | null;
  notes: string | null;
  url: string | null;
  imageUrl: string | null;
  acquired: number | null;
  sortOrder: number | null;
  createdAt: number;
};

const CATEGORIES = ['knives', 'cookware', 'bakeware', 'appliance', 'tool', 'modernist', 'storage', 'other'];

const PRIORITY_STYLES: Record<string, { badge: string; dot: string; label: string }> = {
  high:   { badge: 'bg-rose-100 text-rose-800 border-rose-200',   dot: 'bg-rose-500',   label: 'High' },
  medium: { badge: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500',  label: 'Medium' },
  low:    { badge: 'bg-sky-100 text-sky-800 border-sky-200',       dot: 'bg-sky-500',    label: 'Low' },
};

const CATEGORY_ICONS: Record<string, string> = {
  knives:    '🔪',
  cookware:  '🍳',
  bakeware:  '🥧',
  appliance: '⚡',
  tool:      '🔧',
  modernist: '🧪',
  storage:   '📦',
  other:     '✦',
};

// Two-slot crossfade state
type Slots = { a: string | null; b: string | null; active: 'a' | 'b' };

function formatPrice(p: number | null) {
  if (p == null) return null;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(p);
}

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

export function WishlistClient({ initialItems }: { initialItems: WishlistItem[] }) {
  const [items, setItems] = useState<WishlistItem[]>(initialItems);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [hideAcquired, setHideAcquired] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', brand: '', category: 'tool', priority: 'medium',
    estimatedPrice: '', notes: '', url: '',
  });

  // Image preview state
  const [slots, setSlots] = useState<Slots>({ a: null, b: null, active: 'a' });
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const imageCacheRef = useRef<Map<string, string[]>>(new Map());
  const fetchPromisesRef = useRef<Map<string, Promise<string[]>>>(new Map());
  const cycleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cycleIndexRef = useRef(0);

  useEffect(() => () => { if (cycleTimerRef.current) clearInterval(cycleTimerRef.current); }, []);

  const showImage = useCallback((url: string) => {
    setSlots((prev) => {
      const next = prev.active === 'a' ? 'b' : 'a';
      return { ...prev, [next]: url, active: next };
    });
  }, []);

  const startCycle = useCallback((images: string[]) => {
    if (cycleTimerRef.current) clearInterval(cycleTimerRef.current);
    if (!images.length) return;
    cycleIndexRef.current = 0;
    showImage(images[0]);
    if (images.length === 1) return;
    cycleTimerRef.current = setInterval(() => {
      cycleIndexRef.current = (cycleIndexRef.current + 1) % images.length;
      showImage(images[cycleIndexRef.current]);
    }, 5000);
  }, [showImage]);

  const fetchItemImages = useCallback(async (item: WishlistItem): Promise<string[]> => {
    const cached = imageCacheRef.current.get(item.id);
    if (cached !== undefined) return cached;
    const existing = fetchPromisesRef.current.get(item.id);
    if (existing) return existing;
    const query = [item.brand, item.name].filter(Boolean).join(' ');
    const promise = (async () => {
      try {
        const res = await fetch(`/api/kitchen/image?q=${encodeURIComponent(query)}`);
        const { images } = await res.json() as { images: string[] };
        imageCacheRef.current.set(item.id, images);
        return images;
      } catch {
        imageCacheRef.current.set(item.id, []);
        return [] as string[];
      } finally {
        fetchPromisesRef.current.delete(item.id);
      }
    })();
    fetchPromisesRef.current.set(item.id, promise);
    return promise;
  }, []);

  const handleItemHover = useCallback(async (item: WishlistItem) => {
    setHoveredName(item.name);
    const images = await fetchItemImages(item);
    startCycle(images);
  }, [fetchItemImages, startCycle]);

  const activeItems = items.filter((it) => {
    if (hideAcquired && it.acquired) return false;
    if (filterCategory !== 'all' && it.category !== filterCategory) return false;
    if (filterPriority !== 'all' && it.priority !== filterPriority) return false;
    return true;
  }).sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority ?? 'low'] ?? 2;
    const pb = PRIORITY_ORDER[b.priority ?? 'low'] ?? 2;
    if (pa !== pb) return pa - pb;
    return a.name.localeCompare(b.name);
  });

  const acquiredCount = items.filter((i) => i.acquired).length;
  const totalEstimated = items
    .filter((i) => !i.acquired && i.estimatedPrice)
    .reduce((s, i) => s + (i.estimatedPrice ?? 0), 0);

  async function handleAdd() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/kitchen/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          brand: form.brand.trim() || null,
          category: form.category,
          priority: form.priority,
          estimatedPrice: form.estimatedPrice ? parseFloat(form.estimatedPrice) : null,
          notes: form.notes.trim() || null,
          url: form.url.trim() || null,
        }),
      });
      const item = await res.json() as WishlistItem;
      setItems((prev) => [item, ...prev]);
      setShowAdd(false);
      setForm({ name: '', brand: '', category: 'tool', priority: 'medium', estimatedPrice: '', notes: '', url: '' });
      toast.success('Added to wish list');
    } catch {
      toast.error('Failed to add item');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleAcquired(item: WishlistItem) {
    const next = item.acquired ? 0 : 1;
    const res = await fetch(`/api/kitchen/wishlist/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acquired: next === 1 }),
    });
    const updated = await res.json() as WishlistItem;
    setItems((prev) => prev.map((i) => i.id === item.id ? updated : i));
    toast.success(next ? 'Marked as acquired!' : 'Moved back to wish list');
  }

  async function handleDelete(id: string) {
    await fetch(`/api/kitchen/wishlist/${id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success('Removed from wish list');
  }

  async function handlePriorityChange(item: WishlistItem, priority: string) {
    const res = await fetch(`/api/kitchen/wishlist/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority }),
    });
    const updated = await res.json() as WishlistItem;
    setItems((prev) => prev.map((i) => i.id === item.id ? updated : i));
  }

  const usedCategories = [...new Set(items.map((i) => i.category).filter(Boolean))] as string[];
  const hasImage = slots.a !== null || slots.b !== null;

  return (
    <>
      {/* Full-height left image panel */}
      <div
        aria-hidden
        className="fixed inset-y-0 left-0 pointer-events-none overflow-hidden"
        style={{ width: 'calc(100vw - 80rem)' }}
      >
        {slots.a && (
          <img
            src={slots.a}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out ${slots.active === 'a' ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
        {slots.b && (
          <img
            src={slots.b}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out ${slots.active === 'b' ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
        {hasImage && (
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-r from-transparent to-background" />
        )}
        {hasImage && hoveredName && (
          <div className="absolute bottom-0 inset-x-0 px-3 py-4 bg-gradient-to-t from-black/70 to-transparent">
            <p className="text-white text-xs font-medium leading-tight line-clamp-2">{hoveredName}</p>
          </div>
        )}
      </div>

    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Gear Wish List</h2>
            <Badge variant="outline" className="font-mono text-xs">
              {items.length - acquiredCount} remaining
            </Badge>
            {acquiredCount > 0 && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                {acquiredCount} acquired
              </Badge>
            )}
          </div>
          {totalEstimated > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">
              <ShoppingCart className="w-3.5 h-3.5 inline mr-1 opacity-60" />
              {formatPrice(totalEstimated)} estimated remaining
            </p>
          )}
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Category pills */}
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterCategory === 'all' ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            All
          </button>
          {usedCategories.sort().map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(filterCategory === cat ? 'all' : cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterCategory === cat ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              {CATEGORY_ICONS[cat] ?? '✦'} {cat}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-border mx-1 hidden sm:block" />

        {/* Priority filter */}
        <div className="flex gap-1">
          {['all', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(filterPriority === p ? 'all' : p)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                filterPriority === p
                  ? p === 'all' ? 'bg-foreground text-background border-foreground' : `${PRIORITY_STYLES[p]?.badge} border-current`
                  : 'bg-transparent border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {p === 'all' ? 'Any priority' : PRIORITY_STYLES[p]?.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setHideAcquired(!hideAcquired)}
          className={`ml-auto px-3 py-1 rounded-full text-xs font-medium transition-colors border ${hideAcquired ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`}
        >
          {hideAcquired ? 'Showing active' : 'Hide acquired'}
        </button>
      </div>

      {/* Items grid */}
      {activeItems.length === 0 ? (
        <div className="rounded-lg border border-dashed p-14 text-center text-muted-foreground">
          <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No items match these filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {activeItems.map((item) => {
            const priority = item.priority ?? 'medium';
            const ps = PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.medium;
            const isAcquired = Boolean(item.acquired);
            return (
              <div
                key={item.id}
                className={`rounded-xl border p-4 flex flex-col gap-3 transition-opacity ${isAcquired ? 'opacity-50' : 'hover:shadow-sm'}`}
                onMouseEnter={() => handleItemHover(item)}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold leading-snug ${isAcquired ? 'line-through text-muted-foreground' : ''}`}>
                      {item.name}
                    </p>
                    {item.brand && (
                      <p className="text-xs text-muted-foreground mt-0.5">{item.brand}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-muted-foreground hover:text-destructive shrink-0 mt-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  {item.category && (
                    <Badge variant="outline" className="text-xs">
                      {CATEGORY_ICONS[item.category] ?? '✦'} {item.category}
                    </Badge>
                  )}
                  <Badge variant="outline" className={`text-xs ${ps.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${ps.dot} mr-1.5 inline-block`} />
                    {ps.label}
                  </Badge>
                  {item.estimatedPrice != null && (
                    <span className="text-xs font-medium text-muted-foreground ml-auto">
                      {formatPrice(item.estimatedPrice)}
                    </span>
                  )}
                </div>

                {/* Notes */}
                {item.notes && (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {item.notes}
                  </p>
                )}

                {/* Action row */}
                <div className="flex items-center gap-2 mt-auto pt-1 border-t border-border/50">
                  <button
                    onClick={() => handleToggleAcquired(item)}
                    className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${isAcquired ? 'text-green-600 hover:text-muted-foreground' : 'text-muted-foreground hover:text-green-600'}`}
                  >
                    {isAcquired
                      ? <><CheckCircle2 className="w-4 h-4" /> Acquired</>
                      : <><Circle className="w-4 h-4" /> Mark acquired</>
                    }
                  </button>

                  {!isAcquired && (
                    <div className="ml-auto flex gap-1">
                      {(['high', 'medium', 'low'] as const).map((p) => (
                        <button
                          key={p}
                          title={`Set ${p} priority`}
                          onClick={() => handlePriorityChange(item, p)}
                          className={`w-2 h-2 rounded-full transition-transform ${PRIORITY_STYLES[p].dot} ${priority === p ? 'scale-150' : 'opacity-30 hover:opacity-70'}`}
                        />
                      ))}
                    </div>
                  )}

                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${!isAcquired ? '' : 'ml-auto'} text-muted-foreground hover:text-foreground`}
                      title="View product"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Item Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Wish List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Item name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="De Buyer Mineral B Carbon Steel Pan"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Brand</Label>
                <Input
                  value={form.brand}
                  onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))}
                  placeholder="De Buyer"
                />
              </div>
              <div>
                <Label>Est. price ($)</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.estimatedPrice}
                  onChange={(e) => setForm((p) => ({ ...p, estimatedPrice: e.target.value }))}
                  placeholder="90"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Priority</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={form.priority}
                  onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div>
              <Label>URL</Label>
              <Input
                value={form.url}
                onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                rows={3}
                placeholder="Why you want it, where to buy, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving || !form.name.trim()}>
              {saving ? 'Adding...' : 'Add to list'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}
