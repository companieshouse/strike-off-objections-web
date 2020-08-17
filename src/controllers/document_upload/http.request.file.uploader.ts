import Busboy from "busboy";
import { Request } from "express";
import { Socket } from "net";
import logger from "../../utils/logger";

/**
 * The callback functions needed to upload a file using the uploadFile function
 * You provide functions to be executed when the following events occur
 * File size limit exceeded
 * No file data received
 * Upload finished
 */
export interface UploadFileCallbacks {
  /**
   * File size limit exceeded
   * @param {string} filename of the file being uploaded
   * @param {number} maxSizeBytes the maximum file size allowed in bytes
   */
  fileSizeLimitExceededCallback: (filename: string, maxSizeBytes: number) => Promise<void>;
  /**
   * No file data received
   * @param {string} filename of the file being uploaded
   */
  noFileDataReceivedCallback: (filename: string) => Promise<void>;
  /**
   * Upload finished
   * @param {string} filename of the file being uploaded
   * @param {Buffer} fileData the data contained in the file
   * @param {string} mimeType of the file being uploaded
   */
  uploadFinishedCallback: (filename: string, fileData: Buffer, mimeType: string) => Promise<void>;
}

/**
 * Upload File
 * Uses Busboy to upload a file from the client.
 * Looks for the file in a field type "file" in a multipart/form-data form
 * @param {Request} req the http request
 * @param {number} maxFileSizeBytes the maximum allowed size of file in bytes
 * @param {UploadFileCallbacks} callbacks the functions you provide to be executed on file upload events
 */
export const uploadFile = (req: Request,
  maxFileSizeBytes: number,
  callbacks: UploadFileCallbacks) => {

  const chunkArray: Buffer[] = [];

  const busboy: busboy.Busboy = new Busboy(
    {
      headers: req.headers,
      limits: {
        fileSize: maxFileSizeBytes,
      },
    },
  );

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
      fileStream.on("limit", async () => {
        fileStream.destroy();
        return await callbacks.fileSizeLimitExceededCallback(filename, maxFileSizeBytes);
      });

      // File on end event - fired when file has finished - could be if file completed fully or ended
      // prematurely (destroyed / cancelled)
      fileStream.on("end", async () => {
      // if file ended prematurely - do nothing
        if (fileStream.destroyed) {
          return;
        }
        const fileData: Buffer = Buffer.concat(chunkArray);
        logger.debug("Total bytes received for file = " + fileData.length);
        if (fileData.length === 0) {
          return await callbacks.noFileDataReceivedCallback(filename);
        }

        return await callbacks.uploadFinishedCallback(filename, fileData, mimeType);
      }); // end fileStream.on("end") event
    }); // end busboy.on("file") event

  // send the request to busboy and starts the upload
  req.pipe(busboy);
};
