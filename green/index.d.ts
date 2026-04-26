/**
 * Chew — Green-facing skill exports.
 *
 * Consumed by Project Green as a local package dependency ("chew": "file:../chew/green").
 * All /chew and /equipment slash-command logic lives here; Green only wires the
 * PromptRunner callback and delegates to these functions.
 */
export type { ChewModule, ChewRouterResult } from './router.js';
export { routeChewImage } from './router.js';
export { processReceiptImage } from './pantry.js';
export { processEquipmentImage } from './equipment.js';
/**
 * Abstraction over Green's runClaudeCode — passed in by the caller so this
 * package has no dependency on Green internals.
 */
export type PromptRunner = (prompt: string) => Promise<{
    success: boolean;
    output: string;
    exit_code: number | null;
}>;
