/*
 * String formatting functions
 */
const PRINTABLE_CHARS: Set<String> =
    new Set(["À", "Á", "Â", "Ä", "È", "É", "Ê", "Ë", "Ì", "Í", "Î", "Ï", "Ò", "Ó", "Ô", "Ö", "Ù", "Ú", "Û", "Ü", "Ẁ", "Ẃ", "Ŵ", "Ẅ", "Ỳ", "Ý", "Ŷ", "Ÿ", "à", "á", "â", "ä", "è", "é", "ê", "ë", "ì", "í", "î", "ï", "ò", "ó", "ô", "ö", "ù", "ú", "û", "ü", "ẁ", "ẃ", "ŵ", "ẅ", "ỳ", "ý", "ŷ", "ÿ", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "&", "@", "£", "$", "€", "¥", ".", ", ", ":", ";", "–", "-", "‘", "’", "'", "(", ")", "[", "]", "{", "}", "<", ">", "!", "“", "”", "»", "«", "\"", "?", "/", "\\", "*", "=", "#", "%", "+", " ", "\r", "\n"]);
export const removeNonPrintableChars = (inputStr: string): string => {
  if (inputStr) {
    for (let index = 0; index < inputStr.length; index++) {
      if (!PRINTABLE_CHARS.has(inputStr.charAt(index))) {
        inputStr = inputStr.replace(inputStr.charAt(index), " ");
      }
    }
    return inputStr;
  }
  return "";
};
