'use client';

import { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, UtensilsCrossed, History } from 'lucide-react';

type GroceryItem = {
  id: string;
  receiptId: string | null;
  name: string;
  normalizedName: string | null;
  category: string | null;
  quantity: number | null;
  unit: string | null;
  price: number | null;
  purchaseDate: number | null;
  expiryDate: number | null;
  runningLow: number | null;
  remainingPct: number | null;
  removedAt: number | null;
  removalReason: string | null;
  notes: string | null;
  wikiId: string | null;
  createdAt: number;
  // Joined from receipts
  receiptImagePath: string | null;
  receiptMerchant: string | null;
  receiptDate: number | null;
};

type ParsedItem = {
  name: string;
  quantity: number | null;
  unit: string | null;
  price: number | null;
  category: string;
};

const CATEGORIES = ['all', 'produce', 'dairy', 'meat', 'seafood', 'pantry', 'frozen', 'beverage', 'other'];

const CATEGORY_COLORS: Record<string, string> = {
  produce: 'bg-green-100 text-green-800',
  dairy: 'bg-blue-100 text-blue-800',
  meat: 'bg-red-100 text-red-800',
  seafood: 'bg-cyan-100 text-cyan-800',
  pantry: 'bg-amber-100 text-amber-800',
  frozen: 'bg-indigo-100 text-indigo-800',
  beverage: 'bg-purple-100 text-purple-800',
  other: 'bg-gray-100 text-gray-800',
};

const CATEGORY_EMOJI: Record<string, string> = {
  produce: '🥦',
  dairy: '🥛',
  meat: '🥩',
  seafood: '🐟',
  pantry: '🫙',
  frozen: '🧊',
  beverage: '🥤',
  other: '📦',
};

function formatDate(ts: number | null): string {
  if (!ts) return '';
  return new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatPrice(p: number | null): string | null {
  if (p == null) return null;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p);
}

function sourceLabel(item: GroceryItem): string {
  if (!item.receiptId) return 'Manual';
  if (item.receiptMerchant) return item.receiptMerchant;
  if (item.receiptDate) return `Receipt ${formatDate(item.receiptDate)}`;
  return 'Receipt';
}

// ── Consumption slider ────────────────────────────────────────────────────────

// Returns true when quantity represents a discrete countable amount (≥2 integers)
function isCountMode(qty: number | null): qty is number {
  return qty !== null && qty > 1 && qty === Math.floor(qty);
}

// Pct-mode stops: 4 stops at 0 / 25 / 50 / 100
const PCT_STOPS = [0, 25, 50, 100];
const PCT_LABELS = ['Empty', '¼', '½', 'Full'];

// Map a stored pct value (0-100) → slider index
function pctToIndex(pct: number, countMax: number | null): number {
  if (countMax !== null) {
    return Math.round((pct / 100) * countMax);
  }
  // Find the closest PCT_STOP
  return PCT_STOPS.reduce(
    (best, stop, i) => (Math.abs(stop - pct) < Math.abs(PCT_STOPS[best] - pct) ? i : best),
    PCT_STOPS.length - 1,
  );
}

// Map slider index → pct (0-100)
function indexToPct(index: number, countMax: number | null): number {
  if (countMax !== null) return Math.round((index / countMax) * 100);
  return PCT_STOPS[index];
}

