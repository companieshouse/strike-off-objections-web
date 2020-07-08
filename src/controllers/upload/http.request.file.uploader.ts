import Busboy from "busboy";
import { Request } from "express";
import { Socket } from "net";
import logger from "../../utils/logger";

/**
 * The callback functions needed to upload a file using the uploadFile function
 */
export interface UploadFileCallbacks {
  fileSizeLimitExceededCallback: (filename: string, maxSizeBytes: number) => void;
  noFileDataReceivedCallback: (filename: string) => void;
  uploadFinishedCallback: (filename: string, fileData: Buffer, mimeType: string) => void;
}

/**
 * Upload File
 * Uses Busboy to upload a file from the client.
 * Looks for the file in a field type "file" in a multipart/form-data form
 * @param req
 * @param maxSizeBytes
 * @param callbacks
 */
export const uploadFile = (req: Request,
                           maxSizeBytes: number,
                           callbacks: UploadFileCallbacks) => {

  const chunkArray: Buffer[] = [];

  const busboy: busboy.Busboy = new Busboy(
    {
      headers: req.headers,
      limits: {
        fileSize: maxSizeBytes,
      },
  });

  // Busboy on file received event - start of file upload process when start of a file is initially received
  busboy.on("file",
            (_fieldName: string,
             fileStream: Socket,
             filename: string,
             _encoding: string,
             mimeType: string) => {

    // File on data event - fired when a new chunk of data arrives into busboy
    fileStream.on("data", (chunk: Buffer) => {
      chunkArray.push(chunk);
      logger.trace("Received " + chunk.length + " bytes for file " + filename);
    });

    // File on limit event - fired when file size limit is reached
    fileStream.on("limit", () => {
      fileStream.destroy();
      return callbacks.fileSizeLimitExceededCallback(filename, maxSizeBytes);
    });

    // File on end event - fired when file has finished - could be if file completed fully or ended
    // prematurely (destroyed / cancelled)
    fileStream.on("end", async () => {
      // if file ended prematurely - do nothing
      if (fileStream.destroyed) {
        return;
      }
      const fileData: Buffer = Buffer.concat(chunkArray);
      logger.debug("Total bytes received for " + filename + " = " + fileData.length);
      if (fileData.length === 0) {
        return callbacks.noFileDataReceivedCallback(filename);
      }

      return callbacks.uploadFinishedCallback(filename, fileData, mimeType);
    }); // end fileStream.on("end") event
  }); // end busboy.on("file") event

  // send the request to busboy
  req.pipe(busboy);
};
