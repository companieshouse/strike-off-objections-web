export enum UploadErrorMessages {
  INVALID_MIME_TYPES = "The selected file must be a JPG, JPEG, ZIP, GIF, PNG, PDF, DOCX or XLSX",
  NO_DOCUMENTS_ADDED = "Add a document to support your objection",
  NO_FILE_CHOSEN = "You must add a document",
  FILE_TOO_LARGE = "File size must be smaller than",
}

export enum DownloadErrorMessages {
  HEADING_NOT_FOUND = "Not Found",
  MESSAGE_NOT_FOUND = "The file path could not be found.",
}

export enum ErrorMessages {
  ERROR_500 = "An internal server error has occurred",
}

export enum HttpStatusCodes {
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  UNSUPPORTED_MEDIA_TYPE = 415,
}
