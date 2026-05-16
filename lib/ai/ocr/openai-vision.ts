import { IOCRProvider } from './interface';

export class OpenAIVisionOCR implements IOCRProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error("OpenAI API key is required");
    this.apiKey = apiKey;
  }

  async extractText(fileBuffer: Buffer, mimeType: string): Promise<string> {
    // Convert buffer to base64
    const base64Image = fileBuffer.toString('base64');

    // Determine the correct mime type for the API
    const imageType = mimeType === 'application/pdf' ? 'pdf' : mimeType.split('/')[1];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract ALL text visible in this receipt image. Return just the raw text content, preserving the layout as much as possible. Include all merchant names, addresses, line items, prices, totals, dates, and any other text visible.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI Vision Error:', errorData);
      throw new Error(`OpenAI Vision API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content;

    if (!text) {
      throw new Error("Failed to extract text from image");
    }

    return text;
  }
}