export interface IOCRProvider {
  extractText(fileBuffer: Buffer, mimeType: string): Promise<string>;
}
