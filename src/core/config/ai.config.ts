/**
 * AI Provider & Generation Configuration
 * Abstracted to support multiple providers (Gemini, OpenRouter, Rule-based, etc.)
 */

export interface AiProviderConfig {
  defaultProvider: "rule_based" | "gemini" | "openrouter";
  temperature: number;
  maxRetries: number;
  batchSize: number;
  enableQualityValidation: boolean;
  minQualityScore: number; // 0 to 10
}

export const AI_CONFIG: AiProviderConfig = {
  defaultProvider: "rule_based",
  temperature: 0.2, // low temperature for faithful, deterministic educational extraction
  maxRetries: 3,
  batchSize: 10,
  enableQualityValidation: true,
  minQualityScore: 8,
};