function ConsumptionSlider({
  item,
  onUpdate,
}: {
  item: GroceryItem;
  onUpdate: (id: string, remainingPct: number) => void;
}) {
  const countMax = isCountMode(item.quantity) ? item.quantity : null;
  const sliderMax = countMax ?? (PCT_STOPS.length - 1);

  const [index, setIndex] = useState<number>(() =>
    pctToIndex(item.remainingPct ?? 100, countMax),
  );

  const pct = indexToPct(index, countMax);

  // Accent colour tracks fullness
  const accentColor =
    pct === 0 ? '#ef4444' : pct <= 25 ? '#f59e0b' : '#22c55e';

  // Human-readable label above the slider
  const label = (() => {
    if (countMax !== null) {
      if (index === 0) return 'Empty';
      if (index === countMax) return 'Full';
      return `${index} left`;
    }
    return PCT_LABELS[index];
  })();

  // Stop labels rendered below the track
  const stopLabels: string[] =
    countMax !== null
      ? Array.from({ length: countMax + 1 }, (_, i) => String(i))
      : PCT_LABELS;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIndex = Number(e.target.value);
    setIndex(newIndex);
    onUpdate(item.id, indexToPct(newIndex, countMax));
  };

  const listId = `stops-${item.id}`;

  return (
    <div className="mt-2.5 mb-0.5">
      {/* Label */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-medium" style={{ color: accentColor }}>
          {label}
        </span>
      </div>

      {/* Track */}
      <input
        type="range"
        min={0}
        max={sliderMax}
        step={1}
        value={index}
        list={listId}
        onChange={handleChange}
        className="w-full h-1.5 cursor-pointer rounded-full appearance-none bg-muted"
        style={{ accentColor }}
      />
      <datalist id={listId}>
        {Array.from({ length: sliderMax + 1 }, (_, i) => (
          <option key={i} value={i} />
        ))}
      </datalist>

      {/* Stop labels — justify-between aligns them under the tick marks */}
      <div className="flex justify-between mt-0.5">
        {stopLabels.map((lbl, i) => (
          <span key={i} className="text-[10px] text-muted-foreground leading-none">
            {lbl}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function PantryClient({ initialItems }: { initialItems: GroceryItem[] }) {
  const [items, setItems] = useState<GroceryItem[]>(initialItems);
  const [activeCategory, setActiveCategory] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedItem[] | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [currentReceiptId, setCurrentReceiptId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', unit: '', price: '', category: 'other' });
  const [parseWarning, setParseWarning] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<GroceryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles[0]) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);
    try {
      const res = await fetch('/api/pantry/receipts', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      setCurrentReceiptId(data.id);
      setParsedItems(data.items ?? []);
      setParseWarning(data.warning ?? null);
      setReviewOpen(true);
      toast.success(`Receipt uploaded! ${data.items?.length ?? 0} items detected.`);
    } catch (err) {
      toast.error('Upload failed: ' + (err as Error).message);
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.heic'] },
    maxFiles: 1,
    disabled: uploading,
  });

  const saveReviewedItems = async () => {
    if (!parsedItems || !currentReceiptId) return;
    const res = await fetch(`/api/pantry/receipts/${currentReceiptId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: parsedItems }),
    });
    const data = await res.json();
    toast.success(`Added ${data.saved} items to pantry`);
    setReviewOpen(false);
    const refreshed = await fetch('/api/pantry/items');
    setItems(await refreshed.json());
  };

  const updateConsumption = async (id: string, remainingPct: number) => {
    await fetch(`/api/pantry/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ remainingPct }),
    });
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, remainingPct } : i)));
  };

  const toggleRunningLow = async (item: GroceryItem) => {
    const newVal = item.runningLow === 1 ? 0 : 1;
    await fetch(`/api/pantry/items/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ runningLow: newVal }),
    });
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, runningLow: newVal } : i)));
    toast(newVal === 1 ? `Marked "${item.name}" as running low` : `"${item.name}" restocked`);
  };

  const removeItem = async (item: GroceryItem, reason: 'consumed' | 'disposed') => {
    const removedAt = Math.floor(Date.now() / 1000);
    await fetch(`/api/pantry/items/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ removedAt, removalReason: reason }),
    });
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    toast.success(
      reason === 'consumed'
        ? `"${item.name}" marked as consumed`
        : `"${item.name}" discarded`
    );
  };

  const addManualItem = async () => {
    if (!newItem.name.trim()) return;
    const res = await fetch('/api/pantry/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newItem.name,
        quantity: newItem.quantity ? parseFloat(newItem.quantity) : null,
        unit: newItem.unit || null,
        price: newItem.price ? parseFloat(newItem.price) : null,
        category: newItem.category,
      }),
    });
    const saved = await res.json();
    // Enrich with null receipt fields for type compatibility
    setItems((prev) => [{ ...saved, receiptImagePath: null, receiptMerchant: null, receiptDate: null }, ...prev]);
    setNewItem({ name: '', quantity: '', unit: '', price: '', category: 'other' });
    setAddOpen(false);
    toast.success(`Added "${saved.name}" to pantry`);
  };

  const loadHistory = async () => {
    if (loadingHistory) return;
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/pantry/items?include_removed=1');
      const all: GroceryItem[] = await res.json();
      setHistory(all.filter((i) => i.removedAt != null).sort((a, b) => (b.removedAt ?? 0) - (a.removedAt ?? 0)));
    } finally {
      setLoadingHistory(false);
    }
  };

  const runningLow = useMemo(() => items.filter((i) => i.removedAt == null && i.runningLow === 1), [items]);
  const filtered = useMemo(
    () => activeCategory === 'all' ? items : items.filter((i) => i.category === activeCategory),
    [items, activeCategory]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🥦 Pantry</h1>
          <p className="text-muted-foreground">
            {items.length} items · {runningLow.length} running low
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              if (!showHistory) await loadHistory();
              setShowHistory((v) => !v);
            }}
          >
            <History className="w-4 h-4 mr-1.5" />
            History
          </Button>
          <Button onClick={() => setAddOpen(true)}>+ Add Item</Button>
        </div>
      </div>

      {/* Running low widget */}
      {runningLow.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardContent className="pt-4">
            <p className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
              ⚠️ Running Low ({runningLow.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {runningLow.map((item) => (
                <Badge key={item.id} variant="outline" className="border-amber-400 text-amber-700 dark:text-amber-300">
                  {item.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Receipt upload */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <p className="text-3xl mb-2">🧾</p>
        {uploading ? (
          <p className="text-sm text-muted-foreground">Processing receipt with AI...</p>
        ) : isDragActive ? (
          <p className="text-sm font-medium">Drop receipt here</p>
        ) : (
          <>
            <p className="text-sm font-medium">Drag &amp; drop a receipt photo</p>
            <p className="text-xs text-muted-foreground mt-1">or click to browse · JPG, PNG, HEIC supported</p>
          </>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {cat !== 'all' && CATEGORY_EMOJI[cat]} {cat === 'all' ? `All (${items.length})` : cat}
          </button>
        ))}
      </div>

      {/* Items grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-4xl mb-2">📭</p>
          <p>No items in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((item) => (
            <Card key={item.id} className={`relative card-elevated ${item.runningLow === 1 ? 'ring-1 ring-amber-400' : ''}`}>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm leading-tight truncate">{item.name}</p>
                    {(item.quantity || item.unit) && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.quantity} {item.unit}
                      </p>
                    )}
                  </div>
                  <Badge className={`text-xs shrink-0 ${CATEGORY_COLORS[item.category ?? 'other']}`}>
                    {CATEGORY_EMOJI[item.category ?? 'other']}
                  </Badge>
                </div>

                {/* Meta row: price · date · source */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-2">
                  {item.price != null && (
                    <span className="text-xs font-medium text-foreground">{formatPrice(item.price)}</span>
                  )}
                  <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
                  <span
                    className={`text-xs truncate max-w-[120px] ${item.receiptId ? 'text-primary/70' : 'text-muted-foreground/60'}`}
                    title={item.receiptImagePath ?? undefined}
                  >
                    {sourceLabel(item)}
                  </span>
                </div>

                <ConsumptionSlider item={item} onUpdate={updateConsumption} />

                <div className="flex items-center gap-1 mt-3">
                  <button
                    onClick={() => toggleRunningLow(item)}
                    className={`flex-1 text-xs py-1 px-2 rounded transition-colors ${
                      item.runningLow === 1
                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {item.runningLow === 1 ? '⚠️ Low' : '✓ Stocked'}
                  </button>

                  {/* Consumed */}
                  <button
                    onClick={() => removeItem(item, 'consumed')}
                    className="text-muted-foreground hover:text-green-600 p-1 rounded transition-colors"
                    aria-label="Mark as consumed"
                    title="Mark as consumed"
                  >
                    <UtensilsCrossed className="w-4 h-4" />
                  </button>

                  {/* Disposed / thrown away */}
                  <button
                    onClick={() => removeItem(item, 'disposed')}
                    className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                    aria-label="Discard (thrown away)"
                    title="Discard (thrown away)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* History panel */}
      {showHistory && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold">History</h2>
            <span className="text-xs text-muted-foreground">{history.length} items</span>
          </div>
          {loadingHistory ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No history yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {history.map((item) => {
                const consumed = item.removalReason === 'consumed';
                return (
                  <Card key={item.id} className="relative opacity-70">
                    <CardContent className="pt-4 pb-3 px-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm leading-tight truncate line-through text-muted-foreground">
                            {item.name}
                          </p>
                          {(item.quantity || item.unit) && (
                            <p className="text-xs text-muted-foreground mt-0.5">{item.quantity} {item.unit}</p>
                          )}
                        </div>
                        <span
                          className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                            consumed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {consumed ? 'Used' : 'Tossed'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-2">
                        {item.price != null && (
                          <span className="text-xs font-medium">{formatPrice(item.price)}</span>
                        )}
                        <span className="text-xs text-muted-foreground">Added {formatDate(item.createdAt)}</span>
                        {item.removedAt && (
                          <span className="text-xs text-muted-foreground">
                            {consumed ? 'Used' : 'Tossed'} {formatDate(item.removedAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{sourceLabel(item)}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Review parsed items dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Parsed Items</DialogTitle>
          </DialogHeader>
          {parseWarning && (
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-800">
              ⚠️ {parseWarning}
            </div>
          )}
          {parsedItems && parsedItems.length === 0 && !parseWarning && (
            <p className="text-muted-foreground text-sm">No items were detected. You can add items manually.</p>
          )}
          {parsedItems && parsedItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {parsedItems.length} items detected. Review and edit before saving:
              </p>
              {parsedItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded border">
                  <Input
                    value={item.name}
                    onChange={(e) =>
                      setParsedItems((prev) => prev?.map((it, idx) => idx === i ? { ...it, name: e.target.value } : it) ?? null)
                    }
                    className="flex-1 h-8 text-sm"
                  />
                  <Input
                    value={item.quantity ?? ''}
                    onChange={(e) =>
                      setParsedItems((prev) => prev?.map((it, idx) => idx === i ? { ...it, quantity: parseFloat(e.target.value) || null } : it) ?? null)
                    }
                    className="w-16 h-8 text-sm"
                    placeholder="qty"
                  />
                  <Input
                    value={item.unit ?? ''}
                    onChange={(e) =>
                      setParsedItems((prev) => prev?.map((it, idx) => idx === i ? { ...it, unit: e.target.value } : it) ?? null)
                    }
                    className="w-20 h-8 text-sm"
                    placeholder="unit"
                  />
                  <Input
                    value={item.price ?? ''}
                    onChange={(e) =>
                      setParsedItems((prev) => prev?.map((it, idx) => idx === i ? { ...it, price: parseFloat(e.target.value) || null } : it) ?? null)
                    }
                    className="w-20 h-8 text-sm"
                    placeholder="$price"
                  />
                  <button
                    onClick={() => setParsedItems((prev) => prev?.filter((_, idx) => idx !== i) ?? null)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>Cancel</Button>
            <Button onClick={saveReviewedItems}>Save {parsedItems?.length ?? 0} Items</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add manual item dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Item Manually</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Item name</Label>
              <Input
                value={newItem.name}
                onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Roma Tomatoes"
                onKeyDown={(e) => e.key === 'Enter' && addManualItem()}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem((p) => ({ ...p, quantity: e.target.value }))}
                  placeholder="2"
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Input
                  value={newItem.unit}
                  onChange={(e) => setNewItem((p) => ({ ...p, unit: e.target.value }))}
                  placeholder="lbs, oz…"
                />
              </div>
              <div>
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => setNewItem((p) => ({ ...p, price: e.target.value }))}
                  placeholder="3.49"
                />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={newItem.category} onValueChange={(v) => setNewItem((p) => ({ ...p, category: v ?? p.category }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter((c) => c !== 'all').map((c) => (
                    <SelectItem key={c} value={c}>{CATEGORY_EMOJI[c]} {c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addManualItem} disabled={!newItem.name.trim()}>Add to Pantry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
