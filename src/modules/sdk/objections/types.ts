import * as he from "he";

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
 * Class representing an Objection
 * @class
 */
export class Objection {
  private readonly _reason: string;
  private readonly _attachments: Array<{
    name: string;
  }>;

  constructor(reason: string, attachments: Array<{ name: string }>) {
    this._reason = reason;
    this._attachments = attachments;
  }

  get reason(): string {
    return this._reason;
  }

  get attachments(): Array<{ name: string }> {
    return this._attachments;
  }

  public getHtmlEncoded(): Objection {
    const htmlReason: string = he.encode(this._reason);
    const htmlAttachments: Array<{name: string}> = [];

    this._attachments.forEach((attachment) => {
      const name = he.encode(attachment.name);
      const encodedAttachment = {
        name,
      };

      htmlAttachments.push(encodedAttachment);
    });

    return new Objection(
      htmlReason,
      htmlAttachments,
    );
  }
}
