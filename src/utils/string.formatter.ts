/*
 * String formatting functions
 */
const REGEX_MATCH_NON_PRINTABLE_CHARS: RegExp =
    /[^ÀÁÂÄÈÉÊËÌÍÎÏÒÓÔÖÙÚÛÜẀẂŴẄỲÝŶŸàáâäèéêëìíîïòóôöùúûüẁẃŵẅỳýŷÿA-Za-z0-9&@£$€¥.,:;–\-‘’'()\[\]\{\}<>!“”»«"\?\/\\*=#%\+ \r\n]/g;

export const removeNonPrintableChars = (inputStr: string): string => {
  if (inputStr) {
    return inputStr.replace(REGEX_MATCH_NON_PRINTABLE_CHARS, " ");
  } else {
    return inputStr;
  }
};
