import path from 'path';
import fs from 'fs';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/api';
const VISION_MODEL = process.env.OLLAMA_VISION_MODEL ?? 'llava';

export interface ParsedItem {
  name: string;
  quantity: number | null;
  unit: string | null;
  category: 'produce' | 'dairy' | 'meat' | 'seafood' | 'pantry' | 'frozen' | 'beverage' | 'other';
}

export async function parseReceiptImage(imagePath: string): Promise<ParsedItem[]> {
  // Read image as base64
  const fullPath = path.join(process.cwd(), imagePath);
  const imageData = fs.readFileSync(fullPath);
  const base64 = imageData.toString('base64');

  const prompt = `You are a grocery receipt parser. Look at this receipt image and extract all purchased food items.

Return ONLY a valid JSON array with no extra text. Each item should have:
- "name": the full item name (expand abbreviations, e.g. "ORG FUJI APL" → "Organic Fuji Apple")
- "quantity": numeric quantity (null if unclear)
- "unit": unit like "lbs", "oz", "count", "fl oz" (null if unclear)
- "category": one of: produce, dairy, meat, seafood, pantry, frozen, beverage, other

Skip non-food items (bags, fees, taxes, totals).

Example output:
[{"name":"Roma Tomatoes","quantity":2,"unit":"lbs","category":"produce"},{"name":"Whole Milk","quantity":1,"unit":"gallon","category":"dairy"}]`;

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: VISION_MODEL,
        prompt,
        images: [base64],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama responded with ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.response ?? '';

    // Try to parse JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found in response');

    const items = JSON.parse(jsonMatch[0]) as ParsedItem[];
    return items.filter((item) => item.name && item.name.trim().length > 0);
  } catch (err) {
    console.error('Receipt parsing error:', err);
    throw err;
  }
}
