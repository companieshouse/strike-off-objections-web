import moment = require("moment");

const DISPLAY_DATE_FORMAT: string = "D MMMM YYYY";

export const formatCHSDateForDisplay = (inputDate: string): string => {
  return moment(inputDate, "YYYY-MM-DD", true).format( DISPLAY_DATE_FORMAT);
};
