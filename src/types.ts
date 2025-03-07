import { Request } from "express";

interface UploadedFile {
  filename: string;
  mimeType: string;
  data: Buffer;
}

export interface FileUploadRequest extends Request {
  files?: UploadedFile[]; // Ensure req.files exists
  body: { [key: string]: any }; // Ensure req.body exists
  fileUploadError?: Error; // Capture any upload errors
}

