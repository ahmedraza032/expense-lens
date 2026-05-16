import { OpenAIVisionOCR } from './ocr/openai-vision';
import { OpenAILLM } from './llm/openai';

export async function processReceipt(fileBuffer: Buffer, mimeType: string) {
  const ocrProvider = new OpenAIVisionOCR(process.env.OPENAI_API_KEY!);
  const llmProvider = new OpenAILLM(process.env.OPENAI_API_KEY!);

  const rawText = await ocrProvider.extractText(fileBuffer, mimeType);

  if (!rawText) {
    throw new Error("No text found in the image.");
  }

  const expense = await llmProvider.structureExpense(rawText);

  return { rawText, expense };
}