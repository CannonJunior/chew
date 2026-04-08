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
import { Plus, Search, Network, Leaf, GitCompare, X, CheckSquare } from 'lucide-react';

// Cytoscape requires the DOM, so load it dynamically
const CytoscapeComponent = dynamic(() => import('react-cytoscapejs'), { ssr: false });

type Ingredient = {
  id: string;
  name: string;
  aliases: string | null;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  origin: string | null;
  flavorProfile: string | null;
  seasons: string | null;
  imageUrl: string | null;
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

type CompareData = DetailData & { id: string };

export function WikiClient({ initialIngredients }: { initialIngredients: Ingredient[] }) {
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', aliases: '', description: '', category: '', subcategory: '', origin: '', seasons: '', imageUrl: '' });
  const [saving, setSaving] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareData, setCompareData] = useState<CompareData[] | null>(null);
  const [loadingCompare, setLoadingCompare] = useState(false);

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

  function toggleCompareId(id: string) {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  }

  async function runCompare() {
    if (compareIds.length < 2) { toast.error('Select at least 2 ingredients to compare'); return; }
    setLoadingCompare(true);
    try {
      const results = await Promise.all(
        compareIds.map(async (id) => {
          const [detailRes, relRes] = await Promise.all([
            fetch(`/api/wiki/ingredients/${id}`),
            fetch(`/api/wiki/relationships?ingredientId=${id}`),
          ]);
          const { ingredient, nutrition } = await detailRes.json();
          const { relationships, ingredients: relatedIngredients } = await relRes.json();
          return { id, ingredient, nutrition, relationships, relatedIngredients } as CompareData;
        })
      );
      setCompareData(results);
    } catch {
      toast.error('Failed to load comparison data');
    } finally {
      setLoadingCompare(false);
    }
  }

  function exitCompareMode() {
    setCompareMode(false);
    setCompareIds([]);
    setCompareData(null);
  }

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
      const aliasArr = form.aliases.trim() ? form.aliases.split(',').map((s) => s.trim()).filter(Boolean) : null;
      const seasonArr = form.seasons.trim() ? form.seasons.split(',').map((s) => s.trim()).filter(Boolean) : null;
      const res = await fetch('/api/wiki/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          aliases: aliasArr,
          description: form.description || null,
          category: form.category || null,
          subcategory: form.subcategory || null,
          origin: form.origin || null,
          seasons: seasonArr,
          imageUrl: form.imageUrl || null,
        }),
      });
      const ingredient = await res.json();
      setIngredients((prev) => [ingredient, ...prev]);
      setShowAdd(false);
      setForm({ name: '', aliases: '', description: '', category: '', subcategory: '', origin: '', seasons: '', imageUrl: '' });
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
        <div className="flex gap-2">
          {compareMode ? (
            <>
              <Button variant="outline" onClick={exitCompareMode}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={runCompare} disabled={compareIds.length < 2 || loadingCompare}>
                <GitCompare className="w-4 h-4 mr-2" />
                {loadingCompare ? 'Loading...' : `Compare${compareIds.length > 0 ? ` (${compareIds.length})` : ''}`}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setCompareMode(true)}>
                <GitCompare className="w-4 h-4 mr-2" />
                Compare
              </Button>
              <Button onClick={() => setShowAdd(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Ingredient
              </Button>
            </>
          )}
        </div>
      </div>
      {compareMode && (
        <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-2 text-sm text-primary">
          {compareIds.length === 0
            ? 'Click ingredients to select them for comparison (up to 4)'
            : `${compareIds.length} selected — ${compareIds.length < 2 ? 'select at least one more' : 'ready to compare'}`}
        </div>
      )}

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
          {ingredients.map((ing) => {
            const isCompareSelected = compareIds.includes(ing.id);
            return (
              <Card
                key={ing.id}
                className={`cursor-pointer transition-shadow hover:shadow-md ${
                  compareMode
                    ? isCompareSelected
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'opacity-70'
                    : selected === ing.id
                    ? 'ring-2 ring-primary'
                    : ''
                }`}
                onClick={() => compareMode ? toggleCompareId(ing.id) : openDetail(ing.id)}
              >
                <CardContent className="p-4 relative">
                  {compareMode && isCompareSelected && (
                    <CheckSquare className="absolute top-2 right-2 w-4 h-4 text-primary" />
                  )}
                  <p className="font-medium text-sm leading-tight">{ing.name}</p>
                  {ing.category && <p className="text-xs text-muted-foreground mt-1">{ing.category}</p>}
                  {ing.origin && <p className="text-xs text-muted-foreground">{ing.origin}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Ingredient Detail Dialog */}
      {detail && (
        <Dialog open={!!selected} onOpenChange={(open) => { if (!open) { setSelected(null); setDetail(null); } }}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{detail.ingredient.name}</DialogTitle>
              <div className="flex gap-2 mt-1 flex-wrap">
                {detail.ingredient.category && <Badge variant="outline">{detail.ingredient.category}</Badge>}
                {detail.ingredient.subcategory && <Badge variant="outline">{detail.ingredient.subcategory}</Badge>}
                {detail.ingredient.origin && <Badge variant="outline">{detail.ingredient.origin}</Badge>}
              </div>
            </DialogHeader>
            <div className="space-y-5">
              {detail.ingredient.imageUrl && (
                <img
                  src={detail.ingredient.imageUrl}
                  alt={detail.ingredient.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}

              {detail.ingredient.description && <p className="text-sm leading-relaxed">{detail.ingredient.description}</p>}

              {detail.ingredient.aliases && (() => {
                const aliases = parseJson(detail.ingredient.aliases) as string[] | null;
                return aliases?.length ? (
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Also Known As</h3>
                    <div className="flex gap-2 flex-wrap">
                      {aliases.map((a) => <Badge key={a} variant="secondary">{a}</Badge>)}
                    </div>
                  </div>
                ) : null;
              })()}

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

      {/* Compare Dialog */}
      <Dialog open={!!compareData} onOpenChange={(open) => { if (!open) setCompareData(null); }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="w-5 h-5" /> Compare Ingredients
            </DialogTitle>
          </DialogHeader>
          {compareData && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium w-32">Field</th>
                    {compareData.map((d) => (
                      <th key={d.id} className="text-left py-2 px-3 font-semibold border-l">
                        {d.ingredient.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr className="bg-muted/30">
                    <td className="py-2 pr-4 text-muted-foreground text-xs font-medium uppercase tracking-wide" colSpan={compareData.length + 1}>
                      General
                    </td>
                  </tr>
                  {(['category', 'subcategory', 'origin'] as const).map((field) => (
                    <tr key={field} className="hover:bg-muted/20">
                      <td className="py-2 pr-4 text-muted-foreground capitalize">{field}</td>
                      {compareData.map((d) => (
                        <td key={d.id} className="py-2 px-3 border-l">
                          {d.ingredient[field] ?? <span className="text-muted-foreground/50">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="hover:bg-muted/20">
                    <td className="py-2 pr-4 text-muted-foreground">Aliases</td>
                    {compareData.map((d) => {
                      const a = parseJson(d.ingredient.aliases) as string[] | null;
                      return (
                        <td key={d.id} className="py-2 px-3 border-l">
                          {a?.length ? (
                            <div className="flex gap-1 flex-wrap">{a.map((x) => <Badge key={x} variant="secondary" className="text-xs">{x}</Badge>)}</div>
                          ) : <span className="text-muted-foreground/50">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="hover:bg-muted/20">
                    <td className="py-2 pr-4 text-muted-foreground">Seasons</td>
                    {compareData.map((d) => {
                      const s = parseJson(d.ingredient.seasons) as string[] | null;
                      return (
                        <td key={d.id} className="py-2 px-3 border-l">
                          {s?.length ? (
                            <div className="flex gap-1 flex-wrap">{s.map((x) => <Badge key={x} variant="outline" className="text-xs">{x}</Badge>)}</div>
                          ) : <span className="text-muted-foreground/50">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="hover:bg-muted/20">
                    <td className="py-2 pr-4 text-muted-foreground align-top">Description</td>
                    {compareData.map((d) => (
                      <td key={d.id} className="py-2 px-3 border-l align-top text-xs leading-relaxed max-w-xs">
                        {d.ingredient.description ?? <span className="text-muted-foreground/50">—</span>}
                      </td>
                    ))}
                  </tr>

                  <tr className="bg-muted/30">
                    <td className="py-2 pr-4 text-muted-foreground text-xs font-medium uppercase tracking-wide" colSpan={compareData.length + 1}>
                      Flavor Profile
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/20">
                    <td className="py-2 pr-4 text-muted-foreground align-top">Notes</td>
                    {compareData.map((d) => {
                      const fp = parseJson(d.ingredient.flavorProfile) as Record<string, number> | null;
                      return (
                        <td key={d.id} className="py-2 px-3 border-l align-top">
                          {fp ? (
                            <div className="flex gap-1 flex-wrap">
                              {Object.entries(fp).map(([k, v]) => (
                                <Badge key={k} variant="secondary" className="text-xs">{k}: {v}</Badge>
                              ))}
                            </div>
                          ) : <span className="text-muted-foreground/50">—</span>}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="bg-muted/30">
                    <td className="py-2 pr-4 text-muted-foreground text-xs font-medium uppercase tracking-wide" colSpan={compareData.length + 1}>
                      Nutrition (per 100g)
                    </td>
                  </tr>
                  {([
                    { key: 'calories', label: 'Calories', unit: ' kcal' },
                    { key: 'proteinG', label: 'Protein', unit: 'g' },
                    { key: 'carbsG', label: 'Carbs', unit: 'g' },
                    { key: 'fatG', label: 'Fat', unit: 'g' },
                    { key: 'fiberG', label: 'Fiber', unit: 'g' },
                  ] as const).map(({ key, label, unit }) => {
                    const values = compareData.map((d) => d.nutrition?.[key] ?? null);
                    const max = Math.max(...values.filter((v): v is number => v != null), 1);
                    return (
                      <tr key={key} className="hover:bg-muted/20">
                        <td className="py-2 pr-4 text-muted-foreground">{label}</td>
                        {compareData.map((d, i) => {
                          const val = values[i];
                          return (
                            <td key={d.id} className="py-2 px-3 border-l">
                              {val != null ? (
                                <div className="space-y-1">
                                  <span className="font-medium">{val}{unit}</span>
                                  <div className="h-1.5 bg-muted rounded-full w-28">
                                    <div
                                      className="h-1.5 bg-primary rounded-full"
                                      style={{ width: `${Math.min((val / max) * 100, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              ) : <span className="text-muted-foreground/50">—</span>}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompareData(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Ingredient Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Ingredient</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Saffron" />
            </div>
            <div>
              <Label>Also Known As <span className="text-muted-foreground font-normal">(comma-separated)</span></Label>
              <Input value={form.aliases} onChange={(e) => setForm((p) => ({ ...p, aliases: e.target.value }))} placeholder="Crocus sativus, Zafaran" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} placeholder="Spice" />
              </div>
              <div>
                <Label>Subcategory</Label>
                <Input value={form.subcategory} onChange={(e) => setForm((p) => ({ ...p, subcategory: e.target.value }))} placeholder="Floral spice" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Origin</Label>
                <Input value={form.origin} onChange={(e) => setForm((p) => ({ ...p, origin: e.target.value }))} placeholder="Iran" />
              </div>
              <div>
                <Label>Seasons <span className="text-muted-foreground font-normal">(comma-separated)</span></Label>
                <Input value={form.seasons} onChange={(e) => setForm((p) => ({ ...p, seasons: e.target.value }))} placeholder="Fall, Winter" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} placeholder="Rich, aromatic threads with earthy, honey-like sweetness..." />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={form.imageUrl} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..." />
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
