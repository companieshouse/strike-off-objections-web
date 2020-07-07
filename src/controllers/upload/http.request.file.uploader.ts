import Busboy from "busboy";
import { Request } from "express";
import { Socket } from "net";
import logger from "../../utils/logger";

export const uploadFile = (req: Request,
                           maxSizeBytes: number,
                           fileLimitExceededCallback: (filename: string, maxInMB: number) => void,
                           noFileDataReceivedCallback: (filename: string) => void,
                           uploadFinishedCallback: (filename: string, fileData: Buffer, mimeType: string) => void) => {

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
            (fieldName: string,
             fileStream: Socket,
             filename: string,
             encoding: string,
             mimeType: string) => {

    // File on data event - fired when a new chunk of data arrives into busboy
    fileStream.on("data", (chunk: Buffer) => {
      chunkArray.push(chunk);
      logger.trace("Received " + chunk.length + " bytes for file " + filename);
    });

    // File on limit event - fired when file size limit is reached
    fileStream.on("limit", () => {
      fileStream.destroy();
      const maxInMB: number = getMaxFileSizeInMB(maxSizeBytes);
      return fileLimitExceededCallback(filename, maxInMB);
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
        return noFileDataReceivedCallback(filename);
      }

      return uploadFinishedCallback(filename, fileData, mimeType);
    }); // end fileStream.on("end") event
  }); // end busboy.on("file") event

  // send the request to busboy
  req.pipe(busboy);
};

// Gets max file size in MB rounded down to nearest whole number
const getMaxFileSizeInMB = (maxSizeInBytes: number): number => {
  return Math.floor(maxSizeInBytes / (1024 * 1024));
};
