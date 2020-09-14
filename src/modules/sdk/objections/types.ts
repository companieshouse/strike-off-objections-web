import { Readable } from "stream";

/**
 * Api Error
 * @interface
 */
export interface ApiError {
  data: any;
  message: string;
  status: number;
}

/**
 * Status of Objection
 * @enum
 */
export enum ObjectionStatus {
  // Note use of String enums to ensure that correct status values are mapped to/from API calls
  INELIGIBLE_COMPANY_STRUCK_OFF = "INELIGIBLE_COMPANY_STRUCK_OFF",
  INELIGIBLE_NO_DISSOLUTION_ACTION = "INELIGIBLE_NO_DISSOLUTION_ACTION",
  OPEN = "OPEN",
  PROCESSED = "PROCESSED",
  SUBMITTED = "SUBMITTED",
}

/**
 * Data structure for creating an Objection
 * @interface
 */
export interface ObjectionCreate {
  fullName: string;
  shareIdentity: boolean;
}

/**
 * Data structure for patching an Objection
 * @interface
 */
export interface ObjectionPatch {
  reason?: string;
  status?: ObjectionStatus;
}

/**
 * List of attachments for an objection
 * @interface
 */
export interface Attachment {
  id: string;
  name: string;
}

/**
 * Data structure representing an Objection
 * @interface
 */
export interface Objection {
  reason: string;
  created_by: CreatedBy,
  attachments: Array<{
    name: string;
  }>;
}

export interface CreatedBy {
  fullName: string,
  shareIdentity: boolean
}


export const HEADER_CONTENT_DISPOSITION = "content-disposition";
export const HEADER_CONTENT_LENGTH = "content-length";
export const HEADER_CONTENT_TYPE = "content-type";

/**
 * Data structure containing the download
 * @interface
 */
export interface Download {
  data: Readable;
  headers: {
    [HEADER_CONTENT_DISPOSITION]: string;
    [HEADER_CONTENT_LENGTH]: string;
    [HEADER_CONTENT_TYPE]: string;
  };
}
