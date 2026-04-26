/**
 * Chew Equipment skill — processes a kitchen equipment image via Claude Code
 * subprocess, identifies the item and finds a product link, then saves to Chew.
 *
 * Flow:
 *   1. POST image to Chew /api/kitchen/equipment/record  → get { id, imagePath (absolute) }
 *   2. runPrompt subprocess reads the image → identifies equipment + searches web
 *   3. PUT identified fields to Chew /api/kitchen/equipment/:id
 */
import fs from 'node:fs';
import path from 'node:path';
export async function processEquipmentImage(imagePath, chewUrl, runPrompt) {
    console.log(`[chew/equipment] processEquipmentImage imagePath=${imagePath} chewUrl=${chewUrl}`);
    // Step 1: Read the attachment and POST to Chew to create the equipment record
    let fileBuffer;
    try {
        fileBuffer = fs.readFileSync(imagePath);
        console.log(`[chew/equipment] image read OK (${Math.round(fileBuffer.length / 1024)} KB)`);
    }
    catch (err) {
        return `Could not read image file: ${err instanceof Error ? err.message : String(err)}`;
    }
    const filename = path.basename(imagePath);
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
        '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
        '.png': 'image/png', '.webp': 'image/webp', '.heic': 'image/heic',
    };
    const contentType = mimeTypes[ext] ?? 'image/jpeg';
    const formData = new FormData();
    formData.append('file', new Blob([new Uint8Array(fileBuffer)], { type: contentType }), filename);
    let record;
    try {
        console.log(`[chew/equipment] POST ${chewUrl}/api/kitchen/equipment/record`);
        const res = await fetch(`${chewUrl}/api/kitchen/equipment/record`, {
            method: 'POST',
            body: formData,
            signal: AbortSignal.timeout(30_000),
        });
        if (!res.ok) {
            const body = await res.text().catch(() => '');
            return `Chew record error ${res.status}: ${body.slice(0, 200)}`;
        }
        record = await res.json();
        console.log(`[chew/equipment] record id=${record.id} imagePath=${record.imagePath}`);
    }
    catch (err) {
        return `Could not reach Chew at ${chewUrl}: ${err instanceof Error ? err.message : String(err)}`;
    }
    // Step 2: Identify the equipment via Claude Code subprocess (uses Pro quota)
    const identifyPrompt = [
        `Read the image at this path: ${record.imagePath}`,
        '',
        'This is a photo of a kitchen equipment item. Identify it, then use web_search to find a product page for this or a very similar item.',
        '',
        'Return ONLY a JSON object — no markdown, no explanation, no code fences:',
        '{',
        '  "name": "full descriptive item name (required)",',
        '  "brand": "brand name or null if not visible",',
        '  "model": "model name or number or null",',
        '  "category": "one of: appliance, cookware, bakeware, tool, storage, other",',
        '  "condition": "one of: excellent, good, fair, poor — based on visible wear",',
        '  "notes": "one-sentence description of the item, or null",',
        '  "productUrl": "URL to a product page for this or a similar item, or null"',
        '}',
    ].join('\n');
    console.log('[chew/equipment] running Claude Code subprocess for equipment identification');
    const result = await runPrompt(identifyPrompt);
    if (!result.success) {
        console.error(`[chew/equipment] subprocess failed (exit ${result.exit_code}): ${result.output.slice(0, 200)}`);
        return `Equipment image saved but identification failed. Open Chew to add details manually. (${result.output.slice(0, 100)})`;
    }
    // Extract JSON from output
    let identified;
    try {
        const match = result.output.match(/\{[\s\S]*\}/);
        if (!match)
            throw new Error('No JSON object found in output');
        identified = JSON.parse(match[0]);
    }
    catch (err) {
        console.error('[chew/equipment] JSON parse error:', err, '\nOutput:', result.output.slice(0, 300));
        return `Equipment saved but could not parse identification. Open Chew to add details manually.`;
    }
    console.log(`[chew/equipment] identified: ${identified.name}`);
    // Step 3: Update the equipment record with identified fields
    try {
        console.log(`[chew/equipment] PUT ${chewUrl}/api/kitchen/equipment/${record.id}`);
        const putRes = await fetch(`${chewUrl}/api/kitchen/equipment/${record.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(identified),
            signal: AbortSignal.timeout(15_000),
        });
        if (!putRes.ok) {
            return `Identified as "${identified.name}" but save failed (${putRes.status}). Open Chew to review.`;
        }
    }
    catch (err) {
        return `Identified as "${identified.name}" but save failed: ${err instanceof Error ? err.message : String(err)}`;
    }
    // Format summary
    const parts = [`Equipment added to Kitchen: ${identified.name}`];
    if (identified.brand)
        parts.push(`Brand: ${identified.brand}`);
    if (identified.model)
        parts.push(`Model: ${identified.model}`);
    parts.push(`Category: ${identified.category}`);
    if (identified.notes)
        parts.push(`Notes: ${identified.notes}`);
    if (identified.productUrl)
        parts.push(`Product: ${identified.productUrl}`);
    else
        parts.push('No product link found.');
    return parts.join('\n');
}
