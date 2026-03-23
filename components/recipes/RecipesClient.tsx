'use client';

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Clock, Users, Trash2, ChefHat, Search, ThumbsUp, ThumbsDown, RefreshCw, Sparkles } from 'lucide-react';

type Recipe = {
  id: string;
  title: string;
  description: string | null;
  cuisine: string | null;
  difficulty: string | null;
  prepTimeMin: number | null;
  cookTimeMin: number | null;
  servings: number | null;
  tags: string | null;
  sourceUrl: string | null;
  createdAt: number;
};

type Step = { stepNumber: number; instruction: string; durationMin?: number; tip?: string };
type Ingredient = { nameOverride: string; amount?: number; unit?: string; optional?: boolean };

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-amber-100 text-amber-800',
  hard: 'bg-red-100 text-red-800',
};

// Two-slot crossfade state
type Slots = { a: string | null; b: string | null; active: 'a' | 'b' };

export function RecipesClient({ initialRecipes }: { initialRecipes: Recipe[] }) {
  const [recipes, setRecipes] = useState(initialRecipes);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ recipe: Recipe; ingredients: Ingredient[]; steps: Step[] } | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', cuisine: '', difficulty: 'medium', prepTimeMin: '', cookTimeMin: '', servings: '4', sourceUrl: '' });
  const [stepsText, setStepsText] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newImageRecipes, setNewImageRecipes] = useState<Set<string>>(new Set());

  // Per-recipe vote state, persisted to localStorage
  const [votes, setVotes] = useState<Record<string, 'up' | 'down'>>({});
  useEffect(() => {
    try { setVotes(JSON.parse(localStorage.getItem('recipe-votes') ?? '{}')); } catch { /* ignore */ }
  }, []);

  // Image preview state
  const [slots, setSlots] = useState<Slots>({ a: null, b: null, active: 'a' });
  const [hoveredTitle, setHoveredTitle] = useState<string | null>(null);

  // Per-recipe image arrays, keyed by recipe id
  const imageCacheRef = useRef<Map<string, string[]>>(new Map());
  // In-flight fetch promises — lets hover await an ongoing prefetch instead of dropping it
  const fetchPromisesRef = useRef<Map<string, Promise<string[]>>>(new Map());
  const cycleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cycleIndexRef = useRef(0);

  // Push a new image into the inactive slot and flip active
  const showImage = useCallback((url: string) => {
    setSlots((prev) => {
      const next = prev.active === 'a' ? 'b' : 'a';
      return { ...prev, [next]: url, active: next };
    });
  }, []);

  // Start (or restart) cycling through an array of images
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

  // Clean up cycle timer on unmount
  useEffect(() => () => { if (cycleTimerRef.current) clearInterval(cycleTimerRef.current); }, []);

  // Fetch and cache images for a recipe; deduplicates concurrent calls via promise sharing
  const fetchImages = useCallback(async (recipe: Recipe): Promise<string[]> => {
    const cached = imageCacheRef.current.get(recipe.id);
    if (cached !== undefined) return cached;
    const existing = fetchPromisesRef.current.get(recipe.id);
    if (existing) return existing;
    const promise = (async () => {
      try {
        const res = await fetch(`/api/recipes/image?id=${recipe.id}&q=${encodeURIComponent(recipe.title)}`);
        const { images } = await res.json() as { images: string[] };
        imageCacheRef.current.set(recipe.id, images);
        return images;
      } catch {
        imageCacheRef.current.set(recipe.id, []);
        return [] as string[];
      } finally {
        fetchPromisesRef.current.delete(recipe.id);
      }
    })();
    fetchPromisesRef.current.set(recipe.id, promise);
    return promise;
  }, []);

  // Prefetch images for all recipes in the background on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const BATCH = 4;
      for (let i = 0; i < recipes.length; i += BATCH) {
        if (cancelled) break;
        await Promise.all(recipes.slice(i, i + BATCH).map((r) => fetchImages(r)));
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRecipeHover = useCallback(async (recipe: Recipe) => {
    setHoveredTitle(recipe.title);
    const images = await fetchImages(recipe);
    startCycle(images);
  }, [fetchImages, startCycle]);

  function toggleVote(id: string, direction: 'up' | 'down', e: React.MouseEvent) {
    e.stopPropagation();
    setVotes((prev) => {
      const next = { ...prev };
      if (next[id] === direction) {
        delete next[id];
      } else {
        next[id] = direction;
      }
      localStorage.setItem('recipe-votes', JSON.stringify(next));
      return next;
    });
    setNewImageRecipes((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  async function handleReplaceDisliked() {
    const disliked = recipes.filter((r) => votes[r.id] === 'down');
    if (!disliked.length) {
      toast('No thumbs-down recipes to replace');
      return;
    }
    setRefreshing(true);
    try {
      const res = await fetch('/api/recipes/replace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipes: disliked.map((r) => ({ id: r.id, title: r.title, cuisine: r.cuisine, difficulty: r.difficulty })),
        }),
      });
      if (!res.ok) throw new Error('Replace failed');
      const { added, deleted } = await res.json() as { added: Recipe[]; deleted: string[] };

      // Swap out old recipes for new ones in state
      setRecipes((prev) => {
        const deletedSet = new Set(deleted);
        return [...added, ...prev.filter((r) => !deletedSet.has(r.id))];
      });

      // Clear votes for removed recipes
      setVotes((prev) => {
        const next = { ...prev };
        for (const id of deleted) delete next[id];
        localStorage.setItem('recipe-votes', JSON.stringify(next));
        return next;
      });

      // Clear image cache for removed recipes; start prefetching new ones
      for (const id of deleted) {
        imageCacheRef.current.delete(id);
        fetchPromisesRef.current.delete(id);
      }
      for (const r of added) fetchImages(r);

      // Mark new recipes with the sparkle indicator
      setNewImageRecipes(new Set(added.map((r) => r.id)));

      toast.success(`Replaced ${deleted.length} recipe${deleted.length !== 1 ? 's' : ''}`);
    } catch {
      toast.error('Failed to replace recipes — is Ollama running?');
    } finally {
      setRefreshing(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return recipes.filter((r) =>
      r.title.toLowerCase().includes(q) || (r.cuisine ?? '').toLowerCase().includes(q)
    );
  }, [recipes, search]);

  async function openDetail(id: string) {
    setSelected(id);
    const res = await fetch(`/api/recipes/${id}`);
    const data = await res.json();
    setDetail(data);
  }

  async function handleAdd() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          cuisine: form.cuisine || null,
          difficulty: form.difficulty,
          prepTimeMin: form.prepTimeMin ? parseInt(form.prepTimeMin) : null,
          cookTimeMin: form.cookTimeMin ? parseInt(form.cookTimeMin) : null,
          servings: parseInt(form.servings) || 4,
          sourceUrl: form.sourceUrl || null,
        }),
      });
      const recipe = await res.json();
      const ingredientLines = ingredientsText.split('\n').filter((l) => l.trim());
      const stepLines = stepsText.split('\n').filter((l) => l.trim());
      const steps = stepLines.map((inst, i) => ({ stepNumber: i + 1, instruction: inst.trim() }));
      await Promise.all([
        ...ingredientLines.map((line) =>
          fetch(`/api/recipes/${recipe.id}/ingredients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nameOverride: line.trim() }),
          })
        ),
        steps.length
          ? fetch(`/api/recipes/${recipe.id}/steps`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(steps),
            })
          : Promise.resolve(),
      ]);
      setRecipes((prev) => [recipe, ...prev]);
      setShowAdd(false);
      setForm({ title: '', description: '', cuisine: '', difficulty: 'medium', prepTimeMin: '', cookTimeMin: '', servings: '4', sourceUrl: '' });
      setStepsText('');
      setIngredientsText('');
      toast.success('Recipe saved!');
    } catch {
      toast.error('Failed to save recipe');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    if (selected === id) { setSelected(null); setDetail(null); }
    toast.success('Recipe deleted');
  }

  const totalTime = (r: Recipe) => (r.prepTimeMin ?? 0) + (r.cookTimeMin ?? 0);
  const hasImage = slots.a !== null || slots.b !== null;

  return (
    <>
      {/* Full-height left image panel — doubled width, sits left of the recipe list */}
      <div
        aria-hidden
        className="fixed inset-y-0 left-0 pointer-events-none overflow-hidden"
        style={{ width: 'calc(100vw - 80rem)' }}
      >
        {/* Images fill the entire panel, cropped/zoomed via object-cover */}
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
        {/* Right-edge fade so image blends into page background */}
        {hasImage && (
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-r from-transparent to-background" />
        )}
        {/* Recipe name caption at bottom */}
        {hasImage && hoveredTitle && (
          <div className="absolute bottom-0 inset-x-0 px-3 py-4 bg-gradient-to-t from-black/70 to-transparent">
            <p className="text-white text-xs font-medium leading-tight line-clamp-2">{hoveredTitle}</p>
          </div>
        )}
      </div>

      {/* Main content — shifted right so it clears the doubled image panel */}
      <div className="space-y-6" style={{ marginLeft: 'max(0px, calc((100vw - 80rem) / 2))' }}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Recipes</h1>
            <p className="text-muted-foreground text-sm">{recipes.length} recipes saved</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleReplaceDisliked} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Replacing…' : 'Replace disliked recipes'}
            </Button>
            <Button onClick={() => setShowAdd(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Recipe
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
            <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-lg font-medium">No recipes yet</p>
            <p className="text-sm mt-1">Add your first recipe to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((r) => (
              <Card
                key={r.id}
                className={`cursor-pointer transition-shadow hover:shadow-md ${selected === r.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => openDetail(r.id)}
                onMouseEnter={() => handleRecipeHover(r)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-tight">{r.title}</CardTitle>
                    <div className="flex items-center gap-1 shrink-0">
                      {newImageRecipes.has(r.id) && (
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" title="New image found" />
                      )}
                      <button
                        onClick={(e) => toggleVote(r.id, 'up', e)}
                        className={`${votes[r.id] === 'up' ? 'text-green-600' : 'text-muted-foreground hover:text-green-600'}`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => toggleVote(r.id, 'down', e)}
                        className={`${votes[r.id] === 'down' ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {r.cuisine && <p className="text-xs text-muted-foreground">{r.cuisine}</p>}
                  {r.sourceUrl && (
                    <a
                      href={r.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-primary hover:underline truncate block max-w-full"
                    >
                      {r.sourceUrl}
                    </a>
                  )}
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {r.description && <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>}
                  <div className="flex items-center gap-2 flex-wrap">
                    {r.difficulty && (
                      <Badge variant="outline" className={DIFFICULTY_COLORS[r.difficulty] ?? ''}>
                        {r.difficulty}
                      </Badge>
                    )}
                    {totalTime(r) > 0 && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {totalTime(r)} min
                      </span>
                    )}
                    {r.servings && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {r.servings}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Recipe Detail */}
        {detail && (
          <Dialog open={!!selected} onOpenChange={(open) => { if (!open) { setSelected(null); setDetail(null); } }}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{detail.recipe.title}</DialogTitle>
                {detail.recipe.cuisine && <p className="text-sm text-muted-foreground">{detail.recipe.cuisine}</p>}
                {detail.recipe.sourceUrl && (
                  <a
                    href={detail.recipe.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline break-all"
                  >
                    {detail.recipe.sourceUrl}
                  </a>
                )}
              </DialogHeader>
              <div className="space-y-4">
                {detail.recipe.description && <p className="text-sm">{detail.recipe.description}</p>}
                <div className="flex gap-4 text-sm">
                  {detail.recipe.prepTimeMin && <span>Prep: {detail.recipe.prepTimeMin} min</span>}
                  {detail.recipe.cookTimeMin && <span>Cook: {detail.recipe.cookTimeMin} min</span>}
                  {detail.recipe.servings && <span>Serves: {detail.recipe.servings}</span>}
                </div>
                {detail.ingredients.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Ingredients</h3>
                    <ul className="space-y-1">
                      {detail.ingredients.map((ing, i) => (
                        <li key={i} className="text-sm flex gap-2">
                          <span className="text-muted-foreground">•</span>
                          {ing.amount && <span>{ing.amount} {ing.unit}</span>}
                          <span>{ing.nameOverride}</span>
                          {ing.optional && <span className="text-muted-foreground">(optional)</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {detail.steps.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Instructions</h3>
                    <ol className="space-y-3">
                      {detail.steps.map((step) => (
                        <li key={step.stepNumber} className="flex gap-3 text-sm">
                          <span className="font-bold text-primary shrink-0 w-5">{step.stepNumber}.</span>
                          <div>
                            <p>{step.instruction}</p>
                            {step.tip && <p className="text-muted-foreground text-xs mt-1 italic">Tip: {step.tip}</p>}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Add Recipe Dialog */}
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Recipe</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Spaghetti Carbonara" />
              </div>
              <div>
                <Label>Source URL</Label>
                <Input value={form.sourceUrl} onChange={(e) => setForm((p) => ({ ...p, sourceUrl: e.target.value }))} placeholder="https://..." type="url" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Cuisine</Label>
                  <Input value={form.cuisine} onChange={(e) => setForm((p) => ({ ...p, cuisine: e.target.value }))} placeholder="Italian" />
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                    value={form.difficulty}
                    onChange={(e) => setForm((p) => ({ ...p, difficulty: e.target.value }))}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Prep (min)</Label>
                  <Input type="number" value={form.prepTimeMin} onChange={(e) => setForm((p) => ({ ...p, prepTimeMin: e.target.value }))} />
                </div>
                <div>
                  <Label>Cook (min)</Label>
                  <Input type="number" value={form.cookTimeMin} onChange={(e) => setForm((p) => ({ ...p, cookTimeMin: e.target.value }))} />
                </div>
                <div>
                  <Label>Servings</Label>
                  <Input type="number" value={form.servings} onChange={(e) => setForm((p) => ({ ...p, servings: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} />
              </div>
              <div>
                <Label>Ingredients (one per line)</Label>
                <Textarea
                  value={ingredientsText}
                  onChange={(e) => setIngredientsText(e.target.value)}
                  placeholder={"2 cups flour\n1 cup sugar\n3 eggs"}
                  rows={5}
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <Label>Steps (one per line)</Label>
                <Textarea
                  value={stepsText}
                  onChange={(e) => setStepsText(e.target.value)}
                  placeholder={"Preheat oven to 350°F\nMix dry ingredients\nBake for 30 minutes"}
                  rows={5}
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={handleAdd} disabled={saving || !form.title.trim()}>
                {saving ? 'Saving...' : 'Save Recipe'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
