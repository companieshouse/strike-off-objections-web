/*
 * String formatting functions
 */
const PRINTABLE_CHARS: string =
    "ÀÁÂÄÈÉÊËÌÍÎÏÒÓÔÖÙÚÛÜẀẂŴẄỲÝŶŸàáâäèéêëìíîïòóôöùúûüẁẃŵẅỳýŷÿABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&@£$€¥.,:;–-‘’'()[]{}<>!“”»«\"?/\\*=#%+ \r\n";

export const removeNonPrintableChars = (inputStr: string): string => {
  if (inputStr) {
    for (let index = 0; index < inputStr.length; index++) {
      if (PRINTABLE_CHARS.indexOf(inputStr.charAt(index)) === -1) {
        inputStr = inputStr.replace(inputStr.charAt(index), " ");
      }
    }
    return inputStr;
  }
  return "";
};
