'use client';

import { useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Search, Network, Leaf } from 'lucide-react';

// Cytoscape requires the DOM, so load it dynamically
const CytoscapeComponent = dynamic(() => import('react-cytoscapejs'), { ssr: false });

type Ingredient = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  origin: string | null;
  flavorProfile: string | null;
  seasons: string | null;
  createdAt: number;
};

type Nutrition = {
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  fiberG: number | null;
  sodiumMg: number | null;
  servingSizeG: number | null;
} | null;

type Relationship = {
  id: string;
  ingredientAId: string | null;
  ingredientBId: string | null;
  relationship: string;
  strength: number | null;
};

type DetailData = {
  ingredient: Ingredient;
  nutrition: Nutrition;
  relationships: Relationship[];
  relatedIngredients: { id: string; name: string; category: string | null }[];
};

function NutritionBar({ label, value, max, unit }: { label: string; value: number; max: number; unit: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}{unit}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full">
        <div className="h-1.5 bg-primary rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function FlavorGraph({ ingredientId, ingredientName, relationships, relatedIngredients }: {
  ingredientId: string;
  ingredientName: string;
  relationships: Relationship[];
  relatedIngredients: { id: string; name: string }[];
}) {
  const nodeMap = new Map(relatedIngredients.map((r) => [r.id, r.name]));
  nodeMap.set(ingredientId, ingredientName);

  const elements = [
    { data: { id: ingredientId, label: ingredientName }, classes: 'root' },
    ...relatedIngredients.map((r) => ({ data: { id: r.id, label: r.name } })),
    ...relationships.map((rel) => ({
      data: {
        id: rel.id,
        source: rel.ingredientAId ?? '',
        target: rel.ingredientBId ?? '',
        label: rel.relationship,
        weight: rel.strength ?? 0.5,
      },
    })),
  ];

  return (
    <div className="border rounded-lg overflow-hidden" style={{ height: 320 }}>
      <CytoscapeComponent
        elements={elements}
        style={{ width: '100%', height: '100%' }}
        layout={{ name: 'cose', idealEdgeLength: 120, nodeRepulsion: 800000, animate: false } as unknown as cytoscape.LayoutOptions}
        stylesheet={[
          { selector: 'node', style: { label: 'data(label)', 'font-size': 10, 'background-color': '#e2e8f0', 'color': '#1e293b', 'text-valign': 'center', 'text-halign': 'center', width: 60, height: 60 } },
          { selector: 'node.root', style: { 'background-color': '#4f46e5', color: '#fff', width: 80, height: 80, 'font-size': 12, 'font-weight': 'bold' } },
          { selector: 'edge', style: { width: 'mapData(weight, 0, 1, 1, 4)', 'line-color': '#94a3b8', 'curve-style': 'bezier', opacity: 0.7 } },
        ]}
        minZoom={0.4}
        maxZoom={2}
      />
    </div>
  );
}

