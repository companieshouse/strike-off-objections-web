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
  INELIGIBLE_GAZ2_REQUESTED = "INELIGIBLE_GAZ2_REQUESTED",
  OPEN = "OPEN",
  PROCESSED = "PROCESSED",
  SUBMITTED = "SUBMITTED",
}

/**
 * Eligibility Status of a Company
 * @enum
 */
export enum EligibilityStatus {
  ELIGIBLE = "ELIGIBLE",
  INELIGIBLE_COMPANY_STRUCK_OFF = "INELIGIBLE_COMPANY_STRUCK_OFF",
  INELIGIBLE_NO_DISSOLUTION_ACTION = "INELIGIBLE_NO_DISSOLUTION_ACTION",
  INELIGIBLE_GAZ2_REQUESTED = "INELIGIBLE_GAZ2_REQUESTED",
}

/**
 * Eligibility of a company
 * @interface
 */
export interface CompanyEligibility {
  is_eligible: boolean;
  eligibility_status: EligibilityStatus;
}

/**
 * Data structure for creating an Objection
 * @interface
 */
export interface ObjectionCreate {
  objector: string;
  full_name: string;
  share_identity: boolean;
}

/**
 * Data structure for patching an Objection
 * @interface
 */
export interface ObjectionPatch {
  objector?: string;
  full_name?: string;
  share_identity?: boolean;
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
  id: string,
  attachments: Array<{
    name: string;
  }>,
  created_by: CreatedBy,
  reason?: string;
  status: ObjectionStatus;
}

export interface CreatedBy {
  objector: string,
  full_name: string,
  share_identity: boolean
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

/**
 * Data structure containing the response after creating an Objection
 * @interface
 */
export interface ObjectionCreatedResponse {
  objectionId: string;
  objectionStatus: ObjectionStatus;
}
