export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">⚙️ Settings</h1>
        <p className="text-muted-foreground">Configure Chew</p>
      </div>
      <div className="grid gap-4">
        <div className="rounded-lg border p-4">
          <h2 className="font-semibold mb-1">AI Configuration</h2>
          <p className="text-sm text-muted-foreground">Ollama URL: http://localhost:11434</p>
          <p className="text-sm text-muted-foreground">Chat model: qwen2.5:7b</p>
          <p className="text-sm text-muted-foreground">Vision model: llava (for receipts)</p>
        </div>
      </div>
    </div>
  );
}
