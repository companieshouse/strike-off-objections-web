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
  OPEN = "OPEN",
  SUBMITTED = "SUBMITTED",
  PROCESSED = "PROCESSED",
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
  attachments: Array<{
    name: string;
  }>;
}
