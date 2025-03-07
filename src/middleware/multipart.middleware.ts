import { Response, NextFunction } from "express";
import { Socket } from "net";
import logger from "../utils/logger";
import { MAX_FILE_SIZE_BYTES } from "../utils/properties";
import { FileUploadRequest } from "../types";

/**
 * Upload file and extract CSRF token
 */
export const MultipartMiddleware = async (req: FileUploadRequest, res: Response, next: NextFunction) => {

    if (!req.is("multipart/form-data")) {
        return next();
    }

    req.body = {};
    req.files = [];

    const maxFileSizeBytes: number = parseInt(MAX_FILE_SIZE_BYTES, 10);

    const Busboy = require('busboy');

    const busboy = Busboy(
        {
            headers: req.headers,
            preservePath: true,
            limits: {
                fileSize: maxFileSizeBytes,
            },
        },
    );

    // Extract _csrf from the form fields
    busboy.on("field", (name: string, value: string) => {
        if (name === "_csrf") {
            req.body[name] = value;
        }
    });

    // Busboy on file received event - start of file upload process when start of a file is initially received
    busboy.on("file",
              (name:string, file:Socket, info:{ filename: string; mimeType: string }) => {

                  const { filename, mimeType } = info;

                  const chunkArray: Buffer[] = [];

                  // File on data event - fired when a new chunk of data arrives into busboy
                  file.on("data", (chunk: Buffer) => {
                      chunkArray.push(chunk);
                      logger.trace("Received " + chunk.length + " bytes for file " + filename);
                  });

                  // File on limit event - fired when file size limit is reached
                  file.on("limit", async () => {
                      file.resume();
                      req.body.fileSizeLimitExceeded = true;
                      req.body.filename = filename;
                      logger.trace("File size limit exceeded for file " + filename);
                  });

                  // File on end event - fired when file has finished - could be if file completed fully or ended
                  // prematurely (destroyed / cancelled)
                  file.on("end", () => {
                      if (req.body.fileSizeLimitExceeded) {
                          logger.error(`File size limit exceeded: ${filename}`);
                          return;
                      }
                      const fileData: Buffer = Buffer.concat(chunkArray);
                      logger.debug("Total bytes received for file = " + fileData.length);
                      if (fileData.length === 0) {
                          logger.error(`Empty file uploaded: ${filename}`);
                          return;
                      }

                      req.files!.push({ filename, mimeType, data: fileData });
                      logger.debug(`File upload complete: ${filename}, size: ${fileData.length} bytes`);
                  }); // end fileStream.on("end") event
    }); // end busboy.on("file") event

    busboy.on("finish", () => {
                  logger.debug("Busboy parsing complete, passing request to next middleware");
                  next();
    });
    // send the request to busboy and starts the upload
    req.pipe(busboy);
};
