import { AzureOpenAI } from 'openai';

const client = new AzureOpenAI({
  endpoint: process.env.AZURE_FOUNDRY_ENDPOINT!,
  apiKey: process.env.AZURE_FOUNDRY_KEY!,
  apiVersion: process.env.AZURE_FOUNDRY_API_VERSION || '2024-12-01-preview',
  deployment: process.env.AZURE_FOUNDRY_DEPLOYMENT || 'gpt-4o',
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callFoundry(
  messages: ChatMessage[],
  maxTokens = 600
): Promise<string> {
  const response = await client.chat.completions.create({
    model: process.env.AZURE_FOUNDRY_DEPLOYMENT || 'gpt-4o',
    messages,
    max_tokens: maxTokens,
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No content returned from Foundry');
  return content;
}
