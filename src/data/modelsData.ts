import { BenchmarkComparison, PromptTemplate, ToolDefinition } from '../types';

export const GPT_4O_MINI_SPECS = {
  name: 'GPT-4o mini',
  provider: 'OpenAI',
  releaseDate: 'July 18, 2024',
  contextWindow: 128000,
  maxOutputTokens: 16384,
  knowledgeCutoff: 'October 2023',
  inputPricingPerM: 0.15,
  outputPricingPerM: 0.60,
  cachedInputPricingPerM: 0.075,
  modalities: ['Text', 'Vision', 'Multimodal (Audio via Realtime API)'],
  architecture: 'Dense/MoE hybrid optimized for sub-100ms first-token latency',
  keyHighlights: [
    'Over 60% cheaper than GPT-3.5 Turbo with superior intelligence',
    'Outperforms GPT-4 (classic) on many reasoning and coding benchmarks',
    'Native Structured Outputs with 100% adherence to supplied JSON Schemas',
    '128K context window with 16K max completion tokens per turn',
    'High throughput: routinely achieves 80-140+ tokens/second in production',
  ],
};

export const BENCHMARKS_DATA: BenchmarkComparison[] = [
  {
    name: 'MMLU',
    category: 'General',
    description: 'Massive Multitask Language Understanding (57 subjects covering STEM, humanities, law, etc.)',
    gpt4oMini: 82.0,
    gpt4o: 88.7,
    gpt35Turbo: 70.0,
    geminiFlash: 78.9,
    claudeHaiku: 75.2,
    unit: '%',
  },
  {
    name: 'HumanEval',
    category: 'Coding',
    description: 'Python code synthesis and algorithmic problem solving (pass@1)',
    gpt4oMini: 87.2,
    gpt4o: 90.2,
    gpt35Turbo: 48.1,
    geminiFlash: 74.3,
    claudeHaiku: 75.9,
    unit: '%',
  },
  {
    name: 'MATH',
    category: 'Math',
    description: 'Challenging high school and collegiate competition mathematics',
    gpt4oMini: 70.2,
    gpt4o: 76.6,
    gpt35Turbo: 34.1,
    geminiFlash: 55.5,
    claudeHaiku: 48.9,
    unit: '%',
  },
  {
    name: 'MGSM',
    category: 'Multilingual',
    description: 'Multilingual Grade School Math across 10 languages',
    gpt4oMini: 87.0,
    gpt4o: 90.5,
    gpt35Turbo: 54.7,
    geminiFlash: 79.0,
    claudeHaiku: 71.4,
    unit: '%',
  },
  {
    name: 'MMMU (Vision)',
    category: 'Vision',
    description: 'Multi-discipline college-level visual reasoning benchmark',
    gpt4oMini: 59.4,
    gpt4o: 69.1,
    gpt35Turbo: 0.0, // No vision
    geminiFlash: 56.1,
    claudeHaiku: 50.2,
    unit: '%',
  },
  {
    name: 'MathVista',
    category: 'Vision',
    description: 'Mathematical problem solving within charts, geometry, and plots',
    gpt4oMini: 56.7,
    gpt4o: 63.8,
    gpt35Turbo: 0.0,
    geminiFlash: 53.4,
    claudeHaiku: 46.8,
    unit: '%',
  },
];

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'json-entity-extraction',
    title: 'Strict JSON Entity Extractor',
    category: 'Data Extraction',
    description: 'Extracts invoices, line items, totals, and metadata with strict schema adherence.',
    systemPrompt: 'You are a precise data extraction specialist. Extract the data exactly according to the schema provided. Do not hallucinate or omit fields.',
    userPrompt: `Invoice #INV-2024-8849
Date: Oct 14, 2024
Vendor: Nexus Cloud Systems, 100 Tech Blvd, Austin, TX
Client: Apex Dynamics Inc.
Items:
1. 4x Dedicated GPU Nodes (H100) @ $2,450.00 each = $9,800.00
2. Enterprise Support SLA (Monthly) @ $1,200.00
3. 2TB Cold Storage Provisioning @ $180.00
Tax (8.25%): $922.35
Total Due: $12,102.35
Payment Terms: Net 30, due Nov 13, 2024.`,
    jsonMode: true,
    jsonSchema: JSON.stringify(
      {
        type: 'object',
        properties: {
          invoice_id: { type: 'string' },
          date: { type: 'string' },
          vendor: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              address: { type: 'string' },
            },
            required: ['name', 'address'],
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                description: { type: 'string' },
                quantity: { type: 'number' },
                unit_price: { type: 'number' },
                total: { type: 'number' },
              },
              required: ['description', 'quantity', 'unit_price', 'total'],
            },
          },
          tax_amount: { type: 'number' },
          total_due: { type: 'number' },
          due_date: { type: 'string' },
        },
        required: ['invoice_id', 'date', 'vendor', 'items', 'total_due'],
      },
      null,
      2
    ),
  },
  {
    id: 'code-refactor-security',
    title: 'TypeScript Performance & Security Auditor',
    category: 'Coding',
    description: 'Analyzes code for SQL injection, memory leaks, async bottlenecks, and suggests optimized refactors.',
    systemPrompt: 'You are an elite Principal Software Security Engineer. Audit the provided code, identify security vulnerabilities and performance bottlenecks, and provide a refactored production-ready version with explanations.',
    userPrompt: `async function fetchUserData(req: any, res: any) {
  const userId = req.query.id;
  // Query DB directly
  const query = "SELECT * FROM users WHERE id = '" + userId + "'";
  const user = await db.raw(query);
  
  // N+1 issue: fetch orders
  const orders = [];
  for (let i = 0; i < user.orderIds.length; i++) {
    const order = await db('orders').where({ id: user.orderIds[i] }).first();
    orders.push(order);
  }
  
  res.json({ user, orders });
}`,
    jsonMode: false,
  },
  {
    id: 'chain-of-thought-reasoning',
    title: 'Chain-of-Thought Logic & Proof',
    category: 'Reasoning',
    description: 'Forces deliberate step-by-step mathematical reasoning to solve multi-step problems.',
    systemPrompt: 'You are an advanced mathematical logic assistant. Think step-by-step through the puzzle before providing your final answer. Clearly delimit your thinking process and final conclusion.',
    userPrompt: 'A company has 3 servers. Server A handles 40% of traffic and fails 1% of the time. Server B handles 35% of traffic and fails 2% of the time. Server C handles 25% of traffic and fails 4% of the time. If a user encounters a failed request, what is the exact probability that it originated from Server C? Show all Bayes theorem steps.',
    jsonMode: false,
  },
  {
    id: 'multilingual-localization',
    title: 'Idiomatic UI / Copy Localizer',
    category: 'Creative',
    description: 'Translates and culturally adapts product messaging into Spanish, Japanese, German, and French.',
    systemPrompt: 'You are a global product localization director. Adapt English SaaS marketing copy into idiomatic, culturally natural phrasing for international audiences. Avoid literal translations.',
    userPrompt: `Headline: "Supercharge your pipeline with instant AI-driven insight."
Subheader: "Stop wrestling with unruly spreadsheets. Automate compliance in one click and ship with total confidence."
CTA: "Start Free 14-Day Trial — No Credit Card Required"`,
    jsonMode: false,
  },
  {
    id: 'sql-query-architect',
    title: 'Complex PostgreSQL Window & CTE Generator',
    category: 'Coding',
    description: 'Generates high-performance SQL queries with window functions and indexing recommendations.',
    systemPrompt: 'You are a veteran Database Administrator & SQL Performance Architect. Write production-optimized SQL with clear CTEs, window functions, and indexing hints.',
    userPrompt: `Given a table 'user_events' (user_id UUID, event_name VARCHAR, created_at TIMESTAMP, revenue_usd NUMERIC):
Write a query to calculate:
1. The 7-day rolling revenue per user.
2. The user's rank within their cohort based on lifetime spend.
3. The churn risk flag (user has not triggered any event in the last 14 days relative to max created_at).`,
    jsonMode: false,
  },
];

export const PRESET_TOOLS: ToolDefinition[] = [
  {
    name: 'get_stock_quote',
    description: 'Retrieve real-time market data, price, change, and trading volume for a stock ticker symbol.',
    parameters: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'The stock ticker symbol, e.g. NVDA, AAPL, MSFT, GOOGL',
        },
        include_technical_indicators: {
          type: 'boolean',
          description: 'Whether to include 50-day and 200-day moving averages',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'search_vector_database',
    description: 'Perform a semantic vector similarity search across internal knowledge base documents.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The natural language search query',
        },
        collection: {
          type: 'string',
          enum: ['engineering_docs', 'hr_policies', 'customer_tickets', 'sales_contracts'],
          description: 'Target document collection',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of documents to retrieve (1-20)',
        },
      },
      required: ['query', 'collection'],
    },
  },
  {
    name: 'send_slack_alert',
    description: 'Post an urgent incident alert or notification to a Slack channel.',
    parameters: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'The target channel name, e.g. #ops-incidents or #dev-general',
        },
        severity: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'critical'],
          description: 'Incident severity level',
        },
        message: {
          type: 'string',
          description: 'The Markdown formatted message body',
        },
      },
      required: ['channel', 'severity', 'message'],
    },
  },
];
