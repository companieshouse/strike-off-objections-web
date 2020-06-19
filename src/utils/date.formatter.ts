import moment = require("moment");

const DISPLAY_DATE_FORMAT: string = "D MMMM YYYY";

export const formatDateForDisplay = (inputDate: string): string => {
  return moment(inputDate).format(DISPLAY_DATE_FORMAT);
};
