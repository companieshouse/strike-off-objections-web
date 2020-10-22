/*
 * String formatting functions
 */
const REGEX_NON_PRINTABLE_CHARS: RegExp =
    /[^ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&@£$€¥.,:;–\-'''()\[\]{}<>!""»«"\?\/\\*=#%\+ \r\n]+/g;

export const removeNonPrintableChars = (inputStr: string): string => {
  if (inputStr) {
    return inputStr.replace(REGEX_NON_PRINTABLE_CHARS, " ");
  } else {
    return inputStr;
  }
};
