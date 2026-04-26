export type ChewModule = 'pantry' | 'recipes' | 'kitchen' | 'wiki' | 'yeschef' | 'unknown';
export interface ChewRouterResult {
    module: ChewModule;
    confidence: 'high' | 'medium' | 'low';
    reason: string;
}
export declare function routeChewImage(apiKey: string, imagePath: string, model: string): Promise<ChewRouterResult>;
