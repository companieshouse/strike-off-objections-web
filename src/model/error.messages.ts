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
  ERROR_SUMMARY_TITLE = "There is a problem",
  ENTER_NAME = "Enter your full name or organisation name",
  SELECT_TO_DIVULGE = "Select if we can share your name and email address with the company if they request that information",
  SELECT_TO_REMOVE = "You must tell us if you want to remove a document",
}

export enum HttpStatusCodes {
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  UNSUPPORTED_MEDIA_TYPE = 415,
}

export enum CompanySearchErrorMessages {
  INVALID_COMPANY_NUMBER = "Invalid company number",
  COMPANY_NUMBER_TOO_LONG = "Company number too long",
  NO_COMPANY_NUMBER_SUPPLIED = "You must enter a company number",
  COMPANY_NOT_FOUND = "No results found for that company number",
}
