import { NextRequest } from 'next/server';
import { createUIMessageStream, createUIMessageStreamResponse } from 'ai';
import { db } from '@/lib/db/client';
import { groceryItems, kitchenEquipment, recipes } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

// Normalize: strip trailing /api so we can always append /api/chat ourselves
const OLLAMA_BASE = (process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434').replace(/\/api\/?$/, '');

function buildSystemPrompt(mode: string): string {
  const pantryItems = db.select().from(groceryItems).orderBy(desc(groceryItems.createdAt)).limit(50).all();
  const equipment = db.select().from(kitchenEquipment).all();
  const recentRecipes = db.select().from(recipes).orderBy(desc(recipes.createdAt)).limit(10).all();

  const pantryList = pantryItems
    .map((i) => `- ${i.name}${i.quantity ? ` (${i.quantity} ${i.unit ?? ''})` : ''}${i.runningLow ? ' [LOW]' : ''}`)
    .join('\n');
  const equipmentList = equipment.map((e) => `- ${e.name}${e.brand ? ` (${e.brand})` : ''}`).join('\n');
  const recipeList = recentRecipes.map((r) => `- ${r.title}${r.cuisine ? ` (${r.cuisine})` : ''}`).join('\n');

  return `You are Yes Chef, an AI cooking assistant. You have access to the user's kitchen data.

PANTRY:
${pantryList || 'No items in pantry'}

KITCHEN EQUIPMENT:
${equipmentList || 'No equipment listed'}

SAVED RECIPES:
${recipeList || 'No recipes saved'}

MODE: ${mode === 'plan' ? 'PLAN — provide detailed, comprehensive responses with full meal plans and step-by-step guidance.' : 'QUICK — give concise, actionable answers.'}

Answer cooking questions using the pantry and equipment context above.`;
}

// Extract plain text from a UIMessage's parts array
function extractText(parts: Array<{ type: string; text?: string }> | undefined): string {
  if (!parts) return '';
  return parts.filter((p) => p.type === 'text').map((p) => p.text ?? '').join('');
}

type UIMessageLike = {
  role: string;
  content?: string;
  parts?: Array<{ type: string; text?: string }>;
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const uiMessages: UIMessageLike[] = body.messages ?? [];
  const mode = (body.mode as string) ?? 'quick';
  const modelName = mode === 'plan' ? 'qwen3.5:2b' : 'qwen3.5:0.8b';

  const systemPrompt = buildSystemPrompt(mode);

  // Convert UIMessage[] → Ollama { role, content }[]
  const ollamaMessages = [
    { role: 'system', content: systemPrompt },
    ...uiMessages.map((m) => ({
      role: m.role,
      content: m.parts ? extractText(m.parts) : (m.content ?? ''),
    })),
  ];

  let ollamaRes: Response;
  try {
    ollamaRes = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelName,
        messages: ollamaMessages,
        stream: true,
        think: false,
        options: { num_ctx: 8192 },
      }),
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: `Cannot reach Ollama — is it running? (${err})` }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!ollamaRes.ok || !ollamaRes.body) {
    const errorText = await ollamaRes.text().catch(() => '');
    return new Response(
      JSON.stringify({ error: `Ollama error ${ollamaRes.status}: ${errorText || `is ${modelName} installed?`}` }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const responseBody = ollamaRes.body;

  const textId = 'text-0';
  const decoder = new TextDecoder();

  return createUIMessageStreamResponse({
    stream: createUIMessageStream({
      execute: async ({ writer }) => {
        writer.write({ type: 'text-start', id: textId });

        const reader = responseBody.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const lines = decoder.decode(value, { stream: true }).split('\n').filter(Boolean);
            for (const line of lines) {
              try {
                const json = JSON.parse(line);
                if (json.message?.content) {
                  writer.write({ type: 'text-delta', id: textId, delta: json.message.content });
                }
              } catch {
                // skip malformed lines
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

        writer.write({ type: 'text-end', id: textId });
      },
      onError: (err) => `Error: ${String(err)}`,
    }),
  });
}
