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

// Types matching DB schema
type GroceryItem = {
  id: string;
  receiptId: string | null;
  name: string;
  normalizedName: string | null;
  category: string | null;
  quantity: number | null;
  unit: string | null;
  purchaseDate: number | null;
  expiryDate: number | null;
  runningLow: number | null;
  notes: string | null;
  wikiId: string | null;
  createdAt: number;
};

type ParsedItem = {
  name: string;
  quantity: number | null;
  unit: string | null;
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

interface PantryClientProps {
  initialItems: GroceryItem[];
  initialRunningLow: GroceryItem[];
}

export function PantryClient({ initialItems }: PantryClientProps) {
  const [items, setItems] = useState<GroceryItem[]>(initialItems);
  const [activeCategory, setActiveCategory] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedItem[] | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [currentReceiptId, setCurrentReceiptId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', unit: '', category: 'other' });
  const [parseWarning, setParseWarning] = useState<string | null>(null);

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
    // Refresh items
    const refreshed = await fetch('/api/pantry/items');
    setItems(await refreshed.json());
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

  const deleteItem = async (id: string, name: string) => {
    await fetch(`/api/pantry/items/${id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success(`Removed "${name}"`);
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
        category: newItem.category,
      }),
    });
    const saved = await res.json();
    setItems((prev) => [saved, ...prev]);
    setNewItem({ name: '', quantity: '', unit: '', category: 'other' });
    setAddOpen(false);
    toast.success(`Added "${saved.name}" to pantry`);
  };

  const runningLow = useMemo(() => items.filter((i) => i.runningLow === 1), [items]);
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
        <Button onClick={() => setAddOpen(true)}>+ Add Item</Button>
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
                <Badge
                  key={item.id}
                  variant="outline"
                  className="border-amber-400 text-amber-700 dark:text-amber-300"
                >
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
            <p className="text-xs text-muted-foreground mt-1">
              or click to browse · JPG, PNG, HEIC supported
            </p>
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
            <Card key={item.id} className={`relative ${item.runningLow === 1 ? 'ring-1 ring-amber-400' : ''}`}>
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
                  <button
                    onClick={() => deleteItem(item.id, item.name)}
                    className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                    aria-label="Delete"
                  >
                    🗑
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
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
            <p className="text-muted-foreground text-sm">
              No items were detected. You can add items manually.
            </p>
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
                      setParsedItems(
                        (prev) =>
                          prev?.map((it, idx) => (idx === i ? { ...it, name: e.target.value } : it)) ?? null,
                      )
                    }
                    className="flex-1 h-8 text-sm"
                  />
                  <Input
                    value={item.quantity ?? ''}
                    onChange={(e) =>
                      setParsedItems(
                        (prev) =>
                          prev?.map((it, idx) =>
                            idx === i ? { ...it, quantity: parseFloat(e.target.value) || null } : it,
                          ) ?? null,
                      )
                    }
                    className="w-16 h-8 text-sm"
                    placeholder="qty"
                  />
                  <Input
                    value={item.unit ?? ''}
                    onChange={(e) =>
                      setParsedItems(
                        (prev) =>
                          prev?.map((it, idx) => (idx === i ? { ...it, unit: e.target.value } : it)) ?? null,
                      )
                    }
                    className="w-20 h-8 text-sm"
                    placeholder="unit"
                  />
                  <button
                    onClick={() =>
                      setParsedItems((prev) => prev?.filter((_, idx) => idx !== i) ?? null)
                    }
                    className="text-muted-foreground hover:text-destructive"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>
              Cancel
            </Button>
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
            <div className="flex gap-2">
              <div className="flex-1">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem((p) => ({ ...p, quantity: e.target.value }))}
                  placeholder="2"
                />
              </div>
              <div className="flex-1">
                <Label>Unit</Label>
                <Input
                  value={newItem.unit}
                  onChange={(e) => setNewItem((p) => ({ ...p, unit: e.target.value }))}
                  placeholder="lbs, oz, count..."
                />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={newItem.category}
                onValueChange={(v) => setNewItem((p) => ({ ...p, category: v ?? p.category }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter((c) => c !== 'all').map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_EMOJI[c]} {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addManualItem} disabled={!newItem.name.trim()}>
              Add to Pantry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
