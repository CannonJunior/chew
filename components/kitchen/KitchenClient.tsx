'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, MapPin, Utensils } from 'lucide-react';

// Konva needs DOM
const Stage = dynamic(() => import('react-konva').then((m) => m.Stage), { ssr: false });
const Layer = dynamic(() => import('react-konva').then((m) => m.Layer), { ssr: false });
const Image: typeof import('react-konva').Image = dynamic(() => import('react-konva').then((m) => m.Image), { ssr: false }) as unknown as typeof import('react-konva').Image;
const Rect = dynamic(() => import('react-konva').then((m) => m.Rect), { ssr: false });
const Text = dynamic(() => import('react-konva').then((m) => m.Text), { ssr: false });
const Transformer = dynamic(() => import('react-konva').then((m) => m.Transformer), { ssr: false });

type Equipment = {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  condition: string | null;
  notes: string | null;
  createdAt: number;
};

type Floorplan = {
  id: string;
  name: string | null;
  imagePath: string;
  widthFt: number | null;
  heightFt: number | null;
  createdAt: number;
};

type Annotation = {
  id?: string;
  equipmentId: string | null;
  label: string;
  xPct: number;
  yPct: number;
  color: string;
};

const EQ_CATEGORIES = ['appliance', 'cookware', 'bakeware', 'tool', 'storage', 'other'];
const CONDITION_COLORS: Record<string, string> = {
  excellent: 'bg-green-100 text-green-800',
  good: 'bg-blue-100 text-blue-800',
  fair: 'bg-amber-100 text-amber-800',
  poor: 'bg-red-100 text-red-800',
};

