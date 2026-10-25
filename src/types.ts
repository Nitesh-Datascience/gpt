export type AppTab = 
  | 'playground' 
  | 'arena' 
  | 'benchmarks' 
  | 'calculator' 
  | 'tools' 
  | 'cookbook';

export interface GenerationMetrics {
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  tokensPerSecond: number;
  estimatedCostUsd: number;
  model: string;
  isRealOpenAi?: boolean;
}

export interface GenerationResult {
  text: string;
  metrics?: GenerationMetrics;
  error?: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: 'Coding' | 'Data Extraction' | 'Reasoning' | 'Creative' | 'System';
  description: string;
  systemPrompt: string;
  userPrompt: string;
  jsonMode?: boolean;
  jsonSchema?: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required?: string[];
  };
}

export interface BenchmarkComparison {
  name: string;
  category: 'General' | 'Coding' | 'Math' | 'Multilingual' | 'Vision';
  description: string;
  gpt4oMini: number;
  gpt4o: number;
  gpt35Turbo: number;
  geminiFlash: number;
  claudeHaiku: number;
  unit: string;
}
