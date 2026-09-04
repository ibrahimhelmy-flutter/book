import { IAiQuestionGenerator } from "../../domain/interfaces/IAiQuestionGenerator";
import { RuleBasedAiQuestionGenerator } from "./RuleBasedAiQuestionGenerator";

export class AiProviderRegistry {
  private static providers: Map<string, IAiQuestionGenerator> = new Map();
  private static defaultProviderName = "rule_based";

  static {
    // Register default built-in generator
    this.providers.set("rule_based", new RuleBasedAiQuestionGenerator());
  }

  public static register(name: string, provider: IAiQuestionGenerator): void {
    this.providers.set(name, provider);
  }

  public static get(name?: string): IAiQuestionGenerator {
    const providerName = name || this.defaultProviderName;
    const provider = this.providers.get(providerName);
    if (!provider) {
      // Fallback to default
      return this.providers.get(this.defaultProviderName)!;
    }
    return provider;
  }
}