export function WikiClient({ initialIngredients }: { initialIngredients: Ingredient[] }) {
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: '', origin: '' });
  const [saving, setSaving] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((q: string) => {
    setSearch(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setIngredients(initialIngredients); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/wiki/ingredients?q=${encodeURIComponent(q)}`);
        setIngredients(await res.json());
      } finally {
        setSearching(false);
      }
    }, 300);
  }, [initialIngredients]);

  async function openDetail(id: string) {
    setSelected(id);
    const [detailRes, relRes] = await Promise.all([
      fetch(`/api/wiki/ingredients/${id}`),
      fetch(`/api/wiki/relationships?ingredientId=${id}`),
    ]);
    const { ingredient, nutrition } = await detailRes.json();
    const { relationships, ingredients: relatedIngredients } = await relRes.json();
    setDetail({ ingredient, nutrition, relationships, relatedIngredients });
  }

  async function handleAdd() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/wiki/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, description: form.description || null, category: form.category || null, origin: form.origin || null }),
      });
      const ingredient = await res.json();
      setIngredients((prev) => [ingredient, ...prev]);
      setShowAdd(false);
      setForm({ name: '', description: '', category: '', origin: '' });
      toast.success('Ingredient added');
    } catch {
      toast.error('Failed to add ingredient');
    } finally {
      setSaving(false);
    }
  }

  const parseJson = (s: string | null) => { try { return s ? JSON.parse(s) : null; } catch { return null; } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Food Wiki</h1>
          <p className="text-muted-foreground text-sm">{ingredients.length} ingredients</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Ingredient
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search ingredients..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {searching && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Searching...</span>}
      </div>

      {ingredients.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          <Leaf className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No ingredients yet</p>
          <p className="text-sm mt-1">Add ingredients manually or seed from USDA FoodData Central</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {ingredients.map((ing) => (
            <Card
              key={ing.id}
              className={`cursor-pointer transition-shadow hover:shadow-md ${selected === ing.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => openDetail(ing.id)}
            >
              <CardContent className="p-4">
                <p className="font-medium text-sm leading-tight">{ing.name}</p>
                {ing.category && <p className="text-xs text-muted-foreground mt-1">{ing.category}</p>}
                {ing.origin && <p className="text-xs text-muted-foreground">{ing.origin}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Ingredient Detail Dialog */}
      {detail && (
        <Dialog open={!!selected} onOpenChange={(open) => { if (!open) { setSelected(null); setDetail(null); } }}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{detail.ingredient.name}</DialogTitle>
              <div className="flex gap-2 mt-1">
                {detail.ingredient.category && <Badge variant="outline">{detail.ingredient.category}</Badge>}
                {detail.ingredient.origin && <Badge variant="outline">{detail.ingredient.origin}</Badge>}
              </div>
            </DialogHeader>
            <div className="space-y-5">
              {detail.ingredient.description && <p className="text-sm">{detail.ingredient.description}</p>}

              {detail.ingredient.flavorProfile && (() => {
                const fp = parseJson(detail.ingredient.flavorProfile);
                return fp ? (
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Flavor Profile</h3>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(fp as Record<string, number>).map(([k, v]) => (
                        <Badge key={k} variant="secondary">{k}: {v}</Badge>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {detail.ingredient.seasons && (() => {
                const seasons = parseJson(detail.ingredient.seasons) as string[] | null;
                return seasons?.length ? (
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Seasons</h3>
                    <div className="flex gap-2">{seasons.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}</div>
                  </div>
                ) : null;
              })()}

              {detail.nutrition && (
                <div>
                  <h3 className="font-semibold text-sm mb-3">
                    Nutrition <span className="font-normal text-muted-foreground">per {detail.nutrition.servingSizeG ?? 100}g</span>
                  </h3>
                  <div className="space-y-2">
                    {detail.nutrition.calories != null && <NutritionBar label="Calories" value={detail.nutrition.calories} max={500} unit=" kcal" />}
                    {detail.nutrition.proteinG != null && <NutritionBar label="Protein" value={detail.nutrition.proteinG} max={50} unit="g" />}
                    {detail.nutrition.carbsG != null && <NutritionBar label="Carbs" value={detail.nutrition.carbsG} max={100} unit="g" />}
                    {detail.nutrition.fatG != null && <NutritionBar label="Fat" value={detail.nutrition.fatG} max={50} unit="g" />}
                    {detail.nutrition.fiberG != null && <NutritionBar label="Fiber" value={detail.nutrition.fiberG} max={30} unit="g" />}
                  </div>
                </div>
              )}

              {detail.relationships.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Network className="w-4 h-4" /> Flavor Relationships
                  </h3>
                  <FlavorGraph
                    ingredientId={detail.ingredient.id}
                    ingredientName={detail.ingredient.name}
                    relationships={detail.relationships}
                    relatedIngredients={detail.relatedIngredients}
                  />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Ingredient Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Ingredient</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Saffron" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} placeholder="Spice" />
              </div>
              <div>
                <Label>Origin</Label>
                <Input value={form.origin} onChange={(e) => setForm((p) => ({ ...p, origin: e.target.value }))} placeholder="Iran" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving || !form.name.trim()}>
              {saving ? 'Saving...' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
