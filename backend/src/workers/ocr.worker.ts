import { Worker, type ConnectionOptions, type Job } from "bullmq";
import { OCRService } from "../domains/scan/services/OCRService";

export interface OcrJobData {
  scanJobId: string;
  imageBytesBase64?: string;
}

export const ocrWorker = {
  name: "ocr.worker",
  queue: "scan"
};

export function createOcrWorker(connection: ConnectionOptions): Worker<OcrJobData> {
  const service = new OCRService();
  return new Worker<OcrJobData>(
    ocrWorker.queue,
    async (job: Job<OcrJobData>) => {
      const bytes = job.data.imageBytesBase64
        ? Uint8Array.from(Buffer.from(job.data.imageBytesBase64, "base64"))
        : new Uint8Array();
      const extractedText = await service.extractText(bytes);
      return { scanJobId: job.data.scanJobId, extractedText };
    },
    { connection }
  );
}
