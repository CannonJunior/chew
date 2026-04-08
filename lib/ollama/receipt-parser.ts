import path from 'path';
import fs from 'fs';
import Anthropic from '@anthropic-ai/sdk';

const VISION_MODEL = process.env.ANTHROPIC_VISION_MODEL ?? 'claude-sonnet-4-6';

export interface ParsedItem {
  name: string;
  quantity: number | null;
  unit: string | null;
  price: number | null;
  category: 'produce' | 'dairy' | 'meat' | 'seafood' | 'pantry' | 'frozen' | 'beverage' | 'other';
}

export async function parseReceiptImage(imagePath: string): Promise<ParsedItem[]> {
  const fullPath = path.join(process.cwd(), imagePath);
  const imageData = fs.readFileSync(fullPath);
  const base64 = imageData.toString('base64');

  // Detect media type from file header
  const buf = imageData.subarray(0, 4);
  let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/jpeg';
  if (buf[0] === 0x89 && buf[1] === 0x50) mediaType = 'image/png';
  else if (buf[0] === 0x47 && buf[1] === 0x49) mediaType = 'image/gif';
  else if (buf[0] === 0x52 && buf[1] === 0x49) mediaType = 'image/webp';

  const prompt = `You are a grocery receipt parser. Look at this receipt image and extract all purchased food items.

Return ONLY a valid JSON array with no extra text. Each item should have:
- "name": the full item name (expand abbreviations, e.g. "ORG FUJI APL" → "Organic Fuji Apple")
- "quantity": numeric quantity (null if unclear)
- "unit": unit like "lbs", "oz", "count", "fl oz" (null if unclear)
- "price": the item's line-item price as a number in USD (null if not visible)
- "category": one of: produce, dairy, meat, seafood, pantry, frozen, beverage, other

Skip non-food items (bags, fees, taxes, totals).

Example output:
[{"name":"Roma Tomatoes","quantity":2,"unit":"lbs","price":3.49,"category":"produce"},{"name":"Whole Milk","quantity":1,"unit":"gallon","price":4.29,"category":"dairy"}]`;

  const client = new Anthropic();
  const response = await client.messages.create({
    model: VISION_MODEL,
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: mediaType, data: base64 },
        },
        { type: 'text', text: prompt },
      ],
    }],
  });

  const text = response.content.find(b => b.type === 'text')?.text ?? '';
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('No JSON array found in response');

  const items = JSON.parse(jsonMatch[0]) as ParsedItem[];
  return items.filter((item) => item.name && item.name.trim().length > 0);
}
