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
  OPEN,
  SUBMITTED,
  PROCESSED,
}

/**
 * Data structure for patching an Objection
 * @interface
 */
export interface ObjectionPatch {
  reason?: string;
  status?: ObjectionStatus;
}