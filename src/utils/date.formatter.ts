import moment = require("moment");

const DISPLAY_DATE_FORMAT = "D MMMM YYYY";
const CHS_DATE_FORMAT = "YYYY-MM-DD";

export const formatCHSDateForDisplay = (inputDate: string): string => {
  return moment(inputDate, CHS_DATE_FORMAT, true).format(DISPLAY_DATE_FORMAT);
};
