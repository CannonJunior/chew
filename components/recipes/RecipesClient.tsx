'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Clock, Users, Trash2, ChefHat, Search } from 'lucide-react';

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
  createdAt: number;
};

type Step = { stepNumber: number; instruction: string; durationMin?: number; tip?: string };
type Ingredient = { nameOverride: string; amount?: number; unit?: string; optional?: boolean };

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-amber-100 text-amber-800',
  hard: 'bg-red-100 text-red-800',
};

export function RecipesClient({ initialRecipes }: { initialRecipes: Recipe[] }) {
  const [recipes, setRecipes] = useState(initialRecipes);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<{
    recipe: Recipe;
    ingredients: Ingredient[];
    steps: Step[];
  } | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', cuisine: '', difficulty: 'medium', prepTimeMin: '', cookTimeMin: '', servings: '4' });
  const [stepsText, setStepsText] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return recipes.filter((r) =>
      r.title.toLowerCase().includes(q) ||
      (r.cuisine ?? '').toLowerCase().includes(q)
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
        }),
      });
      const recipe = await res.json();

      // Add ingredients and steps in parallel
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
      setForm({ title: '', description: '', cuisine: '', difficulty: 'medium', prepTimeMin: '', cookTimeMin: '', servings: '4' });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Recipes</h1>
          <p className="text-muted-foreground text-sm">{recipes.length} recipes saved</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Recipe
        </Button>
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
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-tight">{r.title}</CardTitle>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {r.cuisine && <p className="text-xs text-muted-foreground">{r.cuisine}</p>}
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
  );
}
