import OpenAI from 'openai';
import { ILLMProvider, StructuredExpense } from './interface';

export class OpenAILLM implements ILLMProvider {
  private openai: OpenAI;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error("OpenAI API key is required");
    this.openai = new OpenAI({ apiKey });
  }

  async structureExpense(rawText: string): Promise<StructuredExpense> {
    const prompt = `
You are a financial data extraction assistant.
Extract the following from this receipt text and return ONLY valid JSON.

{
  "merchant": string,
  "amount": number,
  "currency": "USD" | "PKR" | "EUR" | "GBP" | null,
  "date": "YYYY-MM-DD",
  "category": "Food & Beverage" | "Transport" | "Shopping" | "Bills" | "Entertainment" | "Other"
}

Rules:
- If a field cannot be determined, use null.
- Amount must be a number (no currency symbols).
- Date must be ISO 8601 format.
- Category must be exactly one of the provided options.

Receipt text:
${rawText}
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant designed to output JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Failed to get content from OpenAI");

    const parsed = JSON.parse(content);
    
    return {
      merchant: parsed.merchant || null,
      amount: typeof parsed.amount === 'number' ? parsed.amount : null,
      currency: parsed.currency || null,
      date: parsed.date || null,
      category: parsed.category || 'Other',
      confidence: 0.95 // Arbitrary for now, or calculate based on null fields
    };
  }
}