function FloorplanCanvas({
  floorplan,
  equipment,
  initialAnnotations,
  onSave,
}: {
  floorplan: Floorplan;
  equipment: Equipment[];
  initialAnnotations: Annotation[];
  onSave: (annotations: Annotation[]) => void;
}) {
  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const stageW = 640;
  const stageH = 400;

  useEffect(() => {
    const img = new window.Image();
    img.src = floorplan.imagePath;
    img.onload = () => setBgImage(img);
  }, [floorplan.imagePath]);

  function addAnnotation(eq: Equipment) {
    setAnnotations((prev) => [
      ...prev,
      { equipmentId: eq.id, label: eq.name, xPct: 0.1 + Math.random() * 0.7, yPct: 0.1 + Math.random() * 0.7, color: '#4f46e5' },
    ]);
  }

  function handleDragEnd(i: number, x: number, y: number) {
    setAnnotations((prev) =>
      prev.map((a, idx) =>
        idx === i ? { ...a, xPct: x / stageW, yPct: y / stageH } : a
      )
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden bg-muted">
        <Stage width={stageW} height={stageH}>
          <Layer>
            {bgImage && <Image image={bgImage} x={0} y={0} width={stageW} height={stageH} />}
            {annotations.map((a, i) => (
              <>
                <Rect
                  key={`rect-${i}`}
                  x={a.xPct * stageW - 20}
                  y={a.yPct * stageH - 20}
                  width={40}
                  height={40}
                  fill={a.color}
                  opacity={0.8}
                  cornerRadius={6}
                  draggable
                  onDragEnd={(e) => handleDragEnd(i, e.target.x() + 20, e.target.y() + 20)}
                />
                <Text
                  key={`text-${i}`}
                  x={a.xPct * stageW - 35}
                  y={a.yPct * stageH + 24}
                  text={a.label}
                  fontSize={10}
                  fill="#1e293b"
                  width={70}
                  align="center"
                />
              </>
            ))}
          </Layer>
        </Stage>
      </div>
      <div className="flex gap-2 flex-wrap">
        {equipment.map((eq) => (
          <Button key={eq.id} size="sm" variant="outline" onClick={() => addAnnotation(eq)}>
            <Plus className="w-3 h-3 mr-1" />
            {eq.name}
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSave(annotations)}>Save Layout</Button>
        <Button size="sm" variant="outline" onClick={() => setAnnotations([])}>Clear</Button>
      </div>
    </div>
  );
}

export function KitchenClient({
  initialEquipment,
  initialFloorplans,
}: {
  initialEquipment: Equipment[];
  initialFloorplans: Floorplan[];
}) {
  const [equipment, setEquipment] = useState(initialEquipment);
  const [floorplans, setFloorplans] = useState(initialFloorplans);
  const [activeTab, setActiveTab] = useState<'equipment' | 'floorplan'>('equipment');
  const [showAddEq, setShowAddEq] = useState(false);
  const [eqForm, setEqForm] = useState({ name: '', brand: '', category: 'appliance', condition: 'good', notes: '' });
  const [savingEq, setSavingEq] = useState(false);
  const [selectedFloorplan, setSelectedFloorplan] = useState<Floorplan | null>(floorplans[0] ?? null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [uploadingFp, setUploadingFp] = useState(false);

  const onDropFloorplan = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setUploadingFp(true);
    const fd = new FormData();
    fd.append('image', file);
    fd.append('name', 'My Kitchen');
    try {
      const res = await fetch('/api/kitchen/floorplans', { method: 'POST', body: fd });
      const fp = await res.json();
      setFloorplans((prev) => [fp, ...prev]);
      setSelectedFloorplan(fp);
      toast.success('Floorplan uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingFp(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropFloorplan,
    accept: { 'image/*': [] },
    multiple: false,
  });

  async function handleAddEquipment() {
    if (!eqForm.name.trim()) return;
    setSavingEq(true);
    try {
      const res = await fetch('/api/kitchen/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: eqForm.name, brand: eqForm.brand || null, category: eqForm.category, condition: eqForm.condition, notes: eqForm.notes || null }),
      });
      const item = await res.json();
      setEquipment((prev) => [item, ...prev]);
      setShowAddEq(false);
      setEqForm({ name: '', brand: '', category: 'appliance', condition: 'good', notes: '' });
      toast.success('Equipment added');
    } catch {
      toast.error('Failed to add equipment');
    } finally {
      setSavingEq(false);
    }
  }

  async function handleDeleteEq(id: string) {
    await fetch(`/api/kitchen/equipment/${id}`, { method: 'DELETE' });
    setEquipment((prev) => prev.filter((e) => e.id !== id));
    toast.success('Removed');
  }

  async function handleSaveAnnotations(ann: Annotation[]) {
    if (!selectedFloorplan) return;
    await fetch(`/api/kitchen/floorplans/${selectedFloorplan.id}/annotations`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ann),
    });
    toast.success('Layout saved');
  }

  // Load annotations when floorplan selected
  useEffect(() => {
    if (!selectedFloorplan) return;
    fetch(`/api/kitchen/floorplans/${selectedFloorplan.id}/annotations`)
      .then((r) => r.json())
      .then(setAnnotations)
      .catch(() => setAnnotations([]));
  }, [selectedFloorplan]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kitchen</h1>
          <p className="text-muted-foreground text-sm">{equipment.length} items documented</p>
        </div>
        <Button onClick={() => setShowAddEq(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Equipment
        </Button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b">
        {(['equipment', 'floorplan'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {tab === 'equipment' ? <><Utensils className="w-4 h-4 inline mr-1" />Equipment</> : <><MapPin className="w-4 h-4 inline mr-1" />Floorplan</>}
          </button>
        ))}
      </div>

      {activeTab === 'equipment' && (
        equipment.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
            <Utensils className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-lg font-medium">No equipment yet</p>
            <p className="text-sm mt-1">Document your knives, pans, appliances, and more</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipment.map((eq) => (
              <Card key={eq.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{eq.name}</p>
                      {eq.brand && <p className="text-sm text-muted-foreground">{eq.brand}</p>}
                    </div>
                    <button onClick={() => handleDeleteEq(eq.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {eq.category && <Badge variant="outline" className="text-xs">{eq.category}</Badge>}
                    {eq.condition && (
                      <Badge variant="outline" className={`text-xs ${CONDITION_COLORS[eq.condition] ?? ''}`}>
                        {eq.condition}
                      </Badge>
                    )}
                  </div>
                  {eq.notes && <p className="text-xs text-muted-foreground mt-2">{eq.notes}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {activeTab === 'floorplan' && (
        <div className="space-y-4">
          {floorplans.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {floorplans.map((fp) => (
                <button
                  key={fp.id}
                  onClick={() => setSelectedFloorplan(fp)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${selectedFloorplan?.id === fp.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-muted'}`}
                >
                  {fp.name ?? 'My Kitchen'}
                </button>
              ))}
            </div>
          )}

          {selectedFloorplan ? (
            <FloorplanCanvas
              floorplan={selectedFloorplan}
              equipment={equipment}
              initialAnnotations={annotations}
              onSave={handleSaveAnnotations}
            />
          ) : (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-16 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
            >
              <input {...getInputProps()} />
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">{uploadingFp ? 'Uploading...' : 'Upload a floorplan photo'}</p>
              <p className="text-sm text-muted-foreground mt-1">Drag & drop or click to select an image</p>
            </div>
          )}

          {!selectedFloorplan && floorplans.length === 0 && null}
          {selectedFloorplan && (
            <div
              {...getRootProps()}
              className="border border-dashed rounded-lg p-4 text-center cursor-pointer text-sm text-muted-foreground hover:border-primary/50 transition-colors"
            >
              <input {...getInputProps()} />
              <span>{uploadingFp ? 'Uploading...' : '+ Upload another floorplan'}</span>
            </div>
          )}
        </div>
      )}

      {/* Add Equipment Dialog */}
      <Dialog open={showAddEq} onOpenChange={setShowAddEq}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Equipment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input value={eqForm.name} onChange={(e) => setEqForm((p) => ({ ...p, name: e.target.value }))} placeholder="KitchenAid Stand Mixer" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Brand</Label>
                <Input value={eqForm.brand} onChange={(e) => setEqForm((p) => ({ ...p, brand: e.target.value }))} placeholder="KitchenAid" />
              </div>
              <div>
                <Label>Category</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={eqForm.category}
                  onChange={(e) => setEqForm((p) => ({ ...p, category: e.target.value }))}
                >
                  {EQ_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label>Condition</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={eqForm.condition}
                onChange={(e) => setEqForm((p) => ({ ...p, condition: e.target.value }))}
              >
                {['excellent', 'good', 'fair', 'poor'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={eqForm.notes} onChange={(e) => setEqForm((p) => ({ ...p, notes: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddEq(false)}>Cancel</Button>
            <Button onClick={handleAddEquipment} disabled={savingEq || !eqForm.name.trim()}>
              {savingEq ? 'Saving...' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
