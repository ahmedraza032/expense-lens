import { IOCRProvider } from './interface';

export class GoogleVisionOCR implements IOCRProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error("Google Vision API key is required");
    this.apiKey = apiKey;
  }

  async extractText(fileBuffer: Buffer, mimeType: string): Promise<string> {
    const base64Image = fileBuffer.toString('base64');
    
    // We use the REST API directly since we are authenticating with an API key
    // rather than a Google Service Account credentials file.
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64Image },
            features: [{ type: 'TEXT_DETECTION' }]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Vision Error:', errorData);
      throw new Error(`Google Vision API error: ${response.statusText}`);
    }

    const data = await response.json();
    const textAnnotations = data.responses[0]?.textAnnotations;
    
    if (!textAnnotations || textAnnotations.length === 0) {
      return "";
    }

    // The first annotation contains the entire extracted text
    return textAnnotations[0].description;
  }
}
