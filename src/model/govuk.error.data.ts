// Used by the Gov.uk nunjucks components to extract
// validation error messages

export interface IGovUkErrorData {
  href: string;
  flag: boolean;
  text: string;
  type: string;
}

export const createGovUkErrorData = (errorText: string,
                                     errorHref: string,
                                     errorFlag: boolean,
                                     errorType: string): IGovUkErrorData => {
  return {
    flag: errorFlag,
    href: errorHref,
    text: errorText,
    type: errorType,
  };
};
