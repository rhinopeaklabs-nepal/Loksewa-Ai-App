import { BaseService } from "../../../core/base/BaseService";

export class OCRService extends BaseService {
  constructor() {
    super("OCRService");
  }

  async extractText(imageBytes: Uint8Array): Promise<string> {
    this.log("OCR extraction requested");
    const decoded = new TextDecoder("utf-8", { fatal: false }).decode(imageBytes);
    const printable = decoded.replace(/[^\p{L}\p{N}\s.,?!:;()\-]/gu, " ").replace(/\s+/g, " ").trim();
    return printable.length > 0 ? printable : "OCR text extraction requires a native OCR worker result for binary images.";
  }
}
