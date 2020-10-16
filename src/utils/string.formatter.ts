/*
 * String formatting functions
 */
const REGEX_NON_PRINTABLE_CHARS: RegExp = /[^ -\xFF€]+/g;
const REGEX_MULTIPLE_SPACES: RegExp = /\s\s+/g;

export const removeNonPrintableChars = (inputStr: string): string => {
  if (inputStr) {
    const revisedInput: string = inputStr.replace(REGEX_NON_PRINTABLE_CHARS, " ");
    return revisedInput.replace(REGEX_MULTIPLE_SPACES, " ");
  } else {
    return inputStr;
  }
};
