export enum UploadErrorMessages {
  INVALID_MIME_TYPES = "The selected file must be a JPG, JPEG, ZIP, GIF, PNG, PDF, DOCX or XLSX",
  NO_DOCUMENTS_ADDED = "Add a document to support your objection",
  NO_FILE_CHOSEN = "You must add a document",
  FILE_TOO_LARGE = "File size must be smaller than",
}

export enum DownloadErrorMessages {
  HEADING_UNAUTHORISED = "Unauthorised",
  MESSAGE_UNAUTHORISED = "You are not authorised to download this file.",
  HEADING_FORBIDDEN = "Forbidden",
  MESSAGE_FORBIDDEN = "This file cannot be downloaded.",
  HEADING_NOT_FOUND = "Not Found",
  MESSAGE_NOT_FOUND = "The file path could not be found.",
}

export enum ErrorMessages {
  ERROR_500 = "An internal server error has occurred",
}

export enum HttpStatusCodes {
  UNSUPPORTED_MEDIA_TYPE = 415,
}
