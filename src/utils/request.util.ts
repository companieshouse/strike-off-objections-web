import logger from "../utils/logger";

export const STRIKE_OFF_OBJECTIONS_OBJECTING_ENTITY_NAME = /\/strike-off-objections\/objecting-entity-name/;
export const STRIKE_OFF_OBJECTIONS_ENTER_INFORMATION =  /\/strike-off-objections\/enter-information/;
export const STRIKE_OFF_OBJECTIONS_DOCUMENT_UPLOAD =  /\/strike-off-objections\/document-upload/;

// create a whitelist with all relevant redirects needed
const REDIRECTS_WHITELIST: RegExp[] = [
  STRIKE_OFF_OBJECTIONS_OBJECTING_ENTITY_NAME,
  STRIKE_OFF_OBJECTIONS_DOCUMENT_UPLOAD,
  STRIKE_OFF_OBJECTIONS_ENTER_INFORMATION
];


/* getWhitelistedReturnToURL performs checks on the return to URL to be used in a redirect, as it is obtained from the
inbound request, and therefore potentially subject to forging attacks.
 Without these checks, SonarQube reports that the affected redirects contain a Blocker level security vulnerability.
 Throws an Error if no match found. */
export const getWhitelistedReturnToURL = (returnToUrl: string) => {
  logger.info(`Looking up return to URL ${returnToUrl} in whitelist.`);
  let value: string | null;
  for (const expression of REDIRECTS_WHITELIST) {
    value = extractValueIfPresentFromRequestField(returnToUrl, expression);
    if (value) {return value;}
  }
  const error = `Return to URL ${returnToUrl} not found in trusted URLs whitelist ${REDIRECTS_WHITELIST}.`;
  logger.error(error);
  throw new Error(error);
};


// extractValueIfPresentFromRequestField extracts a value that matches the regular expression provided from the request
// field.
// Extracting a value from a field from the incoming request in this way appears to allay SonarQube's fears that
// any redirect using the value is doing so using user-controlled data.
// Returns null if no match found.
export const extractValueIfPresentFromRequestField = (requestField: string, expression: RegExp) => {
  if (requestField) {
    const extractedMatches = requestField.match(expression);
    if (extractedMatches !== null && extractedMatches.length > 0) {
      return extractedMatches[0];
    }
  }
  return null;
};